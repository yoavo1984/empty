# Daylight development notes

- Daylight is a browser-local task manager, not a multi-user backend. Tasks persist in localStorage under `daylight.tasks.v1`; there is no authentication or cloud synchronization. Do not imply cross-device persistence.
- First visits get seven clearly documented example tasks. An existing empty task array remains empty. Malformed storage is preserved rather than silently overwritten.
- Start with `docker compose -f docker-compose.base44.yml up -d`. The bind-mounted Vite dev server serves port 3000; startup runs `npm ci` from the lockfile. Wait for the service healthcheck before running build checks.
- Build check: `docker compose -f docker-compose.base44.yml exec -T web npm run build`. This checks the production bundle but the preview must keep serving Vite, not `dist`.
- Verify task creation, editing, completion, search, project/status/priority filters, sorting, deletion and Undo via the UI. Read localStorage to confirm writes, and clean up only records created by the verification.
- Date-only values use local calendar dates, not UTC conversion, to avoid changing due dates across time zones.
- The preview hostname is allowed using the platform-provided `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` Compose environment entry. There are no unconditional host wildcards or sandbox-only application branches. Source watching polls for reliable updates through the bind mount.
