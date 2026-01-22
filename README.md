# InventoryGo

InventoryGo is a React + Vite app with:

- **Pages (routes)** managed by React Router
- **Shared state** managed by React Context Providers
- **Layouts** that wrap groups of routes

This README explains (in human language) “who is a child of who” and what each important piece of code is doing.

---

## How the app starts

### 1) The app is mounted

In `src/main.jsx`, React renders `<App />` into the `#root` element.

### 2) Providers wrap the router

In `src/App.jsx`:

- `<AppProviders>` wraps `<RouterProvider>`
- This means the router (and every page rendered by the router) lives **inside** your Providers

So the relationship looks like this:

```
<StrictMode>
	<App>
		<AppProviders>
			<RouterProvider router={router} />
		</AppProviders>
	</App>
</StrictMode>
```

---

## “Who is child of who?” (Provider nesting)

In `src/providers/AppProviders.jsx` you currently have:

```
<InventoryProvider>
	<RequestsProvider>
		{children}
	</RequestsProvider>
</InventoryProvider>
```

That means:

- Everything inside `<RequestsProvider>` can read/write the Requests Context.
- Everything inside `<InventoryProvider>` can read/write the Inventory Context.
- Because `RequestsProvider` is *inside* `InventoryProvider`, the requests code can also use inventory functions.

### What `{children}` means

`children` is just “whatever you wrapped inside this component”.

Example:

```
<RequestsProvider>
	<RouterProvider />
</RequestsProvider>
```

In this example, `<RouterProvider />` is the `children`.

---

## What this line does (the context Provider line)

In `src/contexts/RequestsContext.jsx`, you have:

```jsx
return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>
```

Human translation:

- “Make the `value` object available to all components rendered inside me.”
- “Also render my children (don’t block the UI).”

So any nested component can call `useContext(RequestsContext)` (or a helper hook) and get that `value`.

If you remove the Provider, any consumer will only see the default context value (in your case `null`).

---

## “Nested pages” (routing nesting)

“Nested pages” means: pages that render **under** a parent route/layout.

In `src/router.jsx` you define route nesting like this:

- `/` uses `<AppLayout />`
	- inside it, `<Outlet />` is where the current page renders

### What `<Outlet />` means

`<Outlet />` is a placeholder.

In `src/layouts/AppLayout.jsx`:

- The `NavBar` always shows
- The page content changes inside `<Outlet />`

So the mental model is:

```
AppLayout
	NavBar (always)
	Outlet (changes based on URL)
```

### Auth / role wrappers

You also have “gatekeeper” routes:

- `RequireAuth` checks if the user is logged in
	- not logged in: redirect to `/login`
	- logged in: render `<Outlet />` (let the child routes show)
- `RequireRole` checks if the logged-in user has the right role (ex: admin)
	- wrong role: redirect away
	- correct role: render `<Outlet />`

These components don’t show a page by themselves; they decide whether a page is allowed to render.

---

## Contexts (what they store)

### Inventory Context

Inventory Context stores:

- `items` (your inventory list)
- `loading` and `error` (UI state for fetching)
- actions like `fetchItems`, `consumeStock`, and `restock`

Any page under `AppProviders` can use this context.

### Requests Context

Requests Context stores:

- `requests` (the requests list)
- actions like `createRequest`, `approveRequest`, and `rejectRequest`

Important detail:

- `RequestsProvider` calls `useInventory()` and uses `consumeStock`
- That’s why `RequestsProvider` must be wrapped by `InventoryProvider` (which you already do)

---

## Running the project

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Production build: `npm run build`
