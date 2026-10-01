# Aibolit Frontend

[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-5-0170FE.svg?logo=antdesign&logoColor=white)](https://ant.design/)
[![Keycloak](https://img.shields.io/badge/Auth-Keycloak-4D4D4D.svg?logo=keycloak&logoColor=white)](https://www.keycloak.org/)
[![CRACO](https://img.shields.io/badge/Build-CRACO-ED7D31.svg)](https://craco.js.org/)

A React/TypeScript frontend application for the Aibolit Healthcare System. It provides role-based dashboards for patients, doctors, chief doctors, and administrators, utilizing Keycloak for authentication and communicating directly with the AibolitAPI backend. Primary interface language: Ukrainian.

> **Architecture Note:** This frontend is strictly dependent on the [Aibolit API](https://github.com/Tokar08/AibolitAPI) backend. While the backend can function independently, this frontend application requires the backend and a Keycloak instance to be running to provide any meaningful functionality.

---

## Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Role-Based Features](#role-based-features)
- [Integration with Backend](#integration-with-backend)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Available Scripts](#available-scripts)
- [Known Limitations & Design Decisions](#known-limitations--design-decisions)
- [Troubleshooting](#troubleshooting)

---

## Technology Stack

*   **Framework:** React 18 with TypeScript 4.9
*   **Build Tool:** CRACO (Customize CRA) to extend Webpack configuration without ejecting
*   **UI Library:** Ant Design 5 (component library)
*   **Styling:** Tailwind CSS (utility-first CSS)
*   **Routing:** React Router 7
*   **Charts:** Recharts (data visualization for statistics)
*   **Drag & Drop:** dnd-kit, react-draggable (schedule management)
*   **Date Handling:** Day.js, Moment.js
*   **PWA:** Workbox (service worker management)
*   **Authentication:** Keycloak JS Adapter (OAuth 2.0 / OpenID Connect)
*   **HTTP Client:** Axios (for API requests with automatic token attachment)
*   **Testing:** Jest + React Testing Library (configured via CRACO)

---

## Project Structure

```text
AibolitFrontend/
├── .gitignore                   # Git ignore rules (node_modules, .env, build artifacts)
├── craco.config.js              # CRACO configuration (extends Create React App without ejecting)
├── package.json                 # Project dependencies and npm scripts
├── package-lock.json            # Locked dependency versions for reproducible builds
├── README.md                    # Project documentation
├── tailwind.config.js           # Tailwind CSS configuration (theme, custom utilities)
├── tsconfig.json                # TypeScript compiler options
├── public/                      # Static assets served at the root (not processed by Webpack)
│   ├── aibolit-logo.ico         # App icon for browser tab
│   ├── aibolit-logo192.png      # PWA icon (192x192)
│   ├── aibolit-logo512.png      # PWA icon (512x512)
│   ├── favicon.ico              # Legacy favicon
│   ├── index.html               # HTML entry point (root div for React mount)
│   ├── logo192.png              # Default CRA icon (192x192)
│   ├── logo512.png              # Default CRA icon (512x512)
│   ├── manifest.json            # PWA manifest (app name, icons, theme colors)
│   └── robots.txt               # SEO crawler directives
└── src/                         # Application source code
    ├── api/                     # Service layer: typed wrappers around HTTP requests
    │   ├── diseaseSearch.ts     # Disease search queries (Gemini / NLM API via backend)
    │   ├── doctor.ts            # Doctor CRUD, patient lists, prescriptions, recommendations
    │   ├── hospital.ts          # Hospital-scoped operations (chief doctor context)
    │   ├── keycloak.ts          # Keycloak initialization, token management, logout flow
    │   ├── patient.ts           # Patient operations: appointments, favorites, history
    │   ├── statistics.ts        # Hospital statistics and analytics
    │   └── workSchedule.ts      # Work schedule CRUD operations
    ├── components/              # Reusable UI components (not tied to specific routes)
    │   ├── AddDoctorModal.tsx         # Modal for onboarding a new doctor
    │   ├── AddPrescriptionModal.tsx   # Modal for creating a prescription
    │   ├── AddRecommendationModal.tsx # Modal for creating a recommendation
    │   ├── BookingModal.tsx           # Modal for booking an appointment (slot selection)
    │   ├── DoctorProfile.tsx          # Doctor profile card / detailed view
    │   ├── EditDoctorModal.tsx        # Modal for editing doctor data
    │   ├── ManagePatients.tsx         # Patient management table (doctor/chief context)
    │   ├── Navbar.tsx                 # Top navigation bar with role-aware links
    │   ├── PatientList.tsx            # Paginated list of patients
    │   ├── PatientProfile.tsx         # Patient profile card / detailed view
    │   ├── PrescriptionModal.tsx      # Modal for viewing/editing a prescription
    │   ├── ProfileModal.tsx           # Modal for editing user profile
    │   ├── RecommendationModal.tsx    # Modal for viewing/editing a recommendation
    │   ├── ResponseRenderer.tsx       # Generic response display component
    │   ├── RoleBasedGuard.tsx         # HOC that restricts route access by Keycloak role
    │   └── ScheduleModal.tsx          # Modal for managing doctor work schedules
    ├── pages/                   # Route-level components (one per application route)
    │   ├── AdminPanel.tsx             # Administrator dashboard
    │   ├── AppointmentsPage.tsx       # Appointment list and management
    │   ├── ChiefActions.tsx           # Chief doctor action panel
    │   ├── ChiefDoctorStatistics.tsx  # Hospital-wide statistics dashboard
    │   ├── Dashboard.tsx              # Main dashboard (role-dependent content)
    │   ├── DiseaseSearch.tsx          # Disease search interface (AI / external API)
    │   ├── DoctorsPage.tsx            # Doctor catalog with filters
    │   ├── ForbiddenPage.tsx          # 403 page (insufficient role)
    │   ├── KnowledgeBase.tsx          # Medical knowledge base / informational pages
    │   ├── ManageDoctors.tsx          # Doctor management (chief doctor context)
    │   ├── ManagePatients.tsx         # Patient management (chief doctor context)
    │   ├── ManageSchedules.tsx        # Work schedule management (chief doctor context)
    │   └── NotFoundPage.tsx           # 404 page
    ├── App.css                  # Global application styles
    ├── App.test.tsx             # Basic smoke test for App component
    ├── App.tsx                  # Root component: routing setup and Keycloak provider
    ├── index.css                # Tailwind CSS base imports and global resets
    ├── index.tsx                # Application entry point (renders App into DOM)
    ├── logo.svg                 # Default CRA logo asset
    ├── react-app-env.d.ts       # TypeScript declarations for CRA environment
    ├── reportWebVitals.ts       # Web Vitals performance metrics reporter
    ├── service-worker.ts        # PWA service worker logic (offline caching)
    ├── serviceWorkerRegistration.ts # Service worker registration bootstrap
    └── setupTests.ts            # Jest / React Testing Library test setup
```

---

## Role-Based Features

The application uses a `RoleBasedGuard` component to protect routes. Users without the required Keycloak client role are redirected to the `ForbiddenPage`.

*   **Patient:** Browse/search doctors, view available slots, book/cancel appointments, manage favorites, view personal medical history, prescriptions, and recommendations.
*   **Doctor:** View assigned patients, create/manage prescriptions and recommendations, view upcoming appointments, and manage personal work schedules.
*   **Chief Doctor:** Access hospital-wide statistics, manage all doctors and patients within the assigned hospital, and assign/override work schedules.
*   **Administrator:** Onboard new doctors/administrators (by passing Keycloak IDs to the backend) and manage system-wide user lifecycle.

---

## Integration with Backend

The frontend communicates exclusively with [Aibolit API](https://github.com/Tokar08/AibolitAPI). Each service file in `src/api/` directly maps to a backend controller using relative paths (e.g., `/api/Doctor`), relying on the development server proxy or same-origin policy.

| Frontend Service | Backend Controller | Purpose |
| :--- | :--- | :--- |
| `api/doctor.ts` | `DoctorController` | Fetch doctors, manage patient lists, prescriptions, recommendations. |
| `api/patient.ts` | `PatientController` | Book appointments, manage favorites, fetch patient history. |
| `api/hospital.ts` | `HospitalController` | Chief doctor operations: fetch hospital doctors and patient dossiers. |
| `api/workSchedule.ts` | `WorkScheduleController` | CRUD operations for schedule templates. |
| `api/statistics.ts` | `StatisticsController` | Fetch aggregated hospital analytics. |
| `api/diseaseSearch.ts`| `DiseaseSearchController`| Query external AI or NLM APIs for symptom information. |
| `api/keycloak.ts` | `UserController` | Fetch current user profile data (`/api/User/me`) and handle SSO. |

**Authentication Flow:** API calls attach the JWT token obtained from Keycloak in the `Authorization: Bearer <token>` header. The token is managed by the Keycloak JS adapter and passed to service functions explicitly.

---

## Prerequisites

Before you begin, ensure you have the following running:
*   [Node.js](https://nodejs.org/) (version 20 or higher) and `npm`
*   A running instance of the [Aibolit API](https://github.com/Tokar08/AibolitAPI) backend
*   A running instance of Keycloak with the `aibolit-api` realm imported and configured

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Tokar08/AibolitFrontend.git
cd AibolitFrontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Keycloak
For simplicity, Keycloak connection settings (url, realm, clientId) are currently set directly in `src/api/keycloak.ts` to ensure the project runs immediately after cloning. API requests use relative paths (e.g., `/api/Doctor`), relying on the development server proxy. Support for `.env` variables is planned for future releases.

If you need to change the Keycloak settings manually, edit `src/api/keycloak.ts`:

| Setting | Default Value |
| :--- | :--- |
| Keycloak URL | `http://localhost:8081` |
| Keycloak Realm | `aibolit-api` |
| Keycloak Client ID | `aibolit-api` |

### 4. Start the Development Server
```bash
npm start
```
The application will open automatically at `http://localhost:3000`.

---

## Available Scripts

*   `npm start`: Runs the app in development mode with hot reloading.
*   `npm test`: Launches the test runner in interactive watch mode.
*   `npm run build`: Builds the app for production to the `build` folder. It correctly bundles React in production mode, minifies the code, and includes content hashes for optimal caching.

---

## Known Limitations & Design Decisions

*   **Strict Backend Dependency:** The frontend cannot function in isolation. It requires the backend API and Keycloak to be fully operational.
*   **Design Decision - Hardcoded Keycloak Config:** Keycloak URL and realm are set directly in `src/api/keycloak.ts` to simplify the initial setup and first run. Migration to `.env` is planned.
*   **No Automated E2E Tests:** The project has unit test configuration via CRACO, but no end-to-end (Cypress/Playwright) tests are implemented.
*   **CORS Dependency:** The backend must have CORS configured to allow requests from `http://localhost:3000` (or the deployed frontend domain).

---

## Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Infinite Keycloak redirect loop** | Check that the Keycloak URL in `keycloak.ts` matches exactly. Ensure "Valid Redirect URIs" in Keycloak Client Settings includes `http://localhost:3000/*`. |
| **API calls return 401 after a few minutes** | The access token is read once after login and is not refreshed automatically in the current version. Reload the page to get a new one. |
| **Token or user data is printed in the console** | The code contains debug `console.log` / `console.table` calls for development purposes. Ignore them or remove them before deploying. |
| **After login, I land on the main page instead of my link** | The app resets the URL to `/` after login and then redirects to the role-specific landing page. This is expected behavior. |
| **Created a .env file but nothing changes** | The app currently reads Keycloak settings directly from `src/api/keycloak.ts`, and API calls use relative paths. `.env` support is planned. |
| **Logout fails or CORS error on logout** | Ensure `http://localhost:3000` is added to the "Web Origins" field in your Keycloak Client settings. |
| **Node version errors during install** | React Router 7 requires Node.js 20+. If you see compatibility errors, upgrade Node.js via `nvm` or the official installer. |
