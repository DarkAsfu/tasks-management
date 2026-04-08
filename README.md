# Task Management Client

Frontend for the task management system, built with Next.js.

## Features

- Authentication and role-based access (Admin/User)
- Task list, task details, add task, edit task
- Status updates and task deletion
- Admin-only audit logs page with:
  - search
  - action/date filters
  - expandable details
  - changed-field highlights for updates
- Quick login credentials shown on the login page for local testing

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- shadcn/ui components
- Axios

## Prerequisites

- Node.js 18+
- npm
- Running backend API (`task-management-server`)

## Environment Variables

Create a `.env.local` file in this folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

If not set, the app falls back to `http://localhost:5000`.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Run with Docker (from project root)

```bash
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000).

## Demo Credentials (Seeded)

These are displayed on the login page and can be auto-filled with the "Use" buttons:

- Admin
  - Email: `admin@test.com`
  - Password: `admin123`
- User
  - Email: `user@test.com`
  - Password: `user123`

## Main Routes

- `/login` - login page
- `/dashboard` - task list
- `/add-task` - add task (admin)
- `/edit-task/[task_id]` - edit task
- `/task-details/[task_id]` - task details
- `/audit-logs` - audit logs (admin)

## Notes

- Audit logs are served from backend endpoint `GET /audit-logs`.
- Admin-only navigation links are conditionally rendered by role.
- In production mode, quick-login credentials are hidden on the login page.
