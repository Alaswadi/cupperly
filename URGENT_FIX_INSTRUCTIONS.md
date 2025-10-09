# 🚨 URGENT FIX: Package.json Not Found Error

## Quick Fix (5 minutes)

Your containers are crashing because they're looking for source code that doesn't exist. Here's the immediate fix:

### Step 1: Commit These Changes (1 minute)

```bash
git add .
git commit -m "Fix docker-compose for Coolify production deployment"
git push origin main
```

### Step 2: Add ONE Environment Variable in Coolify (1 minute)

Go to Coolify Dashboard → Your Resource → Environment Variables

**Add this single variable:**
```
BUILD_TARGET=production
```

### Step 3: Redeploy (3 minutes)

Click **"Redeploy"** or **"Force Rebuild"** in Coolify

Wait for the build to complete.

---

## That's It!

The containers should now build and run successfully.

---

## Full Environment Variables (For Complete Setup)

After the quick fix works, add these for a complete production setup:

```env
# Build Configuration
BUILD_TARGET=production
NODE_ENV=production

# Database
POSTGRES_PASSWORD=<your-strong-password>
DATABASE_URL=postgresql://postgres:<same-password>@postgres:5432/cupperly

# JWT Secrets (generate 3 random 32-char strings)
JWT_SECRET=<random-32-chars>
JWT_REFRESH_SECRET=<random-32-chars>
NEXTAUTH_SECRET=<random-32-chars>

# URLs
NEXTAUTH_URL=http://your-vps-ip:3000
NEXT_PUBLIC_API_URL=http://your-vps-ip:3001
```

### Generate Secrets:

**Windows:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

---

## What Was Wrong?

- ❌ **Before**: Containers expected source code to be mounted from local machine
- ✅ **After**: Containers build source code into the Docker image

## Verification

After redeployment:

1. **Check API**: `http://your-vps-ip:3001/health`
2. **Check Web**: `http://your-vps-ip:3000`
3. **Check Logs**: No more "ENOENT" errors

---

## Need More Help?

See detailed guide: [COOLIFY_FIX_PACKAGE_JSON_ERROR.md](./COOLIFY_FIX_PACKAGE_JSON_ERROR.md)

