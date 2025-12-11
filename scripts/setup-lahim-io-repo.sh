#!/bin/bash
# Script to set up lahim.io as a separate GitHub repository for GitHub Pages

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAHIM_IO_DIR="$PROJECT_ROOT/lahim.io"

echo "🚀 Setting up lahim.io GitHub Pages repository..."

# Check if lahim.io directory exists
if [ ! -d "$LAHIM_IO_DIR" ]; then
    echo "❌ Error: lahim.io directory not found. Please run 'yarn build:lahim.io' first."
    exit 1
fi

cd "$LAHIM_IO_DIR"

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/

# Build artifacts (we keep the built files)
# build/

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF
fi

# Add all files
echo "📝 Staging files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit. Repository is up to date."
else
    echo "💾 Committing changes..."
    git commit -m "Initial commit: LaHIM static site for GitHub Pages"
fi

echo ""
echo "✅ Repository setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub named 'lahim.io' (or 'github.lahim.io')"
echo "2. Run the following commands:"
echo ""
echo "   cd lahim.io"
echo "   git remote add origin https://github.com/YOUR_USERNAME/lahim.io.git"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages in the repository settings:"
echo "   - Go to Settings → Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main"
echo "   - Folder: / (root)"
echo "   - Save"
echo ""
echo "4. (Optional) Set up custom domain 'lahim.io' in Pages settings"


