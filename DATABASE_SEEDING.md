# 🌱 Cupperly Database Seeding Guide

This document explains how the database seeding works in Cupperly and provides troubleshooting steps.

---

## 📊 What Gets Seeded

The database seeding process creates all necessary initial data:

### 1. **Organization** (1)
- **Demo Coffee Roastery**
  - Slug: `demo-roastery`
  - Subscription: TRIAL (30 days)
  - Plan: PROFESSIONAL

### 2. **Users** (4)
- **Admin Users (2):**
  - `admin@demo.com` / `demo123` (ADMIN)
  - `admin@demo.cupperly.com` / `demo123` (ADMIN)
  
- **Cupper Users (2):**
  - `cupper1@demo.cupperly.com` / `demo123` (CUPPER)
  - `cupper2@demo.cupperly.com` / `demo123` (CUPPER)

### 3. **Cupping Templates** (1)
- **SCA Standard Cupping Form**
  - 10 categories (Aroma, Flavor, Aftertaste, Acidity, Body, Balance, Sweetness, Cleanliness, Uniformity, Overall)
  - Max score: 100 points
  - Default template for all sessions

### 4. **Sample Coffees** (2)
- **Ethiopian Yirgacheffe**
  - Origin: Ethiopia, Region: Yirgacheffe
  - Variety: Heirloom, Processing: Washed
  - Altitude: 1800m
  - Notes: Floral and citrus notes with a tea-like body

- **Colombian Supremo**
  - Origin: Colombia, Region: Huila
  - Variety: Caturra, Processing: Washed
  - Altitude: 1600m
  - Notes: Balanced with chocolate and caramel sweetness

### 5. **Flavor Descriptors** (40)
- **20 POSITIVE descriptors:**
  - Floral, Fruity, Citrus, Berry, Stone Fruit, Tropical, Chocolate, Caramel, Vanilla, Nutty, Honey, Brown Sugar, Spicy, Wine-like, Tea-like, Bright, Clean, Balanced, Complex, Smooth

- **20 NEGATIVE descriptors:**
  - Bitter, Sour, Astringent, Musty, Earthy, Grassy, Woody, Papery, Cardboard, Metallic, Chemical, Rubber, Petroleum, Rancid, Fermented, Moldy, Animal, Smoky, Burnt, Flat

---

## 🚀 Automatic Seeding (Recommended)

### How It Works

When you deploy to Coolify, the seeding happens **automatically**:

1. **Migrations run first** - Creates all database tables
2. **Seed script runs** - Populates initial data
3. **Smart detection** - Skips seeding if data already exists

### Deployment Process

```bash
# 1. Push to GitHub
git push

# 2. Redeploy in Coolify
# The startup script (apps/api/start.sh) will:
# - Run migrations: npx prisma migrate deploy
# - Run seeding: npx tsx /app/prisma/seed.ts
# - Start the app: node dist/index.js
```

### Expected Logs

After successful deployment, you should see:

```
🚀 Starting Cupperly API...
📊 Running database migrations...
No pending migrations to apply.
🌱 Seeding database...
🌱 Starting database seed...
📊 Checking existing data...
📝 Creating initial data...
✅ Created demo organization: Demo Coffee Roastery
✅ Created admin user: admin@demo.com
✅ Created admin user: admin@demo.cupperly.com
✅ Created cupper users: [ 'cupper1@demo.cupperly.com', 'cupper2@demo.cupperly.com' ]
✅ Created SCA template: SCA Standard Cupping Form
✅ Created sample coffees: [ 'Ethiopian Yirgacheffe', 'Colombian Supremo' ]
✅ Created 40 flavor descriptors

🎉 Database seed completed successfully!

📊 Summary:
   - Organization: Demo Coffee Roastery
   - Users: 4 (2 admins, 2 cuppers)
   - Templates: 1 (SCA Standard)
   - Samples: 2 (Ethiopian, Colombian)
   - Flavor Descriptors: 40 (20 positive, 20 negative)

🔑 Login Credentials:
   Email: admin@demo.com
   Email: admin@demo.cupperly.com
   Password: demo123

🚀 Starting application...
```

---

## 🗄️ Manual Seeding (Alternative)

If automatic seeding fails, you can use the SQL file.

### Method 1: Using SQL File

```bash
# Connect to your database and run the SQL file
psql -h YOUR_DB_HOST -U postgres -d cupperly -f database-seed-complete.sql
```

### Method 2: From Coolify Terminal

If you have access to the backend container terminal:

```bash
# Navigate to prisma directory
cd /app/prisma

# Run the seed script
npx tsx seed.ts
```

### Method 3: Direct SQL in psql

Connect to your database:
```bash
psql -h YOUR_DB_HOST -U postgres -d cupperly
```

Then copy and paste the contents of `database-seed-complete.sql`.

---

## ✅ Verification

### Check if Data Exists

```sql
-- Check organizations
SELECT COUNT(*) as count FROM organizations;

-- Check users
SELECT email, role FROM users ORDER BY role DESC;

-- Check templates
SELECT name FROM "cuppingTemplates";

-- Check samples
SELECT name, origin FROM samples;

-- Check flavor descriptors
SELECT category, COUNT(*) as count 
FROM flavor_descriptors 
WHERE "isDefault" = true 
GROUP BY category;
```

### Expected Results

```
Organizations: 1
Users: 4 (2 ADMIN, 2 CUPPER)
Templates: 1 (SCA Standard)
Samples: 2 (Ethiopian, Colombian)
Flavor Descriptors: 40 (20 POSITIVE, 20 NEGATIVE)
```

---

## 🔧 Troubleshooting

### Issue: "Seeding skipped (already done or failed)"

**Cause:** The seed script encountered an error or data already exists.

**Solution:**
1. Check the logs for specific error messages
2. Verify database connection
3. Try manual seeding with SQL file

### Issue: "Cannot find module '@prisma/client'"

**Cause:** Prisma client not generated or installed.

**Solution:**
```bash
# In the backend container
npx prisma generate
npx tsx /app/prisma/seed.ts
```

### Issue: "Flavor descriptors not showing"

**Cause:** Flavor descriptors seeding might have failed silently.

**Solution:**
```sql
-- Check if flavor descriptors exist
SELECT COUNT(*) FROM flavor_descriptors WHERE "isDefault" = true;

-- If count is 0, run the SQL file
\i database-seed-complete.sql
```

### Issue: "Users table is empty"

**Cause:** Seeding failed or was skipped.

**Solution:**
1. Check if organization exists first:
   ```sql
   SELECT * FROM organizations;
   ```
2. If no organization, run the complete SQL file:
   ```bash
   psql -d cupperly -f database-seed-complete.sql
   ```

---

## 🔄 Re-seeding

If you need to re-seed the database:

### Option 1: Delete and Re-seed

```sql
-- WARNING: This deletes all data!
TRUNCATE TABLE users, organizations, samples, "cuppingTemplates", flavor_descriptors CASCADE;

-- Then run the seed script or SQL file
```

### Option 2: Selective Re-seed

The seed scripts use `upsert` operations, so you can:
- Delete specific records
- Re-run the seed script
- It will recreate only missing data

---

## 📝 Files

- **`packages/database/seed.ts`** - Main TypeScript seed script (runs automatically)
- **`database-seed-complete.sql`** - Complete SQL backup (manual fallback)
- **`apps/api/start.sh`** - Startup script that runs migrations and seeding

---

## 🎯 Quick Reference

### Login After Seeding

```
URL: https://demo.cupperly.com
Email: admin@demo.com
Password: demo123
```

### Check Seeding Status

```bash
# In Coolify, check backend logs for:
"🎉 Database seed completed successfully!"
```

### Force Re-seed

```bash
# Delete all data and re-seed
psql -d cupperly -f database-seed-complete.sql
```

---

## 🚨 Important Notes

1. **Automatic seeding runs on every deployment** - But it's smart and skips if data exists
2. **Password is always `demo123`** - Change this in production!
3. **Flavor descriptors are global** - They have `organizationId = NULL` and `isDefault = true`
4. **Sample data is for demo purposes** - You can delete and add your own
5. **The SQL file is a backup** - Use it if TypeScript seeding fails

---

## 📞 Support

If seeding fails:
1. Check the backend logs in Coolify
2. Look for specific error messages
3. Try the SQL file as a fallback
4. Verify database connection and credentials
5. Check that migrations ran successfully first

---

**Last Updated:** 2025-10-12

