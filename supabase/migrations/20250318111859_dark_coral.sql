/*
  # Initial Schema Setup

  1. Tables
    - users
      - id (uuid, primary key)
      - wallet_address (text, unique)
      - created_at (timestamp)
    - wills
      - id (uuid, primary key)
      - creator_id (uuid, references users)
      - contract_will_id (bigint)
      - status (text)
      - created_at (timestamp)
    - beneficiaries
      - id (uuid, primary key)
      - will_id (uuid, references wills)
      - wallet_address (text)
      - share_percentage (integer)
    - vault_transactions
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - amount (numeric)
      - transaction_type (text)
      - created_at (timestamp)
    - identity_verifications
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - status (text)
      - verification_type (text)
      - verified_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Wills table
CREATE TABLE wills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES users(id),
  contract_will_id bigint NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'executed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wills"
  ON wills
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

-- Beneficiaries table
CREATE TABLE beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id uuid REFERENCES wills(id),
  wallet_address text NOT NULL,
  share_percentage integer NOT NULL CHECK (share_percentage BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read beneficiaries of own wills"
  ON beneficiaries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wills
      WHERE wills.id = beneficiaries.will_id
      AND wills.creator_id = auth.uid()
    )
  );

-- Vault transactions table
CREATE TABLE vault_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  amount numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw', 'yield')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vault_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own vault transactions"
  ON vault_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Identity verifications table
CREATE TABLE identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  status text NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')),
  verification_type text NOT NULL CHECK (verification_type IN ('kyc', 'mfa')),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own identity verifications"
  ON identity_verifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());