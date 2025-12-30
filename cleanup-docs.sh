#!/bin/bash

# Script to archive redundant documentation files
# These are now covered by ARCHITECTURE_AND_DESIGN.md

ARCHIVE_DIR="docs/archived"
mkdir -p "$ARCHIVE_DIR"

echo "Archiving redundant documentation files..."
echo ""

# Files that are now covered by ARCHITECTURE_AND_DESIGN.md
REDUNDANT_FILES=(
    # Priority summaries (covered in Implementation Status section)
    "ALL_PRIORITIES_COMPLETE_SUMMARY.md"
    "PRIORITY_1_COMPLETION_SUMMARY.md"
    "PRIORITY_1_STATUS.md"
    "PRIORITY_2_COMPLETION_SUMMARY.md"
    "PRIORITY_2_PROGRESS.md"
    "PRIORITY_2_IMPLEMENTATION_PLAN.md"
    "PRIORITY_3_COMPLETION_SUMMARY.md"
    
    # Implementation analysis (covered in Architecture & Design)
    "HOLISTIC_IMPLEMENTATION_ANALYSIS.md"
    "IMPLEMENTATION_STATUS_QUICK_REFERENCE.md"
    
    # Status reports (covered in Implementation Status section)
    "ACTUAL_IMPLEMENTATION_STATUS.md"
    "APPLICATION_STATUS.md"
    "COMPLETE_IMPLEMENTATION_SUMMARY.md"
    "COMPLETION_SUMMARY.md"
    "FINAL_COMPLETION_REPORT.md"
    "FINAL_STATUS.md"
    "IMPLEMENTATION_SUMMARY.md"
    "STARTUP_STATUS.md"
)

ARCHIVED=0
NOT_FOUND=0

for file in "${REDUNDANT_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_DIR/"
        echo "✅ Archived: $file"
        ARCHIVED=$((ARCHIVED + 1))
    else
        echo "⚠️  Not found: $file"
        NOT_FOUND=$((NOT_FOUND + 1))
    fi
done

echo ""
echo "=========================================="
echo "Archive Summary"
echo "=========================================="
echo "Archived: $ARCHIVED files"
echo "Not found: $NOT_FOUND files"
echo ""
echo "Files moved to: $ARCHIVE_DIR/"
echo ""
echo "✅ Cleanup complete!"


