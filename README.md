# Daylight

A calm, responsive task manager built with React and Vite. Create and edit tasks with notes, projects, priorities, and due dates; track completion; search, filter, sort, delete, and undo deletion.

## Run the development preview

Docker and Docker Compose are required.

```sh
docker compose -f docker-compose.base44.yml up -d
```

Open http://localhost:3000. The source is bind-mounted, dependencies are installed from `package-lock.json` on startup, and Vite reloads changes automatically. The healthcheck allows startup time for the dependency install.

```sh
# Check service status
docker compose -f docker-compose.base44.yml ps
# Follow development logs
docker compose -f docker-compose.base44.yml logs -f web
# Check the production build (does not change preview serving mode)
docker compose -f docker-compose.base44.yml exec -T web npm run build
# Stop without deleting dependency volumes
docker compose -f docker-compose.base44.yml down
```

## Storage and sample content

Tasks are saved **only in the current browser**, under localStorage key `daylight.tasks.v1`. There is no server database, account system, or cross-device synchronization. Clearing browser site data removes tasks. Seven sample tasks are created on the first visit to demonstrate the app; edit or delete them normally. No external credentials are needed. Google Fonts is optional, with system font fallbacks.

## Preview configuration

The Compose service passes through `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`, which Base44 supplies for its proxy host. When unset, Vite uses its default host protection. No shared application settings depend on `BASE44_PREVIEW_MODE`. Polling is enabled for source watching through Docker mounts; it only affects development. The preview is a development environment, not a public production deployment.

## Verification

Run the build command above, then create a temporary task in the app. Edit its details, complete and reopen it, try search and filters, and delete it. Use Undo to restore that same task, then delete it again. Verify localStorage reflects each save. Check the list and task dialog on desktop and mobile.
