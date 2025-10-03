-- Step 1: Update any existing MANAGER or VIEWER users to CUPPER (preserving data)
UPDATE "users" SET "role" = 'CUPPER' WHERE "role" = 'MANAGER';
UPDATE "users" SET "role" = 'CUPPER' WHERE "role" = 'VIEWER';

-- Step 2: Update any existing MANAGER or VIEWER invitations to CUPPER (preserving data)
UPDATE "invitations" SET "role" = 'CUPPER' WHERE "role" = 'MANAGER';
UPDATE "invitations" SET "role" = 'CUPPER' WHERE "role" = 'VIEWER';

-- Step 3: Drop the default values temporarily from both tables
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "invitations" ALTER COLUMN "role" DROP DEFAULT;

-- Step 4: Create new enum type with only ADMIN and CUPPER
CREATE TYPE "user_role_new" AS ENUM ('ADMIN', 'CUPPER');

-- Step 5: Alter the columns to use the new enum type
ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role_new" USING ("role"::text::"user_role_new");
ALTER TABLE "invitations" ALTER COLUMN "role" TYPE "user_role_new" USING ("role"::text::"user_role_new");

-- Step 6: Drop the old enum type
DROP TYPE "user_role";

-- Step 7: Rename the new enum type to the original name
ALTER TYPE "user_role_new" RENAME TO "user_role";

-- Step 8: Restore the default values for both tables
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUPPER'::"user_role";
ALTER TABLE "invitations" ALTER COLUMN "role" SET DEFAULT 'CUPPER'::"user_role";

