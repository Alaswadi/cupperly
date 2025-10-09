# 🚨 URGENT FIX: Workspace Conflict Error

## Problem

Build is failing with:
```
must not have multiple workspaces with the same name
package '@cupperly/ui' has conflicts
```

## Root Cause

Dockerfiles were copying the `packages` directory twice, creating duplicate workspace definitions.

## Quick Fix (2 minutes)

### Step 1: Commit These Changes (1 minute)

The Dockerfiles have been fixed to avoid duplicate package copies.

```bash
git add .
git commit -m "Fix Dockerfile workspace conflicts for Coolify deployment"
git push origin main
```

### Step 2: Force Rebuild in Coolify (1 minute)

1. Go to Coolify Dashboard
2. Find your Cupperly resource
3. Click **"Force Rebuild"** (IMPORTANT - clears cache)
4. Wait for build to complete (5-10 minutes)

### Step 3: Set Required Environment Variables

While the build is running, set these in Coolify → Environment Variables:

```env
# Database (REQUIRED)
POSTGRES_PASSWORD=<your-strong-password>
DATABASE_URL=postgresql://postgres:<same-password>@postgres:5432/cupperly

# JWT Secrets (REQUIRED - generate 3 random 32-char strings)
JWT_SECRET=<random-32-chars>
JWT_REFRESH_SECRET=<random-32-chars>
NEXTAUTH_SECRET=<random-32-chars>

# URLs (REQUIRED - replace with your VPS IP)
NEXTAUTH_URL=http://your-vps-ip:3000
NEXT_PUBLIC_API_URL=http://your-vps-ip:3001
```

**Note:** You don't need `BUILD_TARGET` anymore - it's hardcoded to production now!

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

---

## What Changed?

### Before (Development Mode ❌):
```yaml
api:
  build:
    target: development  # ❌ Runs "npm run dev"
  command: npm run dev   # ❌ Needs tsx (dev dependency)
```

### After (Production Mode ✅):
```yaml
api:
  build:
    target: production   # ✅ Runs compiled code
  # No command needed    # ✅ Uses built-in CMD
```

## Verification

After redeployment, you should see:

1. **Build logs**:
   - ✅ "Building API..."
   - ✅ "npm run build" succeeds
   - ✅ "Building Web..."
   - ✅ "next build" succeeds

2. **Container logs**:
   - ✅ No more "tsx: not found"
   - ✅ No more "next: not found"
   - ✅ API starts on port 3001
   - ✅ Web starts on port 3000

3. **Access**:
   - ✅ API Health: `http://your-vps-ip:3001/health`
   - ✅ Frontend: `http://your-vps-ip:3000`

## Troubleshooting

### Still seeing "tsx not found"?

This means it's still building in development mode. Check:
1. Did you commit and push the changes?
2. Did you click "Force Rebuild" (not just "Redeploy")?
3. Check build logs - should say `target: production`

### Build fails?

Check that all environment variables are set, especially:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NEXTAUTH_SECRET`

---

## For Local Development

Use the new development compose file:

```bash
docker-compose -f docker-compose.dev.yml up
```

This gives you hot-reload and all development features.

---

**Need More Help?** Check [COOLIFY_FIX_PACKAGE_JSON_ERROR.md](./COOLIFY_FIX_PACKAGE_JSON_ERROR.md)

