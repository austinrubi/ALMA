-- ALMA Seed Data
-- Populates the database with the same sample data from the prototype.
-- Uses deterministic UUIDs so relationships are consistent.
-- Run with: supabase db reset

-- ============================================================
-- Fake auth.users (needed because profiles FK → auth.users)
-- Password for all: "password123"
-- ============================================================
-- bcrypt hash of "password123"
-- $2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_user_meta_data)
values
  -- Named users u1–u22
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'margaret.holloway@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Margaret Holloway"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'caroline.pritchett@example.com',  '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Caroline Pritchett"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'eleanor.vance@example.com',       '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Eleanor Vance"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'beatrice.whitfield@example.com',  '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Beatrice Whitfield"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vivian.locke@example.com',        '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Vivian Locke"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'adelaide.quinn@example.com',      '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Adelaide Quinn"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'frances.eberhardt@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Frances Eberhardt"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'harriet.compton@example.com',     '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Harriet Compton"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lillian.marchetti@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Lillian Marchetti"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'penelope.strathmore@example.com', '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Penelope Strathmore"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cornelia.boatwright@example.com', '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Cornelia Boatwright"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'augusta.reeves@example.com',      '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Augusta Reeves"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rosalind.tate@example.com',       '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Rosalind Tate"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mary-beth.ainsworth@example.com', '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Mary-Beth Ainsworth"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sallie.devereaux@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Sallie Devereaux"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tabitha.lockridge@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Tabitha Lockridge"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'winnie.carmichael@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Winnie Carmichael"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'edith.calloway@example.com',      '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Edith Calloway"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'greta.mossbacher@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Greta Mossbacher"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'imogen.halliwell@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Imogen Halliwell"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'josephine.karr@example.com',      '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Josephine Karr"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'delphine.forrest@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Delphine Forrest"}'::jsonb),
  -- Admin user
  ('d0000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'info@almamahj.com',               '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"ALMA Admin"}'::jsonb),
  -- Filler roster users (t1-f5 through t8-f7) — 32 users to fill rosters to 8 each
  ('d0000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'genevieve.ashford@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Genevieve Ashford"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cecilia.berkeley@example.com',     '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Cecilia Berkeley"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marguerite.chamberlain@example.com','$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Marguerite Chamberlain"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ophelia.delacroix@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Ophelia Delacroix"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'clementine.ellsworth@example.com', '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Clementine Ellsworth"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rosamund.fairbanks@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Rosamund Fairbanks"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'theodora.grantham@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Theodora Grantham"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arabella.harrington@example.com',  '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Arabella Harrington"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'millicent.ingram@example.com',     '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Millicent Ingram"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'prudence.kingsley@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Prudence Kingsley"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'wilhelmina.ledbetter@example.com', '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Wilhelmina Ledbetter"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'constance.montague@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Constance Montague"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'georgiana.northcott@example.com',  '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Georgiana Northcott"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'henrietta.ormsby@example.com',     '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Henrietta Ormsby"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000115', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'evangeline.prescott@example.com',  '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Evangeline Prescott"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000116', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dorothea.radcliffe@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Dorothea Radcliffe"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000117', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cordelia.sedgwick@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Cordelia Sedgwick"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000118', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'philippa.thornbury@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Philippa Thornbury"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000119', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seraphina.underwood@example.com',  '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Seraphina Underwood"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000120', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'antonia.vandergriff@example.com',  '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Antonia Vandergriff"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000121', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'isadora.winthrop@example.com',     '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Isadora Winthrop"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000122', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lavinia.yardley@example.com',      '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Lavinia Yardley"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000123', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'octavia.ashford@example.com',      '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Octavia Ashford"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000124', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bernadette.berkeley@example.com',  '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Bernadette Berkeley"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000125', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'guinevere.chamberlain@example.com','$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Guinevere Chamberlain"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000126', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hortense.delacroix@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Hortense Delacroix"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000127', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'josepha.ellsworth@example.com',    '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Josepha Ellsworth"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000128', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'katharine.fairbanks@example.com',  '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Katharine Fairbanks"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000129', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'leonora.grantham@example.com',     '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Leonora Grantham"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'matilda.harrington@example.com',   '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Matilda Harrington"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nadine.ingram@example.com',        '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Nadine Ingram"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000132', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'odette.kingsley@example.com',      '$2a$10$PznXkMALjMOEVSRGsSOyZ.RIR7SjNFpzHYv3W1JMvEMXx2mHOqSXy', now(), now(), now(), '', '{"name":"Odette Kingsley"}'::jsonb);

-- Create auth.identities entries (required by Supabase auth)
insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
select id, id, jsonb_build_object('sub', id::text, 'email', email), 'email', id::text, now(), now(), now()
from auth.users;

-- ============================================================
-- Profiles (the trigger creates them, but we need to update with full data)
-- The handle_new_user trigger already fired, so update with our details.
-- ============================================================
-- UUID mapping: u1 = ...0001, u2 = ...0002, ..., u22 = ...0022, admin = ...0099
-- Filler roster: ...0101 through ...0132

update public.profiles set phone = '(404) 555-0100', tile = 'plum',   tint = 'bone',  skill = 'Experienced', zip = '30305', area = 'Buckhead',       role = 'captain' where id = 'd0000000-0000-0000-0000-000000000001';
update public.profiles set phone = '(404) 555-0137', tile = 'orchid', tint = 'sky',   skill = 'Experienced', zip = '30319', area = 'Brookhaven',     role = 'captain' where id = 'd0000000-0000-0000-0000-000000000002';
update public.profiles set phone = '(404) 555-0174', tile = 'mum',    tint = 'sage',  skill = 'Experienced', zip = '30327', area = 'Sandy Springs',  role = 'captain' where id = 'd0000000-0000-0000-0000-000000000003';
update public.profiles set phone = '(404) 555-0211', tile = 'bamboo', tint = 'cream', skill = 'Experienced', zip = '30338', area = 'Dunwoody',       role = 'captain' where id = 'd0000000-0000-0000-0000-000000000004';
update public.profiles set phone = '(404) 555-0248', tile = 'red',    tint = 'sky',   skill = 'Experienced', zip = '30075', area = 'Roswell',        role = 'captain' where id = 'd0000000-0000-0000-0000-000000000005';
update public.profiles set phone = '(404) 555-0285', tile = 'green',  tint = 'bone',  skill = 'Experienced', zip = '30030', area = 'Decatur',        role = 'captain' where id = 'd0000000-0000-0000-0000-000000000006';
update public.profiles set phone = '(404) 555-0322', tile = 'flower', tint = 'sage',  skill = 'Experienced', zip = '30307', area = 'Druid Hills',    role = 'captain' where id = 'd0000000-0000-0000-0000-000000000007';
update public.profiles set phone = '(404) 555-0359', tile = 'spring', tint = 'cream', skill = 'Experienced', zip = '30306', area = 'Va-Highland',    role = 'captain' where id = 'd0000000-0000-0000-0000-000000000008';
update public.profiles set phone = '(404) 555-0396', tile = 'plum',   tint = 'sky',   skill = 'Experienced', zip = '30316', area = 'East Atlanta',   role = 'player'  where id = 'd0000000-0000-0000-0000-000000000009';
update public.profiles set phone = '(404) 555-0433', tile = 'orchid', tint = 'bone',  skill = 'Experienced', zip = '30068', area = 'Marietta',       role = 'player'  where id = 'd0000000-0000-0000-0000-000000000010';
update public.profiles set phone = '(404) 555-0470', tile = 'mum',    tint = 'sage',  skill = 'Experienced', zip = '30307', area = 'Inman Park',     role = 'player'  where id = 'd0000000-0000-0000-0000-000000000011';
update public.profiles set phone = '(404) 555-0507', tile = 'bamboo', tint = 'cream', skill = 'Experienced', zip = '30306', area = 'Morningside',    role = 'player'  where id = 'd0000000-0000-0000-0000-000000000012';
update public.profiles set phone = '(404) 555-0544', tile = 'red',    tint = 'bone',  skill = 'Experienced', zip = '30305', area = 'Buckhead',       role = 'captain' where id = 'd0000000-0000-0000-0000-000000000013';
update public.profiles set phone = '(404) 555-0581', tile = 'green',  tint = 'sky',   skill = 'Experienced', zip = '30305', area = 'Buckhead',       role = 'player'  where id = 'd0000000-0000-0000-0000-000000000014';
update public.profiles set phone = '(404) 555-0618', tile = 'flower', tint = 'sage',  skill = 'Experienced', zip = '30305', area = 'Buckhead',       role = 'player'  where id = 'd0000000-0000-0000-0000-000000000015';
update public.profiles set phone = '(404) 555-0655', tile = 'spring', tint = 'cream', skill = 'Experienced', zip = '30327', area = 'Buckhead',       role = 'player'  where id = 'd0000000-0000-0000-0000-000000000016';
update public.profiles set phone = '(404) 555-0692', tile = 'plum',   tint = 'bone',  skill = 'Experienced', zip = '30305', area = 'Buckhead',       role = 'player'  where id = 'd0000000-0000-0000-0000-000000000017';
update public.profiles set phone = '(404) 555-0729', tile = 'orchid', tint = 'sky',   skill = 'Experienced', zip = '30305', area = 'Buckhead',       role = 'player'  where id = 'd0000000-0000-0000-0000-000000000018';
update public.profiles set phone = '(404) 555-0766', tile = 'mum',    tint = 'sage',  skill = 'Experienced', zip = '30327', area = 'Buckhead',       role = 'player'  where id = 'd0000000-0000-0000-0000-000000000019';
update public.profiles set phone = '(404) 555-0803', tile = 'bamboo', tint = 'bone',  skill = 'Experienced', zip = '30319', area = 'Brookhaven',     role = 'captain' where id = 'd0000000-0000-0000-0000-000000000020';
update public.profiles set phone = '(404) 555-0840', tile = 'red',    tint = 'sky',   skill = 'Experienced', zip = '30319', area = 'Brookhaven',     role = 'player'  where id = 'd0000000-0000-0000-0000-000000000021';
update public.profiles set phone = '(404) 555-0877', tile = 'green',  tint = 'sage',  skill = 'Experienced', zip = '30319', area = 'Brookhaven',     role = 'player'  where id = 'd0000000-0000-0000-0000-000000000022';
-- Admin
update public.profiles set phone = '',                tile = 'flower', tint = 'sky',   skill = '-',           zip = '',      area = '',               role = 'admin'   where id = 'd0000000-0000-0000-0000-000000000099';

-- Filler roster users — all players
update public.profiles set tile = 'plum',   tint = 'bone',  skill = 'Experienced', zip = '30305', area = 'Buckhead', role = 'player' where id like 'd0000000-0000-0000-0000-0000000001__';

-- ============================================================
-- Season
-- ============================================================
insert into public.seasons (id, name, start_date, end_date, week_count, current_week, fee, forfeit_points, week_win_bonus, short_handed_bonus, published)
values ('a0000000-0000-0000-0000-000000000001', 'Spring 2026', '2026-04-28', '2026-06-16', 8, 4, 75, 75, 50, 15, true);

-- Play windows
insert into public.play_windows (id, season_id, days, start_time, end_time) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '{2,3}', '09:00', '15:00'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '{6}', '10:00', '14:00');

-- ============================================================
-- Teams
-- ============================================================
insert into public.teams (id, season_id, name, short_name, home_venue, code, points, prev_rank_change) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Jade Sparrows',   'Sparrows',   'Cherokee Town Club',             'SPAR-4471', 4980,  2),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Golden Bamboos',  'Bamboos',    'Capital City Country Club',      'BAMB-2903', 5210,  1),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'White Magnolias', 'Magnolias',  'The Cathedral Antique Show Hall', 'MAGN-7714', 5090,  1),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Red Dragons',     'Dragons',    'Dunwoody Country Club',          'DRAG-5182', 4720, -1),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Silver Cranes',   'Cranes',     'Roswell Garden Club',            'CRAN-6340', 4460,  0),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Pearl Doves',     'Doves',      'Decatur Recreation Center',      'DOVE-8125', 4210, -1),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Wild Orchids',    'Orchids',    'Druid Hills Golf Club',          'ORCH-3097', 3980,  1),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Autumn Peonies',  'Peonies',    'Frasier Center',                 'PEON-9256', 3640, -1);

-- ============================================================
-- Team Members
-- ============================================================
-- Team 1: Jade Sparrows — captains: u1, u13; players: u14-u19, u9-u11, plus filler
insert into public.team_members (team_id, user_id, team_role) values
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'captain'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000013', 'captain'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000014', 'player'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000015', 'player'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000016', 'player'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000017', 'player'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000018', 'player'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000019', 'player');

-- Team 2: Golden Bamboos — captains: u2, u20; players: u21, u22, plus filler
insert into public.team_members (team_id, user_id, team_role) values
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'captain'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000020', 'captain'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000021', 'player'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000022', 'player'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000101', 'player'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000102', 'player'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000103', 'player'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000104', 'player');

-- Team 3: White Magnolias — captain: u3
insert into public.team_members (team_id, user_id, team_role) values
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'captain'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000105', 'player'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000106', 'player'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000107', 'player'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000108', 'player'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000109', 'player'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000110', 'player'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000111', 'player');

-- Team 4: Red Dragons — captain: u4
insert into public.team_members (team_id, user_id, team_role) values
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'captain'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000112', 'player'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000113', 'player'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000114', 'player'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000115', 'player'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000116', 'player'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000117', 'player'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000118', 'player');

-- Team 5: Silver Cranes — captain: u5
insert into public.team_members (team_id, user_id, team_role) values
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'captain'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000119', 'player'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000120', 'player'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000121', 'player'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000122', 'player'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000123', 'player'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000124', 'player'),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000125', 'player');

-- Team 6: Pearl Doves — captain: u6
insert into public.team_members (team_id, user_id, team_role) values
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'captain'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000126', 'player'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000127', 'player'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000128', 'player'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000129', 'player'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000130', 'player'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000131', 'player'),
  ('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000132', 'player');

-- Team 7: Wild Orchids — captain: u7
insert into public.team_members (team_id, user_id, team_role) values
  ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000007', 'captain'),
  ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000009', 'player'),
  ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000010', 'player'),
  ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000011', 'player'),
  ('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000012', 'player');

-- Team 8: Autumn Peonies — captain: u8
insert into public.team_members (team_id, user_id, team_role) values
  ('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000008', 'captain');

-- ============================================================
-- Matches
-- ============================================================
-- Week 4: Sparrows (t1) host Bamboos (t2) — 3 tables
insert into public.matches (id, season_id, week, table_num, match_type, home_team_id, away_team_id, status) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 4, 1, 'tournament', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'final'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 4, 2, 'tournament', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'final'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 4, 3, 'tournament', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'open');

-- Week 3: Sparrows (t1) host Magnolias (t3) — 3 tables
insert into public.matches (id, season_id, week, table_num, match_type, home_team_id, away_team_id, status) values
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 3, 1, 'tournament', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'final'),
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 3, 2, 'tournament', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'final'),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 3, 3, 'tournament', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'final');

-- Week 5: Dragons (t4) host Sparrows (t1) — 3 tables
insert into public.matches (id, season_id, week, table_num, match_type, home_team_id, away_team_id, status) values
  ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 5, 1, 'tournament', 'c0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'open'),
  ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 5, 2, 'tournament', 'c0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'open'),
  ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 5, 3, 'tournament', 'c0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'open');

-- Week 1: Sparrows (t1) host Cranes (t5) — 3 tables
insert into public.matches (id, season_id, week, table_num, match_type, home_team_id, away_team_id, status) values
  ('e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 1, 1, 'tournament', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'final'),
  ('e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 1, 2, 'tournament', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'final'),
  ('e0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 1, 3, 'tournament', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'final');

-- ============================================================
-- Match Seats
-- ============================================================
-- Week 4 table 1
insert into public.match_seats (match_id, side, seat_index, user_id) values
  ('e0000000-0000-0000-0000-000000000001', 'home', 0, 'd0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000001', 'home', 1, 'd0000000-0000-0000-0000-000000000013'),
  ('e0000000-0000-0000-0000-000000000001', 'away', 0, 'd0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000001', 'away', 1, 'd0000000-0000-0000-0000-000000000020');
-- Week 4 table 2
insert into public.match_seats (match_id, side, seat_index, user_id) values
  ('e0000000-0000-0000-0000-000000000002', 'home', 0, 'd0000000-0000-0000-0000-000000000014'),
  ('e0000000-0000-0000-0000-000000000002', 'home', 1, 'd0000000-0000-0000-0000-000000000015'),
  ('e0000000-0000-0000-0000-000000000002', 'away', 0, 'd0000000-0000-0000-0000-000000000021'),
  ('e0000000-0000-0000-0000-000000000002', 'away', 1, 'd0000000-0000-0000-0000-000000000022');
-- Week 4 table 3 (home only)
insert into public.match_seats (match_id, side, seat_index, user_id) values
  ('e0000000-0000-0000-0000-000000000003', 'home', 0, 'd0000000-0000-0000-0000-000000000016'),
  ('e0000000-0000-0000-0000-000000000003', 'home', 1, 'd0000000-0000-0000-0000-000000000017');

-- Week 3 table 1
insert into public.match_seats (match_id, side, seat_index, user_id) values
  ('e0000000-0000-0000-0000-000000000005', 'home', 0, 'd0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000005', 'home', 1, 'd0000000-0000-0000-0000-000000000017'),
  ('e0000000-0000-0000-0000-000000000005', 'away', 0, 'd0000000-0000-0000-0000-000000000003');
-- Week 3 table 2
insert into public.match_seats (match_id, side, seat_index, user_id) values
  ('e0000000-0000-0000-0000-000000000006', 'home', 0, 'd0000000-0000-0000-0000-000000000013'),
  ('e0000000-0000-0000-0000-000000000006', 'home', 1, 'd0000000-0000-0000-0000-000000000015');
-- Week 3 table 3
insert into public.match_seats (match_id, side, seat_index, user_id) values
  ('e0000000-0000-0000-0000-000000000007', 'home', 0, 'd0000000-0000-0000-0000-000000000014'),
  ('e0000000-0000-0000-0000-000000000007', 'home', 1, 'd0000000-0000-0000-0000-000000000016');

-- Week 5 table 1 (one home seat)
insert into public.match_seats (match_id, side, seat_index, user_id) values
  ('e0000000-0000-0000-0000-000000000009', 'home', 0, 'd0000000-0000-0000-0000-000000000004');

-- Week 1 seats
insert into public.match_seats (match_id, side, seat_index, user_id) values
  ('e0000000-0000-0000-0000-000000000013', 'home', 0, 'd0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000013', 'home', 1, 'd0000000-0000-0000-0000-000000000015'),
  ('e0000000-0000-0000-0000-000000000013', 'away', 0, 'd0000000-0000-0000-0000-000000000005'),
  ('e0000000-0000-0000-0000-000000000014', 'home', 0, 'd0000000-0000-0000-0000-000000000013'),
  ('e0000000-0000-0000-0000-000000000014', 'home', 1, 'd0000000-0000-0000-0000-000000000014'),
  ('e0000000-0000-0000-0000-000000000015', 'home', 0, 'd0000000-0000-0000-0000-000000000016'),
  ('e0000000-0000-0000-0000-000000000015', 'home', 1, 'd0000000-0000-0000-0000-000000000018');

-- ============================================================
-- Match Results
-- ============================================================
insert into public.match_results (match_id, home_score, away_score, entered_by, entered_at) values
  ('e0000000-0000-0000-0000-000000000001', 544, 498, 'd0000000-0000-0000-0000-000000000013', '2026-05-19 21:40:00+00'),
  ('e0000000-0000-0000-0000-000000000002', 471, 602, 'd0000000-0000-0000-0000-000000000014', '2026-05-20 22:05:00+00'),
  ('e0000000-0000-0000-0000-000000000005', 512, 476, 'd0000000-0000-0000-0000-000000000017', '2026-05-12 22:14:00+00'),
  ('e0000000-0000-0000-0000-000000000006', 588, 401, 'd0000000-0000-0000-0000-000000000013', '2026-05-10 18:02:00+00'),
  ('e0000000-0000-0000-0000-000000000007', 437, 610, 'd0000000-0000-0000-0000-000000000016', '2026-05-08 20:31:00+00'),
  ('e0000000-0000-0000-0000-000000000013', 521, 468, 'd0000000-0000-0000-0000-000000000015', '2026-04-29 21:10:00+00'),
  ('e0000000-0000-0000-0000-000000000014', 486, 533, 'd0000000-0000-0000-0000-000000000013', '2026-04-30 20:25:00+00'),
  ('e0000000-0000-0000-0000-000000000015', 574, 442, 'd0000000-0000-0000-0000-000000000016', '2026-05-01 19:48:00+00');

-- Week 3 table 3 was edited
update public.match_results set edited_by = 'd0000000-0000-0000-0000-000000000001', edited_at = '2026-05-09 09:12:00+00'
  where match_id = 'e0000000-0000-0000-0000-000000000007';

-- ============================================================
-- Match Plans
-- ============================================================
insert into public.match_plans (match_id, when_text, where_text, set_by, set_at) values
  ('e0000000-0000-0000-0000-000000000001', 'Tuesday, May 19 · 10:00 AM', 'Ansley Club, card room', 'd0000000-0000-0000-0000-000000000013', '2026-05-15 14:00:00+00');

-- ============================================================
-- Documents
-- ============================================================
insert into public.documents (title, category, pages, role_visibility, updated_at) values
  ('Tournament Rulebook · 2026 Season',     'Rules',   14, 'all',     '2026-04-02'),
  ('Scoring Conventions',                    'Rules',    6, 'all',     '2026-04-02'),
  ('Captain Handbook',                       'Captain', 22, 'captain', '2026-04-10'),
  ('Availability Email Templates',           'Captain',  3, 'captain', '2026-04-10'),
  ('Code of Conduct & Hold-Harmless',        'League',   4, 'all',     '2026-03-01'),
  ('Spring 2026 Season Packet',              'League',  18, 'all',     '2026-03-25'),
  ('Atlanta League · Member Directory',      'League',   9, 'all',     '2026-05-01');

-- ============================================================
-- FAQs
-- ============================================================
insert into public.faqs (category, question, answer, sort_order) values
  ('Account',    'How do I reset my password?', 'From the sign-in screen, tap "Forgot password" and we''ll send a link to your registered email.', 1),
  ('Teams',      'Can I be on more than one team in a season?', 'No. Each player belongs to one team per eight-week season.', 2),
  ('Teams',      'Can a team have two captains?', 'Yes. A team carries one or two captains, and co-captains share every captain power.', 3),
  ('Scheduling', 'How many matches does my team play each week?', 'Three. Each week you face one other team, and both sides split into pairs of two.', 4),
  ('Scheduling', 'How do we set the day and time of our match?', 'Between yourselves. Open your table to see the opposing pair''s phone and email.', 5),
  ('Scoring',    'Who logs the score?', 'Anyone at the table can log the score. There is no approval step.', 6),
  ('Scoring',    'How does scoring work?', 'Every match is scored from 1 to 999 points.', 7),
  ('Scoring',    'A score was entered wrong — what now?', 'Ask either team''s captain. Only a captain can override the entry.', 8),
  ('Payments',   'When are season dues due?', 'Dues are due by the start of Week 1.', 9),
  ('Scheduling', 'When can matches be played?', 'The admin sets the season''s play windows before Week 1.', 10);

-- ============================================================
-- Announcements
-- ============================================================
insert into public.announcements (season_id, title, body, date) values
  ('a0000000-0000-0000-0000-000000000001', 'East Wind Open registration is open', 'The mid-season tournament returns to the Cathedral on June 12-14. Reserve your seat — first 64 in.', '2026-05-13'),
  ('a0000000-0000-0000-0000-000000000001', 'Welcome our new members', 'Yuko and Renata join Marietta this week. Say hello when you see them at the table.', '2026-05-11');
