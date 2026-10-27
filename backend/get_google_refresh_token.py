"""
One-Time Google OAuth Refresh Token Generator for PathPilot AI
Run this script to authorize Google Calendar and get your GOOGLE_CALENDAR_REFRESH_TOKEN.
"""

import os
from google_auth_oauthlib.flow import InstalledAppFlow
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv()

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events"
]

def main():
    if not CLIENT_ID or not CLIENT_SECRET:
        print("\n[ERROR] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in backend/.env!")
        print("Please check backend/.env before running this script.")
        return

    client_config = {
        "installed": {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost:8080/"]
        }
    }

    print("\n" + "=" * 65)
    print("PATHPILOT AI - GOOGLE CALENDAR & MEET AUTHORIZATION HELPER")
    print("=" * 65)
    print("1. A browser window will open asking you to sign in with your Google account.")
    print("2. Approve access to Google Calendar.")
    print("3. Your long-lived Refresh Token will be printed below.\n")

    flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
    creds = flow.run_local_server(port=8080, access_type='offline', prompt='consent')

    print("\n" + "=" * 65)
    print("AUTHORIZATION SUCCESSFUL! COPY THIS TO YOUR .env FILES:")
    print("=" * 65)
    print(f"\nGOOGLE_CALENDAR_REFRESH_TOKEN={creds.refresh_token}\n")
    print("=" * 65)

if __name__ == "__main__":
    main()
