-- Enable RLS
alter table "public"."documents" enable row level security;

-- Drop existing policies
drop policy if exists "Users can view documents from their enrolled classes" on "public"."documents";
drop policy if exists "Users can insert their own documents" on "public"."documents";
drop policy if exists "Users can update their own documents" on "public"."documents";
drop policy if exists "Users can delete their own documents" on "public"."documents";
drop policy if exists "Anyone can read documents" on "public"."documents";
drop policy if exists "Users can upload their own documents" on "public"."documents";

-- Allow users to view documents from classes they're enrolled in
create policy "Users can view documents from their enrolled classes"
  on "public"."documents"
  for select
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 
      from class_enrollments 
      where class_enrollments.class_id = documents.class_id 
      and class_enrollments.user_id = auth.uid()
    )
  );

-- Allow users to insert their own documents
create policy "Users can insert their own documents"
  on "public"."documents"
  for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own documents
create policy "Users can update their own documents"
  on "public"."documents"
  for update
  using (auth.uid() = user_id);

-- Allow users to delete their own documents
create policy "Users can delete their own documents"
  on "public"."documents"
  for delete
  using (auth.uid() = user_id);