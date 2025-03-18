/*
  # Add death verification system
  
  1. Changes
    - Add name, email, phone fields to beneficiaries table
    - Add death_votes table for tracking beneficiary votes
    - Add last_alive_check column to users table
    - Add is_alive column to users table
  
  2. Security
    - Enable RLS on new table
    - Add policies for beneficiaries to vote
*/

-- Add contact fields to beneficiaries
ALTER TABLE beneficiaries
ADD COLUMN name text,
ADD COLUMN email text,
ADD COLUMN phone text;

-- Add death verification fields to users
ALTER TABLE users
ADD COLUMN last_alive_check timestamptz DEFAULT now(),
ADD COLUMN is_alive boolean DEFAULT true;

-- Create death votes table
CREATE TABLE death_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id uuid REFERENCES wills(id),
  beneficiary_id uuid REFERENCES beneficiaries(id),
  voted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE death_votes ENABLE ROW LEVEL SECURITY;

-- Allow beneficiaries to vote on associated wills
CREATE POLICY "Beneficiaries can vote on associated wills"
  ON death_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM beneficiaries
      WHERE beneficiaries.id = death_votes.beneficiary_id
      AND beneficiaries.will_id = death_votes.will_id
    )
  );