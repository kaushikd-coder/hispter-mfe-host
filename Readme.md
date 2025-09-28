# Host App – Pluggable Micro‑Frontend Shell (React + TypeScript + Module Federation)

This repository contains the **host container** for a pluggable micro‑frontend architecture. It loads independent MFEs (Auth, Booking, Reporting) **dynamically at runtime** via a JSON config, provides cross‑app routing, session bridging, error boundaries, and an optional plugin registry.

---

## ✨ Features

* **Runtime‑loaded MFEs:** `remotes.json` controls which MFEs load (no rebuild needed).
* **Module Federation:** Each remote provides its own `remoteEntry.js` and shared deps.
* **Routing & Guards:** React Router, `Protected` wrapper, role‑aware route gating.
* **Cross‑App Communication:** Session shared via browser **CustomEvent** bridge.
* **Resilient UX:** `ErrorBoundary` + friendly fallback text if a remote fails.
* **Design:** Tailwind CSS for a clean, modern host shell.

---

## 🧱 Tech Stack

* **React 18 + TypeScript**
* **Webpack 5 Module Federation**
* **React Router**
* **Tailwind CSS**

> Remotes use compatible versions of React/React‑DOM and can share **react**, **react‑dom**, **react‑redux**, and **@reduxjs/toolkit** as singletons.

---

## 📁 Folder Structure (host)

```
├─ public/
│  └─ index.html
├─ src/
│  ├─ RemoteLoader.tsx          # dynamic loader for MFEs
│  ├─ ErrorBoundary.tsx         # catches remote errors
│  ├─ routes/
│  │   └─ Home.tsx
│  ├─ App.tsx                   # routes + nav + guards
│  ├─ bootstrap.tsx             # React root
│  ├─ index.ts                  # async import('./bootstrap')
│  └─ types.d.ts                # (optional) module types
├─ remotes.json                 # runtime remote config
├─ webpack.config.js
├─ package.json
└─ README.md
```

---

## ⚙️ Runtime Configuration – `remotes.json`

The host fetches this file at startup and registers remotes in `window.__remoteUrls`.

```json
{
  "authApp": "http://localhost:3001/remoteEntry.js",
  "bookingApp": "http://localhost:3002/remoteEntry.js",
  "reportingApp": "http://localhost:3003/remoteEntry.js"
}
```

> To **add a new module** (e.g., `helpdeskApp`), just add a key here and expose at least one component from the remote. **No host rebuild required.**

---

## 🏗️ Module Federation (host) – Key Points

* The host does **not** expose modules; it **consumes** them via `window[scope]`.
* Remotes declare exposes like `./Login`, `./UserBooking`, `./ReportDashboard`.
* Shared deps are marked as **singletons** to avoid version duplication across apps.

Example (in each remote):

```js
new ModuleFederationPlugin({
  name: "bookingApp",
  filename: "remoteEntry.js",
  exposes: {
    "./UserBooking": "./src/UserBookingWithStore",
    "./BookingForm": "./src/booking/BookingForm",
    "./BookingList": "./src/booking/BookingList",
    "./useSession": "./src/booking/useSession",
    "./bookingsSlice": "./src/store/bookingsSlice"
  },
  shared: {
    react: { singleton: true, requiredVersion: deps.react },
    "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
    "react-redux": { singleton: true, requiredVersion: deps["react-redux"] },
    "@reduxjs/toolkit": { singleton: true, requiredVersion: deps["@reduxjs/toolkit"] }
  }
});
```

---

## 🔌 Dynamic Loader – `RemoteLoader`

The host fetches `remotes.json`, loads a `remoteEntry.js` once, initializes sharing, then resolves the requested exposed module.

```ts
// simplified outline
await __webpack_init_sharing__("default");
// inject <script src="remoteEntry.js"> ...
const container = (window as any)[scope];
await container.init(__webpack_share_scopes__.default);
const factory = await container.get(modulePath);
const Module = factory();
```

Usage in routes:

```tsx
<RemoteLoader
  scope="bookingApp"
  module="./UserBooking"
  fallback={<div>Loading…</div>}
  render={({ Component }) => <Component user={user} />}
/>
```

---

## 🔐 Routing, Guards & Role Access

* `Protected` redirects unauthenticated users to `/login`.
* **Role‑based access (optional bonus):** show `reporting` only for Admin.

```tsx
function Protected({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const isAdmin = (u?: { email?: string }) => u?.email === "admin@example.com";
```

---

## 🔁 Cross‑App Communication (Session Bridge)

We share auth/session via **CustomEvent** so remotes can react without tight coupling.

```ts
// login from auth-app
window.dispatchEvent(new CustomEvent("auth:login", { detail: user }));
// logout from host or any remote
window.dispatchEvent(new CustomEvent("auth:logout"));
```

The host listens and persists:

```ts
useEffect(() => {
  const onLogin = (e: any) => { setUser(e.detail); localStorage.setItem("authUser", JSON.stringify(e.detail)); };
  const onLogout = () => { setUser(null); localStorage.removeItem("authUser"); };
  window.addEventListener("auth:login", onLogin);
  window.addEventListener("auth:logout", onLogout);
  return () => { window.removeEventListener("auth:login", onLogin); window.removeEventListener("auth:logout", onLogout); };
}, []);
```

> Remotes can also **import** shared hooks (e.g., `bookingApp/useSession`) if exposed.

---

## 🧰 Local Development

### Prereqs

* Node 18+

### Install & Run

```bash
npm install
npm run dev
```

By default the host serves on e.g. `http://localhost:3000`.

### Build

```bash
npm run build
```

> Run each remote independently on its own port (e.g., 3001, 3002, 3003) so the host can load them at runtime.

---

## 🚀 Deployment Simulation

1. **Serve each remote** (Auth/Booking/Reporting) from its own origin (ports or hosts).
2. Publish their `remoteEntry.js` URLs.
3. Update **only** `remotes.json` in the host deployment to point to the new URLs.
4. Reload host → new versions are consumed **without rebuilding** the host.

> For cloud (bonus): deploy MFEs to Vercel/Netlify/Amplify and host can remain static.

---

## 🧩 Plugin Registry (Bonus Hook)

You can let modules self‑register with metadata consumed by the host nav (name, routes, permissions). Example contract a remote can expose:

```ts
// remote: ./pluginMeta
export default {
  name: "Booking",
  scope: "bookingApp",
  routes: [{ path: "/booking", module: "./UserBooking", requireAuth: true }],
  permissions: ["user"],
};
```

The host can load `./pluginMeta` from each scope listed in `remotes.json` and render routes dynamically.

---

## 🧯 Error Handling & Fallbacks

* All remote loads are wrapped in `ErrorBoundary`.
* Friendly messages like: **“Booking module is currently unavailable.”**
* `RemoteLoader` also shows loading fallback while downloading `remoteEntry.js`.

## ✅ Assessment Checklist (Host)

* [x] Loads MFEs at runtime from JSON (no rebuild)
* [x] Routing + guards
* [x] Error boundaries & graceful fallbacks
* [x] Cross‑app session bridge
* [x] Role‑aware gating (optional bonus ready)
* [x] Ready for deployment simulation (change `remotes.json` only)
