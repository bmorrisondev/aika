-- Add requesting_owner_id function
create or replace function requesting_owner_id()
returns text as $$
    select coalesce(
        (auth.jwt() -> 'o'::text) ->> 'id'::text,
        (auth.jwt() ->> 'sub'::text)
    )::text;
$$ language sql stable;

-- Update RLS policies to use the new requesting_owner_id function
-- Update select policy
DROP POLICY IF EXISTS select_own_time_entries ON time_entries;
CREATE POLICY select_own_time_entries ON time_entries
  FOR SELECT
  USING (owner_id = requesting_owner_id());

-- Update insert policy
DROP POLICY IF EXISTS insert_own_time_entries ON time_entries;
CREATE POLICY insert_own_time_entries ON time_entries
  FOR INSERT
  WITH CHECK (owner_id = requesting_owner_id());

-- Update update policy
DROP POLICY IF EXISTS update_own_time_entries ON time_entries;
CREATE POLICY update_own_time_entries ON time_entries
  FOR UPDATE
  USING (owner_id = requesting_owner_id());

-- Update delete policy
DROP POLICY IF EXISTS delete_own_time_entries ON time_entries;
CREATE POLICY delete_own_time_entries ON time_entries
  FOR DELETE
  USING (owner_id = requesting_owner_id());

-- Add created_by column to time_entries table
alter table time_entries add created_by text default (auth.jwt() ->> 'sub'::text);