"""
Interactive Google OAuth Authorization Helper for PathPilot AI
Generates the Google authorization URL directly. You click the URL in your browser,
approve access, and paste the resulting code back here to generate your refresh token.
"""

import os
import urllib.parse
import httpx
from dotenv import load_dotenv

# Load credentials from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "https://oauth.pstmn.io/v1/callback" # Standard out-of-band / callback or localhost

SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"

def main():
    if not CLIENT_ID or not CLIENT_SECRET:
        print("\n[ERROR] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in backend/.env!")
        return

    # Check redirect URI: we can use a local redirect or custom redirect
    # Also support Google's localhost redirect
    redirect_uri = "http://localhost:8080/"

    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",
        "prompt": "consent"
    }

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)

    print("\n" + "=" * 70)
    print("PATHPILOT AI — GOOGLE CALENDAR & MEET AUTHORIZATION")
    print("=" * 70)
    print("\nSTEP 1: Open this authorization link in your web browser:")
    print("-" * 70)
    print(auth_url)
    print("-" * 70)
    print("\nSTEP 2: Sign in with shuklaiit23@gmail.com and click 'Continue / Allow'.")
    print("\nSTEP 3: When redirected to http://localhost:8080/?code=...:")
    print("If your browser says 'This site can't be reached', that's completely normal!")
    print("Just look at the address bar in your browser, copy the entire URL (or the code=... part),")
    print("and paste it below:\n")

    user_input = input("Paste the URL or code here: ").strip()

    code = user_input
    if "code=" in user_input:
        parsed = urllib.parse.urlparse(user_input)
        queries = urllib.parse.parse_qs(parsed.query)
        if "code" in queries:
            code = queries["code"][0]
        else:
            # Maybe pasted after 'code='
            code = user_input.split("code=")[1].split("&")[0]

    code = urllib.parse.unquote(code)

    print("\nExchanging authorization code for permanent Refresh Token...")
    try:
        resp = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code"
            },
            timeout=15
        )

        data = resp.json()
        refresh_token = data.get("refresh_token")

        if refresh_token:
            print("\n" + "=" * 70)
            print("SUCCESS! HERE IS YOUR GOOGLE CALENDAR REFRESH TOKEN:")
            print("=" * 70)
            print(f"\nGOOGLE_CALENDAR_REFRESH_TOKEN={refresh_token}\n")
            print("=" * 70)

            # Auto-save directly into backend/.env
            env_path = os.path.join(os.path.dirname(__file__), ".env")
            with open(env_path, "r", encoding="utf-8") as f:
                content = f.read()

            if "GOOGLE_CALENDAR_REFRESH_TOKEN=" in content:
                lines = [l for l in content.splitlines() if not l.startswith("GOOGLE_CALENDAR_REFRESH_TOKEN=")]
                content = "\n".join(lines) + "\n"

            content += f"GOOGLE_CALENDAR_REFRESH_TOKEN={refresh_token}\n"

            with open(env_path, "w", encoding="utf-8") as f:
                f.write(content)

            print(f"-> Automatically saved into {env_path}!")

            # Auto-save into pathpilot/.env.local
            frontend_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pathpilot", ".env.local")
            if os.path.exists(frontend_env):
                with open(frontend_env, "r", encoding="utf-8") as f:
                    f_content = f.read()
                if "GOOGLE_CALENDAR_REFRESH_TOKEN=" in f_content:
                    f_lines = [l for l in f_content.splitlines() if not l.startswith("GOOGLE_CALENDAR_REFRESH_TOKEN=")]
                    f_content = "\n".join(f_lines) + "\n"
                f_content += f"GOOGLE_CALENDAR_REFRESH_TOKEN={refresh_token}\n"
                with open(frontend_env, "w", encoding="utf-8") as f:
                    f.write(f_content)
                print(f"-> Automatically saved into {frontend_env}!")

            print("\nAll done! Restarting the backend server will activate Google Calendar & Meet.\n")

        else:
            print("\n[ERROR] Failed to obtain refresh token. Response from Google:")
            print(data)

    except Exception as e:
        print(f"\n[ERROR] Request failed: {e}")

if __name__ == "__main__":
    main()
