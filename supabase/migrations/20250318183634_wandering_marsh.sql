/*
  # Recreate users table with simplified schema

  1. Changes
    - Drop existing users table and related foreign keys
    - Create new users table with only email and phone number
    - Add new RLS policies with all operations for authenticated users
    - Add policy for inserting new users without authentication

  2. Security
    - Enable RLS on users table
    - Add policies for all operations (SELECT, INSERT, UPDATE, DELETE)
    - Allow unauthenticated users to insert new records
    - Restrict other operations to authenticated users only
*/

-- First, drop foreign key constraints from other tables
ALTER TABLE wills DROP CONSTRAINT IF EXISTS wills_creator_id_fkey;
ALTER TABLE vault_transactions DROP CONSTRAINT IF EXISTS vault_transactions_user_id_fkey;
ALTER TABLE identity_verifications DROP CONSTRAINT IF EXISTS identity_verifications_user_id_fkey;

-- Drop the existing users table
DROP TABLE IF EXISTS users;

-- Create new users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  phone_number text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting new users (allow public access)
CREATE POLICY "Allow public user creation"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy for other operations (authenticated users only)
CREATE POLICY "Users can manage own data"
  ON users
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Update foreign key constraints
ALTER TABLE wills
  ADD CONSTRAINT wills_creator_id_fkey
  FOREIGN KEY (creator_id)
  REFERENCES users(id);

ALTER TABLE vault_transactions
  ADD CONSTRAINT vault_transactions_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id);

ALTER TABLE identity_verifications
  ADD CONSTRAINT identity_verifications_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id);