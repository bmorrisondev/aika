-- Create time_entries table for tracking time
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  description TEXT,
  owner_id TEXT NOT NULL
);

-- Enable Row Level Security on time_entries table
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting time entries
CREATE POLICY select_own_time_entries ON time_entries
  FOR SELECT
  USING (owner_id = (auth.jwt() ->> 'sub'::text));

-- Create policy for inserting time entries
CREATE POLICY insert_own_time_entries ON time_entries
  FOR INSERT
  WITH CHECK (owner_id = (auth.jwt() ->> 'sub'::text));

-- Create policy for updating time entries
CREATE POLICY update_own_time_entries ON time_entries
  FOR UPDATE
  USING (owner_id = (auth.jwt() ->> 'sub'::text));

-- Create policy for deleting time entries
CREATE POLICY delete_own_time_entries ON time_entries
  FOR DELETE
  USING (owner_id = (auth.jwt() ->> 'sub'::text));