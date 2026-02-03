#!/usr/bin/env python3
"""
Update offices' points in inventory-service-prod.offices.json using a CSV file.

CSV format (columns): Identifier, Path_ID, X, Y, ...
- Identifier -> identifier (in each point); also matches office "name" in JSON
- Path_ID -> path_ID
- X -> x
- Y -> y

Usage:
  python update-glendale-points.py <csv_path> <location_id>

Example:
  python update-glendale-points.py public/glendale.csv 6424657d16a40d45431865e0
"""

import argparse
import csv
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
OFFICES_JSON = REPO_ROOT / "inventory-service-prod.offices.json"


def load_points_from_csv(csv_path: Path) -> dict[str, list[dict]]:
    """Load CSV and group points by Identifier (office name)."""
    points_by_identifier: dict[str, list[dict]] = {}
    with open(csv_path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            identifier = row.get("Identifier", "").strip()
            if not identifier:
                continue
            path_id = int(float(row.get("Path_ID", 0)))
            x = float(row.get("X", 0))
            y = float(row.get("Y", 0))

            point = {
                "identifier": identifier,
                "x": x,
                "y": y,
                "path_ID": path_id,
            }

            if identifier not in points_by_identifier:
                points_by_identifier[identifier] = []
            points_by_identifier[identifier].append(point)

    for identifier in points_by_identifier:
        points_by_identifier[identifier].sort(key=lambda p: p["path_ID"])

    return points_by_identifier


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Update office points in JSON from a CSV file (Identifier, Path_ID, X, Y)."
    )
    parser.add_argument(
        "csv_path",
        type=Path,
        help="Path to CSV file (e.g. public/glendale.csv)",
    )
    parser.add_argument(
        "location_id",
        help="Location OID to update (e.g. 6424657d16a40d45431865e0 for Glendale)",
    )
    parser.add_argument(
        "--offices-json",
        type=Path,
        default=OFFICES_JSON,
        help=f"Path to offices JSON (default: {OFFICES_JSON.relative_to(REPO_ROOT)})",
    )
    args = parser.parse_args()

    csv_path = args.csv_path if args.csv_path.is_absolute() else REPO_ROOT / args.csv_path
    if not csv_path.exists():
        print(f"Error: CSV file not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    if not args.offices_json.is_absolute():
        offices_json = REPO_ROOT / args.offices_json
    else:
        offices_json = args.offices_json

    if not offices_json.exists():
        print(f"Error: Offices JSON not found: {offices_json}", file=sys.stderr)
        sys.exit(1)

    # Load offices JSON
    with open(offices_json, encoding="utf-8") as f:
        offices = json.load(f)

    # Load points from CSV
    points_by_identifier = load_points_from_csv(csv_path)

    # Update offices for the given location
    updated_count = 0
    for office in offices:
        location_oid = office.get("locationId", {}).get("$oid", "")
        if location_oid != args.location_id:
            continue

        office_name = office.get("name", "")
        if office_name in points_by_identifier:
            office["points"] = points_by_identifier[office_name]
            updated_count += 1

    # Write updated JSON
    with open(offices_json, "w", encoding="utf-8") as f:
        json.dump(offices, f, indent=2, ensure_ascii=False)

    print(f"Updated {updated_count} offices with points from {csv_path.name}")
    print(f"CSV identifiers: {len(points_by_identifier)}")


if __name__ == "__main__":
    main()
