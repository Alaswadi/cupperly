# Quick deployment push script
Write-Host "🚀 Deploying CORS and Trust Proxy fixes..." -ForegroundColor Green

# Add changes
git add apps/api/src/index.ts
git add nixpacks.toml
git add DEPLOY_TO_COOLIFY.md
git add COOLIFY_QUICK_REFERENCE.md
git add PRE_DEPLOYMENT_CHECKLIST.md
git add DEPLOYMENT_SUMMARY.md
git add DEPLOYMENT_README.md

# Commit
git commit -m "Fix CORS production detection and trust proxy for Coolify"

# Push
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host "✅ Done! Now redeploy in Coolify." -ForegroundColor Green

