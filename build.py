from pathlib import Path
import shutil
import generator

ROOT = Path(__file__).resolve().parent
GENERATED = ROOT / "generated"
ASSET_SOURCE = ROOT / "static"
ASSET_DEST = GENERATED / "assets"
ICON_SOURCE = ASSET_SOURCE / "icons"
ICON_DEST = GENERATED / "icons"

def clean_generated():
    # Remove stale build output before generating the new site.
    if GENERATED.exists():
        shutil.rmtree(GENERATED)


def copy_runtime_assets():
    ASSET_DEST.mkdir(parents=True, exist_ok=True)
    ICON_DEST.mkdir(parents=True, exist_ok=True)
    files = {
        "manifest.webmanifest": GENERATED / "manifest.webmanifest",
        "manifest.json": GENERATED / "manifest.json",
        "sw.js": GENERATED / "sw.js",
        "robots.txt": GENERATED / "robots.txt",
        "icon.svg": ASSET_DEST / "icon.svg",
        "pwa.css": ASSET_DEST / "pwa.css",
        "pwa.js": ASSET_DEST / "pwa.js",
    }
    for source_name, destination in files.items():
        source = ASSET_SOURCE / source_name
        if not source.exists():
            raise FileNotFoundError(f"Missing build asset: {source}")
        shutil.copy2(source, destination)

    # Keep a JSON manifest alias for hosts that do not assign the
    # application/manifest+json MIME type to .webmanifest files.
    shutil.copy2(ASSET_SOURCE / "manifest.webmanifest", GENERATED / "manifest.json")

    for icon in ICON_SOURCE.glob("*.svg"):
        shutil.copy2(icon, ICON_DEST / icon.name)

def main():
    clean_generated()
    generator.main()
    copy_runtime_assets()
    print("Production assets copied to generated/.")

if __name__ == "__main__":
    main()
