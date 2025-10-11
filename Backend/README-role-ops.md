Role Ops API (RBAC integration)

Base: http://localhost:5000/role-ops (JWT required)

- GET /sm/projects — Site Manager: list assigned projects
- POST /sm/projects/add-supervisor { projectId, supervisorId } — Site Manager assigns supervisor

- GET /ss/projects — Supervisor: list projects assigned
- POST /ss/tasks { projectId, title, description?, dueDate?, laborerIds? } — create task
- GET /ss/tasks — Supervisor: list own tasks
- PUT /ss/tasks/:id — Supervisor: update task

- GET /labor/tasks — Labor: list tasks assigned to me
- POST /labor/tasks/:id/complete — Labor: mark task completed

- GET /client/projects — Client: list projects linked to me

Assignment helpers (Admin only)

Base: http://localhost:5000/project-assign

- POST /:id/assign-site-manager { siteManagerId }
- POST /:id/add-client { clientId }
