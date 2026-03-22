# Semester VI Report Notes (Chapter 5 → Appendix)

**Project:** Taskify — SaaS Task Management System  
**Repository:** `SAAS_TMS` (React + Vite frontend, Node.js + Express backend, MongoDB)  
**Purpose of this document:** Draft material aligned with the *Project Syllabus TYIT* structure (Chapter 5 through References, Glossary, and Appendices), filled using your actual implementation. Replace bracketed placeholders with your name, college, seat number, and screenshots where indicated.

---

## CHAPTER 5: IMPLEMENTATION AND TESTING

### 5.1 Implementation Approaches

**Architecture**

The system follows a **three-tier, client–server** pattern:

| Layer | Technology | Role |
|--------|------------|------|
| Presentation | React 18, Vite, Tailwind CSS, Radix UI | SPA, routing, dashboards, forms, real-time UI |
| Application | Express.js on Node.js 20 (ES modules) | REST APIs, middleware, business logic |
| Data | MongoDB via Mongoose | Persistent storage, indexing on hot fields |

**Communication**

- **REST/JSON** for CRUD and queries (`/api/auth`, `/api/task`, `/api/employee`, `/api/department`, `/api/dashboard`, `/api/chat`, `/api/meeting`, `/api/room`, `/api/activities`, `/api/roles`, etc.).
- **WebSockets (Socket.IO)** for chat messaging and call signaling (`initializeSocket` in `backend/sockets/socketManager.js`), with JWT validated from the `token` cookie on handshake.
- **HTTP + cookies**: Session continuity uses JWT stored in cookies; `AuthContext` calls `GET /api/auth/me` with `withCredentials: true`.

**Multi-tenancy**

- Most domain data is scoped by **`organizationId`** (e.g. tasks, users, channels). Socket connections join rooms by `organizationId` and user id.

**SaaS onboarding & billing**

- Organization registration with profile image upload via **Multer + Cloudinary** (`auth.route.js` → `registerOrg`).
- **Razorpay** routes: `POST /api/auth/create-order`, `POST /api/auth/verify-payment` (see `auth.controller.js`).

**Standards and conventions**

- **ES modules** (`"type": "module"`) across backend.
- **express-validator** on relevant inputs (where used in controllers).
- **Helmet**, **CORS** (origin from `FRONTEND_URL`), **Morgan** logging, **express-rate-limit** (100 requests / 15 min per IP on `/api`).
- **Role-based access**: `verifyToken` then `authorizePermission("action:resource")` on protected routes (e.g. `read:dashboard` on dashboard routes).

**Scheduled processing**

- After MongoDB connects (`backend/db/connectdb.js`), **`startCronJobs`** runs: hourly cron marks tasks with `deadline < now` and status `Pending` or `In Progress` as **`Overdue`** (`backend/services/cronJobs.js`).

---

### 5.2 Coding Details and Code Efficiency

The syllabus asks for *important* code snippets, not the full source. Below are implementation highlights tied to your repo.

#### 5.2.1 Representative modules (what to show in the report)

1. **Server bootstrap** (`backend/server.js`): Express app, `http.Server`, Socket.IO attachment, middleware order, route mounting, global error handler, `PORT`.
2. **JWT authentication** (`backend/middlewares/verifyToken.js`): read token from cookie or `Authorization` header; `jwt.verify`; attach `req.user`.
3. **Permission authorization** (`backend/middlewares/authorizePermission.js`): load role’s permissions (with **in-memory `Map` cache** per role id); check `requiredPermission` string.
4. **Permission naming** (`backend/config/permissions.constants.js`): CRUD actions × resources → strings like `read:dashboard`, `create:task`.
5. **Real-time chat** (`backend/sockets/socketManager.js`): cookie-based JWT; `joinChat` / `sendMessage` with channel membership checks; `newMessage` broadcast; call events (`startCall`, `incomingCall`, etc.).
6. **Task model** (`backend/models/task.model.js`): priority, status enum, milestones, dependencies, `organizationId` indexes.
7. **Frontend shell** (`frontend/src/main.jsx`, `App.jsx`): providers (`AuthProvider`, `SocketProvider`, `NotificationProvider`, `CallProvider`), `ProtectedRoute`, lazy-loaded detail pages, public marketing/legal routes.

#### 5.2.2 Code efficiency

Document these as deliberate optimizations:

| Technique | Where / what |
|-----------|----------------|
| **Indexed queries** | Task schema indexes on `createdBy`, `assignedManager`, `team`, `assignedEmployees`, `priority`, `status`, `deadline`, `organizationId`. |
| **Permission cache** | `rolePermissionsCache` in `authorizePermission.js` reduces repeated DB reads for the same role. |
| **Code splitting** | `React.lazy` for `TaskDetails`, `EmpDetails`, `DepartmentDetails`, `MeetingDetails` in `App.jsx`. |
| **API protection** | Rate limiting + Helmet reduces abuse and common HTTP vulnerabilities. |
| **Batch status updates** | `Task.updateMany` in cron for overdue tasks instead of per-document loops. |

**Note for the report:** The backend `package.json` **does not** define automated unit tests (`"test"` is a placeholder). You should state that **systematic automated testing is planned or in progress**, and describe **manual and integration testing** actually performed (see §5.3).

---

### 5.3 Testing Approach

Align with the syllabus: tie testing to **functional requirements** and, where possible, to a **category-partition** or **state-based** mindset (e.g. task status transitions: Pending → In Progress → Completed / Overdue).

**Suggested testing model for the write-up**

- **Functional:** login, registration, task CRUD, department/employee flows, chat send/receive, dashboard analytics APIs, meeting/room flows, role permission denial.
- **Security:** unauthorized API without token (401/403); cross-organization isolation; Socket.IO connection without valid cookie rejected.
- **Real-time:** two browsers/users in same channel receive `newMessage`.

#### 5.3.1 Unit testing

**Current state:** No Jest/Mocha/Vitest test suites are present in the repository for backend or frontend.

**What to write in the report (honest + forward-looking):**

- *Planned or future* unit tests: pure functions, validators, permission name resolution, cron date logic.
- If you add tests before submission, list the framework (e.g. Vitest for frontend, Node test runner for backend) and example test files.

#### 5.3.2 Integrated testing

Describe tests that span **frontend → API → database**:

- Register organization → login → cookie set → `GET /api/auth/me` returns user with `organizationId` and `role`.
- Create task → appears in list/detail → update status → cron or manual date manipulation → verify `Overdue`.
- Create/join chat channel → send message → second client receives `newMessage` via Socket.IO.

#### 5.3.3 Beta testing (user acceptance)

- Internal testers (classmates/guide) using deployed or local environment.
- Scenarios: manager assigns task, employee updates status, boss views dashboard analytics.
- Collect feedback on **Settings** (e.g. `RolesSettings.jsx`), **Employees**, navigation, and **Reports** page usability.

---

### 5.4 Modifications and Improvements

Use this subsection for **iterations during Semester VI**. Examples you can adapt to truthfully match your diary:

- Refined **role and permission** model (`Role`, `Permission`, `authorizePermission`, optional `seedPermissions.js`).
- **Email** flows: forgot password / OTP (`sendOTP`, `verifyOTPAndAllowPasswordChange`, SendGrid/Nodemailer utilities).
- **UI**: Kanban (`KanbanBoard.jsx`), dashboards (`StatsCards`, charts), meeting integration (Zego UIKit prebuilt on frontend).
- **Hardening**: rate limits, Helmet, channel-based chat authorization in sockets.

---

### 5.5 Test Cases (sample table for the report)

Expand this table with **actual pass/fail** and **screenshot references** (Fig. 5.1, etc.).

| ID | Module | Precondition | Steps | Expected result |
|----|--------|--------------|-------|-----------------|
| TC-01 | Auth | Valid user | POST `/api/auth/login` with credentials | 200, `Set-Cookie: token`, redirect works in app |
| TC-02 | Auth | No token | GET `/api/auth/me` | 401 Unauthorized |
| TC-03 | Task | Logged-in user with `create:task` | Create task with title, deadline, org id | Task saved; appears in task list |
| TC-04 | Task | Task past deadline | Wait for cron or set `deadline` in past | Status becomes `Overdue` if was Pending/In Progress |
| TC-05 | RBAC | User lacks `read:dashboard` | GET `/api/dashboard/overview-data1` | 403 Forbidden |
| TC-06 | Chat | Two users in same channel | A sends message | B receives `newMessage` event |
| TC-07 | Socket | Invalid/missing token | Connect Socket.IO without cookie | Connection error / rejected |
| TC-08 | Registration | New GSTIN/email | POST `/api/auth/register-org` with logo | Organization and admin user created |

---

## CHAPTER 6: RESULTS AND DISCUSSION

### 6.1 Test Reports

**What to include**

1. **Summary table:** total test cases, passed, failed, blocked (fill from your actual runs).
2. **Discussion:** which areas were most stable (e.g. auth, CRUD) vs fragile (e.g. real-time edge cases, payment webhooks if environment-dependent).
3. **Performance notes (optional):** time to load dashboard, size of lazy chunks after `vite build` (mention build output).
4. **Figures:** embed screenshots — Login, Dashboard (`/dashboard`), Tasks (list + Kanban), Chat, Meetings, Reports, Settings/Roles, Employee directory.

### 6.2 User Documentation

Write a short **user manual** section structured by role:

| Audience | Features to document |
|----------|----------------------|
| **All users** | Login, profile, password reset, navigation, notifications |
| **Managers / Boss** | Task assignment, departments, teams, reports, employee views |
| **Employees** | Viewing/updating assigned tasks, chat, meetings |

For each feature: **goal → steps → expected outcome → screenshot**.

Mention environment requirements briefly:

- **Browser:** modern Chromium/Firefox/Safari.
- **Network:** WebSocket-capable network (for chat/calls).

---

## CHAPTER 7: CONCLUSIONS

### 7.1 Conclusion

Summarize in 2–3 pages:

- The project delivers a **multi-tenant SaaS task management** product with **authentication**, **RBAC**, **task lifecycle**, **departments/employees**, **dashboard analytics**, **real-time chat and calling signaling**, **meetings**, and **subscription-related** flows (Razorpay).

### 7.1.1 Significance of the system

- Centralizes work tracking and communication for organizations.
- Reduces reliance on scattered spreadsheets/informal channels.
- Demonstrates **full-stack** skills relevant to industry (React, Node, MongoDB, real-time systems).

### 7.2 Limitations of the system

State limitations you can defend truthfully:

- **Automated test coverage** is not yet comprehensive (see `backend/package.json` test script).
- **Scaling:** single deployment assumptions; Redis is a dependency in `package.json` but document how/if you use it for sessions/cache.
- **Real-time video:** depends on third-party SDK (ZegoCloud); quality varies with network.
- **Operational:** production needs hardened secrets management, monitoring, backups, and HTTPS-only cookies.

### 7.3 Future scope of the project

- Native **mobile apps** or PWA.
- **E2E tests** (Playwright/Cypress) and **API tests** (Supertest).
- **Email/push notifications** for task deadlines and mentions.
- **Advanced analytics**, exports (PDF/Excel), audit logs.
- **Internationalization** and accessibility (WCAG) audit.

---

## REFERENCES

Use a consistent style (APA/IEEE as per your department). Include **official documentation** and any books your guide recommends.

**Examples to cite (replace with your exact versions and access dates):**

1. MongoDB Inc. *MongoDB Manual* — https://www.mongodb.com/docs/
2. Mongoose — https://mongoosejs.com/docs/
3. Express.js — https://expressjs.com/
4. React — https://react.dev/
5. Vite — https://vite.dev/
6. Socket.IO — https://socket.io/docs/
7. JSON Web Token (JWT) — https://jwt.io/introduction
8. Razorpay API Documentation — https://razorpay.com/docs/
9. Hoffer, J. A., George, J. F., & Valacich, J. S. *Modern Systems Analysis and Design* (as in syllabus further readings).
10. ISO/IEC 12207 — Software life cycle processes (conceptual reference for SDLC alignment).

---

## GLOSSARY

| Term | Meaning in this project |
|------|-------------------------|
| **SaaS** | Software as a Service; multiple organizations share one deployment with data isolation by `organizationId`. |
| **TMS** | Task Management System. |
| **JWT** | JSON Web Token used for authentication; stored in cookie for API and Socket.IO. |
| **RBAC** | Role-Based Access Control; roles hold many permissions; `authorizePermission` checks strings like `read:task`. |
| **Mongoose** | ODM for MongoDB; defines schemas and models (User, Task, Organization, Role, etc.). |
| **Socket.IO** | Library for WebSockets; used for chat and call signaling. |
| **REST** | Resource-oriented HTTP API design used under `/api/...`. |
| **Cron** | Scheduled job; hourly update of overdue tasks. |
| **GSTIN** | Organization tax identifier stored on registration (India-specific business context). |
| **Razorpay** | Payment gateway integration for plans/orders. |

---

## APPENDIX A (suggested content)

**Full API route list or OpenAPI-style table**

- Method, path, auth required, permission string, short description.
- Optionally generate a list with `express-list-endpoints` during development (package already in dependencies).

**Or:** Redacted **`.env.example`** listing variable *names* only: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `CLIENT_URL`, Cloudinary, Razorpay keys, SendGrid — **never commit real secrets**.

---

## APPENDIX B (suggested content)

1. **ER-style entity list** (narrative or diagram): Organization 1—* many Users; Department; Task links to Team, User refs, milestones; Role—Permission many-to-many; Channel/Message for chat.
2. **Permission matrix:** rows = roles (Boss, Manager, Employee — match your seeded data), columns = resources (`task`, `employee`, `dashboard`, …), cells = CRUD allowed.
3. **Selected code listings:** `socketManager.js` JWT middleware; `authorizePermission.js` cache; `task.model.js` indexes (as required by syllabus for “illustrative” code).

---

## Syllabus alignment checklist (Chapter 5 → Appendix)

| Syllabus item | Addressed in this document |
|---------------|----------------------------|
| 5.1 Implementation approaches | §5.1 |
| 5.2 Coding details | §5.2 |
| 5.2.1 Code efficiency | §5.2.2 |
| 5.3 Testing approach | §5.3 |
| 5.3.1–5.3.3 Unit / Integrated / Beta | §5.3.1–5.3.3 |
| 5.4 Modifications | §5.4 |
| 5.5 Test cases | §5.5 |
| Chapter 6 | §6 |
| Chapter 7 | §7 |
| References | References |
| Glossary | Glossary |
| Appendix A & B | Appendix A & B |

---

*End of draft notes. Insert screenshots, actual test counts, and your institution’s title/certificate wording where the syllabus requires fixed formats (Times New Roman, spacing, etc.).*
