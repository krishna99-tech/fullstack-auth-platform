# Fullstack Auth & Developer Portfolio Platform

<div align="center">

![Platform Banner](https://img.shields.io/badge/Architecture-Serverless%20Fullstack-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![AWS](https://img.shields.io/badge/AWS%20Lambda%20%26%20DynamoDB-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Express](https://img.shields.io/badge/Express.js%205-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**An enterprise-grade, serverless fullstack web application combining bank-grade authentication, multi-factor security, a public developer portfolio hub (`/@username`), an interactive project showcase engine, a rich Markdown blogging platform, and real-time visitor analytics.**

[Explore Features](#-key-features) •
[System Architecture](#-architecture--how-it-works) •
[Quick Start](#-quick-start--local-development) •
[Documentation](#-documentation-index)

</div>

---

## 📖 About The Project

Modern developers and software creators often struggle with fragmented digital identities—maintaining separate, paid subscriptions for authentication boilerplates (Auth0/Clerk), link-in-bio pages (Linktree/Bento), technical blogs (Medium/Dev.to), project showcases, and analytics tools.

This repository provides an **all-in-one, self-hosted, serverless-native platform** that brings these essential capabilities together into a cohesive ecosystem. Deployed on **AWS Serverless (Lambda, DynamoDB, S3, API Gateway)** and **Vercel (Next.js 16)**, it offers near-zero idle cost, unlimited on-demand scalability, and 100% data ownership.

---

## ✨ Key Features

### 🔐 1. Authentication & Enterprise Security
* **Credential-Based Auth:** Secure user signup and login with salted `bcrypt` password hashing (cost factor 10).
* **6-Digit Email Verification:** One-time verification tokens with a strict 15-minute expiration window.
* **Social OAuth 2.0 Sign-In:** One-click authentication with **Google** (`passport-google-oauth20`) and **GitHub** (`passport-github2`).
* **Account Linking & Disconnection:** Seamlessly connect or disconnect social providers from within the dashboard.
* **Two-Factor Authentication (TOTP / MFA):** Standard-compliant RFC 6238 time-based one-time password security via `speakeasy` with QR code generation via `qrcode` (compatible with Google Authenticator, Authy, and 1Password).
* **Multi-Device Session Tracking:** Full visibility into active sessions (IP address, user-agent device, creation date) with remote session revocation ("Revoke other sessions").
* **Security Audit Trail & Alerts:** Tamper-evident activity logs recording IP, timestamp, action, and geolocated city/country, plus automated email alerts on new logins.
* **Rate Limiting:** Sliding-window protection on authentication endpoints to defend against automated brute-force attacks.

### 🌐 2. Public Creator & Portfolio Hub (`/@username`)
* **Personalized Vanity Routing:** Clean, branded user profiles at `https://platform.domain/@username`.
* **Link-in-Bio Hub:** Configurable list of custom outbound links with real-time click tracking.
* **Developer Social Links:** Direct integration for GitHub, Twitter/X, and LinkedIn profiles.
* **Interactive Profile Tabs:** Tabbed navigation across developer **Overview**, **Projects Showcase**, and **Published Articles**.
* **Appearance Customizer:** User-selectable profile themes (Dark, Light, Custom accent color variables).
* **Privacy Toggle:** Instant switch between public and private profile visibility.

### 💼 3. Project Showcase & Portfolio CMS
* **Rich Metadata Model:** Detail project difficulty, duration, team size, company/client name, license, and progress percentage.
* **Multi-Media Showcase:** Support for cover images, logos, thumbnails, video demos, and screenshot galleries.
* **Code & Docs Links:** Direct shortcuts to GitHub repositories, live deployments, API docs, and downloadable assets.
* **Built-in Engagement Counters:** Track views, likes, stars, forks, comments, and downloads.
* **SEO Management:** Custom `metaTitle`, `metaDescription`, `keywords`, `canonicalUrl`, and OpenGraph images per project.

### ✍️ 4. Markdown Blogging Platform
* **Rich Content Authoring:** Write articles using Markdown powered by `react-markdown`, `remark-gfm`, and `rehype-raw`.
* **Draft & Publishing Lifecycle:** Work on drafts in private before publishing to the global `/blog` feed.
* **Discovery & Search:** Auto-generated URL slugs, category filters, multi-tag search, and instant full-text search.

### 📊 5. Real-Time Analytics & Tracking Engine
* **Privacy-First Metrics:** First-party tracking for profile visits (`track-view`) and outbound link clicks (`track-click`).
* **IP Geolocation Resolution:** Automatic conversion of visitor IPs to City and Country using `ipinfo.io` and `freeipapi.com`.
* **Interactive Visualizations:** Dual-metric 7-day trend charts (Views vs. Clicks) rendered using `recharts`.
* **Actionable Insights:** Live Click-Through Rate (CTR) calculations, top-performing links ranking, and geographic audience breakdowns.

### ☁️ 6. Cloud Infrastructure & Direct Media Uploads
* **AWS Serverless Backbone:** AWS Lambda API wrapped with `serverless-http` and routed through Amazon API Gateway HTTP API.
* **Amazon DynamoDB:** 7 high-performance, on-demand tables with Global Secondary Indexes (GSIs).
* **Amazon S3 Presigned Uploads:** Direct client-to-bucket media uploads via `@aws-sdk/s3-request-presigner`, avoiding API payload limits.
* **Transactional Emails:** HTML email notifications delivered via `nodemailer` using responsive Handlebars (`.hbs`) templates.

---

## 🏗️ Architecture & How It Works

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / VISITOR BROWSER                        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────┐
│       FRONTEND (Vercel Network)       │  │   Amazon S3 (Uploads)       │
│ • Next.js 16 App Router (React 19)    │  │ • Direct Presigned PUTs     │
│ • Tailwind CSS v4 + Motion + Recharts │  │ • Avatars, Covers, Gallery  │
│ • Public Pages: Landing, /@user, /blog│  └──────────────▲──────────────┘
│ • Private Pages: Dashboard, Settings  │                 │
└───────────────────┬───────────────────┘                 │ Presigned URLs
                    │ HTTPS API Requests                  │
                    ▼                                     │
┌─────────────────────────────────────────────────────────┴──────────────┐
│                     BACKEND (AWS Serverless ap-south-1)                │
│ • Amazon API Gateway (Greedy Proxy Ingress: /{proxy+})                 │
│ • AWS Lambda (Node.js 20.x runtime with Express 5 & serverless-http)   │
│ • Passport.js (Google & GitHub OAuth 2.0)                              │
│ • Speakeasy (TOTP 2FA) & JWT Token Generation                          │
│ • Nodemailer Email Engine (AWS SES / SMTP)                             │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    AMAZON DYNAMODB (NoSQL Storage)                     │
│ • auth-users         • auth-user-sessions   • auth-audit-logs          │
│ • auth-analytics     • auth-blogs           • auth-projects            │
│ • express-sessions (connect-dynamodb)                                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
my-app/
├── Documentation/                              # Comprehensive Architectural Docs
│   ├── 01_APPLICATION_PURPOSE_AND_USE_CASES.md # Purpose, problem statement & personas
│   ├── 02_FEATURES_AND_INTEGRATIONS_GUIDE.md   # Feature matrix & technical integrations
│   └── 03_BACKEND_FRONTEND_ARCHITECTURE_AND_SERVICES.md # Topology, connectivity & cloud services
│
├── auth-backend/                               # Express.js & AWS Serverless Backend
│   ├── config/passport.js                      # Google & GitHub OAuth strategies
│   ├── controllers/                            # Auth, settings, blog, project & analytics controllers
│   ├── middleware/                             # JWT auth validation & rate-limiting middleware
│   ├── routes/                                 # Express API route declarations
│   ├── templates/                              # Handlebars (.hbs) email templates
│   ├── utils/                                  # Email delivery, IP geolocation & logging helpers
│   ├── db.js                                   # DynamoDB DocumentClient ORM abstraction
│   ├── app.js                                  # Express app configuration & CORS setup
│   ├── server.js                               # Local Node.js HTTP server entry point
│   ├── lambda.js                               # AWS Lambda serverless handler entry point
│   └── template.yaml                           # AWS SAM / CloudFormation Infrastructure-as-Code
│
└── auth-frontend/                              # Next.js 16 App Router Frontend
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/                         # Login, Signup, MFA, Password Reset flows
    │   │   ├── [username]/                     # Public vanity portfolio hub (/@username)
    │   │   ├── blog/                           # Public blog feed & article reader
    │   │   ├── projects/                       # Public project showcase gallery
    │   │   ├── dashboard/                      # Creator dashboard, analytics, audit logs, CMS
    │   │   └── page.tsx                        # High-conversion landing page
    │   ├── components/                         # UI components (Base UI, Lucide, Charts)
    │   └── lib/                                # API clients, token store & S3 upload helpers
    └── package.json
```

---

## 🚀 Quick Start & Local Development

### Prerequisites
* **Node.js:** v20.x or later installed
* **npm:** v10.x or later installed
* **AWS CLI & SAM CLI:** *(Optional, only required for AWS cloud deployment)*

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/krishna99-tech/fullstack-auth-platform.git
cd fullstack-auth-platform
```

---

### Step 2: Configure & Start the Backend (`auth-backend`)
1. Navigate into the backend directory and install dependencies:
   ```bash
   cd auth-backend
   npm install
   ```

2. Create your environment file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Populate the required environment variables:
   ```ini
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:5000
   JWT_SECRET=your_super_secret_jwt_key_here

   # AWS / DynamoDB Configuration
   AWS_REGION=ap-south-1
   USERS_TABLE=auth-users
   AUTH_SESSIONS_TABLE=auth-user-sessions
   AUDIT_LOGS_TABLE=auth-audit-logs
   ANALYTICS_TABLE=auth-analytics
   BLOGS_TABLE=auth-blogs
   PROJECTS_TABLE=auth-projects
   SESSIONS_TABLE=express-sessions

   # OAuth 2.0 Credentials (Optional for local dev)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # SMTP Configuration (Optional for emails)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM="Platform <no-reply@yourdomain.com>"
   ```

4. Launch the local API server:
   ```bash
   npm start
   # Server will run at http://localhost:5000
   # Health check available at http://localhost:5000/health
   ```

---

### Step 3: Configure & Start the Frontend (`auth-frontend`)
1. In a new terminal window, navigate into the frontend directory:
   ```bash
   cd auth-frontend
   npm install
   ```

2. Create your local environment configuration:
   ```bash
   cp .env.example .env.local
   ```

3. Set your backend connection endpoint:
   ```ini
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   # Frontend will run at http://localhost:3000
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to explore the landing page, register an account, and customize your profile!

---

## ☁️ Cloud Deployment (AWS SAM & Vercel)

### Backend Deployment to AWS Lambda
The backend includes an automated deployment script that reads your `.env` variables and builds the AWS CloudFormation stack:
```bash
cd auth-backend
# First time guided deployment:
npm run deploy:guided

# Subsequent automated deployments:
npm run deploy:env
```

### Frontend Deployment to Vercel
1. Import the `auth-frontend` directory into your [Vercel Dashboard](https://vercel.com).
2. Set the Environment Variable:
   * `NEXT_PUBLIC_API_URL` = `https://${YOUR_API_ID}.execute-api.ap-south-1.amazonaws.com/Prod/api`
3. Click **Deploy**.

---

## 📚 Documentation Index

For in-depth architectural breakdowns, visit the [Documentation/](file:///c:/Users/vakav/Documents/vercel/my-app/my-app/Documentation) directory:

1. **[01_APPLICATION_PURPOSE_AND_USE_CASES.md](file:///c:/Users/vakav/Documents/vercel/my-app/my-app/Documentation/01_APPLICATION_PURPOSE_AND_USE_CASES.md)**  
   *Covers the core problem statement, executive vision, user personas, real-world workflows, and business value.*
2. **[02_FEATURES_AND_INTEGRATIONS_GUIDE.md](file:///c:/Users/vakav/Documents/vercel/my-app/my-app/Documentation/02_FEATURES_AND_INTEGRATIONS_GUIDE.md)**  
   *Comprehensive technical guide covering the auth subsystem, project portfolio CMS, markdown blog engine, analytics tracking, and email templates.*
3. **[03_BACKEND_FRONTEND_ARCHITECTURE_AND_SERVICES.md](file:///c:/Users/vakav/Documents/vercel/my-app/my-app/Documentation/03_BACKEND_FRONTEND_ARCHITECTURE_AND_SERVICES.md)**  
   *Explains how the frontend and backend communicate, where the backend runs, CORS security, token storage, and AWS services utilized.*

---

## 🛡️ Security Best Practices

* **Passwords:** Salted with `bcrypt` before storage; raw passwords are never logged or stored.
* **Tokens:** Signed with asymmetric or high-entropy symmetric secrets with strict expiration.
* **File Uploads:** S3 bucket permissions are protected using presigned PUT URLs with sanitization, avoiding arbitrary executable uploads.
* **Rate Limiting:** Enforced on high-risk endpoints to deter automated credential-stuffing attacks.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
