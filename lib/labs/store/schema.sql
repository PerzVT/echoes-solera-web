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
