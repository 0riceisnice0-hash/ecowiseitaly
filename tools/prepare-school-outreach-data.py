#!/usr/bin/env python3
"""Prepare an auditable UK independent-school universe and a small reviewed contact pilot.

The input is the official daily GIAS public-download CSV. The script never queries
individual GIAS pages. For the highest-fit records only, it reads the school's
public homepage and one clearly linked contact page and records generic role
inboxes. It deliberately rejects person-named addresses.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import re
import ssl
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


EMAIL_RE = re.compile(r"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}", re.I)
GENERIC_PREFIXES = (
    "office", "info", "enquiries", "enquiry", "reception", "admin",
    "schooloffice", "contact", "hello", "secretary", "trips", "visits",
    "outdoor", "education", "co-curricular", "cocurricular", "activities",
)
EXCLUDED_EMAIL_PARTS = ("example.", "sentry", "cloudflare", "wixpress", "wordpress")


def clean_url(raw: str) -> str:
    value = raw.strip()
    if not value:
        return ""
    if not value.lower().startswith(("http://", "https://")):
        value = "https://" + value
    return value


def integer(value: str) -> int:
    try:
        return int(float(value or 0))
    except ValueError:
        return 0


def priority_score(row: dict[str, str]) -> int:
    score = 0
    if row.get("Boarders (name)") == "Boarding school":
        score += 30
    if integer(row.get("StatutoryHighAge", "")) >= 18:
        score += 20
    if integer(row.get("StatutoryLowAge", "")) <= 11:
        score += 10
    if row.get("OfficialSixthForm (name)") == "Has a sixth form":
        score += 15
    if integer(row.get("NumberOfPupils", "")) >= 200:
        score += 10
    if clean_url(row.get("SchoolWebsite", "")):
        score += 10
    return score


def public_generic_emails(document: str, website: str) -> list[str]:
    text = html.unescape(document).replace("%40", "@").replace("%2E", ".")
    host = urlparse(website).hostname or ""
    host = host.lower().removeprefix("www.")
    found: list[str] = []
    for candidate in EMAIL_RE.findall(text):
        address = candidate.strip(".,;:()[]<>\"'").lower()
        local, _, domain = address.partition("@")
        if not domain or any(part in address for part in EXCLUDED_EMAIL_PARTS):
            continue
        if not any(local == prefix or local.startswith(prefix + ".") for prefix in GENERIC_PREFIXES):
            continue
        if host and not (domain == host or domain.endswith("." + host) or host.endswith("." + domain)):
            continue
        if address not in found:
            found.append(address)
    return found


def fetch(url: str) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": "EcoWiseItaly-outreach-research/1.0 (+https://ecowiseitaly.com/contact-us/)",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    context = ssl.create_default_context()
    with urlopen(request, timeout=12, context=context) as response:
        content_type = response.headers.get("Content-Type", "")
        if "html" not in content_type.lower():
            return ""
        return response.read(2_000_000).decode("utf-8", errors="replace")


def find_contact_link(document: str, website: str) -> str:
    candidates = re.findall(r"href=[\"']([^\"']+)[\"']", document, re.I)
    for href in candidates:
        lower = href.lower()
        if "contact" in lower and not lower.startswith(("mailto:", "tel:", "#")):
            target = urljoin(website, html.unescape(href))
            if urlparse(target).hostname == urlparse(website).hostname:
                return target
    return ""


def enrich(row: dict[str, object]) -> None:
    website = str(row["website"])
    if not website:
        row["research_status"] = "No website in GIAS"
        return
    try:
        home = fetch(website)
        emails = public_generic_emails(home, website)
        source = website
        contact_url = find_contact_link(home, website)
        if not emails and contact_url:
            contact = fetch(contact_url)
            emails = public_generic_emails(contact, website)
            source = contact_url
        row["public_email"] = emails[0] if emails else ""
        row["email_source"] = source if emails else contact_url or website
        row["research_status"] = "Generic public inbox found" if emails else "Manual contact review needed"
    except (HTTPError, URLError, TimeoutError, ValueError, ssl.SSLError) as exc:
        row["research_status"] = f"Manual contact review needed ({type(exc).__name__})"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("gias_csv", type=Path)
    parser.add_argument("output_json", type=Path)
    parser.add_argument("--research-top", type=int, default=80)
    args = parser.parse_args()

    with args.gias_csv.open("r", encoding="cp1252", newline="") as handle:
        source_rows = list(csv.DictReader(handle))

    selected = []
    for source in source_rows:
        if source.get("EstablishmentStatus (name)") != "Open":
            continue
        if source.get("EstablishmentTypeGroup (name)") != "Independent schools":
            continue
        if integer(source.get("StatutoryHighAge", "")) < 11:
            continue
        selected.append(
            {
                "urn": source.get("URN", ""),
                "priority_score": priority_score(source),
                "school": source.get("EstablishmentName", ""),
                "town": source.get("Town", ""),
                "county": source.get("County (name)", ""),
                "postcode": source.get("Postcode", ""),
                "low_age": integer(source.get("StatutoryLowAge", "")),
                "high_age": integer(source.get("StatutoryHighAge", "")),
                "boarders": source.get("Boarders (name)", ""),
                "sixth_form": source.get("OfficialSixthForm (name)", ""),
                "pupils": integer(source.get("NumberOfPupils", "")),
                "website": clean_url(source.get("SchoolWebsite", "")),
                "telephone": source.get("TelephoneNum", ""),
                "public_email": "",
                "email_source": "",
                "research_status": "Queued for contact research",
                "source_url": "https://www.get-information-schools.service.gov.uk/Downloads",
            }
        )

    selected.sort(key=lambda row: (-int(row["priority_score"]), -int(row["pupils"]), str(row["school"])))
    for index, row in enumerate(selected[: args.research_top]):
        enrich(row)
        if index and index % 10 == 0:
            print(f"Researched {index}/{min(args.research_top, len(selected))}", flush=True)
        time.sleep(0.15)

    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(
        json.dumps(
            {
                "source_date": "2026-09-03",
                "source_file": args.gias_csv.name,
                "selection": "Open England independent schools serving pupils aged 11 or older",
                "schools": selected,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    found = sum(bool(row["public_email"]) for row in selected[: args.research_top])
    print(f"Prepared {len(selected)} schools; found {found} generic public inboxes in top {args.research_top}.")


if __name__ == "__main__":
    main()
