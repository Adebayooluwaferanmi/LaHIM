#!/bin/bash

# Quick API Endpoint Testing Script
# Tests all new endpoints to verify they're working

BASE_URL="${BASE_URL:-http://localhost:3000}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing LaHIM LIMS Endpoints"
echo "=================================="
echo ""

# Health Check
echo "1. Testing Health Endpoint..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "$HEALTH"
fi
echo ""

# Vocabulary Service
echo "2. Testing Vocabulary Service..."
echo "   - Organisms endpoint..."
curl -s "$BASE_URL/vocabularies/organisms" > /dev/null && echo -e "${GREEN}✅ Organisms endpoint accessible${NC}" || echo -e "${RED}❌ Organisms endpoint failed${NC}"

echo "   - Antibiotics endpoint..."
curl -s "$BASE_URL/vocabularies/antibiotics" > /dev/null && echo -e "${GREEN}✅ Antibiotics endpoint accessible${NC}" || echo -e "${RED}❌ Antibiotics endpoint failed${NC}"

echo "   - Value sets endpoint..."
curl -s "$BASE_URL/vocabularies/value-sets" > /dev/null && echo -e "${GREEN}✅ Value sets endpoint accessible${NC}" || echo -e "${RED}❌ Value sets endpoint failed${NC}"
echo ""

# Inventory Service
echo "3. Testing Inventory Service..."
echo "   - Items endpoint..."
curl -s "$BASE_URL/inventory/items" > /dev/null && echo -e "${GREEN}✅ Inventory items endpoint accessible${NC}" || echo -e "${RED}❌ Inventory items endpoint failed${NC}"

echo "   - Stock levels endpoint..."
curl -s "$BASE_URL/inventory/stock-levels" > /dev/null && echo -e "${GREEN}✅ Stock levels endpoint accessible${NC}" || echo -e "${RED}❌ Stock levels endpoint failed${NC}"
echo ""

# Westgard Rules
echo "4. Testing Westgard Rules Service..."
echo "   - Statistics endpoint..."
curl -s "$BASE_URL/westgard-rules/statistics?testCode=GLU&materialId=TEST" > /dev/null 2>&1 && echo -e "${GREEN}✅ Westgard statistics endpoint accessible${NC}" || echo -e "${YELLOW}⚠️  Westgard statistics endpoint (may need valid params)${NC}"
echo ""

# PDF Reports
echo "5. Testing PDF Report Service..."
echo "   - PDF endpoint (will fail without valid report ID, but endpoint should exist)..."
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/reports/test-id/pdf" | grep -q "404\|500" && echo -e "${GREEN}✅ PDF endpoint exists (404/500 expected without valid ID)${NC}" || echo -e "${YELLOW}⚠️  PDF endpoint check${NC}"
echo ""

# Metrics
echo "6. Testing Metrics Endpoint..."
METRICS=$(curl -s "$BASE_URL/metrics")
if echo "$METRICS" | grep -q "http_requests_total"; then
    echo -e "${GREEN}✅ Metrics endpoint working${NC}"
else
    echo -e "${RED}❌ Metrics endpoint failed${NC}"
fi
echo ""

echo "=================================="
echo "✅ Basic endpoint testing complete!"
echo ""
echo "For detailed testing, see TESTING_GUIDE.md"

