-- Cupperly Database Seed Script
-- Run this in your PostgreSQL database to create initial data

-- 1. Create Demo Organization
INSERT INTO organizations (
  id,
  name,
  slug,
  subdomain,
  description,
  "subscriptionStatus",
  "subscriptionPlan",
  "trialEndsAt",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Demo Coffee Roastery',
  'demo-roastery',
  'demo',
  'A demonstration coffee roastery for Cupperly',
  'TRIAL',
  'PROFESSIONAL',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description
RETURNING id;

-- Store the organization ID for later use
-- You'll need to replace 'YOUR_ORG_ID' below with the actual ID returned above

-- 2. Create Admin User
-- Password: demo123 (hashed with bcrypt)
INSERT INTO users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  "organizationId",
  role,
  "emailVerified",
  "emailVerifiedAt",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'admin@demo.cupperly.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
  'Demo',
  'Admin',
  (SELECT id FROM organizations WHERE slug = 'demo-roastery' LIMIT 1),
  'ADMIN',
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName";

-- 3. Create Cupper Users
INSERT INTO users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  "organizationId",
  role,
  "emailVerified",
  "emailVerifiedAt",
  "createdAt",
  "updatedAt"
)
VALUES 
(
  gen_random_uuid(),
  'cupper1@demo.cupperly.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
  'Alice',
  'Johnson',
  (SELECT id FROM organizations WHERE slug = 'demo-roastery' LIMIT 1),
  'CUPPER',
  true,
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'cupper2@demo.cupperly.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
  'Bob',
  'Smith',
  (SELECT id FROM organizations WHERE slug = 'demo-roastery' LIMIT 1),
  'CUPPER',
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 4. Create SCA Default Template
INSERT INTO "cuppingTemplates" (
  id,
  name,
  description,
  "organizationId",
  "createdBy",
  "isDefault",
  "isPublic",
  "scoringSystem",
  "maxScore",
  categories,
  "createdAt",
  "updatedAt"
)
VALUES (
  'sca-default-template',
  'SCA Standard Cupping Form',
  'Standard Specialty Coffee Association cupping form',
  (SELECT id FROM organizations WHERE slug = 'demo-roastery' LIMIT 1),
  (SELECT id FROM users WHERE email = 'admin@demo.cupperly.com' LIMIT 1),
  true,
  true,
  'SCA',
  100,
  '{"categories": [
    {"name": "Aroma", "weight": 1, "maxScore": 10},
    {"name": "Flavor", "weight": 1, "maxScore": 10},
    {"name": "Aftertaste", "weight": 1, "maxScore": 10},
    {"name": "Acidity", "weight": 1, "maxScore": 10},
    {"name": "Body", "weight": 1, "maxScore": 10},
    {"name": "Balance", "weight": 1, "maxScore": 10},
    {"name": "Sweetness", "weight": 1, "maxScore": 10},
    {"name": "Cleanliness", "weight": 1, "maxScore": 10},
    {"name": "Uniformity", "weight": 1, "maxScore": 10},
    {"name": "Overall", "weight": 1, "maxScore": 10}
  ]}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Verify the data
SELECT 'Organizations:' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Templates:', COUNT(*) FROM "cuppingTemplates";

-- Show created users
SELECT 
  email,
  "firstName",
  "lastName",
  role,
  "emailVerified"
FROM users
ORDER BY role DESC, email;

