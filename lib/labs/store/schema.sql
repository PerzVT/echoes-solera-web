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
