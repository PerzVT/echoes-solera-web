-- The creator's saved work, for the postgres adapter (lib/labs/store/postgres.ts).
-- Every table carries who made a record (owner), who changed it last (updated_by) and when.
-- Safe to run more than once. Column names are the record fields in snake_case.

create table if not exists nl_series (
  id          text primary key,
  owner       text not null,
  updated_by  text not null,
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  title       text not null check (char_length(title) between 1 and 120),
  tool        text not null check (tool in ('mini-series', 'anime', 'cooking')),
  style       text,
  cover       text
);
create index if not exists nl_series_owner on nl_series (owner);

-- series_id is a saved series' id or the slug of a built-in series, so it carries no foreign key.
create table if not exists nl_episodes (
  id          text primary key,
  owner       text not null,
  updated_by  text not null,
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  series_id   text not null,
  number      integer not null check (number > 0),
  title       text not null,
  step        text not null check (step in ('script', 'screenplay', 'cast', 'style', 'results', 'done')),
  unique (series_id, number)
);
create index if not exists nl_episodes_series on nl_episodes (series_id);
create index if not exists nl_episodes_owner on nl_episodes (owner);

-- One per episode: id is the episode's id.
create table if not exists nl_scripts (
  id          text primary key,
  owner       text not null,
  updated_by  text not null,
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  episode_id  text not null references nl_episodes (id) on delete cascade,
  text        text not null,
  file_name   text,
  file        text
);
create index if not exists nl_scripts_episode on nl_scripts (episode_id);
create index if not exists nl_scripts_owner on nl_scripts (owner);

create table if not exists nl_screenplays (
  id          text primary key,
  owner       text not null,
  updated_by  text not null,
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  episode_id  text not null references nl_episodes (id) on delete cascade,
  texts       jsonb not null default '{}',
  notes       jsonb not null default '[]',
  changed     jsonb not null default '[]'
);
create index if not exists nl_screenplays_episode on nl_screenplays (episode_id);
create index if not exists nl_screenplays_owner on nl_screenplays (owner);

create table if not exists nl_cast_sheets (
  id          text primary key,
  owner       text not null,
  updated_by  text not null,
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  series_id   text not null,
  character   text not null,
  variant     text,
  tag         text not null,
  image       text not null
);
create index if not exists nl_cast_sheets_series on nl_cast_sheets (series_id);
create index if not exists nl_cast_sheets_owner on nl_cast_sheets (owner);

-- What was chosen on the cast, style and references steps. One per episode: id is the episode's id.
create table if not exists nl_choices (
  id           text primary key,
  owner        text not null,
  updated_by   text not null,
  created_at   timestamptz not null,
  updated_at   timestamptz not null,
  episode_id   text not null references nl_episodes (id) on delete cascade,
  "cast"       jsonb,
  style        text,
  "references" jsonb not null default '[]'
);
create index if not exists nl_choices_episode on nl_choices (episode_id);
create index if not exists nl_choices_owner on nl_choices (owner);

-- A storyboard is one record: its scene, style and frames in order (frames as jsonb).
create table if not exists nl_storyboards (
  id          text primary key,
  owner       text not null,
  updated_by  text not null,
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  title       text not null check (char_length(title) between 1 and 120),
  source      text not null,
  style       text,
  series_id   text,
  frames      jsonb not null default '[]',
  step        text not null check (step in ('scene', 'style', 'board'))
);
create index if not exists nl_storyboards_owner on nl_storyboards (owner);
-- Added after the first release: the series a board or manga belongs to, null for one on its own.
alter table nl_storyboards add column if not exists series_id text;

-- A manga is one record: its story, style, page count and pages with their lettering (pages as jsonb).
create table if not exists nl_mangas (
  id          text primary key,
  owner       text not null,
  updated_by  text not null,
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  title       text not null check (char_length(title) between 1 and 120),
  source      text not null,
  style       text,
  series_id   text,
  page_count  integer not null check (page_count between 1 and 24),
  pages       jsonb not null default '[]',
  step        text not null check (step in ('story', 'style', 'pages', 'read'))
);
create index if not exists nl_mangas_owner on nl_mangas (owner);
alter table nl_mangas add column if not exists series_id text;

-- Uploaded scripts and cast images. The bytes live in Blob storage (or on disk in development); location says where.
create table if not exists nl_files (
  key         text primary key,
  name        text not null,
  type        text not null,
  size        integer not null check (size >= 0),
  location    text not null,
  owner       text not null,
  created_at  timestamptz not null
);
create index if not exists nl_files_owner on nl_files (owner);

-- Generation jobs (lib/labs/ai, lib/labs/store/jobs.ts). input and result are jsonb shaped by kind.
-- provider_id is the provider's own id for work that runs on their side, so a later request can resume it.
-- estimate_usd is held against the spending limits while a job runs; cost_usd is what its reported usage came to.
create table if not exists nl_jobs (
  id            text primary key,
  owner         text not null,
  kind          text not null,
  status        text not null check (status in ('queued', 'running', 'done', 'failed')),
  episode_id    text,
  input         jsonb not null,
  result        jsonb,
  error         text,
  provider      text not null,
  provider_id   text,
  estimate_usd  double precision not null default 0,
  cost_usd      double precision,
  attempts      integer not null default 0,
  created_at    timestamptz not null,
  updated_at    timestamptz not null,
  started_at    timestamptz,
  finished_at   timestamptz
);
create index if not exists nl_jobs_owner on nl_jobs (owner, created_at desc);
create index if not exists nl_jobs_episode on nl_jobs (episode_id, created_at desc);
create index if not exists nl_jobs_created on nl_jobs (created_at);

-- Tidebell Cove multiplayer (app/api/cove, lib/labs/store/cove.ts). The game's room server keeps its rooms in memory;
-- here they live in these tables so any function instance can answer. Times are epoch milliseconds from the
-- function's clock. Every timer (seat lease, music boundary, print, cooldowns, the six-second drop) is worked
-- out from these stored times on each request.
-- The first, single-room version's tables.
drop table if exists nl_cove_players;
drop table if exists nl_cove_porch;

-- One row per visitor, found by the sha-256 of the token the server handed it; addr is the hashed client address.
-- room and inst are null until the game joins a room. duck is the validated {x,z,yaw,wave,fish,catchId,fishSeq}.
-- name0 and name1 index the two public word lists. vote counts only while vote_period equals the room's started_at.
-- queued_at orders the Tide Hall queue. tokens and at are the request bucket.
create table if not exists nl_cove_visitors (
  id            text primary key,
  token_hash    text not null,
  addr          text not null,
  room          text,
  inst          integer,
  joined        bigint,
  name0         integer,
  name1         integer,
  outfit        jsonb,
  duck          jsonb,
  fish_started  bigint not null default 0,
  last_say      bigint not null default 0,
  last_emote    bigint not null default 0,
  last_report   bigint not null default 0,
  vote          integer,
  vote_period   bigint,
  queued_at     bigint,
  tokens        double precision not null,
  at            bigint not null,
  seen          bigint not null
);
create unique index if not exists nl_cove_visitors_token on nl_cove_visitors (token_hash);
create index if not exists nl_cove_visitors_room on nl_cove_visitors (room, inst, seen);
create index if not exists nl_cove_visitors_seen on nl_cove_visitors (seen);

-- One row per room instance: the music clock (track, started_at), the Tide Hall seat lease, the event counter,
-- the print press order and a version for compare-and-set updates. touched is the last write.
create table if not exists nl_cove_rooms (
  room        text not null,
  inst        integer not null,
  track       integer not null default 0,
  started_at  bigint not null,
  seat_id     text,
  seat_since  bigint,
  seq         integer not null default 0,
  porch       jsonb,
  version     integer not null default 0,
  touched     bigint not null,
  primary key (room, inst)
);

-- The last twenty events of each room instance (say, emote, emote-stop). arg is a phrase or emote id.
create table if not exists nl_cove_events (
  room    text not null,
  inst    integer not null,
  seq     integer not null,
  type    text not null,
  player  text not null,
  arg     text,
  at      bigint not null,
  primary key (room, inst, seq),
  foreign key (room, inst) references nl_cove_rooms (room, inst) on delete cascade
);

-- Reports, written before the game is told the report was saved. Names are built from the word lists and the
-- reason is one of four ids, so nothing here was typed by a visitor. events is the room log at that moment.
create table if not exists nl_cove_reports (
  id             bigserial primary key,
  at             bigint not null,
  room           text not null,
  inst           integer not null,
  reporter_hash  text not null,
  target_id      text not null,
  target_hash    text not null,
  target_name    text not null,
  reason         text not null,
  events         jsonb not null
);
create index if not exists nl_cove_reports_at on nl_cove_reports (at);

-- Request buckets per hashed client address, so one address cannot flood the cove with tokens or requests.
create table if not exists nl_cove_limits (
  key     text primary key,
  tokens  double precision not null,
  at      bigint not null
);
create index if not exists nl_cove_limits_at on nl_cove_limits (at);
