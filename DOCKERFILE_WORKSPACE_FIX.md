# Dockerfile Workspace Conflict Fix

## Problem

Build was failing with:

```
must not have multiple workspaces with the same name
package '@cupperly/ui' has conflicts in the following paths:
    /app/packages/*
    /app/packages/ui
```

## Root Cause

The Dockerfile was copying the `packages` directory twice:
1. From the `deps` stage: `COPY --from=deps /app/packages ./packages`
2. From source: `COPY packages ./packages`

This created duplicate workspace definitions, causing npm to fail.

## Fix Applied

### apps/api/Dockerfile

**Before:**
```dockerfile
# Copy dependencies
COPY --from=deps /app/packages ./packages  # ❌ Copying packages from deps

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages  # ❌ Copying packages again from source
```

**After:**
```dockerfile
# Copy dependencies (only node_modules and package.json)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/apps/api/package.json ./apps/api/package.json

# Copy source code (including packages)
COPY apps/api ./apps/api
COPY packages ./packages  # ✅ Only copy packages once
```

### apps/web/Dockerfile

Same fix applied - removed duplicate packages copy.

## Changes Made

1. **apps/api/Dockerfile**:
   - Removed `COPY --from=deps /app/packages ./packages` from builder stage
   - Made package.json copies explicit in deps stage
   - Only copy packages source code once

2. **apps/web/Dockerfile**:
   - Same changes as API Dockerfile
   - Ensures consistency across both builds

## Testing

After this fix, the build should:
1. ✅ Install dependencies in deps stage
2. ✅ Copy source code (including packages) in builder stage
3. ✅ Build successfully without workspace conflicts
4. ✅ Create production images

## Next Steps

1. Commit and push changes
2. Force rebuild in Coolify
3. Build should complete successfully
4. Containers should start and run

---

**Status**: ✅ FIXED
**Date**: 2025-10-09

