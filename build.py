from pathlib import Path
import shutil
import generator

ROOT = Path(__file__).resolve().parent
GENERATED = ROOT / "generated"
ASSET_SOURCE = ROOT / "static"
ASSET_DEST = GENERATED / "assets"

def copy_runtime_assets():
    ASSET_DEST.mkdir(parents=True, exist_ok=True)
    files = {
        "manifest.webmanifest": GENERATED / "manifest.webmanifest",
        "sw.js": GENERATED / "sw.js",
        "icon.svg": ASSET_DEST / "icon.svg",
        "pwa.css": ASSET_DEST / "pwa.css",
        "pwa.js": ASSET_DEST / "pwa.js",
    }
    for source_name, destination in files.items():
        source = ASSET_SOURCE / source_name
        if not source.exists():
            raise FileNotFoundError(f"Missing build asset: {source}")
        shutil.copy2(source, destination)

def main():
    generator.main()
    copy_runtime_assets()
    print("Production assets copied to generated/.")

if __name__ == "__main__":
    main()
