# MediFlow IDMS — upgraded workflow build

This package is an upgrade of the supplied MediFlow project. It keeps the existing React/Vite frontend and Spring Boot/MySQL backend.

## Main changes in this build

### Reception → doctor
- New patient registration automatically creates the first visit in `WAITING_FOR_DOCTOR`.
- Reception can create additional visits and they are routed directly to the doctor.
- Nurse navigation and new Nurse account creation are removed.
- On startup, the migration disables existing `NURSE` accounts and moves old `WAITING_FOR_TRIAGE` visits to the doctor queue.
- The legacy `NURSE` enum value and old triage columns remain in the database model only for backward compatibility with existing data; Nurse accounts cannot log in and the old triage endpoint is Admin-only.

### Doctor and laboratory workflow
- The doctor can document symptoms, history, examination and diagnosis, and request multiple tests for one visit.
- Medicine instructions are disabled in the doctor form while investigations are selected or pending.
- The backend independently enforces the lock: it clears/withholds medicine instructions while any investigation is outstanding. Browser-side disabling is not the security control.
- Laboratory staff can enter a measured value, unit, qualitative result, specimen code and interpretation only after the cashier has fully paid the visit's laboratory invoice.
- Lab results are submitted for doctor verification. Once all tests for the visit are verified, the visit returns to `RESULTS_READY_FOR_DOCTOR`; the doctor can then enter medical instructions and complete the consultation.

### Consolidated cashier payment
- Cashier groups all laboratory requests belonging to one patient visit into one invoice.
- One full payment for that invoice automatically changes every lab order in the visit from `UNPAID` to `PAID` and moves them to `READY_FOR_TESTING`.
- Partial payments remain `PARTIAL` at invoice level and do not release any sample for testing.
- The older single-test invoice route remains for compatibility with previously created invoices. New cashier UI uses the consolidated visit invoice.

### Manager dashboard and privacy
- Manager/Admin dashboard includes live workflow counts, completed visits, doctor queue, lab workload and paid revenue.
- Manager API views are minimized: patient search returns basic identifiers only; visit and laboratory lists omit clinical notes, measurements and results; invoice summaries omit clinical result content.
- The Manager role no longer has access to the complete patient-record export page. Clinical records remain available to authorized clinical/records roles.
- Staff management prevents Managers from creating Admin or Manager accounts. Only Admin can enable/disable staff accounts.

### Security and usability
- Authentication tokens are kept in `sessionStorage` rather than persistent `localStorage`, and API error bodies are not written to the browser console.
- Hard-coded JWT signing secrets and bootstrap credentials were removed from application configuration. JWT secret and database credentials must be provided through environment variables.
- Bootstrap Admin creation is disabled by default.
- Added response security headers, password minimum enforcement already present, role checks and reduced-motion support for users who prefer less animation.
- Updated clinical theme, responsive manager analytics, hover/focus states and subtle motion.

### Languages
Language selector includes English, Kiswahili, Arabic, Portuguese, Danish, French, German, Spanish, Italian, Dutch, Norwegian, Swedish, Finnish, Polish, Turkish, Hindi, Chinese, Japanese, Korean, Russian, Greek and Indonesian. Shared navigation and core common labels have translated resources. Some specialist clinical, billing and report text remains English and should be professionally translated/reviewed before using the application in a non-English clinical setting.

## Before installation

1. Stop the current application.
2. Back up the MySQL database.
3. Extract this ZIP to a new folder rather than overwriting your only working copy.
4. Configure the environment variables below.
5. Install dependencies and start the backend/frontend.
6. Test with fictional patients and sample payments before processing real patient data.

## Environment configuration

The backend no longer contains a usable default JWT secret or default administrator password. This is intentional.

Set these environment variables in the terminal that starts Spring Boot:

### Windows CMD
```cmd
set DB_USERNAME=root
set DB_PASSWORD=
set APP_JWT_SECRET=replace-with-a-private-random-secret-at-least-32-characters
set APP_BOOTSTRAP_ENABLED=true
set APP_BOOTSTRAP_USERNAME=admin
set APP_BOOTSTRAP_PASSWORD=replace-with-a-unique-password-at-least-14-characters
set APP_BOOTSTRAP_FULL_NAME=MediFlow Administrator
```

Start backend once. After the first administrator has been created, disable bootstrap and restart:
```cmd
set APP_BOOTSTRAP_ENABLED=false
```

### PowerShell
```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = ""
$env:APP_JWT_SECRET = "replace-with-a-private-random-secret-at-least-32-characters"
$env:APP_BOOTSTRAP_ENABLED = "true"
$env:APP_BOOTSTRAP_USERNAME = "admin"
$env:APP_BOOTSTRAP_PASSWORD = "replace-with-a-unique-password-at-least-14-characters"
$env:APP_BOOTSTRAP_FULL_NAME = "MediFlow Administrator"
```
After the first administrator has been created, set `$env:APP_BOOTSTRAP_ENABLED = "false"` and restart the backend.

Never share or commit your actual secrets. `backend/.env.example` is a variable-name template only; Spring Boot does not automatically load a `.env` file.

## Start the backend
```cmd
cd backend
mvn spring-boot:run
```
API: `http://localhost:8081`

## Start the frontend
Open another terminal:
```cmd
cd frontend
npm install
npm run dev
```
Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## Workflow to test

1. Reception registers a fictional patient. The first visit appears directly in the Doctor queue.
2. Doctor documents the consultation and requests at least two lab tests.
3. Cashier creates one invoice for that visit, enters the combined amount and records payment.
4. Confirm every test in the Laboratory worklist changes to `PAID` and becomes available for measurement.
5. Laboratory staff enter measurement, unit, result and interpretation for each test.
6. Doctor verifies every result. Once all are verified, the visit returns to the doctor.
7. Doctor reopens the visit, enters medicine instructions and completes the consultation.

## Important production notes

- This build is a development upgrade, not a substitute for a clinical safety, security or regulatory audit.
- Use HTTPS, a managed secrets store, encrypted database backups, least-privilege database credentials, firewall rules, and an institution-approved retention policy before production deployment.
- `sessionStorage` reduces token persistence but does not protect against a successful same-origin XSS attack. A production deployment should consider HttpOnly, Secure, SameSite cookies and a tested CSRF strategy.
- The manager analytics are operational summaries, not a tamper-evident audit trail. A dedicated append-only audit log, MFA, backup/restore drills and independent penetration testing are still required for a high-assurance deployment.
- The current frontend has translated shared UI resources, not a complete certified translation of every clinical term. Have clinicians review all translations before clinical use.
- Verify local clinical protocols, lab reference ranges, billing rules and data-protection obligations before going live.


## Premium login and public workflow tour

See `PUBLIC-DEPLOYMENT-GUIDE.md` for deployment. The updated login page includes a rotating clinical image showcase and video preview. The public, non-authenticated workflow tour is available at `/demo` after deployment. A hosted public URL is not included in this source ZIP; it must be created by deploying the frontend and backend.
