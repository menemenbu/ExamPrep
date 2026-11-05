"""Copy the canonical lesson stylesheet and one named output page to publish."""
from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_CSS = ROOT / "templates" / "lesson-ui.css"
OUTPUTS = ROOT / "outputs"
PUBLISH = ROOT / "publish"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("page", nargs="?", help="HTML file name from outputs/ to publish")
    parser.add_argument("--styles-only", action="store_true", help="update the shared stylesheet in outputs/ and publish/")
    args = parser.parse_args()

    if args.styles_only and args.page:
        parser.error("provide either a page name or --styles-only, not both")
    if not args.styles_only and not args.page:
        parser.error("provide an output page name, or use --styles-only")
    if args.page and (Path(args.page).name != args.page or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*\.html", args.page)):
        parser.error("page must be a simple .html file name, without a directory path")
    source = OUTPUTS / args.page if args.page else None
    if source and not source.is_file():
        parser.error(f"outputs/{args.page} does not exist")

    PUBLISH.mkdir(exist_ok=True)
    for folder in (OUTPUTS, PUBLISH):
        shutil.copy2(TEMPLATE_CSS, folder / "lesson-ui.css")
    if source:
        shutil.copy2(source, PUBLISH / args.page)
        print(f"Shared styles updated; published {args.page}.")
    else:
        print("Shared styles updated in outputs/ and publish/.")


if __name__ == "__main__":
    main()
