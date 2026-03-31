-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text check(role in ('teacher', 'student')) default 'student',
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security
alter table profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 2. Courses Table
create table courses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  theme_color text default 'blue',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security
alter table courses enable row level security;

-- Policies for courses
create policy "Courses are viewable by everyone." on courses for select using (true);
create policy "Publishing allowed for teachers only." on courses for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy "Updating allowed for teachers only." on courses for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);

-- Insert Default Courses (7 subjects)
insert into courses (name, description, theme_color) values 
  ('Civilization', 'Learn about history and civilizations', 'amber'),
  ('Grammar', 'English grammar rules and practice', 'blue'),
  ('Literature', 'English literature and poetry', 'purple'),
  ('Phonetics', 'Sounds of English', 'green'),
  ('Reading & Text Analysis', 'Analyze academic texts', 'rose'),
  ('Written', 'Written expression', 'teal'),
  ('Study Skills', 'Methods for studying effectively', 'indigo');

-- 3. Lessons Table
create table lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  pdf_url text,
  youtube_url text, -- For iframe videos
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security
alter table lessons enable row level security;

-- Policies for lessons
create policy "Lessons are viewable by everyone." on lessons for select using (true);
create policy "Teachers can insert lessons." on lessons for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy "Teachers can update lessons." on lessons for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy "Teachers can delete lessons." on lessons for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);

-- 4. Assignments Table
create table assignments (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  deadline timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Security
alter table assignments enable row level security;

-- Policies for assignments
create policy "Assignments are viewable by everyone." on assignments for select using (true);
create policy "Teachers can insert assignments." on assignments for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy "Teachers can update assignments." on assignments for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy "Teachers can delete assignments." on assignments for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
