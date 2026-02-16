# User Quick Start

## What This System Is
CTRG is a two-stage research grant review platform with 3 roles:
- PI (Principal Investigator)
- Reviewer
- SRC Chair (Admin)

## 1. Open the App
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`

## 2. Login
- Go to the login page.
- Enter your email and password.
- You will be redirected to your role dashboard.

Default admin credentials (development):
- Email: `admin@nsu.edu`
- Password: `admin123`

## 3. PI Workflow (Submitter)
1. Open PI dashboard.
2. Click `New Proposal`.
3. Fill proposal details and upload required files.
4. Save draft or submit.
5. Track status from dashboard.
6. If `Revision Requested`, open the proposal and submit revision files before deadline.
7. Check final decision once processing is complete.

## 4. Reviewer Workflow
1. Login as reviewer.
2. Open reviewer dashboard.
3. View assigned proposals.
4. Open assignment and review proposal details.
5. Submit Stage 1 score or Stage 2 review.
6. Save draft if needed, then submit final review.

## 5. SRC Chair Workflow
1. Login as admin/SRC Chair.
2. Create/manage grant cycles.
3. Approve pending reviewer registrations.
4. Assign reviewers to proposals.
5. Monitor dashboard for pending reviews.
6. Apply Stage 1 decision (`ACCEPT`, `REJECT`, `TENTATIVELY_ACCEPT`).
7. Start Stage 2 when revised proposal is submitted.
8. Apply final decision and generate reports.

## 6. Proposal Statuses (High Level)
- `DRAFT` -> `SUBMITTED` -> `UNDER_STAGE_1_REVIEW`
- Stage 1 outcome:
  - `STAGE_1_REJECTED`
  - `ACCEPTED_NO_CORRECTIONS`
  - `TENTATIVELY_ACCEPTED` -> `REVISION_REQUESTED` -> `REVISED_PROPOSAL_SUBMITTED`
- Stage 2:
  - `UNDER_STAGE_2_REVIEW` -> `FINAL_ACCEPTED` or `FINAL_REJECTED`

## 7. Common Issues
- Cannot login:
  - Check email/password.
  - Reviewer may still be pending approval.
- No data visible:
  - Confirm backend and frontend servers are running.
- Permission denied:
  - You are likely using an account with a different role.

## 8. Security Note
If this is not a local demo, change default admin password immediately.
