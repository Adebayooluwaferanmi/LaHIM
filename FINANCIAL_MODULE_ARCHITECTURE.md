# LaHIM Financial Module Architecture

## Purpose
LaHIM already has a working billing base built around `charges`, `invoices`, `payments`, insurance, and financial reporting. The financial module extends that base into a patient-facing and operations-facing finance domain without breaking the current stack.

The target is not a separate billing system. The target is a finance orchestration layer that:
- keeps existing billing and invoicing intact
- adds patient payment orchestration, wallet funding, and privilege overrides
- supports assisted and self-service payment channels
- exposes real-time financial clearance decisions to the care workflow
- gives billing staff immediate visibility into who is cleared, who owes, and who is on approved exception status

## Design Goals
- Preserve current `charges -> invoices -> payments` behavior.
- Make PostgreSQL-era modernization possible later without blocking current Couch-backed runtime.
- Treat financial clearance as a first-class decision service.
- Support cash point, transfer, card, digital payment, insurance, and wallet-based settlement.
- Keep auditability for every approval, settlement, and override.
- Make operational reporting and patient-account summaries available from the same domain contract.

## Existing Foundation
Current LaHIM already contains these financial building blocks:
- `packages/server/src/services/billing.ts`
  - charge capture
  - invoice lifecycle
  - payment posting
- `packages/server/src/services/insurance.ts`
  - provider and patient coverage data
- `packages/server/src/services/reports.ts`
  - financial reporting entry points
- `packages/server/src/services/financial.ts`
  - lab-finance analytics, pricing, costs, and revenue tracking
- `packages/frontend/src/billing/*`
  - invoice and charge UI flows
- `packages/frontend/src/reports/FinancialReports.tsx`
  - reporting surface
- `packages/frontend/src/hooks/useBilling.ts`
  - billing query/mutation hooks

This means the new financial module should sit above the existing billing flow instead of replacing it.

## Standards-Aligned Design Principles
The module is designed to align with widely used healthcare financial patterns:
- FHIR `Account`
  - patient financial responsibility should be modeled as an account that receives charges, payments, and coverage responsibility
- FHIR `ChargeItem`
  - service delivery should produce chargeable financial records tied to the patient and encounter context
- FHIR `Invoice`
  - invoices should summarize line items, totals, payment terms, and accountable parties
- FHIR `CoverageEligibilityResponse`
  - coverage verification should be available before financial clearance decisions are finalized
- FHIR `PaymentReconciliation`
  - posted payments and remittances should be traceable back to receivables for reconciliation
- CMS transparency and No Surprises expectations
  - patient-facing pricing, estimates, and dispute-aware billing behavior should be supportable
- PCI DSS
  - card data must not be stored in application records unless the payment environment is designed for it
- Nacha healthcare EFT rules
  - transfer and ACH-style payment flows should support reassociation and traceability

## Domain Boundaries
### 1. Billing Core
This remains the base operational layer.
- `Charge`
- `Invoice`
- `Payment`
- insurance-linked coverage context

### 2. Patient Finance Layer
This is the new module introduced in this phase.
- `PatientFinancialAccount`
- `PatientWallet`
- `FinancialTransaction`
- `BillingOverride`
- `FinancialClearanceDecision`

### 3. Reporting and Reconciliation
This layer reads from both the billing core and patient finance layer.
- daily collections
- outstanding balances
- wallet liabilities
- override exposure
- payment channel mix
- staff collection performance
- exception/credit reports

## Core Business Flows
### Patient payment flow
1. A service creates or references a charge.
2. Charges are grouped into an invoice.
3. The patient can pay via:
- cash point
- bank transfer
- digital payment gateway
- card
- insurance
- LaHIM wallet
4. Successful payment posts a `Payment` record and a `FinancialTransaction` record.
5. The patient account summary recalculates immediately.
6. Clearance state changes to allow service continuation when obligations are satisfied.

### Wallet flow
1. A patient wallet is funded by cash point staff or a self-service channel.
2. Funding creates a credit transaction.
3. Wallet settlement against an invoice creates:
- a debit wallet transaction
- a posted payment on the invoice
- an updated invoice balance and status
4. The patient profile balance reflects the change immediately.

### Privilege / exception flow
1. Billing department grants an override.
2. Override stores approver, reason, approval amount or scope, and expiry.
3. The patient can proceed even if normal clearance rules would block service.
4. Override remains visible in collections and exception reports until revoked or settled.

## Service Clearance Contract
Financial clearance should be computed, not guessed.

### Inputs
- outstanding invoice balance
- pending charge exposure
- wallet balance
- insurance verification status when relevant
- active override status
- approved credit/override amount

### Outputs
- `cleared`
- `wallet-available`
- `override`
- `payment-required`

### Enforcement Intent
Clinical or lab workflows should be able to ask one question:
- can this patient proceed for the requested service?

The financial module should answer that consistently and expose the reason.

## Initial Data Model
### Existing databases
- `charges`
- `invoices`
- `payments`
- `insurance_providers`
- `patient_insurance`

### New databases introduced in this phase
- `patient_financial_accounts`
- `patient_wallets`
- `financial_transactions`
- `billing_overrides`

### New document types
#### PatientFinancialAccount
- patient identity linkage
- currency
- account status
- self-pay flag
- credit limit
- notes

#### PatientWallet
- patient linkage
- wallet status
- current balance
- last funded timestamp
- currency

#### FinancialTransaction
- patient linkage
- wallet linkage when relevant
- invoice linkage when relevant
- amount
- direction: credit/debit
- transaction type
- payment method/channel
- reference number
- status
- operator metadata

#### BillingOverride
- patient linkage
- approver
- reason
- approved amount or scope
- active flag
- expiry
- revoke metadata

## API Surface Introduced In This Phase
- `GET /financial/summary`
- `POST /financial/accounts`
- `GET /financial/accounts/:patientId/summary`
- `GET /financial/wallets/:patientId`
- `POST /financial/wallets/:patientId/fund`
- `POST /financial/invoices/:id/settle-from-wallet`
- `GET /financial/transactions`
- `GET /financial/overrides`
- `POST /financial/overrides`
- `POST /financial/overrides/:id/revoke`

These APIs are additive and do not replace the existing billing endpoints.

## Realtime Update Strategy
The module should emit patient-finance updates whenever any of these occur:
- account created
- wallet funded
- invoice settled from wallet
- override granted
- override revoked

The first implementation slice emits update events through the existing realtime/socket layer when available. A later slice should formalize this into a durable event stream for audit and replay.

## Reporting Design
### Operational reports
- collections by shift, day, cashier, and channel
- outstanding balances by patient, department, and ageing bucket
- active override exposure
- wallets with high balances or unusual movement

### Management summaries
- billed vs collected
- write-offs and waived amounts
- payment channel distribution
- insurance vs self-pay split
- patient debt concentration

### Patient summary view
- total billed
- total paid
- pending charges
- outstanding invoices
- wallet balance
- active overrides
- current financial clearance status

## Security And Compliance Notes
- Do not store full PAN or sensitive authentication data in LaHIM records.
- Treat payment gateway responses and transfer references as references, not as raw secrets.
- Keep audit fields for every manual override and cashier-assisted funding event.
- Support least-privilege access for billing operations, finance reports, and override approval.

## Integration Plan
### Phase 1
- keep current billing routes
- introduce patient finance APIs and data model
- expose frontend hooks and shared types
- maintain boot safety

### Phase 2
- wire patient profile finance summary UI
- add service-clearance guard usage in core workflows
- connect payment channels and cashier flows
- expand financial reports

### Phase 3
- move high-value transactions toward stronger ledger and PostgreSQL-backed persistence
- add payment gateway adapters and reconciliation jobs
- formalize event-driven financial updates

## Non-Goals For This Slice
- replacing the current billing service
- removing CouchDB-backed billing flows
- implementing external payment gateway secrets handling
- full accounting ledger or general ledger export

## Acceptance For This Slice
- current billing and invoicing remain functional
- new patient finance APIs are additive
- wallet and override concepts exist in both backend and frontend contracts
- financial summaries can be consumed without disturbing current boot paths

## External Standards Reference Points
- HL7 FHIR R4 `Account`
- HL7 FHIR R4 `ChargeItem`
- HL7 FHIR R4 `Invoice`
- HL7 FHIR R4 `CoverageEligibilityResponse`
- HL7 FHIR R4B `PaymentReconciliation`
- CMS hospital price transparency and No Surprises / good faith estimate guidance
- PCI DSS for payment account data protection
- Nacha healthcare EFT operating rules and reassociation expectations
