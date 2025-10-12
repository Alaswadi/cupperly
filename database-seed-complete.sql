-- ============================================================
-- CUPPERLY COMPLETE DATABASE SEED
-- ============================================================
-- This script seeds all necessary data for Cupperly
-- It checks if data exists before inserting to avoid duplicates
-- Run this with: psql -d cupperly -f database-seed-complete.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ORGANIZATIONS
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE slug = 'demo-roastery') THEN
    INSERT INTO organizations (id, name, slug, subdomain, description, "subscriptionStatus", "subscriptionPlan", "trialEndsAt", "createdAt", "updatedAt")
    VALUES (
      'org-demo-roastery-001',
      'Demo Coffee Roastery',
      'demo-roastery',
      'demo',
      'A demonstration coffee roastery for Cupperly',
      'TRIAL',
      'PROFESSIONAL',
      NOW() + INTERVAL '30 days',
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created organization: Demo Coffee Roastery';
  ELSE
    RAISE NOTICE 'Organization already exists: Demo Coffee Roastery';
  END IF;
END $$;

-- ============================================================
-- 2. USERS
-- ============================================================
-- Password for all users: demo123 (bcrypt hashed)
DO $$
DECLARE
  org_id TEXT;
BEGIN
  SELECT id INTO org_id FROM organizations WHERE slug = 'demo-roastery' LIMIT 1;

  -- Admin user 1: admin@demo.com
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@demo.com') THEN
    INSERT INTO users (id, email, password, "firstName", "lastName", "organizationId", role, "emailVerified", "emailVerifiedAt", "createdAt", "updatedAt")
    VALUES (
      'user-admin-demo-001',
      'admin@demo.com',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
      'Admin',
      'User',
      org_id,
      'ADMIN',
      true,
      NOW(),
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created user: admin@demo.com';
  ELSE
    RAISE NOTICE 'User already exists: admin@demo.com';
  END IF;

  -- Admin user 2: admin@demo.cupperly.com
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@demo.cupperly.com') THEN
    INSERT INTO users (id, email, password, "firstName", "lastName", "organizationId", role, "emailVerified", "emailVerifiedAt", "createdAt", "updatedAt")
    VALUES (
      'user-admin-cupperly-001',
      'admin@demo.cupperly.com',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
      'Demo',
      'Admin',
      org_id,
      'ADMIN',
      true,
      NOW(),
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created user: admin@demo.cupperly.com';
  ELSE
    RAISE NOTICE 'User already exists: admin@demo.cupperly.com';
  END IF;

  -- Cupper user 1
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'cupper1@demo.cupperly.com') THEN
    INSERT INTO users (id, email, password, "firstName", "lastName", "organizationId", role, "emailVerified", "emailVerifiedAt", "createdAt", "updatedAt")
    VALUES (
      'user-cupper1-001',
      'cupper1@demo.cupperly.com',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
      'Alice',
      'Johnson',
      org_id,
      'CUPPER',
      true,
      NOW(),
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created user: cupper1@demo.cupperly.com';
  ELSE
    RAISE NOTICE 'User already exists: cupper1@demo.cupperly.com';
  END IF;

  -- Cupper user 2
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'cupper2@demo.cupperly.com') THEN
    INSERT INTO users (id, email, password, "firstName", "lastName", "organizationId", role, "emailVerified", "emailVerifiedAt", "createdAt", "updatedAt")
    VALUES (
      'user-cupper2-001',
      'cupper2@demo.cupperly.com',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u',
      'Bob',
      'Smith',
      org_id,
      'CUPPER',
      true,
      NOW(),
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created user: cupper2@demo.cupperly.com';
  ELSE
    RAISE NOTICE 'User already exists: cupper2@demo.cupperly.com';
  END IF;
END $$;

-- ============================================================
-- 3. CUPPING TEMPLATES
-- ============================================================
DO $$
DECLARE
  org_id TEXT;
  admin_id TEXT;
BEGIN
  SELECT id INTO org_id FROM organizations WHERE slug = 'demo-roastery' LIMIT 1;
  SELECT id INTO admin_id FROM users WHERE email = 'admin@demo.com' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM "cuppingTemplates" WHERE id = 'sca-default-template') THEN
    INSERT INTO "cuppingTemplates" (id, name, description, "organizationId", "createdBy", "isDefault", "isPublic", "scoringSystem", "maxScore", categories, "createdAt", "updatedAt")
    VALUES (
      'sca-default-template',
      'SCA Standard Cupping Form',
      'Standard Specialty Coffee Association cupping form',
      org_id,
      admin_id,
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
    );
    RAISE NOTICE 'Created template: SCA Standard Cupping Form';
  ELSE
    RAISE NOTICE 'Template already exists: SCA Standard Cupping Form';
  END IF;
END $$;

-- ============================================================
-- 4. SAMPLE COFFEES
-- ============================================================
DO $$
DECLARE
  org_id TEXT;
BEGIN
  SELECT id INTO org_id FROM organizations WHERE slug = 'demo-roastery' LIMIT 1;

  -- Ethiopian Yirgacheffe
  IF NOT EXISTS (SELECT 1 FROM samples WHERE id = 'sample-ethiopian-yirgacheffe') THEN
    INSERT INTO samples (id, name, origin, region, variety, "processingMethod", altitude, "harvestDate", notes, "organizationId", "createdAt", "updatedAt")
    VALUES (
      'sample-ethiopian-yirgacheffe',
      'Ethiopian Yirgacheffe',
      'Ethiopia',
      'Yirgacheffe',
      'Heirloom',
      'WASHED',
      1800,
      NOW() - INTERVAL '90 days',
      'Floral and citrus notes with a tea-like body',
      org_id,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created sample: Ethiopian Yirgacheffe';
  ELSE
    RAISE NOTICE 'Sample already exists: Ethiopian Yirgacheffe';
  END IF;

  -- Colombian Supremo
  IF NOT EXISTS (SELECT 1 FROM samples WHERE id = 'sample-colombian-supremo') THEN
    INSERT INTO samples (id, name, origin, region, variety, "processingMethod", altitude, "harvestDate", notes, "organizationId", "createdAt", "updatedAt")
    VALUES (
      'sample-colombian-supremo',
      'Colombian Supremo',
      'Colombia',
      'Huila',
      'Caturra',
      'WASHED',
      1600,
      NOW() - INTERVAL '60 days',
      'Balanced with chocolate and caramel sweetness',
      org_id,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Created sample: Colombian Supremo';
  ELSE
    RAISE NOTICE 'Sample already exists: Colombian Supremo';
  END IF;
END $$;

-- ============================================================
-- 5. FLAVOR DESCRIPTORS (40 total: 20 positive, 20 negative)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM flavor_descriptors WHERE "isDefault" = true LIMIT 1) THEN
    -- POSITIVE Flavors
    INSERT INTO flavor_descriptors (id, name, category, description, "isDefault", "organizationId", "createdBy", "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), 'Floral', 'POSITIVE', 'Delicate flower-like aromas and flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Fruity', 'POSITIVE', 'Fresh fruit characteristics', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Citrus', 'POSITIVE', 'Bright citrus notes like lemon, orange, lime', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Berry', 'POSITIVE', 'Berry flavors like blueberry, strawberry, raspberry', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Stone Fruit', 'POSITIVE', 'Peach, apricot, plum characteristics', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Tropical', 'POSITIVE', 'Tropical fruit notes like mango, pineapple, passion fruit', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Chocolate', 'POSITIVE', 'Rich chocolate flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Caramel', 'POSITIVE', 'Sweet caramel notes', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Vanilla', 'POSITIVE', 'Smooth vanilla characteristics', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Nutty', 'POSITIVE', 'Nut-like flavors such as almond, hazelnut, walnut', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Honey', 'POSITIVE', 'Sweet honey characteristics', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Brown Sugar', 'POSITIVE', 'Rich brown sugar sweetness', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Spicy', 'POSITIVE', 'Pleasant spice notes like cinnamon, clove, cardamom', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Wine-like', 'POSITIVE', 'Wine-like fermented fruit characteristics', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Tea-like', 'POSITIVE', 'Tea-like astringency and flavor', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Bright', 'POSITIVE', 'Lively, vibrant acidity', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Clean', 'POSITIVE', 'Pure, clear flavor profile', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Balanced', 'POSITIVE', 'Well-balanced flavor components', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Complex', 'POSITIVE', 'Multiple layered flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Smooth', 'POSITIVE', 'Smooth, pleasant mouthfeel', true, NULL, NULL, NOW(), NOW());

    RAISE NOTICE 'Created 20 POSITIVE flavor descriptors';

    -- NEGATIVE Flavors
    INSERT INTO flavor_descriptors (id, name, category, description, "isDefault", "organizationId", "createdBy", "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), 'Bitter', 'NEGATIVE', 'Unpleasant bitter taste', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Sour', 'NEGATIVE', 'Overly sour or acidic', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Astringent', 'NEGATIVE', 'Harsh, drying sensation', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Musty', 'NEGATIVE', 'Moldy, stale characteristics', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Earthy', 'NEGATIVE', 'Unpleasant earthy, dirty flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Grassy', 'NEGATIVE', 'Green, grassy off-flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Woody', 'NEGATIVE', 'Unpleasant woody characteristics', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Papery', 'NEGATIVE', 'Paper-like off-flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Cardboard', 'NEGATIVE', 'Cardboard-like staleness', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Metallic', 'NEGATIVE', 'Metallic off-flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Chemical', 'NEGATIVE', 'Chemical or medicinal flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Rubber', 'NEGATIVE', 'Rubber-like off-flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Petroleum', 'NEGATIVE', 'Petroleum or fuel-like flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Rancid', 'NEGATIVE', 'Rancid, spoiled characteristics', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Fermented', 'NEGATIVE', 'Over-fermented, alcoholic flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Moldy', 'NEGATIVE', 'Mold-like off-flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Animal', 'NEGATIVE', 'Unpleasant animal-like flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Smoky', 'NEGATIVE', 'Unpleasant smoky characteristics', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Burnt', 'NEGATIVE', 'Burnt, over-roasted flavors', true, NULL, NULL, NOW(), NOW()),
      (gen_random_uuid(), 'Flat', 'NEGATIVE', 'Lack of flavor or character', true, NULL, NULL, NOW(), NOW());

    RAISE NOTICE 'Created 20 NEGATIVE flavor descriptors';
  ELSE
    RAISE NOTICE 'Flavor descriptors already exist, skipping...';
  END IF;
END $$;

-- ============================================================
-- COMMIT AND SUMMARY
-- ============================================================
COMMIT;

-- Display summary
DO $$
DECLARE
  org_count INT;
  user_count INT;
  template_count INT;
  sample_count INT;
  flavor_count INT;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations;
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO template_count FROM "cuppingTemplates";
  SELECT COUNT(*) INTO sample_count FROM samples;
  SELECT COUNT(*) INTO flavor_count FROM flavor_descriptors WHERE "isDefault" = true;

  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'DATABASE SEEDING COMPLETED!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  - Organizations: %', org_count;
  RAISE NOTICE '  - Users: %', user_count;
  RAISE NOTICE '  - Templates: %', template_count;
  RAISE NOTICE '  - Samples: %', sample_count;
  RAISE NOTICE '  - Flavor Descriptors: %', flavor_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Login Credentials:';
  RAISE NOTICE '  Email: admin@demo.com';
  RAISE NOTICE '  Email: admin@demo.cupperly.com';
  RAISE NOTICE '  Password: demo123';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
END $$;

-- Show created users
SELECT
  email,
  "firstName" || ' ' || "lastName" as name,
  role,
  CASE WHEN "emailVerified" THEN 'Yes' ELSE 'No' END as verified
FROM users
ORDER BY role DESC, email;

