#!/bin/bash

# Create test data for LaHIM LIMS testing
# Run this after backend server is running

API_URL="${API_URL:-http://localhost:3000}"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 Creating Test Data for LaHIM LIMS"
echo "===================================="
echo ""

# Check if server is running
if ! curl -s "$API_URL/health" > /dev/null; then
  echo "❌ Backend server not running. Please start it first."
  exit 1
fi

echo "✅ Backend server is running"
echo ""

# 1. Create Test Catalog Entry
echo "1. Creating test catalog entry..."
TEST_CATALOG=$(curl -s -X POST "$API_URL/test-catalog" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "GLU",
    "name": "Glucose",
    "resultType": "numeric",
    "analyticalPhases": {
      "analytical": {
        "resultTemplate": {
          "fields": [
            {
              "name": "value",
              "type": "number",
              "label": "Glucose Value",
              "required": true,
              "unit": "mg/dL",
              "min": 0,
              "max": 1000
            }
          ]
        },
        "validationRules": {
          "min": 70,
          "max": 100,
          "criticalLow": 40,
          "criticalHigh": 400
        }
      }
    },
    "active": true
  }')

if echo "$TEST_CATALOG" | grep -q "error"; then
  echo "⚠️  Test catalog may already exist or error occurred"
else
  echo -e "${GREEN}✅ Test catalog entry created${NC}"
fi
echo ""

# 2. Create Lab Order
echo "2. Creating lab order..."
LAB_ORDER=$(curl -s -X POST "$API_URL/lab-orders" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-test-001",
    "patientName": "Test Patient",
    "orderedBy": "Dr. Test",
    "priority": "routine",
    "tests": [
      {
        "testCode": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "2339-0",
              "display": "Glucose"
            }
          ]
        },
        "testName": "Glucose",
        "section": "Chemistry"
      }
    ],
    "status": "ordered",
    "notes": "Test order for integration testing"
  }')

ORDER_ID=$(echo "$LAB_ORDER" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', data.get('_id', '')))" 2>/dev/null)

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "None" ]; then
  echo "⚠️  Could not extract order ID. Response: $LAB_ORDER"
  ORDER_ID="test-order-001"
else
  echo -e "${GREEN}✅ Lab order created: $ORDER_ID${NC}"
fi
echo ""

# 3. Create Specimen (directly in CouchDB via API if endpoint exists, otherwise create via curl)
echo "3. Creating specimen..."
ACCESSION_NUM="ACC-$(date +%s)"
SPECIMEN_DATA=$(cat <<EOF
{
  "type": "specimen",
  "orderId": "$ORDER_ID",
  "patientId": "patient-test-001",
  "patientName": "Test Patient",
  "specimenType": "blood",
  "collectedOn": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "collected",
  "accessionNumber": "$ACCESSION_NUM",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)

# Try to create via CouchDB directly
SPECIMEN_RESPONSE=$(curl -s -X POST "$API_URL/specimens" \
  -H "Content-Type: application/json" \
  -d "$SPECIMEN_DATA" 2>&1)

# If that fails, create directly in CouchDB
if echo "$SPECIMEN_RESPONSE" | grep -q "404\|Not Found"; then
  echo "⚠️  POST /specimens not available, creating directly in CouchDB..."
  COUCH_RESPONSE=$(curl -s -X POST "http://dev:dev@localhost:5984/specimens" \
    -H "Content-Type: application/json" \
    -d "$SPECIMEN_DATA")
  SPECIMEN_ID=$(echo "$COUCH_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
else
  SPECIMEN_ID=$(echo "$SPECIMEN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', data.get('_id', '')))" 2>/dev/null)
fi

if [ -z "$SPECIMEN_ID" ] || [ "$SPECIMEN_ID" = "None" ]; then
  echo "⚠️  Could not extract specimen ID. Using generated ID."
  SPECIMEN_ID="specimen-$(date +%s)"
else
  echo -e "${GREEN}✅ Specimen created: $SPECIMEN_ID${NC}"
fi
echo ""

# 4. Create Instrument
echo "4. Creating instrument..."
INSTRUMENT=$(curl -s -X POST "$API_URL/instruments" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Analyzer",
    "type": "analyzer",
    "manufacturer": "Test Corp",
    "model": "TA-1000",
    "serialNumber": "SN-001",
    "section": "Chemistry",
    "status": "active",
    "location": "Lab A"
  }')

INSTRUMENT_ID=$(echo "$INSTRUMENT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', data.get('_id', '')))" 2>/dev/null)

if [ -z "$INSTRUMENT_ID" ] || [ "$INSTRUMENT_ID" = "None" ]; then
  echo "⚠️  Could not extract instrument ID. Response: $INSTRUMENT"
  INSTRUMENT_ID="test-instrument-001"
else
  echo -e "${GREEN}✅ Instrument created: $INSTRUMENT_ID${NC}"
fi
echo ""

# 5. Create Vocabulary Entry (Organism)
echo "5. Creating vocabulary entry (organism)..."
ORGANISM=$(curl -s -X POST "$API_URL/vocabularies/organisms" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "33795004",
    "display": "Escherichia coli",
    "codeSystem": "SNOMED-CT"
  }')

if echo "$ORGANISM" | grep -q "error"; then
  echo "⚠️  Organism may already exist or error occurred"
else
  echo -e "${GREEN}✅ Organism created${NC}"
fi
echo ""

# 6. Create Inventory Item
echo "6. Creating inventory item..."
INVENTORY=$(curl -s -X POST "$API_URL/inventory/items" \
  -H "Content-Type: application/json" \
  -d '{
    "itemCode": "REAG-001",
    "itemName": "Glucose Reagent",
    "category": "reagent",
    "quantityOnHand": 100,
    "reorderLevel": 20,
    "unit": "bottles",
    "manufacturer": "Test Reagents Inc"
  }')

if echo "$INVENTORY" | grep -q "error"; then
  echo "⚠️  Inventory item may already exist or error occurred"
else
  echo -e "${GREEN}✅ Inventory item created${NC}"
fi
echo ""

echo "===================================="
echo -e "${GREEN}✅ Test data creation complete!${NC}"
echo ""
echo "Created resources:"
echo "  - Test Catalog Entry: GLU (Glucose)"
echo "  - Lab Order: $ORDER_ID"
echo "  - Specimen: $SPECIMEN_ID"
echo "  - Instrument: $INSTRUMENT_ID"
echo "  - Organism: Escherichia coli"
echo "  - Inventory Item: REAG-001"
echo ""
echo "You can now test:"
echo "  1. Specimen Reception: /lims/specimens/reception/$SPECIMEN_ID"
echo "  2. Specimen Processing: /lims/specimens/processing/$SPECIMEN_ID"
echo "  3. Instrument Import: /lims/instruments/$INSTRUMENT_ID"
echo "  4. Result Entry: Create worklist first, then enter results"
echo ""

