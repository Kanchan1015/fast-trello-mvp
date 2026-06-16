# Fast Trello Frontend Documentation

This folder contains the React frontend for the Fast Trello MVP. It is a single-page application that lets a user sign up, log in, view boards, collaborate with members, manage lists/cards, reorder work with drag-and-drop, and receive realtime board updates.

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
- `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` for list/card drag-and-drop.
- `@stomp/stompjs` and `sockjs-client` for realtime board subscriptions.

## How The Frontend Works

The app starts in `src/main.tsx`. It creates the React root, configures `QueryClientProvider`, wraps everything in `AuthProvider`, and registers the public and protected routes.

Authentication state is handled in `src/context/AuthContext.tsx`. Tokens are not stored in `localStorage`; the backend stores access and refresh tokens in HttpOnly, Secure, SameSite=Strict cookies. On app load, the provider checks `/api/auth/me`, restores the logged-in user when the access cookie is valid, and exposes `login`, `logout`, `signIn`, and `signOut`.

API calls are centralized under `src/api/`. The Axios instance in `src/api/axios.ts` sets the backend base URL, sends cookies with `withCredentials: true`, retries expired sessions through `/api/auth/refresh`, and handles failed `401` responses by clearing client auth state.

React Query is used for data fetching and mutations:

- `Dashboard.tsx` fetches the user's boards.
- `useCreateBoard.ts` creates boards with optimistic UI.
- `useDeleteBoard.ts` deletes boards with rollback on failure.
- `BoardPage.tsx` fetches a single board, its lists, cards, and members.
- `AddList.tsx` and `ListColumn.tsx` create, rename, delete, and reorder lists.
- `AddCard.tsx` and `CardItem.tsx` create, edit, delete, move, and reorder cards.
- `BoardMembers.tsx` lists collaborators and lets the owner invite/remove members.
- `src/api/realtime.ts` subscribes to board STOMP events and triggers React Query invalidation.

## Folder Structure

```txt
frontend/
  src/
    api/          HTTP clients for auth, boards, lists, cards, members, realtime
    components/   Shared UI pieces like Header, BoardCard, list columns, cards, members
    context/      AuthProvider and auth hook
    hooks/        React Query mutation hooks
    pages/        Route-level screens
    types/        Local ambient declarations
    utils/        Legacy token helpers kept for compatibility only
    App.tsx       Protected app layout and nested routes
    main.tsx      React entrypoint
```

## Main User Flow

1. User opens the app.
2. `AuthProvider` checks `/api/auth/me`; if no valid cookie session exists, `RequireAuth` redirects to `/login`.
3. User signs up or logs in through the auth pages.
4. Backend sets secure HttpOnly access/refresh cookies and returns a user object.
5. Axios sends cookies on future requests and refreshes the session when possible.
6. Dashboard loads boards for the authenticated user.
7. User can create/delete boards and open a board page.
8. Board page loads lists, cards, and members.
9. User can add/rename/delete/reorder lists, add/edit/delete/reorder cards, move cards across lists, and manage collaborators.
10. When another client changes the board, STOMP events invalidate the relevant React Query caches.

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

The backend should be running on an HTTPS origin because auth cookies are marked `Secure`:

```txt
https://localhost:8080
```

If needed, the API base URL can be changed with:

```txt
VITE_API_BASE_URL=https://localhost:8080
```

For local development, use a TLS-terminating proxy or configure the backend for HTTPS. Plain HTTP backend auth will not work in browsers with Secure cookies.

## Build Check

Use this before committing frontend work:

```bash
npm run build
```

This runs TypeScript compilation and creates a production build in `dist/`.

## Current Feature Status

Implemented:

- Signup and login UI.
- Cookie-backed session restore.
- Refresh-token retry on expired access sessions.
- Protected routes.
- Dashboard board list.
- Board create/delete.
- Board details page.
- List create, rename, and delete.
- List drag-and-drop reordering.
- Card create, inline edit, delete, move, and reorder.
- Realtime board synchronization through STOMP/SockJS.
- Board member list/add/remove UI.
- Loading, empty, and error states.

Not implemented yet:

- Dedicated card detail modal.
- Rich card descriptions/checklists/comments.
- Conflict-resolution UI for simultaneous edits.

## Notes For Future Development

Keep new server data in React Query where possible. Put reusable HTTP logic in `src/api/`, route-level screens in `src/pages/`, and shared UI in `src/components/`. For future card details or activity features, keep optimistic cache updates close to the mutation logic and publish backend realtime events so other board viewers refresh promptly.
