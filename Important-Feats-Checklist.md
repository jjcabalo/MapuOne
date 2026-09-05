User Authentication & Role-Based Access Control (RBAC)
- Account registration, login, session/token management, and profile handling.
- Role management distinguishing Complainants (Students, Faculty, Staff) from Administrators/Department Handlers.

Complaint Submission & File Attachment Handling
- Endpoints to ingest structured complaints across 4 categories: Facilities, Academic Affairs, IT Support, Student Services.
- Handling and storage of uploaded multimedia evidence (photos and documents).

Keyword-Driven Routing Engine
- Logic that scans complaint text for predefined keywords (e.g., "aircon" -> Facilities, "grade" -> Academic Affairs) to pre-assign cases to the proper office queue.
- Administrative override functionality to update or confirm the pre-assigned department.

Severity Scoring & Auto-Escalation Logic
- Automated 3-tier priority ranking (High, Medium, Low) based on category and detected urgency keywords (defaults to Medium if unclassified).
- Automated escalation flagging when High-Priority cases exceed response thresholds.

Multi-Stage Lifecycle Management
- Strict state transitions across the 4 workflow stages: Open -> In Process -> Pending Response -> Resolved.
- CRUD endpoints for queue viewing, status updates, and staff assignment.

Internal Communication / Comment Thread
- Messaging/commenting endpoint per ticket between complainants and handlers for clarifications.
- Trigger that updates ticket status to Pending Response when additional information is requested.

Notification System
- Email notification triggers on status changes and administrative remarks.
- Endpoints for storing and fetching in-system alerts.

Reporting, Analytics & Case Archiving
- Endpoints to aggregate summary statistics (complaint volume, resolution timelines, frequent categories).
- Permanent archiving of resolved case records and support for exporting reports (CSV/PDF).