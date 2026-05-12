# Application for shelter volunteers to manage their volunteer time

This application is a work in progress. It uses a Flask server with a React JS client.

## Shelter Volunteers Project – Cross-Team Onboarding Guide

A comprehensive onboarding resource for new contributors across Open Source with SLU teams.

## 1. Introduction

This guide provides step-by-step instructions and process documentation for any internal or external contributor who wants to understand, run, and contribute to the **Shelter Volunteers Rapid Response Application**.

It focuses on:

* Technical setup
* Project architecture
* Contribution workflow
* Coding conventions
* Common issues
* Cross-team collaboration expectations

This onboarding guide is intended for future teams, new OSS contributors, and any collaborators who join after the initial development cycle.

## 2. Project Overview

### 2.1 Purpose of the Application

Homeless shelters depend heavily on volunteers, especially during emergencies such as severe weather. The application solves several critical issues:

* Volunteers don’t always know which shelters are understaffed.
* Shelter managers lack visibility into who is coming, when, and where help is urgently needed.
* Volunteers need a simple way to schedule, reschedule, and cancel shifts.

### 2.2 Core Features

* Volunteer log-in using Google Authentication
* Ability to view shelters, available shifts, and urgent needs
* Ability to book, modify, or cancel volunteer shifts
* Real-time view of staffing shortages for administrators

### 2.3 Technology Stack

* **Backend:** Flask (Python)
* **Frontend:** React.js
* **Database:** MongoDB Atlas
* **Authentication:** Google OAuth + JWT
* **Deployment Platform:** Render


## 3. Repository Structure (High-Level)

A simplified view of the repository to help new contributors quickly understand the layout:

```
shelter_volunteers/
├── client_app/        # React frontend
├── server/            # Flask backend API
├── docs/              # Project documentation
└── README.md
```

---

## 4. Getting Started – Complete Setup Guide

The following instructions allow new contributors to fully set up the project locally.

### 4.1 Prerequisites

Ensure the following tools are installed:

**Required Software:**

* Python 3.9+
* Node.js (v18+) & npm
* Git
* MongoDB Atlas account

**Optional Tools:**

* Postman – API testing
* VS Code – recommended IDE
* GitHub CLI – simplifies workflow

### 4.2 Clone the Repository

```bash
git clone https://github.com/oss-slu/shelter_volunteers.git
cd shelter_volunteers
```

---

## 5. Backend Setup (Flask API)

### 5.1 Create and Activate Virtual Environment

**Mac/Linux:**

```bash
cd server
python3 -m venv venv
source venv/bin/activate
```

**Windows:**

```bash
cd server
python3 -m venv venv
source ./venv/Scripts/activate
```

### 5.2 Install Dependencies

```bash
pip3 install -r requirements.txt
```

This installs:

* Flask
* PyMongo
* JWT libraries
* OAuth libraries
* Environment variable tools

### 5.3 Configure Environment Variables

Create a file:

```
server/.env.pre-production
```

Add the following values:

```
MONGODB_HOST=<Your MongoDB connection string without credentials>
MONGODB_USERNAME=<Your Mongo user>
MONGODB_PASSWORD=<Your Mongo password>
GOOGLE_CLIENT_ID=<From client_app/src/config.js>
JWT_SECRET=<A long random string>
```

**Important Notes:**

* Do **NOT** commit this file.
* Credentials must remain local.
* If you don’t have a MongoDB Atlas cluster, create one first.

### 5.4 Run the Backend

```bash
cd server
source venv/bin/activate
bash run_dev_server.sh
```

Backend runs at:
➡ **[http://localhost:5001](http://localhost:5001)**

---

## 6. Frontend Setup (React Application)

### 6.1 Install Dependencies

```bash
cd client_app
npm install
```

### 6.2 Start the App

```bash
npm start
```

Frontend runs at:
➡ **[http://localhost:3000](http://localhost:3000)**

---

## 7. Understanding Authentication Flow

A high-level overview of how authentication works:

1. User clicks **Sign in with Google**.
2. Google returns an OAuth token.
3. Client sends the token to Flask API.
4. API:

   * Validates token
   * Creates or updates user profile
   * Issues JWT
5. Client stores JWT securely (memory or secure storage).
6. Client includes token in all secured requests:

   ```
   Authorization: Bearer <token>
   ```

---

## 8. Contribution Workflow (Cross-Team Standard)

To get started contributing to the project, see the [contributing guide](CONTRIBUTING.md).
This document also includes guidelines for reporting bugs and proposing new features.

## 9. Pull Request Guidelines

### 9.1 Opening a PR

Your Pull Request must include:

* Issue number (e.g., `Closes #42`)
* Summary of changes
* Screenshots/GIFs if UI changes
* Testing procedure
* Files changed overview

**PR Template:**

```
## Description

## Related Issue

## Screenshots

## Testing Instructions

## Checklist
- [ ] Code compiles
- [ ] No ESLint warnings
- [ ] Tests updated
- [ ] Follows project conventions
```

### 9.2 Review Expectations

Reviewers check:

* Code readability
* Functionality
* Security
* API behavior
* Error handling
* UI consistency

PRs must meet all requirements before merging.

---

## 10. Common Issues & Fixes

### Issue 1: Virtual environment not activating

**Fix:** Use platform-specific activation command:

* Windows: `source ./venv/Scripts/activate`
* Mac/Linux: `source venv/bin/activate`

### Issue 2: Node modules failing

Run:

```bash
npm install --legacy-peer-deps
```

### Issue 3: MongoDB connection errors

Checklist:

* Connection string correct
* Atlas IP whitelist updated
* Correct username/password
* URL-encode special characters

### Issue 4: Google OAuth not working

Verify:

* Correct Client ID
* Authorized origin → `http://localhost:3000`
* Authorized redirect URI → `http://localhost:3000`

---

## 11. Recommended Tools for Contributors

### VS Code Extensions

* Prettier
* ESLint
* Python
* MongoDB

### Others

* Browser DevTools
* Postman for API testing

---

## 12. Cross-Team Expectations

All contributors must:

* Communicate changes through GitHub issues
* Avoid modifying another team’s work without discussion
* Share reusable components
* Use consistent design patterns
* Document all changes in PRs
* Participate in cross-team syncs (if scheduled)

---

## 13. Final Notes for New Contributors

This onboarding guide aims to:

* Reduce setup time
* Provide clarity on conventions
* Enable quick contributions
* Maintain cross-team consistency
* Support high-quality OSS development

If you encounter issues not covered here:

* Open a GitHub issue
* Tag a tech lead
* Update this guide so future teams benefit

---

# Welcome to the Shelter Volunteers Project!
