#!/bin/bash
# Script to build and deploy lahim.io to GitHub Pages repository

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAHIM_IO_DIR="$PROJECT_ROOT/lahim.io"

echo "🔨 Building LaHIM frontend..."

# Build the site
cd "$PROJECT_ROOT"
yarn build:lahim.io

echo ""
echo "📦 Preparing deployment..."

cd "$LAHIM_IO_DIR"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Git repository not initialized. Running setup script..."
    "$SCRIPT_DIR/setup-lahim-io-repo.sh"
fi

# Check if remote is set
if ! git remote | grep -q origin; then
    echo "⚠️  No remote repository configured."
    echo "Please run: git remote add origin https://github.com/YOUR_USERNAME/lahim.io.git"
    exit 1
fi

# Add all changes
git add .

# Check if there are changes
if git diff --staged --quiet && git diff --quiet; then
    echo "ℹ️  No changes to deploy. Site is up to date."
    exit 0
fi

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy: Update LaHIM static site $(date +%Y-%m-%d\ %H:%M:%S)" || {
    echo "ℹ️  No changes to commit."
    exit 0
}

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://YOUR_USERNAME.github.io/lahim.io/"
echo "   Or if custom domain is configured: https://lahim.io"

