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

    # Keep a JSON manifest alias for static hosts that serve .webmanifest
    # with an unsupported MIME type. The browser can consume the .json file.
    shutil.copy2(ASSET_SOURCE / "manifest.webmanifest", GENERATED / "manifest.json")

    # Serve the brand icon from the site root so browsers stop probing for
    # the default /favicon.ico and the icon works from every page depth.
    shutil.copy2(ASSET_SOURCE / "icon.svg", GENERATED / "favicon.svg")

    # A static 404 page prevents direct navigation to an unknown route from
    # returning an unstyled host error page.
    shutil.copy2(GENERATED / "index.html", GENERATED / "404.html")

    for icon in ICON_SOURCE.glob("*.svg"):
        shutil.copy2(icon, ICON_DEST / icon.name)

    required = [
        GENERATED / "index.html",
        GENERATED / "404.html",
        GENERATED / "manifest.json",
        GENERATED / "manifest.webmanifest",
        GENERATED / "favicon.svg",
        GENERATED / "sw.js",
        ASSET_DEST / "icon.svg",
        ASSET_DEST / "pwa.css",
        ASSET_DEST / "pwa.js",
    ]
    missing = [str(path.relative_to(ROOT)) for path in required if not path.is_file()]
    if missing:
        raise RuntimeError("Build output verification failed: " + ", ".join(missing))

def main():
    clean_generated()
    generator.main()
    copy_runtime_assets()
    print("Production assets copied to generated/.")

if __name__ == "__main__":
    main()
