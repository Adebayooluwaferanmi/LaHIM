#!/usr/bin/env bash

set -euo pipefail

API_URL="${LAHIM_API_URL:-http://localhost:3000}"
OUTPUT_FILE="${LAHIM_FINANCE_SMOKE_FILE:-/tmp/lahim-finance-smoke.env}"
SMOKE_TAG="${LAHIM_FINANCE_SMOKE_TAG:-$(date -u +%Y%m%d%H%M%S)}"

PATIENT_ID="${LAHIM_FINANCE_PATIENT_ID:-patient-finance-smoke-${SMOKE_TAG}}"
VISIT_ID="${LAHIM_FINANCE_VISIT_ID:-visit-finance-smoke-${SMOKE_TAG}}"
INVOICE_ID="${LAHIM_FINANCE_INVOICE_ID:-invoice-finance-smoke-${SMOKE_TAG}}"
PATIENT_CODE="${LAHIM_FINANCE_PATIENT_CODE:-P-SMOKE-${SMOKE_TAG}}"

INITIAL_WALLET_FUNDING="${LAHIM_FINANCE_INITIAL_WALLET_FUNDING:-3000}"
OVERRIDE_AMOUNT="${LAHIM_FINANCE_OVERRIDE_AMOUNT:-2500}"
INVOICE_TOTAL="${LAHIM_FINANCE_INVOICE_TOTAL:-5000}"
EXPECTED_BALANCE_AFTER_SETTLEMENT="${LAHIM_FINANCE_EXPECTED_BALANCE_AFTER_SETTLEMENT:-2000}"

NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
DOB_ISO="${LAHIM_FINANCE_PATIENT_DOB:-1992-01-15T00:00:00.000Z}"

require_tool() {
  local tool="$1"
  command -v "${tool}" >/dev/null 2>&1 || {
    echo "Required command is missing: ${tool}" >&2
    exit 1
  }
}

require_tool curl
require_tool sed

put_json() {
  local url="$1"
  local payload="$2"
  curl -fsS \
    -X PUT \
    -H 'Content-Type: application/json' \
    -d "${payload}" \
    "${url}"
}

post_json() {
  local url="$1"
  local payload="$2"
  curl -fsS \
    -X POST \
    -H 'Content-Type: application/json' \
    -d "${payload}" \
    "${url}"
}

extract_json_field() {
  local json="$1"
  local field="$2"
  printf '%s' "${json}" | sed -n "s/.*\"${field}\":\"\\([^\"]*\\)\".*/\\1/p" | head -n 1
}

echo "Seeding finance smoke data against ${API_URL}"

patient_payload="$(cat <<EOF
{
  "_id": "${PATIENT_ID}",
  "type": "patient",
  "code": "${PATIENT_CODE}",
  "givenName": "Finance",
  "familyName": "Smoke",
  "fullName": "Finance Smoke",
  "sex": "female",
  "dateOfBirth": "${DOB_ISO}",
  "isApproximateDateOfBirth": false,
  "preferredLanguage": "English",
  "occupation": "QA",
  "phoneNumber": "+2348010000000",
  "email": "finance.smoke@lahim.local",
  "address": "LaHIM smoke test workspace",
  "createdAt": "${NOW}",
  "updatedAt": "${NOW}"
}
EOF
)"

visit_payload="$(cat <<EOF
{
  "_id": "${VISIT_ID}",
  "patientId": "${PATIENT_ID}",
  "visitType": "Outpatient",
  "status": "InProgress",
  "startDate": "${NOW}",
  "reasonForVisit": "Finance smoke test visit",
  "location": "Chemistry Bench",
  "examiner": "Finance Smoke Script"
}
EOF
)"

invoice_payload="$(cat <<EOF
{
  "_id": "${INVOICE_ID}",
  "patientId": "${PATIENT_ID}",
  "visitId": "${VISIT_ID}",
  "invoiceNumber": "INV-SMOKE-${SMOKE_TAG}",
  "billDate": "${NOW}",
  "status": "Draft",
  "subtotal": ${INVOICE_TOTAL},
  "tax": 0,
  "discount": 0
}
EOF
)"

funding_payload="$(cat <<EOF
{
  "amount": ${INITIAL_WALLET_FUNDING},
  "paymentMethod": "cash",
  "channel": "cash",
  "referenceNumber": "FUND-${SMOKE_TAG}",
  "receivedBy": "finance-smoke-script",
  "notes": "Initial wallet funding for finance smoke test"
}
EOF
)"

override_payload="$(cat <<EOF
{
  "patientId": "${PATIENT_ID}",
  "reason": "Finance smoke privilege",
  "grantedBy": "finance-smoke-script",
  "approvedAmount": ${OVERRIDE_AMOUNT},
  "limitAmount": ${OVERRIDE_AMOUNT},
  "notes": "Temporary privilege for finance smoke verification"
}
EOF
)"

wallet_settlement_payload="$(cat <<EOF
{
  "amount": ${INITIAL_WALLET_FUNDING},
  "referenceNumber": "SETTLE-${SMOKE_TAG}",
  "notes": "Wallet settlement for finance smoke verification"
}
EOF
)"

revoke_payload="$(cat <<EOF
{
  "revokedBy": "finance-smoke-script",
  "reason": "Revoke temporary privilege after smoke settlement"
}
EOF
)"

put_json "${API_URL}/_db/patients/${PATIENT_ID}" "${patient_payload}" >/dev/null
post_json "${API_URL}/visits" "${visit_payload}" >/dev/null
post_json "${API_URL}/invoices" "${invoice_payload}" >/dev/null
post_json "${API_URL}/financial/accounts" "{\"patientId\":\"${PATIENT_ID}\",\"currency\":\"NGN\"}" >/dev/null
post_json "${API_URL}/financial/wallets/${PATIENT_ID}/fund" "${funding_payload}" >/dev/null

override_response="$(post_json "${API_URL}/financial/overrides" "${override_payload}")"
override_id="$(extract_json_field "${override_response}" "_id")"

if [ -z "${override_id}" ]; then
  echo "Failed to extract override id from response: ${override_response}" >&2
  exit 1
fi

post_json "${API_URL}/financial/invoices/${INVOICE_ID}/settle-from-wallet" "${wallet_settlement_payload}" >/dev/null
post_json "${API_URL}/financial/overrides/${override_id}/revoke" "${revoke_payload}" >/dev/null

cat >"${OUTPUT_FILE}" <<EOF
API_URL='${API_URL}'
SMOKE_TAG='${SMOKE_TAG}'
PATIENT_ID='${PATIENT_ID}'
PATIENT_CODE='${PATIENT_CODE}'
VISIT_ID='${VISIT_ID}'
INVOICE_ID='${INVOICE_ID}'
OVERRIDE_ID='${override_id}'
INITIAL_WALLET_FUNDING='${INITIAL_WALLET_FUNDING}'
OVERRIDE_AMOUNT='${OVERRIDE_AMOUNT}'
INVOICE_TOTAL='${INVOICE_TOTAL}'
EXPECTED_BALANCE_AFTER_SETTLEMENT='${EXPECTED_BALANCE_AFTER_SETTLEMENT}'
PATIENT_FINANCE_URL='http://localhost:3001/patients/${PATIENT_ID}/financial'
VISIT_URL='http://localhost:3001/visits/${VISIT_ID}'
INVOICE_URL='http://localhost:3001/billing/invoices/${INVOICE_ID}'
EOF

cat <<EOF
Finance smoke data seeded.

Output file: ${OUTPUT_FILE}
Patient ID: ${PATIENT_ID}
Visit ID: ${VISIT_ID}
Invoice ID: ${INVOICE_ID}
Override ID: ${override_id}

Suggested next checks:
1. Run ./scripts/verify-finance-smoke.sh
2. Open http://localhost:3001/patients/${PATIENT_ID}/financial
3. Open http://localhost:3001/visits/${VISIT_ID}
4. Open http://localhost:3001/billing/invoices/${INVOICE_ID}
EOF
