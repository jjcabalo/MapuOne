# MapuOne Project Details

This document outlines the technical stack, security measures, user types, and core modules of the MapuOne project. MapuOne is a smart campus complaint and case management system.

## 1. Technology Stack

MapuOne is built using a modern React-based tech stack focused on performance, type safety, and scalability.

**Frontend:**
- **Framework:** Next.js 14.2 (using the App Router)
- **Library:** React 18
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS (with PostCSS and Autoprefixer)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **PDF Generation:** jspdf, jspdf-autotable, html2canvas, html2pdf.js

**Backend & Database:**
- **BaaS (Backend as a Service):** Supabase (Authentication, PostgreSQL Database, Storage)
- **Email Service:** Nodemailer (for triggering email notifications)

**Deployment & Tooling:**
- **Hosting / Deployment:** Vercel
- **Package Manager:** npm

---

## 2. Security Measures

To ensure the confidentiality and integrity of user data and complaints, the following security measures are implemented:

- **Authentication & Authorization:** Managed via Supabase Auth, utilizing secure session and JWT token management.
- **Role-Based Access Control (RBAC):** Strict separation of privileges between regular users (complainants) and administrators to prevent unauthorized access to case queues and sensitive reports.
- **Environment Variables:** Sensitive API keys, database URLs, and configuration settings are secured using `.env.local` and environment variables in the deployment pipeline.
- **Secure File Handling:** Secure ingestion and storage of multimedia evidence (photos and documents) attached to complaints.
- **Data Privacy:** Confidentiality maintained for filed complaints, ensuring only assigned department handlers and the original complainant have access to the case details.

---

## 3. User Types (Roles)

MapuOne distinguishes between two primary user roles, each with specific capabilities and access levels:

### **Complainant (User)**
*Includes Students, Faculty, and Staff.*
- **Capabilities:** Can register/login, file structured complaints across different categories, attach evidence, track the status of their cases, communicate via comment threads, and receive system/email notifications. 

### **Administrator (Department Handler)**
*Includes staff assigned to specific offices (e.g., Facilities, Academic Affairs, IT Support, Student Services).*
- **Capabilities:** Can view department-specific case queues, override or confirm pre-assigned routing, update ticket statuses (Open -> In Process -> Pending Response -> Resolved), assign severity scores, request additional information, and generate summary reports.

---

## 4. Core Modules

The system is organized into several interconnected modules that drive the complaint lifecycle:

- **Authentication & User Management Module**
  - Account registration, login, password recovery.
  - Profile handling and session management.

- **Complaint Submission Module**
  - Interfaces to ingest structured complaints across 4 primary categories: Facilities, Academic Affairs, IT Support, and Student Services.
  - File attachment handling for multimedia evidence.

- **Smart Routing & Triage Module**
  - A keyword-driven engine that scans complaint text (e.g., "aircon" -> Facilities) to automatically pre-assign cases to the appropriate office queue.
  - Administrator override capabilities.

- **Priority & Escalation Module**
  - Automated severity scoring and 3-tier priority ranking (High, Medium, Low) based on keywords and categories.
  - Auto-escalation logic flagging High-Priority cases that exceed response thresholds.

- **Lifecycle & Queue Management Module**
  - Strict state transition management: `Open` -> `In Process` -> `Pending Response` -> `Resolved`.
  - Admin dashboards for queue viewing, status updates, and staff assignment.

- **Internal Communication Module**
  - Comment thread system for messaging between complainants and assigned handlers.
  - Auto-triggers state to `Pending Response` when handlers request more info.

- **Notification Module**
  - In-system alerts and notifications dashboard.
  - Emailing for authentication.

- **Reporting, Analytics & Archival Module**
  - Aggregation of summary statistics (complaint volume, resolution times).
  - Generation and exporting of reports in PDF formats.
  - Permanent archiving of resolved cases.
