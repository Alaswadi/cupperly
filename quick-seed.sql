-- Quick Seed Script - Copy and paste this entire script into psql
-- Make sure you're connected to the cupperly database first

-- 1. Create organization
INSERT INTO organizations (id, name, slug, subdomain, description, "subscriptionStatus", "subscriptionPlan", "trialEndsAt", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Demo Coffee Roastery', 'demo-roastery', 'demo', 'Demo organization', 'TRIAL', 'PROFESSIONAL', NOW() + INTERVAL '30 days', NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW();

-- 2. Create admin@demo.com (password: demo123)
INSERT INTO users (id, email, password, "firstName", "lastName", "organizationId", role, "emailVerified", "emailVerifiedAt", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'admin@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u', 'Admin', 'User', o.id, 'ADMIN', true, NOW(), NOW(), NOW()
FROM organizations o WHERE o.slug = 'demo-roastery'
ON CONFLICT (email) DO UPDATE SET "updatedAt" = NOW();

-- 3. Create admin@demo.cupperly.com (password: demo123)
INSERT INTO users (id, email, password, "firstName", "lastName", "organizationId", role, "emailVerified", "emailVerifiedAt", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'admin@demo.cupperly.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u', 'Demo', 'Admin', o.id, 'ADMIN', true, NOW(), NOW(), NOW()
FROM organizations o WHERE o.slug = 'demo-roastery'
ON CONFLICT (email) DO UPDATE SET "updatedAt" = NOW();

-- 4. Create cupper users (password: demo123)
INSERT INTO users (id, email, password, "firstName", "lastName", "organizationId", role, "emailVerified", "emailVerifiedAt", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'cupper1@demo.cupperly.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u', 'Alice', 'Johnson', o.id, 'CUPPER', true, NOW(), NOW(), NOW()
FROM organizations o WHERE o.slug = 'demo-roastery'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password, "firstName", "lastName", "organizationId", role, "emailVerified", "emailVerifiedAt", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'cupper2@demo.cupperly.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvCy8u', 'Bob', 'Smith', o.id, 'CUPPER', true, NOW(), NOW(), NOW()
FROM organizations o WHERE o.slug = 'demo-roastery'
ON CONFLICT (email) DO NOTHING;

-- 5. Create SCA template
INSERT INTO "cuppingTemplates" (id, name, description, "organizationId", "createdBy", "isDefault", "isPublic", "scoringSystem", "maxScore", categories, "createdAt", "updatedAt")
SELECT 'sca-default-template', 'SCA Standard Cupping Form', 'Standard SCA cupping form', o.id, u.id, true, true, 'SCA', 100,
'{"categories": [{"name": "Aroma", "weight": 1, "maxScore": 10}, {"name": "Flavor", "weight": 1, "maxScore": 10}, {"name": "Aftertaste", "weight": 1, "maxScore": 10}, {"name": "Acidity", "weight": 1, "maxScore": 10}, {"name": "Body", "weight": 1, "maxScore": 10}, {"name": "Balance", "weight": 1, "maxScore": 10}, {"name": "Sweetness", "weight": 1, "maxScore": 10}, {"name": "Cleanliness", "weight": 1, "maxScore": 10}, {"name": "Uniformity", "weight": 1, "maxScore": 10}, {"name": "Overall", "weight": 1, "maxScore": 10}]}'::jsonb,
NOW(), NOW()
FROM organizations o CROSS JOIN users u WHERE o.slug = 'demo-roastery' AND u.email = 'admin@demo.com'
ON CONFLICT (id) DO UPDATE SET "updatedAt" = NOW();

-- 6. Verify
SELECT email, "firstName", "lastName", role FROM users ORDER BY role DESC, email;

