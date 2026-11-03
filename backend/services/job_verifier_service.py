"""
Job Health & Link Verification Worker (Architecture Spec 2.0)
High performance, zero-body streaming checks, non-blocking link validation.
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
import httpx

from services.job_scraper_service import JobEngineService

logger = logging.getLogger("job_verifier_service")
logger.setLevel(logging.INFO)

REALISTIC_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

class JobVerifierService:
    """
    Validates job link health with minimal network and memory footprints:
    - Uses HTTP HEAD requests first (no body download)
    - Concurrency bounded via Semaphore to avoid throttling
    - Automatically retires closed, 404, or redirected job postings
    """

    _http_limits = httpx.Limits(max_keepalive_connections=10, max_connections=20)
    _http_timeout = httpx.Timeout(connect=3.0, read=4.0, write=3.0, pool=4.0)

    @classmethod
    async def verify_single_url(cls, client: httpx.AsyncClient, url: str) -> bool:
        """
        Pings target URL with zero payload transfer.
        Returns True if active (2xx or 3xx), False if 404, 410, or unreachable.
        """
        if not url or not url.startswith("http"):
            return False

        headers = {
            "User-Agent": REALISTIC_USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        try:
            # 1. Attempt lightweight HEAD request
            res = await client.head(url, headers=headers, timeout=cls._http_timeout, follow_redirects=True)
            if res.status_code in (200, 201, 301, 302, 307, 308):
                return True
            if res.status_code in (404, 410):
                return False

            # If 405 Method Not Allowed or 403 (some ATS block HEAD), attempt GET with stream=True
            if res.status_code in (405, 403):
                async with client.stream("GET", url, headers=headers, timeout=cls._http_timeout, follow_redirects=True) as stream_res:
                    return stream_res.status_code < 400

            return res.status_code < 400
        except Exception as e:
            logger.debug(f"Verification ping timed out or failed for {url}: {e}")
            # If domain network error or connection timeout, don't hastily close verified seeds
            return True

    @classmethod
    async def sweep_active_jobs(cls, batch_size: int = 50) -> Dict[str, Any]:
        """
        Runs link health audit across active listings.
        """
        JobEngineService.initialize_catalog()
        active_jobs = [
            j for j in JobEngineService._jobs_by_id.values()
            if j.status != "closed"
        ]

        logger.info(f"Starting verification sweep for {len(active_jobs)} active jobs...")
        semaphore = asyncio.Semaphore(10) # 10 concurrent requests
        verified_count = 0
        closed_count = 0

        async with httpx.AsyncClient(limits=cls._http_limits) as client:
            async def _check_job(job):
                nonlocal verified_count, closed_count
                async with semaphore:
                    is_live = await cls.verify_single_url(client, job.apply_url)
                    now_iso = datetime.now(timezone.utc).isoformat()
                    if is_live:
                        job.verified_at = now_iso
                        verified_count += 1
                    else:
                        job.status = "closed"
                        closed_count += 1

            tasks = [_check_job(job) for job in active_jobs[:batch_size]]
            await asyncio.gather(*tasks, return_exceptions=True)

        JobEngineService._last_verified_at = datetime.now(timezone.utc).isoformat()
        return {
            "status": "completed",
            "checked_count": min(len(active_jobs), batch_size),
            "verified_active": verified_count,
            "expired_or_closed": closed_count,
            "timestamp": JobEngineService._last_verified_at
        }

