#!/bin/bash

# Initialize CouchDB databases for LaHIM LIMS
# Run this script after starting Docker services

COUCHDB_URL="${COUCHDB_URL:-http://dev:dev@localhost:5984}"

echo "🗄️  Initializing CouchDB Databases..."
echo "======================================"

# List of databases to create
DATABASES=(
  "vocabularies_organisms"
  "vocabularies_antibiotics"
  "vocabularies_value_sets"
  "inventory"
  "lab_orders"
  "specimens"
  "lab_results"
  "test_catalog"
  "qc_results"
  "instruments"
  "reports"
  "worklists"
  "critical_values"
)

# Create databases
for db in "${DATABASES[@]}"; do
  echo -n "Creating $db... "
  result=$(curl -s -X PUT "$COUCHDB_URL/$db" 2>/dev/null)
  if echo "$result" | grep -q '"ok":true'; then
    echo "✅ Created"
  elif echo "$result" | grep -q "file_exists"; then
    echo "✅ Already exists"
  else
    echo "❌ Failed: $result"
  fi
done

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "Note: Indexes will be created automatically when services are accessed."

