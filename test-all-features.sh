#!/bin/bash

# Comprehensive Test Script for Priority 1, 2, and 3 Features
# This script tests all endpoints and features

BASE_URL="${API_URL:-http://localhost:3000}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "LaHIM Comprehensive Feature Testing"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

# Test counter
PASSED=0
FAILED=0
TOTAL=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    TOTAL=$((TOTAL + 1))
    echo -n "Testing: $description ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Health check
echo "=== Health Check ==="
test_endpoint "GET" "/health" "Server health check"
echo ""

# Priority 1: Partial Implementations
echo "=== Priority 1: Partial Implementations ==="

# QC Results (for Westgard visualization)
echo "Testing QC Results..."
test_endpoint "GET" "/qc-results?limit=10" "List QC results"
test_endpoint "GET" "/qc-results/check-requirement?testCode=2093-3" "Check QC requirement"

# Reports (for PDF download)
echo "Testing Reports..."
test_endpoint "GET" "/reports?limit=10" "List reports"

# Instruments (for import modal)
echo "Testing Instruments..."
test_endpoint "GET" "/instruments?limit=10" "List instruments"

# Specimens (for reception/processing)
echo "Testing Specimens..."
test_endpoint "GET" "/specimens?limit=10" "List specimens"
echo ""

# Priority 2: Infrastructure Integration
echo "=== Priority 2: Infrastructure Integration ==="

# Test caching headers (should see cache hits in logs)
echo "Testing Caching..."
test_endpoint "GET" "/instruments?limit=10" "Instruments (cached)"
test_endpoint "GET" "/test-catalog?limit=10" "Test Catalog (cached)"
test_endpoint "GET" "/worklists?limit=10" "Worklists (cached)"
test_endpoint "GET" "/qc-results?limit=10" "QC Results (cached)"

# Test dual-write endpoints
echo "Testing Dual-Write Endpoints..."
# Note: These will create test data
test_endpoint "POST" "/qc-results" "Create QC result (dual-write)" \
    '{
        "testCode": {"coding": [{"code": "2093-3"}]},
        "materialId": "test-material",
        "materialLot": "LOT-001",
        "result": 5.5,
        "targetValue": 5.0,
        "acceptableRangeLow": 4.5,
        "acceptableRangeHigh": 5.5,
        "instrumentId": "test-instrument"
    }' || true

echo ""

# Priority 3: LIMS Expansion
echo "=== Priority 3: LIMS Expansion ==="

# Document Control
echo "Testing Document Control..."
test_endpoint "GET" "/document-control?limit=10" "List documents"
test_endpoint "POST" "/document-control" "Create document" \
    '{
        "title": "Test SOP",
        "documentType": "SOP",
        "category": "Quality",
        "description": "Test document for quality control",
        "version": "1.0",
        "createdBy": "test-user"
    }' || true

# Audit Management
echo "Testing Audit Management..."
test_endpoint "GET" "/audits?limit=10" "List audits"
test_endpoint "POST" "/audits" "Create audit" \
    '{
        "auditType": "internal",
        "scope": "Test audit scope",
        "scheduledDate": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
        "auditorName": "Test Auditor",
        "department": "Quality"
    }' || true

# Analytics
echo "Testing Analytics..."
test_endpoint "GET" "/lims-analytics/dashboard" "Analytics dashboard"
test_endpoint "GET" "/lims-analytics/operational" "Operational metrics"
test_endpoint "GET" "/lims-analytics/test-volume" "Test volume analytics"
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}Some tests failed. Check the output above.${NC}"
    exit 1
fi

