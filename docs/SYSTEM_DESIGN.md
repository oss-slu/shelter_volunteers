# Shelter Volunteers — System Design
Design artifacts for both halves of the repo: the **React client** (`client_app/`) and the **Flask API** (`server/`). Diagrams are [Mermaid](https://mermaid.js.org/), so GitHub renders them on this page. Red-shaded boxes mark **technical debt / gaps** between the current and intended state.
| # | Section | Notation |
|---|---|---|
| 1 | [System & deployment architecture](#1-system--deployment-architecture) | Deployment diagram, CI/CD flowchart |
| 2 | [Software architecture](#2-software-architecture-inside-both-apps) | Layered component diagrams |
| 3 | [Data model](#3-data-model-mongodb-volunteers_db) | Entity-relationship diagram |
| 4 | [Shift sign-up, waitlist & reminders](#4-shift-sign-up-waitlist--reminders) | UML state diagram, sequence diagram, flowchart |
| 5 | [Auth & user flows](#5-authentication--user-flows) | Sequence diagram, IA tree, user flows |

## Context

**What we made and why.** Shelter Volunteers is an *existing* product (React client + Flask API + MongoDB) about to be handed to the SLU OSS department for public launch on WWT-provided hosting. Its new maintainers need three things: how the system is deployed (Section 1), where code goes and why (Sections 2–3), and how the parts of the domain that are hardest to follow behave (Sections 4–5). We skipped wireframes because they already exist in [`/wireframes`](../wireframes), and the UI is built. Instead, 5b maps the real screens from `App.js`.

**Key decisions and trade-offs shown**
- **Single VM with Docker Compose and Caddy** (1a). It's cheap, works on any host, and gets TLS automatically. The trade-off is no horizontal scaling.
- **In-process reminder scheduler** (1a, 4c). No extra worker service to run, but the API has to stay on **one gunicorn worker** or every email gets sent twice.
- **Clean architecture on the server** (2a). Use cases get repositories passed in, so business rules (capacity, time overlap, FIFO promotion) get tested without a database.
- **Identity is delegated to Google** (5a). We never store passwords. Email is the user key across `user_info`, `permissions` and commitments (3).
- **Automatic waitlist promotion** (4a/4b). A cancellation or a raised capacity fills the open spot right away, with no shelter admin action needed.

**How these inform development**
- Onboarding: new contributors start with Section 2a to see which layer a change belongs in.
- The red items are the backlog for hardening before launch, roughly in priority order:
  1. Implement the reminder repository methods (`find_shifts_due_for_reminder`, `mark_reminder_sent`).
  2. Add unique indexes on commitment and waitlist entries.
  3. Delete the legacy `WorkShift` stack and the unregistered `schedule_bp`.
  4. Consolidate the two HTTP clients.
- Deployment: table 1c is the checklist for the move to WWT (real domain, staging environment, rollback by `:sha` tag).

**Current vs. intended state (summary)**

| Area | Current | Intended |
|---|---|---|
| Hosting | AWS EC2, placeholder domains, prod only | WWT VM, real domain owned by OSS dept, staging + prod |
| Reminders | Logic and tests exist; Mongo methods missing | Fully wired, flags stored on `service_shifts` |
| Data integrity | Dedup enforced only in use cases | Unique DB indexes as a backstop |
| Codebase | Legacy `shifts`/`WorkShift` code and two HTTP clients | One model, one client |
| Scaling | 1 API worker (scheduler coupling) | Scheduler split out if load requires >1 worker |

---

## 1. System & Deployment Architecture

How the two halves of the repo — the **React client** (`client_app/`) and the **Flask API** (`server/`) — are built, shipped and hosted.

### 1a. Runtime architecture (production)

```mermaid
flowchart LR
    subgraph People["Users (browser)"]
        V["Volunteer"]
        SA["Shelter admin"]
        SYS["System admin"]
    end

    subgraph VM["Single Linux VM — docker-compose.prod.yml"]
        CADDY["Caddy 2<br/>TLS (Let's Encrypt) + reverse proxy<br/>:80 / :443 — only public port"]
        FE["frontend container<br/>nginx serving React build<br/>app.&lt;domain&gt;"]
        subgraph BE["backend container — gunicorn (1 worker × 4 threads)"]
            API["Flask REST API<br/>api.&lt;domain&gt;"]
            SCHED["APScheduler job<br/>reminder check every 10 min"]
        end
    end

    subgraph External["External services"]
        GOOGLE["Google Identity<br/>(OAuth ID tokens)"]
        ATLAS[("MongoDB Atlas<br/>volunteers_db")]
        SG["SendGrid<br/>reminder emails"]
    end

    People -- HTTPS --> CADDY
    CADDY -- "app.*" --> FE
    CADDY -- "api.*" --> API
    People -. "Sign in with Google" .-> GOOGLE
    API -- "verify ID token" --> GOOGLE
    API -- "pymongo (TLS)" --> ATLAS
    SCHED -- "find shifts in 24h / 2h window" --> ATLAS
    SCHED -- "send email" --> SG
    SG -. email .-> V
```

**Key decision:** the reminder scheduler runs *inside* the API process, so the backend is pinned to **one gunicorn worker** (more workers = duplicate emails). This keeps hosting to a single VM with no queue/worker service, at the cost of horizontal scaling.

### 1b. Build & deploy pipeline (`.github/workflows/ci-cd.yml`)

```mermaid
flowchart LR
    DEV["Developer<br/>PR → main"] --> GH["GitHub push to main"]
    GH --> TB["test-backend<br/>pytest (Py 3.9)"]
    GH --> TF["test-frontend<br/>jest + npm run build"]
    TB --> BP["build-and-push<br/>Dockerfile.prod × 2"]
    TF --> BP
    BP --> GHCR[("ghcr.io<br/>shelter-volunteers-server<br/>shelter-volunteers-client<br/>:latest + :sha")]
    BP --> DEP["deploy<br/>SSH → VM"]
    DEP --> PULL["docker compose pull<br/>docker compose up -d"]
    GHCR -.-> PULL
    PULL --> HC{"GET /health<br/>200?"}
    HC -- yes --> OK["✅ live"]
    HC -- no --> FAIL["❌ job fails<br/>(manual rollback to :sha tag)"]
```

### 1c. Current vs. intended state

| | Current (Oct 2026) | Intended (launch / handover) |
|---|---|---|
| Host | AWS EC2 via SSH secrets | WWT-provided VM; same Compose file (platform-agnostic) |
| Domains | `Caddyfile` placeholders (`app.yourdomain.org`) | Real domain owned by SLU OSS dept |
| Environments | production only | add **staging** (separate Atlas cluster, same images) |
| Rollback | manual re-tag | deploy pinned `:sha` tag, keep last N |
| Scheduler | in-process APScheduler, 1 worker | split into its own container/cron if API needs >1 worker |
| Local dev | `docker-compose.yml` with local `mongo` + seed of legacy `shifts` data | seed current collections (`shelters`, `service_shifts`, …) |

---

## 2. Software Architecture (inside both apps)

### 2a. Backend layers — Clean Architecture (`server/`)

Dependencies point **inward only**: REST → use cases → domain. Use cases receive repositories as arguments, which is what makes them unit-testable with mocks (`server/tests/use_cases/`).

```mermaid
flowchart TB
    subgraph REST["application/rest — Flask blueprints (HTTP, auth decorators, JSON)"]
        direction LR
        R1["login"]
        R2["shelter"]
        R3["service_shifts"]
        R4["service_commitment"]
        R5["waitlist"]
        R6["repeatable_shifts<br/>(/schedule)"]
        R7["user_info<br/>(/volunteer/profile)"]
        R8["authorization<br/>(admins, permissions)"]
    end

    subgraph AUTH["Cross-cutting guards"]
        direction LR
        T1["@token_required_with_request<br/>JWT → user email"]
        T2["@shelter_admin_permission_required"]
        T3["@system_admin_permission_required"]
    end

    subgraph UC["use_cases — business rules (pure Python)"]
        direction LR
        U1["add_service_commitments<br/>capacity + time-overlap check"]
        U2["join / leave waitlist"]
        U3["promote_from_waitlist<br/>FIFO"]
        U4["delete_service_commitment"]
        U5["list_open_shelters_by_date"]
        U6["set / get repeatable_shifts"]
        U7["authorization/*"]
        U8["reminders/trigger_shift_reminders"]
    end

    subgraph DOM["domains — dataclasses, no I/O"]
        direction LR
        D1["Shelter + Address"]
        D2["ServiceShift"]
        D3["ServiceCommitment"]
        D4["WaitlistEntry"]
        D5["RepeatableShift(s)"]
        D6["UserInfo"]
        D7["UserPermission + Access"]
    end

    subgraph REPO["repository/mongo — persistence adapters"]
        direction LR
        P1["ShelterRepo"]
        P2["ServiceShiftsMongoRepo"]
        P3["MongoRepoCommitments"]
        P4["WaitlistMongoRepo"]
        P5["RepeatableShiftsRepository"]
        P6["UserInfoRepository"]
        P7["PermissionsMongoRepo"]
    end

    DB[("MongoDB")]
    SCHED["scheduler/reminder_scheduler<br/>(APScheduler)"] --> U8
    U8 --> EMAIL["reminder_email<br/>SendGrid + HTML templates"]

    REST --> AUTH --> UC
    UC --> DOM
    UC -. "repo passed in" .-> REPO
    REPO --> DOM
    REPO --> DB

    subgraph LEGACY["⚠ Legacy / dead code (tech debt)"]
        direction LR
        L1["WorkShift · Volunteer · Staffing · ShelterVolunteer"]
        L2["repository/mongorepo.py + memrepo.py<br/>(old 'shifts' collection)"]
        L3["use_cases add/list/delete_workshifts,<br/>count_volunteers, get_volunteers"]
        L4["rest/schedule.py — schedule_bp<br/>never registered in app.py"]
    end
    LEGACY -.- DB

    classDef debt fill:#fde8e8,stroke:#c0392b,color:#7b241c;
    class LEGACY,L1,L2,L3,L4 debt;
```

### 2b. Frontend structure (`client_app/src/`)

```mermaid
flowchart TB
    APP["App.js<br/>React Router"] --> AUTHCTX["AuthContext<br/>(token, logout)"]
    APP --> DASHCTX["DashboardContext<br/>(active role / shelter)"]
    APP --> PR["ProtectedRoute"]
    PR --> LAYOUT["DashboardLayout<br/>Sidebar + NavigationConfig"]
    LAYOUT --> VOL["components/volunteer/*"]
    LAYOUT --> SHEL["components/shelter/*"]
    LAYOUT --> ADM["components/admin/*"]

    VOL --> API
    SHEL --> API
    ADM --> API

    subgraph API["api/* — one module per resource"]
        direction LR
        A1["shelter.js"]
        A2["serviceShift.js"]
        A3["serviceCommitment.js"]
        A4["waitlist.js"]
        A5["repeatableShiftsApi.js · schedule.js"]
        A6["permission.js · volunteerApi.js · login.js"]
    end

    API --> FC["fetchClient.js<br/>(fetch)"]
    API --> HC["httpClient.js<br/>(axios)"]
    FC --> TOK["localStorage 'token'<br/>→ Authorization header<br/>401/403 → logout + /home"]
    HC --> TOK
    TOK --> SERVER["Flask API<br/>REACT_APP_SERVER_URL"]

    classDef debt fill:#fde8e8,stroke:#c0392b,color:#7b241c;
    class FC,HC,A5 debt;
```

#### Technical debt shown in red

| Item | Why it matters | Planned fix |
|---|---|---|
| Two HTTP clients (`fetchClient` + axios `httpClient`) with duplicated auth/401 logic | Bugs fixed in one aren't fixed in the other | Consolidate on one client |
| `schedule.js` and `repeatableShiftsApi.js` both call `/shelters/:id/schedule` | Two code paths for the same endpoint (ScheduleManager vs RepeatableShifts screen) | Merge into one module |
| `rest/schedule.py` + `ScheduleMongoRepo` (not registered) share the `schedule` collection with `RepeatableShiftsRepository` | Confusing; two document shapes in one collection | Delete dead blueprint/repo |
| Legacy `WorkShift` model, `mongorepo.py`, `memrepo.py`, workshift use cases, `cli.py` | Pre-redesign model; local `docker-compose.yml` still seeds it | Delete + update seed data |
| `ServiceShiftsMongoRepo` lacks `find_shifts_due_for_reminder` / `mark_reminder_sent` (only mocked in tests) | Reminder job will error once `SENDGRID_API_KEY` is set | Implement + add repo test |

---

## 3. Data Model (MongoDB `volunteers_db`)

MongoDB has no foreign keys — the relationships below are **by convention** (string ids / emails) and enforced in the use cases, not the database.

```mermaid
erDiagram
    SHELTERS ||--o{ SERVICE_SHIFTS : "offers"
    SHELTERS ||--o| SCHEDULE : "has template"
    SERVICE_SHIFTS ||--o{ SERVICE_COMMITMENTS : "filled by"
    SERVICE_SHIFTS ||--o{ WAITLIST_ENTRIES : "queues"
    USER_INFO ||--o{ SERVICE_COMMITMENTS : "volunteer_id = email"
    USER_INFO ||--o{ WAITLIST_ENTRIES : "volunteer_id = email"
    PERMISSIONS }o--o{ SHELTERS : "Access.resource_ids"

    SHELTERS {
        ObjectId _id PK
        string name
        object address "street, city, state, postal_code, country, coordinates"
    }
    SERVICE_SHIFTS {
        ObjectId _id PK
        string shelter_id FK
        int shift_start "epoch ms UTC"
        int shift_end "epoch ms UTC"
        string shift_name
        string instructions
        int required_volunteer_count "minimum to be staffed"
        int max_volunteer_count "capacity"
        bool can_sign_up
    }
    SERVICE_COMMITMENTS {
        ObjectId _id PK
        string volunteer_id FK "email"
        string service_shift_id FK
    }
    WAITLIST_ENTRIES {
        ObjectId _id PK
        string volunteer_id FK "email"
        string service_shift_id FK
        int joined_at "epoch ms, FIFO order"
    }
    SCHEDULE {
        ObjectId _id PK
        string shelter_id FK
        array shifts "RepeatableShift: start/end offsets, counts, name, instructions"
    }
    USER_INFO {
        string email PK
        string first_name
        string last_name
        string phone_number
        array skills
    }
    PERMISSIONS {
        ObjectId _id PK
        string email "identity from Google"
        array full_access "Access{resource_type: system|shelter, resource_ids[]}"
    }
```

**Notes**
- Users are **not** stored as accounts — identity comes from Google; `USER_INFO` (profile) and `PERMISSIONS` (roles) are both keyed by email. No `PERMISSIONS` row = plain volunteer.
- `SCHEDULE` is a *template*; opening a shelter on a date copies template shifts into concrete `SERVICE_SHIFTS` rows.
- **Intended:** add unique index on (`volunteer_id`, `service_shift_id`) in `service_commitments` and `waitlist_entries` to make the "no double sign-up" rule a DB guarantee; add reminder-sent flags on `service_shifts`; drop legacy `shifts` collection.

---

## 4. Shift Sign-up, Waitlist & Reminders

The core workflow of the product: a shelter publishes a shift, volunteers fill it, overflow queues on a waitlist, and openings are back-filled automatically.

### 4a. Shift state diagram

```mermaid
stateDiagram-v2
    [*] --> Open : shelter admin opens shelter / creates shift

    state "Open: commitments < required" as Open
    state "Staffed: required ≤ commitments < max" as Staffed
    state "Full: commitments = max" as Full

    Open --> Staffed : volunteer signs up
    Staffed --> Full : volunteer signs up
    Full --> Full : volunteer joins waitlist
    Full --> Staffed : cancel or max raised, waitlist empty
    Full --> Full : cancel or max raised, auto-promote next on waitlist
    Staffed --> Open : volunteer cancels

    Open --> Closed : can_sign_up = false
    Staffed --> Closed : can_sign_up = false
    Full --> Closed : can_sign_up = false
    Closed --> Open : can_sign_up = true

    Open --> Reminded : 24h and 2h before start
    Staffed --> Reminded
    Full --> Reminded
    Reminded --> Past : shift_end passes
    Open --> Deleted : admin deletes shift, commitments and waitlist removed
    Past --> [*]
    Deleted --> [*]
```

### 4b. Sign-up / cancel sequence (with waitlist promotion)

```mermaid
sequenceDiagram
    autonumber
    actor V1 as Volunteer A
    actor V2 as Volunteer B
    participant UI as React client
    participant API as Flask API
    participant UC as Use cases
    participant DB as MongoDB

    V1->>UI: Sign up for shift S
    UI->>API: POST /service_commitment [{service_shift_id: S}]
    API->>UC: add_service_commitments()
    UC->>DB: count commitments(S), A's other shifts
    alt S is full
        UC-->>UI: "Shift is full. Join the waitlist instead."
        V1->>UI: Join waitlist
        UI->>API: POST /service_shifts/S/waitlist
        API->>UC: join_waitlist() — checks full, no dup, no time overlap
        UC->>DB: insert waitlist_entry(joined_at=now)
    else time overlap with A's shifts
        UC-->>UI: conflict error
    else capacity available
        UC->>DB: insert service_commitment
        UC-->>UI: success
    end

    Note over V2,DB: Later — someone frees a spot
    V2->>UI: Cancel my commitment on S
    UI->>API: DELETE /service_commitment/:id
    API->>UC: delete_service_commitment()
    UC->>DB: delete commitment
    UC->>UC: promote_from_waitlist(S)
    loop while S has capacity and queue not empty (FIFO)
        UC->>DB: next entry → skip if overlap, else insert commitment + remove entry
    end
    UC-->>UI: {promoted: [...]}
```

### 4c. Reminder job

```mermaid
flowchart LR
    T(["APScheduler<br/>every 10 min"]) --> L{"lock<br/>free?"}
    L -- no --> SKIP["skip run"]
    L -- yes --> K{"SENDGRID_API_KEY<br/>set?"}
    K -- no --> W["log warning, exit"]
    K -- yes --> Q["find shifts starting in<br/>now+24h ±15m and now+2h ±15m<br/>not yet reminded"]
    Q --> C["for each confirmed volunteer:<br/>render reminder_24h / reminder_2h.html<br/>→ SendGrid"]
    C --> M{"all sent?"}
    M -- yes --> F["mark_reminder_sent(shift, type)"]
    M -- no --> R["leave unflagged → retried next run"]

    classDef debt fill:#fde8e8,stroke:#c0392b,color:#7b241c;
    class Q,F debt;
```

> Red boxes: the use case calls these repository methods, but `ServiceShiftsMongoRepo` doesn't implement them yet (tests use mocks). Must be built before reminders are switched on in production.

---

## 5. Authentication & User Flows

### 5a. Login and authorization sequence

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant UI as React client
    participant G as Google Identity
    participant API as Flask API
    participant DB as MongoDB (permissions)

    U->>UI: Click "Sign in with Google"
    UI->>G: OAuth popup (REACT_APP_GOOGLE_CLIENT_ID)
    G-->>UI: Google ID token
    UI->>API: POST /login {idToken}
    API->>G: verify_google_token(idToken, GOOGLE_CLIENT_ID)
    G-->>API: email, name
    API-->>UI: {access_token: app JWT signed with JWT_SECRET}
    UI->>UI: store token in localStorage
    UI->>API: GET /user_permission (Authorization: token)
    API->>DB: find permissions by email
    API-->>UI: roles → system admin? shelter ids?
    UI->>U: Dashboard selector (Volunteer / Shelter X / Admin)

    Note over UI,API: Every later request
    UI->>API: request + Authorization header
    API->>API: @token_required → email<br/>@shelter_admin / @system_admin → check permissions
    alt token invalid / not permitted
        API-->>UI: 401 / 403
        UI->>UI: logout() → /home
    end
```

### 5b. Information architecture — screens by role (`App.js` routes)

```mermaid
flowchart TB
    HOME["/home<br/>Landing + Google sign-in"] --> SEL{"DashboardSelector<br/>roles from /user_permission"}
    HOME --> SIGNUP["/signup"]

    SEL -- everyone --> VD["/volunteer-dashboard"]
    SEL -- shelter admin --> SD["/shelter-dashboard/:shelterId"]
    SEL -- system admin --> AD["/admin-dashboard"]

    VD --> V1["open-shelters-calendar<br/>Open shelters by date"]
    VD --> V2["shelters<br/>Sign up to help"]
    VD --> V3["upcoming-shifts<br/>Cancel / manage"]
    VD --> V4["waitlist<br/>Queued shifts"]
    VD --> V5["past-shifts"]
    VD --> V6["impact"]
    VD --> V7["profile<br/>(prompted if incomplete)"]

    SD --> S1["repeatable-shifts<br/>Daily schedule template"]
    SD --> S2["schedule<br/>Open shelter on dates"]
    SD --> S3["upcoming-shifts<br/>Roster, waitlist, edit/cancel"]
    SD --> S4["open-shelters-list"]
    SD --> S5["users<br/>Shelter admins"]
    SD --> S6["settings"]

    AD --> A1["shelters<br/>Add / list shelters"]
    AD --> A2["users<br/>System admins"]
```

### 5c. Primary task flows

```mermaid
flowchart LR
    subgraph Shelter["Shelter admin: get volunteers for tonight"]
        direction LR
        a1["Define daily<br/>schedule template"] --> a2["Open shelter<br/>for date(s)"] --> a3["Shifts published"] --> a4["Monitor roster &<br/>understaffed shifts"] --> a5["Contact / notify<br/>volunteers"]
    end
    subgraph Volunteer["Volunteer: commit to a shift"]
        direction LR
        b1["Sign in"] --> b2{"Profile<br/>complete?"}
        b2 -- no --> b3["Complete profile"] --> b4
        b2 -- yes --> b4["Browse open shelters<br/>(priority badges)"] --> b5{"Shift full?"}
        b5 -- no --> b6["Sign up"] --> b8["Email reminders<br/>24h & 2h"]
        b5 -- yes --> b7["Join waitlist"] -. auto-promoted .-> b6
    end
    a3 -.-> b4
```

---

*This is a living document. Update the relevant diagram in the same PR that changes the architecture.*
