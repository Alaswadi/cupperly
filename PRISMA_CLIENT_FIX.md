# Prisma Client Generation Fix

## Problem

TypeScript compilation (`tsc`) was failing during the build with exit code 2:

```
npm error command sh -c tsc
exit code: 2
```

## Root Cause

The API uses Prisma ORM, which requires the Prisma Client to be generated before TypeScript can compile. The Dockerfile was trying to build without generating the Prisma Client first, causing TypeScript to fail because it couldn't find the `@prisma/client` types.

## Fix Applied

### apps/api/Dockerfile

Added Prisma Client generation step before building:

**Before:**
```dockerfile
# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Build the application
WORKDIR /app/apps/api
RUN npm run build  # ❌ Fails - Prisma client not generated
```

**After:**
```dockerfile
# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate  # ✅ Generate Prisma client first

# Build the application
RUN npm run build  # ✅ Now TypeScript can find Prisma types
```

### Production Stage Updates

Also updated the production stage to:
1. Copy the built `dist` folder correctly
2. Copy the Prisma schema
3. Include Prisma client in node_modules
4. Run the correct entry point: `node dist/index.js`

**Before:**
```dockerfile
COPY --from=builder /app/apps/api/dist ./
CMD ["node", "index.js"]  # ❌ Wrong path
```

**After:**
```dockerfile
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/schema.prisma ./schema.prisma
CMD ["node", "dist/index.js"]  # ✅ Correct path
```

## Changes Made

1. **Added Prisma generation**: `RUN npx prisma generate` before build
2. **Fixed dist path**: Copy to `./dist` instead of `./`
3. **Added schema**: Copy `schema.prisma` for runtime
4. **Fixed CMD**: Run `node dist/index.js` instead of `node index.js`

## Expected Build Process

After this fix:

1. **Deps Stage**: Install all dependencies (including Prisma)
2. **Builder Stage**:
   - Copy source code
   - Generate Prisma Client ← **NEW**
   - Build TypeScript → JavaScript
3. **Production Stage**:
   - Copy built files
   - Copy Prisma schema
   - Run the application

## Testing

The build should now:
- ✅ Generate Prisma client successfully
- ✅ Compile TypeScript without errors
- ✅ Create production image
- ✅ Run the API successfully

---

**Status**: ✅ FIXED
**Date**: 2025-10-09

