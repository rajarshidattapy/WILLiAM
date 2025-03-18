/*
  # Add contact information to users table

  1. Changes
    - Add email column to users table
    - Add phone_number column to users table
    - Add unique constraint on email

  2. Security
    - Update RLS policies to include new fields
*/

ALTER TABLE users
ADD COLUMN email text UNIQUE,
ADD COLUMN phone_number text;

-- Update the existing RLS policy to include new fields
DROP POLICY IF EXISTS "Users can read own data" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);