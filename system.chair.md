# system.chair Backend Document

## Purpose
`system.chair` represents the SRC Chair (admin) control flow in the backend. This role manages users, cycles, reviewer assignments, decisions, and reporting.

## Where It Lives
- Auth and user administration: `backend/users/views.py`
- Grant cycle and proposal control: `backend/proposals/views.py`
- Assignment and review operations: `backend/reviews/views.py`
- Core business rules: `backend/proposals/services.py`
- Background jobs: `backend/proposals/tasks.py`

## Access Model
- Backend uses DRF token auth.
- SRC Chair privileges rely on `IsAdminUser` / `user.is_staff`.
- SRC Chair endpoints require `Authorization: Token <token>`.

## SRC Chair Backend Responsibilities
1. User governance
- Create users: `POST /api/auth/register/`
- List/manage users: `GET /api/auth/users/`, `GET/PUT/PATCH/DELETE /api/auth/users/<id>/`
- Reviewer onboarding approvals:
  - `GET /api/auth/pending-reviewers/`
  - `POST /api/auth/approve-reviewer/<id>/`
  - `DELETE /api/auth/reject-reviewer/<id>/`

2. Grant cycle governance
- CRUD cycles: `/api/cycles/`
- Active cycles: `GET /api/cycles/active/`
- Cycle statistics: `GET /api/cycles/<id>/statistics/`
- Cycle summary PDF: `GET /api/cycles/<id>/summary_report/`

3. Proposal oversight
- Full proposal visibility via admin scope in `ProposalViewSet`.
- View proposal reviews: `GET /api/proposals/<id>/reviews/`
- Download proposal report PDF: `GET /api/proposals/<id>/download_report/`

4. Reviewer assignment orchestration
- Bulk assign reviewers: `POST /api/assignments/assign_reviewers/`
- Send assignment notifications:
  - `POST /api/assignments/<id>/send_notification/`
  - `POST /api/assignments/bulk_notify/`

5. Decision pipeline control
- Stage 1 decision: `POST /api/proposals/<id>/stage1_decision/`
  - Decisions: `REJECT`, `ACCEPT`, `TENTATIVELY_ACCEPT`
- Start Stage 2: `POST /api/proposals/<id>/start_stage2/`
- Final decision: `POST /api/proposals/<id>/final_decision/`
  - Decisions: `ACCEPTED`, `REJECTED`

6. Monitoring and audit
- SRC Chair dashboard: `GET /api/dashboard/src_chair/`
- Audit logs: `GET /api/audit-logs/` (with filters)

## System Chain (SRC Chair)
1. SRC Chair logs in (`/api/auth/login/`) and receives token.
2. Creates/activates grant cycle.
3. Verifies reviewers (approve pending reviewer accounts).
4. Monitors submitted proposals.
5. Assigns reviewers for Stage 1.
6. Ensures reviews are submitted.
7. Applies Stage 1 decision:
- `REJECT` -> proposal closes at stage 1.
- `ACCEPT` -> accepted without corrections.
- `TENTATIVELY_ACCEPT` -> revision window starts (`REVISION_REQUESTED`).
8. After PI revision submission, starts Stage 2 (`UNDER_STAGE_2_REVIEW`).
9. Assigns Stage 2 reviewers (if required), monitors completion.
10. Applies final decision and locks proposal.
11. Exports reports and checks audit trail.

## Status Flow Controlled by SRC Chair
- `SUBMITTED`
- `UNDER_STAGE_1_REVIEW`
- `STAGE_1_REJECTED` OR `ACCEPTED_NO_CORRECTIONS` OR `TENTATIVELY_ACCEPTED`
- `REVISION_REQUESTED` -> `REVISED_PROPOSAL_SUBMITTED`
- `UNDER_STAGE_2_REVIEW`
- `FINAL_ACCEPTED` OR `FINAL_REJECTED`

## Business Rules Enforced
- Assignment validation checks:
  - no duplicate assignment (same proposal/reviewer/stage)
  - reviewer must be active and under workload limit
  - max reviewers per proposal is respected
- Stage 1 decision requires Stage 1 completion.
- Final decision rejects invalid state and duplicate final decisions.
- Audit entries are created for key administrative actions.

## Background Automation Relevant to SRC Chair
- Periodic revision deadline checks (`check_revision_deadlines`).
- Reminder jobs for pending deadlines/reviews.
- Email notifications for assignments and decisions.

## Notes
- This role is the backend authority for operational governance and the full two-stage review lifecycle.
- If desired, this document can be extended with sequence diagrams and endpoint request/response examples.
