import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from config import settings

logger = logging.getLogger("pathpilot.google_calendar")

class GoogleCalendarService:
    """
    Official Google Calendar API integration service for creating genuine Google Meet conferences,
    generating calendar events with conferenceDataVersion=1, and managing event syncing.
    
    If credentials or user OAuth tokens are not configured, this service cleanly reports
    'UNCONFIGURED' or 'AWAITING_CREDENTIALS' rather than simulating or faking success.
    """

    @classmethod
    def is_configured(cls) -> bool:
        """
        Checks if Google Calendar API integration has been configured via service account or OAuth tokens.
        """
        # Supports Google Service Account JSON path, or OAuth refresh token configuration
        has_credentials = bool(
            settings.GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON or 
            (settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET and settings.GOOGLE_CALENDAR_REFRESH_TOKEN)
        )
        return has_credentials

    @classmethod
    def get_status(cls) -> Dict[str, Any]:
        """
        Returns status information for the Google Calendar integration.
        """
        configured = cls.is_configured()
        return {
            "is_configured": configured,
            "status": "CONFIGURED" if configured else "AWAITING_CREDENTIALS",
            "provider": "Google Calendar API v3",
            "has_client_id": bool(settings.GOOGLE_CLIENT_ID),
            "has_service_account": bool(settings.GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON),
            "has_refresh_token": bool(settings.GOOGLE_CALENDAR_REFRESH_TOKEN),
            "message": (
                "Google Calendar API is active and ready to create Google Meet sessions."
                if configured else
                "Google Calendar integration is awaiting authorization credentials. Set GOOGLE_CALENDAR_REFRESH_TOKEN or GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON in .env."
            )
        }

    @classmethod
    def create_meeting_event(
        cls,
        summary: str,
        description: str,
        start_iso: str,
        end_iso: str,
        student_email: str,
        mentor_email: Optional[str] = None,
        idempotency_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a real Google Calendar event with Google Meet conferencing enabled.
        Strict rule: If Google Calendar API credentials are not present, do NOT fake a Meet link.
        Returns a structured result with genuine conference data or unconfigured flag.
        """
        if not cls.is_configured():
            logger.info("Google Calendar API is not configured; no simulated Meet link will be claimed as real.")
            return {
                "success": False,
                "configured": False,
                "status": "AWAITING_CREDENTIALS",
                "event_id": None,
                "meet_link": None,
                "error": "Google Calendar integration is not yet authorized with Google Cloud API credentials."
            }

        try:
            # We attempt to build Google Calendar Service using Google libraries
            from googleapiclient.discovery import build
            from google.oauth2.credentials import Credentials
            from google.oauth2 import service_account

            creds = None
            if settings.GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON:
                scopes = ['https://www.googleapis.com/auth/calendar']
                creds = service_account.Credentials.from_service_account_file(
                    settings.GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON, scopes=scopes
                )
            elif settings.GOOGLE_CALENDAR_REFRESH_TOKEN:
                creds = Credentials(
                    token=None,
                    refresh_token=settings.GOOGLE_CALENDAR_REFRESH_TOKEN,
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=settings.GOOGLE_CLIENT_ID,
                    client_secret=settings.GOOGLE_CLIENT_SECRET,
                    scopes=['https://www.googleapis.com/auth/calendar']
                )

            if not creds:
                return {
                    "success": False,
                    "configured": False,
                    "status": "FAILED",
                    "event_id": None,
                    "meet_link": None,
                    "error": "Unable to initialize Google credentials."
                }

            service = build('calendar', 'v3', credentials=creds)

            # Build Attendees list with verified emails
            attendees = []
            if student_email and "@" in student_email:
                attendees.append({"email": student_email})
            if mentor_email and "@" in mentor_email:
                attendees.append({"email": mentor_email})

            event_body = {
                "summary": summary,
                "description": description,
                "start": {
                    "dateTime": start_iso,
                },
                "end": {
                    "dateTime": end_iso,
                },
                "attendees": attendees,
                "conferenceData": {
                    "createRequest": {
                        "requestId": idempotency_key or f"req-{uuid.uuid4().hex[:12]}",
                        "conferenceSolutionKey": {
                            "type": "hangoutsMeet"
                        }
                    }
                },
                "reminders": {
                    "useDefault": False,
                    "overrides": [
                        {"method": "email", "minutes": 24 * 60},
                        {"method": "popup", "minutes": 15}
                    ]
                }
            }

            # Call official Google Calendar API with conferenceDataVersion=1
            created_event = service.events().insert(
                calendarId='primary',
                body=event_body,
                conferenceDataVersion=1,
                sendUpdates='all'
            ).execute()

            event_id = created_event.get("id")
            # Extract real Meet URL only when returned by Google API
            entry_points = created_event.get("conferenceData", {}).get("entryPoints", [])
            meet_link = None
            for ep in entry_points:
                if ep.get("entryPointType") == "video":
                    meet_link = ep.get("uri")
                    break

            if not meet_link:
                meet_link = created_event.get("hangoutLink")

            return {
                "success": True,
                "configured": True,
                "status": "CONFIRMED",
                "event_id": event_id,
                "meet_link": meet_link,
                "calendar_html_link": created_event.get("htmlLink"),
                "error": None
            }

        except Exception as e:
            logger.error(f"Google Calendar API invocation error: {e}")
            return {
                "success": False,
                "configured": True,
                "status": "FAILED",
                "event_id": None,
                "meet_link": None,
                "error": str(e)
            }
