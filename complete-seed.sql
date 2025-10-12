-- ============================================================
-- Cupperly Complete Database Seed Script
-- ============================================================
-- This script will create all necessary initial data
-- Run this in your PostgreSQL database: psql -d cupperly -f complete-seed.sql
-- ============================================================

-- Start transaction
BEGIN;

-- ============================================================
-- 1. CREATE DEMO ORGANIZATION
-- ============================================================
DO $$
DECLARE
  org_id UUID;
BEGIN
  -- Insert or get existing organization
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
    "updatedAt" = NOW()
  RETURNING id INTO org_id;

  RAISE NOTICE 'Organization created/updated with ID: %', org_id;
END $$;

-- ============================================================
-- 2. CREATE ADMIN USER
-- ============================================================
-- Password: demo123 (bcrypt hashed)
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
SELECT
  gen_random_uuid(),
  'admin@demo.cupperly.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
  'Demo',
  'Admin',
  o.id,
  'ADMIN',
  true,
  NOW(),
  NOW(),
  NOW()
FROM organizations o
WHERE o.slug = 'demo-roastery'
ON CONFLICT (email) DO UPDATE SET
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  "updatedAt" = NOW();

-- Also create admin@demo.com for convenience
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
SELECT
  gen_random_uuid(),
  'admin@demo.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
  'Admin',
  'User',
  o.id,
  'ADMIN',
  true,
  NOW(),
  NOW(),
  NOW()
FROM organizations o
WHERE o.slug = 'demo-roastery'
ON CONFLICT (email) DO UPDATE SET
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  "updatedAt" = NOW();

-- ============================================================
-- 3. CREATE CUPPER USERS
-- ============================================================
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
SELECT
  gen_random_uuid(),
  'cupper1@demo.cupperly.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
  'Alice',
  'Johnson',
  o.id,
  'CUPPER',
  true,
  NOW(),
  NOW(),
  NOW()
FROM organizations o
WHERE o.slug = 'demo-roastery'
ON CONFLICT (email) DO NOTHING;

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
SELECT
  gen_random_uuid(),
  'cupper2@demo.cupperly.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
  'Bob',
  'Smith',
  o.id,
  'CUPPER',
  true,
  NOW(),
  NOW(),
  NOW()
FROM organizations o
WHERE o.slug = 'demo-roastery'
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 4. CREATE SCA DEFAULT TEMPLATE
-- ============================================================
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
SELECT
  'sca-default-template',
  'SCA Standard Cupping Form',
  'Standard Specialty Coffee Association cupping form',
  o.id,
  u.id,
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
FROM organizations o
CROSS JOIN users u
WHERE o.slug = 'demo-roastery'
  AND u.email = 'admin@demo.cupperly.com'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- ============================================================
-- 5. CREATE SAMPLE DATA (Optional - Coffee Samples)
-- ============================================================
INSERT INTO samples (
  id,
  name,
  origin,
  variety,
  process,
  "harvestDate",
  "organizationId",
  "createdBy",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Ethiopian Yirgacheffe',
  'Ethiopia',
  'Heirloom',
  'Washed',
  NOW() - INTERVAL '3 months',
  o.id,
  u.id,
  NOW(),
  NOW()
FROM organizations o
CROSS JOIN users u
WHERE o.slug = 'demo-roastery'
  AND u.email = 'admin@demo.cupperly.com'
ON CONFLICT DO NOTHING;

INSERT INTO samples (
  id,
  name,
  origin,
  variety,
  process,
  "harvestDate",
  "organizationId",
  "createdBy",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Colombian Supremo',
  'Colombia',
  'Caturra',
  'Washed',
  NOW() - INTERVAL '2 months',
  o.id,
  u.id,
  NOW(),
  NOW()
FROM organizations o
CROSS JOIN users u
WHERE o.slug = 'demo-roastery'
  AND u.email = 'admin@demo.cupperly.com'
ON CONFLICT DO NOTHING;

-- Commit transaction
COMMIT;

-- ============================================================
-- 6. VERIFY DATA
-- ============================================================
\echo ''
\echo '============================================================'
\echo 'DATABASE SEEDING COMPLETED!'
\echo '============================================================'
\echo ''

-- Show summary
SELECT 'SUMMARY' as info, '--------------------' as value
UNION ALL
SELECT 'Organizations:', COUNT(*)::text FROM organizations
UNION ALL
SELECT 'Users:', COUNT(*)::text FROM users
UNION ALL
SELECT 'Templates:', COUNT(*)::text FROM "cuppingTemplates"
UNION ALL
SELECT 'Samples:', COUNT(*)::text FROM samples;

\echo ''
\echo 'CREATED USERS:'
\echo '--------------------'

-- Show created users
SELECT 
  email,
  "firstName" || ' ' || "lastName" as name,
  role,
  CASE WHEN "emailVerified" THEN 'Yes' ELSE 'No' END as verified
FROM users
ORDER BY role DESC, email;

\echo ''
\echo '============================================================'
\echo 'LOGIN CREDENTIALS:'
\echo '============================================================'
\echo 'Email: admin@demo.com'
\echo 'Email: admin@demo.cupperly.com'
\echo 'Password: demo123'
\echo '============================================================'
\echo ''

