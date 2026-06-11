# Fast Trello Frontend Documentation

This folder contains the React frontend for the Fast Trello MVP. It is a small single-page application that lets a user sign up, log in, view boards, create/delete boards, and manage board lists.

## Technology Used

- React for building reusable UI components.
- TypeScript for typed components, API payloads, and safer refactoring.
- Vite for local development, hot reload, and production builds.
- React Router for `/login`, `/signup`, `/dashboard`, and `/boards/:id` routing.
- TanStack React Query for server state, caching, loading states, and optimistic updates.
- Axios for HTTP requests to the Spring Boot backend.
- Tailwind CSS for utility-first styling.
- react-hot-toast for success and error notifications.
- date-fns for formatting board dates.

## How The Frontend Works

The app starts in `src/main.tsx`. It creates the React root, configures `QueryClientProvider`, wraps everything in `AuthProvider`, and registers the public and protected routes.

Authentication state is handled in `src/context/AuthContext.tsx`. The JWT token is stored through helpers in `src/utils/token.ts`. On app load, the provider checks `/api/auth/me` when a token exists, restores the logged-in user, and exposes `login`, `logout`, `signIn`, and `signOut`.

API calls are centralized under `src/api/`. The Axios instance in `src/api/axios.ts` sets the backend base URL, attaches the JWT as a `Bearer` token, and handles `401` responses by clearing the session.

React Query is used for data fetching and mutations:

- `Dashboard.tsx` fetches the user's boards.
- `useCreateBoard.ts` creates boards with optimistic UI.
- `useDeleteBoard.ts` deletes boards with rollback on failure.
- `BoardPage.tsx` fetches a single board and its lists.
- `AddList.tsx` and `ListColumn.tsx` create, rename, and delete lists.

## Folder Structure

```txt
frontend/
  src/
    api/          HTTP clients for auth, boards, and lists
    components/   Shared UI pieces like Header, BoardCard, and list columns
    context/      AuthProvider and auth hook
    hooks/        React Query mutation hooks
    pages/        Route-level screens
    utils/        Token storage helpers
    App.tsx       Protected app layout and nested routes
    main.tsx      React entrypoint
```

## Main User Flow

1. User opens the app.
2. If no token exists, `RequireAuth` redirects to `/login`.
3. User signs up or logs in through the auth pages.
4. Backend returns a JWT and user object.
5. Token is stored locally and Axios sends it with future requests.
6. Dashboard loads boards for the authenticated user.
7. User can create/delete boards and open a board page.
8. Board page loads lists and allows adding, renaming, and deleting lists.

## Running The Frontend

From the `frontend` folder:

```bash
npm install
npm run dev
```

Default local URL:

```txt
http://localhost:5173
```

The backend should be running on:

```txt
http://localhost:8080
```

If needed, the API base URL can be changed with:

```txt
VITE_API_BASE_URL=http://localhost:8080
```

## Build Check

Use this before committing frontend work:

```bash
npm run build
```

This runs TypeScript compilation and creates a production build in `dist/`.

## Current Feature Status

Implemented:

- Signup and login UI.
- JWT session restore.
- Protected routes.
- Dashboard board list.
- Board create/delete.
- Board details page.
- List create, rename, and delete.
- Loading, empty, and error states.

Not implemented yet:

- Cards CRUD.
- Drag and drop.
- Realtime updates.
- Board sharing or members.

## Notes For Future Development

Keep new server data in React Query where possible. Put reusable HTTP logic in `src/api/`, route-level screens in `src/pages/`, and shared UI in `src/components/`. For bigger features like cards or drag-and-drop, add focused hooks similar to `useCreateBoard` and keep optimistic cache updates close to the mutation logic.
