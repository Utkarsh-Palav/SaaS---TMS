# Taskify Documentation

## 1. Project Overview

Taskify is a multi-tenant SaaS task management platform for organizations. It supports organization onboarding, role/permission-based access control, employee-department-team management, task lifecycle tracking, meetings, realtime chat/calls, dashboards, and activity logs.

## Tech Stack Summary

### Backend
- JavaScript (Node.js, ES Modules)
- Express + Mongoose (MongoDB)
- JWT auth (cookie + bearer)
- Socket.IO realtime
- Razorpay, Google Calendar API, Cloudinary, SendGrid/SMTP
- Helmet, CORS, Morgan, Rate Limit, node-cron

### Frontend
- React 18 + Vite 6
- React Router
- Tailwind CSS v4 + Radix/shadcn-style UI primitives
- Context state (Auth, Socket, Notifications, Call, Theme)
- Recharts + Chart.js + Framer Motion + GSAP + R3F

---

## 2. Project Structure

Note: `backend/node_modules`, `frontend/node_modules`, and `frontend/dist` are generated artifacts and are not expanded.

```text
SAAS_TMS/
|-- # Taskify - SAAS Task Management System.md
|-- .gitignore
|-- DOCUMENTATION.md
|-- backend/
|   |-- .env
|   |-- package.json
|   |-- package-lock.json
|   |-- server.js
|   |-- config/ (cloudinary + permission constants)
|   |-- controllers/ (auth, tasks, users, meetings, chat, dashboard, etc.)
|   |-- db/connectdb.js
|   |-- middlewares/ (verifyToken, authorizePermission, requireBoss, authorizeRole)
|   |-- models/ (User, Organization, Role, Permission, Task, Team, Department, Meeting, Room, etc.)
|   |-- routes/ (auth, task, employee, department, team, chat, room, meeting, roles, activities)
|   |-- scripts/ (seed + email diagnostics)
|   |-- services/cronJobs.js
|   |-- sockets/socketManager.js
|   |-- utils/ (mail + activity logger)
|-- frontend/
|   |-- .env.local
|   |-- .gitignore
|   |-- .npmrc
|   |-- components.json
|   |-- eslint.config.js
|   |-- google3030a3bd9f1c17aa.html
|   |-- index.html
|   |-- jsconfig.json
|   |-- package.json
|   |-- package-lock.json
|   |-- README.md
|   |-- tailwind.config.js
|   |-- vite.config.js
|   |-- public/ (icons/images/sitemap/_redirects/ringtone)
|   |-- src/
|   |   |-- main.jsx, App.jsx, index.css
|   |   |-- assets/
|   |   |-- context/ (Auth, Socket, Notification, Call, Theme)
|   |   |-- lib/utils.js
|   |   |-- routes/ (ProtectedRoutes, ProtectRegRoute)
|   |   |-- utils/ (plans.json, socket.js)
|   |   |-- pages/ (all app and marketing pages)
|   |   |-- components/ (chat, dashboard, departments, employee, layout, meeting, settings, task, ui)
```

### File/Folder Purpose Summary
- `backend/server.js`: app bootstrap, middleware, route mounts, socket init.
- `backend/routes/*`: endpoint declaration.
- `backend/controllers/*`: business logic and response shaping.
- `backend/models/*`: Mongoose schema definitions.
- `backend/middlewares/*`: authn/authz gates.
- `backend/services/cronJobs.js`: overdue task updater.
- `backend/sockets/socketManager.js`: realtime messaging/call signaling.
- `backend/scripts/*`: seeding and diagnostics.
- `frontend/src/main.jsx`: provider composition and app mount.
- `frontend/src/App.jsx`: route map.
- `frontend/src/context/*`: global app state domains.
- `frontend/src/pages/*`: route containers.
- `frontend/src/components/*`: feature UI modules.
- `frontend/src/components/ui/*`: reusable primitive components.

---

## 3. Backend Documentation

### Framework & Architecture
- Framework: Express
- Language: Node.js JavaScript (ESM)
- Architecture: route -> middleware -> controller -> Mongoose model (layered monolith)
- Extra runtime layers: Socket.IO event layer + cron service

### API Endpoints

| Method | Path | Auth | Permission | Description |
|---|---|---|---|---|
| POST | `/api/auth/register-org` | No | No | Register org, boss user, subscription |
| POST | `/api/auth/login` | No | No | Login, issue JWT cookie/token |
| POST | `/api/auth/logout` | Yes | No | Logout + status/activity update |
| POST | `/api/auth/forgot-password` | No | No | Send OTP |
| POST | `/api/auth/verify-otp` | No | No | Verify OTP and issue reset token |
| POST | `/api/auth/reset-password` | No | No | Reset password |
| POST | `/api/auth/create-order` | No | No | Razorpay order |
| POST | `/api/auth/verify-payment` | No | No | Verify Razorpay payment |
| GET | `/api/auth/me` | Yes | No | Current user profile |
| GET | `/api/dashboard/overview-data1` | Yes | `read:dashboard` | KPI + yearly trend + dept counts |
| GET | `/api/dashboard/overview-data2` | Yes | `read:dashboard` | Monthly completion trend |
| GET | `/api/dashboard/overview-data3` | Yes | `read:dashboard` | Upcoming deadlines |
| GET | `/api/v1/integrations/google/auth` | Yes | No | Google OAuth URL |
| GET | `/api/v1/integrations/google/callback` | No | No | OAuth callback persist tokens |
| DELETE | `/api/v1/integrations/google/disconnect` | Yes | No | Remove Google tokens |
| POST | `/api/task/create` | Yes | `create:task` | Create task |
| DELETE | `/api/task/:taskId` | Yes | `delete:task` | Delete task |
| PUT | `/api/task/:taskId/employees/add` | Yes | `update:task` | Add employees |
| PUT | `/api/task/:taskId/employees/remove/:employeeId` | Yes | `update:task` | Remove employee |
| PATCH | `/api/task/:taskId/status` | Yes | `update:task` | Update task status/priority/deadline |
| POST | `/api/task/:taskId/milestone` | Yes | `update:task` | Add milestones |
| PATCH | `/api/task/:taskId/milestone` | Yes | `update:task` | Update milestone completion |
| POST | `/api/task/:taskId/assign-team` | Yes | `update:task` | Assign team |
| PUT | `/api/task/:id` | Yes | `update:task` | Update title/description |
| GET | `/api/task/getTask` | Yes | `read:task` | Task list |
| GET | `/api/task/:id` | Yes | `read:task` | Task details |
| POST | `/api/comment/:taskId` | Yes | `create:comment` | Add comment |
| PUT | `/api/comment/:commentId` | Yes | `update:comment` | Update comment |
| DELETE | `/api/comment/:commentId` | Yes | `delete:comment` | Delete comment |
| GET | `/api/department` | Yes | `read:department` | Department list |
| GET | `/api/department/details` | Yes | `read:department` | Department details list |
| GET | `/api/department/details/:id` | Yes | `read:department` | Single department details |
| POST | `/api/department` | Yes | `create:department` | Create department |
| PUT | `/api/department/manager/change` | Yes | `update:department` | Change department manager |
| DELETE | `/api/department/:id` | Yes | `delete:department` | Delete department |
| GET | `/api/dept-details/:id/deptdetails-page` | Yes | `read:department` | Dept dashboard payload |
| GET | `/api/employee/all-employee` | Yes | `read:employee` | Employee list |
| GET | `/api/employee/role-options` | Yes | `create:employee` | Assignable roles |
| GET | `/api/employee/:id` | Yes | `read:employee` | Employee detail + task stats |
| POST | `/api/employee` | Yes | `create:employee` | Create employee |
| PUT | `/api/employee/org/:id` | Yes | `update:employee` | Update org fields |
| PUT | `/api/employee/personal/:id` | Yes | `update:employee` | Update personal fields |
| DELETE | `/api/employee/:id` | Yes | `delete:employee` | Delete employee |
| GET | `/api/employeePage/data1` | Yes | `read:employee` | Dept distribution for employees |
| GET | `/api/employeePage/analytics` | Yes | `read:employee` | Employee analytics |
| POST | `/api/team` | Yes | `create:team` | Create team |
| DELETE | `/api/team/:teamId/delete` | Yes | `delete:team` | Delete team |
| PUT | `/api/team/:teamId/add-members` | Yes | `update:team` | Add team members |
| PUT | `/api/team/:teamId/remove-members` | Yes | `update:team` | Remove team members |
| POST | `/api/chat` | Yes | `create:chat` | Access/create DM channel |
| GET | `/api/chat` | Yes | `read:chat` | User channels |
| GET | `/api/chat/:channelId` | Yes | `read:chat` | Channel messages |
| GET | `/api/room` | Yes | `read:room` | Rooms list |
| GET | `/api/room/:id` | Yes | `read:room` | Room by id |
| POST | `/api/room` | Yes | `create:room` | Create room |
| PUT | `/api/room/:id` | Yes | `update:room` | Update room |
| DELETE | `/api/room/:id` | Yes | `delete:room` | Delete room |
| POST | `/api/meeting` | Yes | `create:meeting` | Create meeting |
| GET | `/api/meeting` | Yes | `read:meeting` | Meetings list |
| GET | `/api/meeting/:id` | Yes | `read:meeting` | Meeting by id |
| PUT | `/api/meeting/:id` | Yes | route guarded | Update meeting |
| PATCH | `/api/meeting/:id/cancel` | Yes | route guarded | Cancel meeting |
| DELETE | `/api/meeting/:id` | Yes | route guarded | Delete meeting |
| GET | `/api/activities` | Yes | `read:recentActivity` | Recent activity feed |
| GET | `/api/roles/permissions` | Yes+Boss | Boss-only | Permission catalog |
| GET | `/api/roles` | Yes+Boss | Boss-only | Role list |
| GET | `/api/roles/:id` | Yes+Boss | Boss-only | Role detail |
| POST | `/api/roles` | Yes+Boss | Boss-only | Create role |
| PUT | `/api/roles/:id` | Yes+Boss | Boss-only | Update role |
| DELETE | `/api/roles/:id` | Yes+Boss | Boss-only | Delete role |

### Database Schema (Models)
- Core: `User`, `Organization`, `Role`, `Permission`
- Work: `Department`, `Team`, `Task`, `Comment`
- Meetings: `Room`, `Meeting`
- Communication: `Channel`, `Message`
- Billing: `Subscription`, `Transaction`
- Observability/Audit: `ActivityLog`, `RecentActivity`

Key relationships:
- User belongs to Organization, Role, optional Department
- Department has optional manager User, many Teams, many Tasks
- Team belongs to Department + Organization, has members + tasks
- Task belongs to Organization + Department, has creator, manager, employees, comments, optional team
- Meeting belongs to Organization, has host, participants, optional room, optional Google event id

### Authentication & Authorization
- `verifyToken`: validates JWT from cookie/bearer and hydrates `req.user`.
- `authorizePermission`: permission check via role -> permissions.
- `requireBoss`: role-name gate for role/permission administration routes.

### Middleware List
- `cors`, `helmet`, `morgan`, `express-rate-limit`, `cookie-parser`, `express.json`, `express.urlencoded`
- custom middleware: `verifyToken`, `authorizePermission`, `requireBoss`, `authorizeRole`

### Services and Business Logic
- Cron: hourly overdue migration (`Pending`/`In Progress` -> `Overdue`).
- Controller-heavy business logic for registration, task filters/aggregations, meeting conflict checks, notifications.

### Environment Variables (backend/.env)

| Variable | Purpose |
|---|---|
| `PORT`, `NODE_ENV` | runtime config |
| `MONGO_URI` | Mongo connection |
| `JWT_SECRET` | JWT sign/verify |
| `FRONTEND_URL`, `CLIENT_URL` | CORS, redirect, links |
| `CLOUDINARY_*` | file upload config |
| `RAZORPAY_*` | payments |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | calendar OAuth |
| `SENDGRID_API_KEY`, `SENDER_EMAIL`, `SENDER_NAME` | SendGrid mailer |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP fallback |
| `SEED_USER_PASSWORD` | demo seed default password |

### Error Handling Strategy
- Local `try/catch` in controllers with typed status codes.
- Global 500 fallback middleware in `server.js`.
- Permission/auth errors are explicit `401/403`.

### Third-party Integrations
- Razorpay payment flow
- Google Calendar OAuth and event sync
- Cloudinary for uploaded media
- SendGrid with SMTP fallback for transactional mail

---

## 4. Frontend Documentation

### Framework & Language
- React 18 (JSX), Vite 6, React Router

### Folder/Component Architecture
- `src/pages`: route-level containers
- `src/components`: feature modules (dashboard/tasks/meetings/chat/etc.)
- `src/components/ui`: reusable UI primitives (Radix-based)
- `src/context`: global state domains
- `src/utils` + `src/lib`: shared utilities and static plan config

### Routing Structure

Public:
- `/`, `/login`, `/registration`, `/plans`, `/about`, `/product`, `/solutions`
- `/privacy`, `/terms`, `/cancellation-refund`, `/shipping-policy`
- `/changelog`, `/integrations`, `/contact`, `/status`, `/careers`, `/reset-password`

Protected (`ProtectedRoutes`):
- `/dashboard`, `/tasks`, `/tasks/:taskId`
- `/employees`, `/employees/:id`
- `/departments`, `/department/:id`
- `/meetings`, `/meetings/:id`
- `/messages`, `/reports`, `/settings`, `/help`, `/profile`

`ProtectRegRoute` enforces `/registration` access with query `payment_success=true`.

### State Management
- Context-based global state:
  - `AuthContext`: user session bootstrap and logout
  - `SocketContext`: socket connection lifecycle
  - `NotificationContext`: notification state + localStorage persistence
  - `CallContext`: call state + incoming/outgoing call flow
  - `ThemeContext`: dark/light mode + localStorage
- Local component state for feature logic and forms

### API Integration Layer
- `axios` calls distributed by feature components/pages.
- Base URL: `import.meta.env.VITE_API_URL`.
- Auth calls use `{ withCredentials: true }` for cookie JWT.

Major frontend-consumed backend APIs:
- Auth: `/api/auth/*`
- Dashboard: `/api/dashboard/overview-data1|2|3`
- Employee/department/team/task/meeting/room/chat/roles/integrations endpoints (full table in backend section).

### Key Components

| Component | Purpose |
|---|---|
| `pages/Home.jsx` | dashboard orchestration (stats/charts/feed/upcoming cards) |
| `pages/Tasks.jsx` + `TaskDetails.jsx` | task list/board/detail + CRUD actions |
| `components/Task/KanbanBoard.jsx` | drag-drop task status board |
| `pages/Meeting.jsx` + `MeetingDetails.jsx` | meeting scheduling + edit/cancel/delete |
| `components/Meeting/MeetingRooms.jsx` | room management UI |
| `pages/Chat.jsx` + `components/Chat/*` | DM UX + realtime messages + call controls |
| `components/Settings/RolesSettings.jsx` | boss role/permission management |
| `components/Dashboard/NotificationPanel.jsx` | global notification drawer |

### Custom Hooks/Utilities
- Context hook exports: `useAuth`, `useSocket`, `useNotifications`, `useCall`, `useTheme`
- `src/lib/utils.js`: `cn()` class merge helper
- `src/utils/socket.js`: shared socket client initializer
- `src/utils/plans.json`: static pricing plan feature matrix

### Styling Approach
- Tailwind utility CSS and custom CSS variable theme in `index.css`.
- Dark mode toggled by applying `.dark` to `documentElement`.
- Radix/shadcn component primitives under `components/ui`.
- Framer Motion + GSAP used for transitions and marketing page animation.

### Environment Variables (frontend/.env.local)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL |
| `VITE_RAZORPAY_KEY_ID` | Client-side Razorpay checkout key |
| `VITE_ZEGO_APP_ID`, `VITE_ZEGO_SERVER_SECRET` | Reserved signaling/RTC integration variables |

---

## 5. Features List

| Feature | Backend files | Frontend files | Description |
|---|---|---|---|
| Organization registration + plan activation | `controllers/auth.controller.js`, `models/organization.model.js`, `models/subscription.js`, `models/transaction.js` | `pages/Pricing.jsx`, `pages/Registration.jsx` | Paid/free onboarding and subscription initialization |
| Authentication/session | `controllers/auth.controller.js`, `middlewares/verifyToken.js` | `context/AuthContext.jsx`, `pages/Login.jsx`, `components/Layout/Sidebar.jsx` | Login/logout/session restore with protected routing |
| Password reset via OTP | `controllers/auth.controller.js`, `utils/sendGrid.mail.js` | `components/ResetPasswordDialog.jsx`, `pages/ResetPassword.jsx` | Email OTP verification and password reset |
| Role & permissions (RBAC) | `models/Role.model.js`, `models/Permission.model.js`, `middlewares/authorizePermission.js`, `controllers/role.controller.js` | `components/Settings/RolesSettings.jsx`, `components/RoleSelect.jsx` | Fine-grained permission model and role CRUD |
| Employee CRUD | `controllers/user.controller.js`, `routes/employee.route.js` | `pages/Employees.jsx`, `pages/EmpDetails.jsx`, `components/Employee/*` | Employee create/edit/delete and details |
| Department management | `controllers/department.controller.js`, `controllers/departmentPage.controller.js` | `pages/Departments.jsx`, `pages/DeptDetails.jsx`, `components/Departments/*` | Department CRUD + manager and team insights |
| Team management | `controllers/team.controller.js` | `components/Departments/AddTeamMemberModal.jsx` | Team create/delete and member assignment |
| Task management | `controllers/task.controller.js`, `models/task.model.js` | `pages/Tasks.jsx`, `pages/TaskDetails.jsx`, `components/Task/*` | Full task lifecycle including board, milestones, assignment |
| Task comments | `controllers/comment.controller.js`, `models/comment.model.js` | `pages/TaskDetails.jsx` | Collaborate with comments on tasks |
| Dashboard analytics | `controllers/dashboard.controller.js` | `pages/Home.jsx`, `components/Dashboard/*`, `components/MonthlyTrendChart.jsx` | KPI and chart reporting |
| Activity audit feed | `models/recentActivity.js`, `utils/logRecentActivity.js` | `components/Dashboard/ActivityFeed.jsx` | Recent action trail across modules |
| Meeting scheduler | `controllers/meeting.controller.js`, `models/meeting.model.js` | `pages/Meeting.jsx`, `pages/MeetingDetails.jsx`, `components/Meeting/*` | Schedule/update/cancel/delete meetings |
| Room booking | `controllers/roomController.js`, `models/room.model.js` | `components/Meeting/MeetingRooms.jsx` | Room inventory and booking constraints |
| Google Calendar integration | `controllers/integration.controller.js`, meeting sync in `meeting.controller.js` | `pages/Settings.jsx` | OAuth connect/disconnect + event sync |
| Realtime DM chat | `sockets/socketManager.js`, `controllers/chat.controller.js`, `models/channelModel.js`, `models/MessageModel.js` | `pages/Chat.jsx`, `components/Chat/ChatSidebar.jsx`, `components/Chat/ChatWindow.jsx` | Socket-powered chat with persisted messages |
| Voice/video calling | `sockets/socketManager.js` | `context/CallContext.jsx`, `components/Chat/VideoCall.jsx`, `IncomingCall.jsx` | WebRTC signaling and call UI |
| Notification system | socket emissions in meeting controllers | `context/NotificationContext.jsx`, `components/Dashboard/NotificationPanel.jsx` | In-app notifications with local persistence |
| Billing workflow | `controllers/auth.controller.js` | `pages/Pricing.jsx` | Razorpay order and verification flow |
| Overdue automation | `services/cronJobs.js` | N/A | Hourly status automation for stale tasks |
| Media upload | `config/cloudinary.js`, `routes/auth.route.js` | `pages/Registration.jsx` | Cloudinary-backed image upload |

---

## 6. Data Flow

### UI -> API -> DB -> UI
1. User action in page/component.
2. `axios` request to backend API with credentials.
3. Route middleware validates auth + permission.
4. Controller performs business logic and Mongoose operations.
5. JSON response returned.
6. Frontend updates state/UI; optional socket events or toasts.

### Auth Flow
1. Login (`/api/auth/login`) returns token and sets `token` cookie.
2. `AuthContext` loads session using `/api/auth/me`.
3. Protected routes render only when `user` exists.
4. Logout clears backend cookie/session state and frontend local storage state.

---

## 7. Setup & Installation

### Prerequisites
- Node.js `20.x`
- npm
- MongoDB
- Optional for full features: Razorpay, Google OAuth, Cloudinary, SendGrid/SMTP credentials

### Backend
```bash
cd backend
npm install
npm start
```

Optional scripts:
```bash
npm run seed:permissions
npm run seed:demo -- you@example.com
npm run seed:demo:force -- you@example.com
npm run test:email
npm run diagnose:sendgrid
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

---

## 8. Dependencies

### Key Backend Dependencies
- `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`
- `socket.io`, `node-cron`
- `razorpay`, `googleapis`, `google-auth-library`
- `cloudinary`, `multer`, `multer-storage-cloudinary`
- `@sendgrid/mail`, `nodemailer`
- `helmet`, `cors`, `morgan`, `express-rate-limit`, `cookie-parser`

### Key Frontend Dependencies
- `react`, `react-dom`, `react-router-dom`, `axios`
- `socket.io-client`
- `tailwindcss`, `@radix-ui/*`, shadcn-style utilities
- `framer-motion`, `gsap`
- `recharts`, `chart.js`, `react-chartjs-2`
- `@dnd-kit/*`
- `@react-three/fiber`, `@react-three/drei`, `three`

## 9. Architecture Diagram (ASCII)

```text
                +-------------------------------+
                |      React Frontend (Vite)    |
                | pages/components/context/state |
                +---------------+---------------+
                                |
                                | HTTPS + cookies + bearer
                                v
                +---------------+---------------+
                |      Express API Server       |
                | routes -> middleware -> logic |
                +--------+---------------+------+
                         |               |
                    Socket.IO        Mongoose
                         |               |
                         v               v
              +----------+-----+   +-----+-----------+
              | realtime events |   |   MongoDB      |
              | chat/call/notify|   | app collections |
              +----------+-----+   +-----+-----------+
                         |
                         v
      +---------------------------------------------------+
      | External Services: Razorpay, Google, Cloudinary,  |
      | SendGrid/SMTP, Cron                               |
      +---------------------------------------------------+
```

---

## 10. Known Patterns & Conventions

- Permission naming convention: `action:resource`.
- Multi-tenancy enforced by filtering queries on `organizationId`.
- Controllers are business-logic heavy (service layer exists only for cron).
- Activity logging is centralized via `logRecentActivity` utility.
- Frontend follows route container + reusable component pattern.
- Context is preferred for app-wide state domains (auth/socket/theme/notifications/call).

### Notable Design Decisions
- JWT in HTTP-only cookie + optional bearer fallback.
- Role permission cache in middleware for faster authorization checks.
- Realtime and REST coexist (chat/call/meeting notification events).
- Meeting module merges local DB meetings with Google Calendar events.

### Risks / Technical Debt Observed
- Secrets are committed in `.env` and `.env.local` (rotate and remove from VCS).
- Some frontend code references fields like `username` while backend primarily uses first/last name.
- Duplicate/legacy commented code remains in some files (e.g., `Sidebar.jsx`).
- A few filenames include trailing spaces (e.g., employee component files).

---

## Appendix A: Backend File-by-File Notes

| Path | Description |
|---|---|
| `backend/.env` | Runtime secrets/config for DB, auth, integrations, mail, payments |
| `backend/package.json` | Backend metadata, scripts, dependency manifest |
| `backend/package-lock.json` | Locked dependency graph |
| `backend/server.js` | HTTP server + Socket.IO bootstrap and route mountpoint |
| `backend/config/cloudinary.js` | Cloudinary + Multer storage/filter config |
| `backend/config/permissions.constants.js` | CRUD action/resource permission generator |
| `backend/db/connectdb.js` | Mongo connection and cron startup |
| `backend/middlewares/verifyToken.js` | JWT parsing/validation and `req.user` hydration |
| `backend/middlewares/authorizePermission.js` | Permission guard with role cache |
| `backend/middlewares/authorizeRole.js` | Role-based guard helper |
| `backend/middlewares/requireBoss.js` | Boss-role guard for role management |
| `backend/models/activityLog.model.js` | Login/logout session duration records |
| `backend/models/channelModel.js` | Chat channel schema |
| `backend/models/comment.model.js` | Task comment schema |
| `backend/models/department.model.js` | Department schema and links to teams/tasks/manager |
| `backend/models/meeting.model.js` | Meeting schema with room/virtual metadata |
| `backend/models/MessageModel.js` | Chat message schema |
| `backend/models/organization.model.js` | Organization tenant profile + plan fields |
| `backend/models/Permission.model.js` | Permission catalog entries |
| `backend/models/recentActivity.js` | Recent activity/audit trail schema |
| `backend/models/Role.model.js` | Role schema with permission references |
| `backend/models/room.model.js` | Meeting room inventory schema |
| `backend/models/subscription.js` | Organization subscription state schema |
| `backend/models/task.model.js` | Core task schema |
| `backend/models/team.model.js` | Team schema |
| `backend/models/transaction.js` | Payment transaction schema |
| `backend/models/user.model.js` | User schema with auth/profile/oauth fields |
| `backend/routes/auth.route.js` | Auth + registration + payment routes |
| `backend/routes/chat.route.js` | Chat channel/message routes |
| `backend/routes/Comment.route.js` | Comment routes |
| `backend/routes/dashboard.route.js` | Dashboard analytics routes |
| `backend/routes/department.page.route.js` | Department detail page route |
| `backend/routes/department.route.js` | Department CRUD and manager-change routes |
| `backend/routes/employee.route.js` | Employee CRUD routes |
| `backend/routes/employeePage.route.js` | Employee analytics routes |
| `backend/routes/integration.routes.js` | Google integration routes |
| `backend/routes/meeting.route.js` | Meeting CRUD routes |
| `backend/routes/recentActivity.route.js` | Recent activities route |
| `backend/routes/role.route.js` | Role/permission admin routes |
| `backend/routes/room.route.js` | Room CRUD routes |
| `backend/routes/task.route.js` | Task lifecycle routes |
| `backend/routes/team.route.js` | Team create/delete/member routes |
| `backend/controllers/auth.controller.js` | Registration/login/logout/password + payment logic |
| `backend/controllers/chat.controller.js` | Channel access and message retrieval logic |
| `backend/controllers/comment.controller.js` | Comment create/update/delete logic |
| `backend/controllers/dashboard.controller.js` | Analytics aggregations and trends |
| `backend/controllers/department.controller.js` | Department CRUD/details/manager change |
| `backend/controllers/departmentPage.controller.js` | Department page aggregate payload |
| `backend/controllers/employeePage.controller.js` | Employee analytics endpoints |
| `backend/controllers/integration.controller.js` | Google OAuth URL/callback/disconnect logic |
| `backend/controllers/meeting.controller.js` | Meeting rules, conflicts, notifications, Google sync |
| `backend/controllers/permission.controller.js` | Permission list endpoint |
| `backend/controllers/role.controller.js` | Role CRUD and validation logic |
| `backend/controllers/roomController.js` | Room CRUD and delete constraints |
| `backend/controllers/task.controller.js` | Task CRUD, assignment, filters, milestones |
| `backend/controllers/team.controller.js` | Team CRUD + membership logic |
| `backend/controllers/user.controller.js` | Employee CRUD and detail analytics |
| `backend/services/cronJobs.js` | Overdue task scheduler |
| `backend/sockets/socketManager.js` | Socket auth, chat events, call signaling events |
| `backend/utils/logRecentActivity.js` | Utility to write activity feed events |
| `backend/utils/send.mail.js` | SMTP-based mail templates and sending |
| `backend/utils/sendGrid.mail.js` | SendGrid-first mail service with SMTP fallback |
| `backend/scripts/seedPermissions.js` | Seed permission catalog and Boss role |
| `backend/scripts/seedDemoData.js` | Seed realistic demo org data |
| `backend/scripts/seedDemoForce.js` | Force reset + seed wrapper |
| `backend/scripts/testSendEmail.js` | SendGrid connectivity test |
| `backend/scripts/diagnoseSendGrid.js` | Sender identity diagnostics |

## Appendix B: Frontend File-by-File Notes

| Path | Description |
|---|---|
| `frontend/.env.local` | Frontend env vars for API/payments/RTC keys |
| `frontend/.gitignore` | Frontend git ignore rules |
| `frontend/.npmrc` | npm config (`legacy-peer-deps=true`) |
| `frontend/components.json` | shadcn component generator config |
| `frontend/eslint.config.js` | Linting rules |
| `frontend/google3030a3bd9f1c17aa.html` | Google site verification file |
| `frontend/index.html` | Root HTML, SEO/meta, Razorpay script injection |
| `frontend/jsconfig.json` | Alias/js compiler options |
| `frontend/package.json` | Frontend scripts and dependencies |
| `frontend/package-lock.json` | Locked frontend dependency graph |
| `frontend/README.md` | Vite React template readme |
| `frontend/tailwind.config.js` | Tailwind animation/theme extension |
| `frontend/vite.config.js` | Vite plugins, alias, `/api` proxy |
| `frontend/public/_redirects` | SPA redirect rule |
| `frontend/public/sitemap.xml` | Sitemap entries |
| `frontend/public/sounds/ringtone.mp3` | Incoming call ringtone asset |
| `frontend/public/*.png|jpg|svg|webp|ico` | Branding, profile, and preview static assets |
| `frontend/src/main.jsx` | Provider tree and app bootstrapping |
| `frontend/src/App.jsx` | Route registration with protected/public split |
| `frontend/src/index.css` | Global design tokens, theme vars, utilities |
| `frontend/src/lib/utils.js` | Classname utility helper (`cn`) |
| `frontend/src/routes/ProtectedRoutes.jsx` | Guard for authenticated routes |
| `frontend/src/routes/ProtectRegRoute.jsx` | Registration precondition guard |
| `frontend/src/utils/plans.json` | Pricing plan metadata and feature matrix |
| `frontend/src/utils/socket.js` | Shared socket client helper |
| `frontend/src/context/AuthContext.jsx` | Session bootstrap, login/logout state |
| `frontend/src/context/SocketContext.jsx` | Socket initialization lifecycle |
| `frontend/src/context/NotificationContext.jsx` | Notification state + persistence |
| `frontend/src/context/CallContext.jsx` | Call orchestration and signaling UX state |
| `frontend/src/context/ThemeContext.jsx` | Theme state and toggle |
| `frontend/src/pages/*.jsx` | Route-level pages for app features and marketing/legal |
| `frontend/src/pages/Tasks.css` | Legacy/auxiliary task table styles |
| `frontend/src/components/Chat/*` | Chat sidebar/window, incoming call UI, WebRTC call screen |
| `frontend/src/components/Dashboard/*` | KPI cards/charts/feed/notification widgets |
| `frontend/src/components/Departments/*` | Department summary/list/team management widgets |
| `frontend/src/components/Employee/*` | Employee directory/stats/distribution widgets |
| `frontend/src/components/Layout/*` | Navbar/footer/sidebar app shell |
| `frontend/src/components/Meeting/*` | Calendar, room, and upcoming meeting widgets |
| `frontend/src/components/Settings/RolesSettings.jsx` | Role-permission admin UI |
| `frontend/src/components/Task/*` | Task list/board/stats/filter/create dialog |
| `frontend/src/components/ui/*` | Shared UI primitives and animated utility components |
| `frontend/src/components/*.jsx` | Additional shared charts/forms/helpers (`RoleSelect`, `SEO`, etc.) |
| `frontend/src/assets/*` | In-bundle media assets for marketing/auth visuals |
