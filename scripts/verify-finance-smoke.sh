#!/usr/bin/env bash

set -euo pipefail

STATE_FILE="${LAHIM_FINANCE_SMOKE_FILE:-/tmp/lahim-finance-smoke.env}"

if [ ! -f "${STATE_FILE}" ]; then
  echo "Missing finance smoke state file: ${STATE_FILE}" >&2
  echo "Run ./scripts/seed-finance-smoke.sh first." >&2
  exit 1
fi

# shellcheck disable=SC1090
. "${STATE_FILE}"

require_tool() {
  local tool="$1"
  command -v "${tool}" >/dev/null 2>&1 || {
    echo "Required command is missing: ${tool}" >&2
    exit 1
  }
}

require_tool curl

fetch() {
  local url="$1"
  curl -fsS "${url}"
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local message="$3"

  printf '%s' "${haystack}" | grep -Fq "${needle}" || {
    echo "${message}" >&2
    echo "Expected to find: ${needle}" >&2
    exit 1
  }
}

echo "Verifying health and finance smoke state against ${API_URL}"

health_response="$(fetch "${API_URL}/health")"
assert_contains "${health_response}" '"status":"ok"' "Health endpoint did not report ok status."

patient_response="$(fetch "${API_URL}/_db/patients/${PATIENT_ID}")"
assert_contains "${patient_response}" "\"_id\":\"${PATIENT_ID}\"" "Patient document was not found in CouchDB proxy."
assert_contains "${patient_response}" "\"code\":\"${PATIENT_CODE}\"" "Patient code does not match expected smoke data."

visit_response="$(fetch "${API_URL}/visits/${VISIT_ID}")"
assert_contains "${visit_response}" "\"patientId\":\"${PATIENT_ID}\"" "Visit is not linked to the smoke patient."
assert_contains "${visit_response}" "\"type\":\"visit\"" "Visit response is missing the expected type."

invoice_response="$(fetch "${API_URL}/invoices/${INVOICE_ID}")"
assert_contains "${invoice_response}" "\"patientId\":\"${PATIENT_ID}\"" "Invoice is not linked to the smoke patient."
assert_contains "${invoice_response}" "\"paidTotal\":${INITIAL_WALLET_FUNDING}" "Invoice paid total does not reflect wallet settlement."
assert_contains "${invoice_response}" "\"balance\":${EXPECTED_BALANCE_AFTER_SETTLEMENT}" "Invoice balance after settlement is incorrect."

summary_response="$(fetch "${API_URL}/financial/accounts/${PATIENT_ID}/summary")"
assert_contains "${summary_response}" "\"patientId\":\"${PATIENT_ID}\"" "Patient finance summary is missing the smoke patient."
assert_contains "${summary_response}" "\"walletBalance\":0" "Wallet balance should be zero after settlement."
assert_contains "${summary_response}" "\"outstanding\":${EXPECTED_BALANCE_AFTER_SETTLEMENT}" "Outstanding balance does not match expected post-settlement amount."
assert_contains "${summary_response}" '"status":"payment-required"' "Service clearance should return to payment-required after override revocation."
assert_contains "${summary_response}" '"canProceed":false' "Service clearance should not allow progression after override revocation."

transaction_response="$(fetch "${API_URL}/financial/transactions?patientId=${PATIENT_ID}")"
assert_contains "${transaction_response}" '"transactionType":"walletFunding"' "Wallet funding transaction is missing."
assert_contains "${transaction_response}" '"transactionType":"walletSettlement"' "Wallet settlement transaction is missing."

overrides_response="$(fetch "${API_URL}/financial/overrides?patientId=${PATIENT_ID}&active=true")"
assert_contains "${overrides_response}" '"count":0' "Active billing overrides should be zero after revoke."

report_response="$(fetch "${API_URL}/reports/financial?reportType=summary&patientId=${PATIENT_ID}")"
assert_contains "${report_response}" '"reportType":"summary"' "Financial report did not return summary type."
assert_contains "${report_response}" "\"invoiceCount\":1" "Financial report should show one invoice for the smoke patient."
assert_contains "${report_response}" "\"paymentCount\":1" "Financial report should show one payment for the smoke patient."

cat <<EOF
Finance smoke checks passed.

Patient finance URL: ${PATIENT_FINANCE_URL}
Visit URL: ${VISIT_URL}
Invoice URL: ${INVOICE_URL}
EOF
