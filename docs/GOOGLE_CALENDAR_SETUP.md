# PathPilot AI — Google Calendar & Google Meet API Integration Guide

This document details the configuration, security design, OAuth scopes, and integration architecture for enabling real Google Calendar scheduling and Google Meet video conference creation in PathPilot AI.

---

## 1. Google Cloud Platform (GCP) Setup

1. **Create or Select a GCP Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project: `PathPilot AI` (or select an existing project).

2. **Enable the Google Calendar API:**
   - Navigate to **APIs & Services** → **Library**.
   - Search for **Google Calendar API**.
   - Click **Enable**.

3. **Configure the OAuth Consent Screen:**
   - Navigate to **APIs & Services** → **OAuth consent screen**.
   - Select **External** (or **Internal** for Workspace organizations).
   - Fill in App Name: `PathPilot AI`, User Support Email, and Developer Contact Info.
   - Under **Scopes**, add the minimum necessary calendar scopes:
     - `https://www.googleapis.com/auth/calendar.events` (View and edit events on all calendars)
     - Or `https://www.googleapis.com/auth/calendar` (Read/write access to Calendars)
   - Add test accounts during development under the **Test users** tab.

4. **Create OAuth 2.0 Client Credentials:**
   - Navigate to **APIs & Services** → **Credentials**.
   - Click **Create Credentials** → **OAuth client ID**.
   - Select **Web application**.
   - Add Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:8000/api/auth/google/callback`
     - Production: `https://yourdomain.com/api/auth/callback/google`
   - Copy `Client ID` and `Client Secret`.

---

## 2. Server Authentication Methods

PathPilot AI supports two server-side authorization patterns:

### Option A: Server-Side OAuth 2.0 with Refresh Token (Recommended for Organization / System Calendar)
- Generate a long-lived refresh token using your authorized organization administrator or mentor account.
- In `backend/.env`:
  ```env
  GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your_client_secret
  GOOGLE_CALENDAR_REFRESH_TOKEN=your_refresh_token
  ```

### Option B: Google Service Account (Domain-Wide Delegation)
- Navigate to **Credentials** → **Create Credentials** → **Service Account**.
- Grant **Domain-Wide Delegation** in Google Workspace Admin Console if scheduling on behalf of mentors.
- Download the Service Account JSON key to a secure server path.
- In `backend/.env`:
  ```env
  GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON=C:/path/to/service-account.json
  ```

---

## 3. Conference Creation Protocol (`conferenceDataVersion=1`)

To create an authentic Google Meet conference room:
1. Every API call to `service.events().insert()` includes `conferenceDataVersion=1`.
2. The event body must provide:
   ```json
   {
     "conferenceData": {
       "createRequest": {
         "requestId": "booking-bk-xxxx",
         "conferenceSolutionKey": { "type": "hangoutsMeet" }
       }
     }
   }
   ```
3. PathPilot AI extracts and persists the Meet link **strictly from the returned Google API response**:
   - `created_event["conferenceData"]["entryPoints"]` (video uri)
   - Or `created_event["hangoutLink"]`.
4. If the Google Calendar API credentials are not configured, PathPilot AI flags the integration state as `AWAITING_CREDENTIALS` and does **not** invent or generate fake `meet.google.com` links.

---

## 4. Verification & Status Endpoint

You can verify whether Google Calendar integration is connected by querying:
```http
GET http://localhost:8000/api/bookings/integrations/google-calendar/status
```

Response when credentials are not yet supplied:
```json
{
  "is_configured": false,
  "status": "AWAITING_CREDENTIALS",
  "provider": "Google Calendar API v3",
  "has_client_id": true,
  "has_service_account": false,
  "has_refresh_token": false,
  "message": "Google Calendar integration is awaiting authorization credentials. Set GOOGLE_CALENDAR_REFRESH_TOKEN or GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON in .env."
}
```

Response when authorized:
```json
{
  "is_configured": true,
  "status": "CONFIGURED",
  "provider": "Google Calendar API v3",
  "has_client_id": true,
  "has_service_account": false,
  "has_refresh_token": true,
  "message": "Google Calendar API is active and ready to create Google Meet sessions."
}
```
