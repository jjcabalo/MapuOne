# MapuOne File Structure & Development Guidelines

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend/DB:** Supabase
- **Deployment:** Vercel

## UI & Branding
- **Font:** Poppins
- **Colors:**
  - **Background:** `#FFFFFF` (dominant)
  - **Primary:** `#F50B0B`
  - **Black:** `#000000`
  - **Accent:** `#FFCC00`

## Project Structure

```text
MapuOne/
├── public/
│   └── assets/
│       ├── images/    # General images
│       ├── icons/     # SVG icons
│       └── logo/      # App logos
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Shared Auth Pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/             # Shared Layout for User & Admin
│   │   │   ├── admin/
│   │   │   │   ├── queue/           # Case Queue
│   │   │   │   ├── reports/         # Reports
│   │   │   │   └── settings/        # Settings
│   │   │   └── user/
│   │   │       ├── dashboard/       # User Dashboard
│   │   │       ├── file-complaint/  # File Complaint
│   │   │       ├── my-cases/        # My Cases
│   │   │       ├── notifications/   # Notifications
│   │   │       └── profile/         # My Profile
│   │   ├── globals.css              # Global styles (Tailwind config + variables)
│   │   └── layout.tsx               # Root Layout (Injects Poppins font)
│   ├── components/
│   │   ├── layout/                  # Layout specific components (Header, Sidebar)
│   │   ├── shared/                  # Components shared across pages (e.g., Popup Dialogs)
│   │   └── ui/                      # Reusable UI elements (Buttons, Inputs)
│   └── lib/                         # Utilities, constants, and supabase client
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Key Guidelines
1. **Routing Strategy:** We use Next.js route groups `(auth)` and `(dashboard)` to apply shared layouts without affecting the URL paths.
2. **Shared Layouts:** The dashboard layout will render the shared left navigation panel and header for both Users and Admins.
3. **Component Reusability:** Popup dialogs and layout elements used by both roles should be placed in `src/components/shared/` or `src/components/layout/`.
4. **Icons & Images:** Always utilize `public/assets/` for standard images and brand assets.
