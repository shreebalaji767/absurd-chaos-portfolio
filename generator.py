from __future__ import annotations

import json
import random
from pathlib import Path


ROOT = Path(__file__).resolve().parent
TEMPLATE_FILE = ROOT / "templates" / "index.html"
CSS_FILE = ROOT / "static" / "style.css"
JS_FILE = ROOT / "static" / "app.js"
OUTPUT_DIR = ROOT / "generated"
OUTPUT_FILE = OUTPUT_DIR / "index.html"


def choose_many(rng, values, minimum=2, maximum=5):
    count = rng.randint(minimum, min(maximum, len(values)))
    return rng.sample(values, count)


def build_config():
    rng = random.SystemRandom()

    config = {
        "version": "1.0.0",

        "names": [
            "Ari Voss",
            "Kael Ren",
            "Mira Vale",
            "Noah Kestrel",
            "Rin Aster",
            "Sora Nyx",
            "Elian Crowe",
            "Nara Vey",
            "Iris Quill",
            "Theo Rune",
            "Vera Sol",
            "Kian Frost",
            "Asha Mori",
            "Ren Calder",
            "Lena Voss",
            "Orin Vale",
            "Yuna Kade",
            "Milo Ash",
            "Eren Locke",
            "Niko Wren",
            "Aya Rook",
            "Cass Rowan",
            "Juno Rei",
            "Dante Kiro",
            "Lyra Chen",
            "Rhea Knox",
            "Kai Mercer",
            "Nova Hart",
            "Mina Cross",
            "Arden Pike",
        ],

        "titles": [
            "Senior Backend Engineer",
            "Staff Software Engineer",
            "Full-Stack Engineer",
            "Platform Engineer",
            "Systems Architect",
            "Product Engineer",
            "DevOps Engineer",
            "Cloud Infrastructure Engineer",
            "Security Engineer",
            "Data Platform Engineer",
            "AI Infrastructure Engineer",
            "Frontend Systems Engineer",
            "Developer Experience Engineer",
            "Technical Product Designer",
            "Creative Technologist",
            "Research Engineer",
            "Software Consultant",
            "Distributed Systems Engineer",
            "Automation Engineer",
            "Independent Software Engineer",
        ],

        "specialties": [
            "Python",
            "JavaScript",
            "TypeScript",
            "PostgreSQL",
            "Docker",
            "Linux",
            "Redis",
            "REST APIs",
            "GraphQL",
            "Cloud Infrastructure",
            "Distributed Systems",
            "CI/CD",
            "Observability",
            "Automation",
            "Data Pipelines",
            "Event-Driven Systems",
            "Web Performance",
            "Security Engineering",
            "Developer Tooling",
            "System Design",
        ],

        "industries": [
            "healthcare technology",
            "financial platforms",
            "logistics",
            "developer tooling",
            "e-commerce",
            "education technology",
            "media platforms",
            "cloud infrastructure",
            "enterprise automation",
            "research software",
            "cybersecurity",
            "public-sector technology",
            "digital commerce",
            "workflow automation",
            "SaaS platforms",
        ],

        "personalities": [
            "methodical",
            "curious",
            "quietly chaotic",
            "systems-minded",
            "experimental",
            "obsessively organized",
            "dryly humorous",
            "highly pragmatic",
            "inventive",
            "calm under pressure",
            "detail-oriented",
            "restlessly curious",
            "strategic",
            "minimalist",
            "unreasonably persistent",
        ],

        "worlds": [
            {
                "name": "The Neon Archive",
                "genre": "cyberpunk",
                "description": "A megacity where abandoned APIs become folklore and forgotten databases are treated as sacred ruins.",
                "sky": "violet static",
            },
            {
                "name": "Eidolon Prime",
                "genre": "space opera",
                "description": "A fractured interstellar civilization held together by engineers, diplomats, and one extremely unreliable moon.",
                "sky": "artificial auroras",
            },
            {
                "name": "The Seven-Layer Kingdom",
                "genre": "fantasy",
                "description": "A kingdom built vertically, where every architectural layer has its own economy, politics, and suspiciously competent guild.",
                "sky": "floating citadels",
            },
            {
                "name": "Moonfall District",
                "genre": "urban fantasy",
                "description": "A city district permanently illuminated by fragments of a moon that technically should not exist anymore.",
                "sky": "silver fragments",
            },
            {
                "name": "The Black Meridian",
                "genre": "dark fantasy",
                "description": "A continent where information is currency and every secret has a measurable weight.",
                "sky": "red eclipses",
            },
            {
                "name": "Aster-09",
                "genre": "science fiction",
                "description": "A remote research colony where every department has independently invented its own calendar.",
                "sky": "two artificial suns",
            },
            {
                "name": "Velorum City",
                "genre": "manhwa-inspired modern fantasy",
                "description": "A modern metropolis where awakened individuals quietly work ordinary jobs while managing increasingly unreasonable supernatural incidents.",
                "sky": "blue electric storms",
            },
            {
                "name": "The Glass Continent",
                "genre": "high fantasy",
                "description": "A crystalline civilization connected by ancient transit gates that nobody remembers how to repair.",
                "sky": "fractured constellations",
            },
            {
                "name": "Sector Null",
                "genre": "post-apocalyptic sci-fi",
                "description": "A surviving industrial zone where machines outnumber humans and the machines have started forming professional associations.",
                "sky": "orange dust",
            },
            {
                "name": "The Infinite Metro",
                "genre": "surreal fantasy",
                "description": "A transit network with no final station, populated by commuters who occasionally arrive in completely different realities.",
                "sky": "indoor stars",
            },
            {
                "name": "Ashen Republic",
                "genre": "political fantasy",
                "description": "A republic where ministries, mercenary guilds, and archivists compete to control the country's surviving knowledge.",
                "sky": "permanent twilight",
            },
            {
                "name": "Kurovale",
                "genre": "dark urban fantasy",
                "description": "A rain-soaked city of hunters, developers, occult investigators, and businesses that definitely should not exist.",
                "sky": "black rain",
            },
        ],

        "factions": [
            "Department of Unnecessary Architecture",
            "Azure Systems Guild",
            "Order of the Silent Compiler",
            "Moonlit Infrastructure Bureau",
            "Seven-Key Consortium",
            "Red Meridian Research Circle",
            "Night Shift Engineering Union",
            "The Glass Operators",
            "Null Sector Maintainers",
            "Axiom Security Directorate",
            "Independent Reality Debuggers",
            "Archive of Forbidden Deployments",
            "Guild of Extremely Specific Problems",
            "The Last Documentation Society",
            "Ministry of Temporary Solutions",
            "Velvet Circuit Syndicate",
            "Royal Bureau of Broken Things",
            "The Recursive Council",
        ],

        "genres": [
            "cyberpunk",
            "fantasy",
            "dark fantasy",
            "space opera",
            "urban fantasy",
            "science fiction",
            "mystery",
            "post-apocalyptic",
            "manhwa-inspired fantasy",
            "surreal adventure",
            "steampunk",
            "occult detective",
        ],

        "ui_families": [
            "executive",
            "terminal",
            "rpg",
            "manhwa",
            "dossier",
            "research",
            "luxury",
            "brutalist",
            "space",
            "detective",
            "spellbook",
            "underground",
            "newspaper",
            "operating-system",
            "chaotic",
        ],

        "layouts": [
            "asymmetric",
            "editorial",
            "command",
            "character-sheet",
            "case-file",
            "dashboard",
            "split-screen",
            "stacked",
            "magazine",
            "terminal-grid",
            "mission-control",
            "dense-grid",
        ],

        "navs": [
            "top",
            "rail",
            "floating",
            "command",
            "minimal",
            "drawer",
        ],

        "hero_modes": [
            "identity",
            "mission",
            "profile",
            "case",
            "status",
            "command",
            "character",
            "manifesto",
        ],

        "project_types": [
            "platform",
            "automation system",
            "developer tool",
            "healthcare workflow",
            "analytics system",
            "API platform",
            "infrastructure project",
            "security platform",
            "data pipeline",
            "internal operations system",
            "SaaS product",
            "research prototype",
            "distributed service",
            "workflow engine",
            "monitoring platform",
        ],

        "project_names": [
            "Atlas",
            "Nightwatch",
            "Helix",
            "Axiom",
            "Orchid",
            "Sentinel",
            "Mosaic",
            "Northstar",
            "Pulse",
            "Meridian",
            "Vector",
            "Lattice",
            "Orbit",
            "Foundry",
            "Beacon",
            "Relay",
            "Forge",
            "Prism",
            "Echo",
            "Vanta",
        ],

        "npc_first": [
            "Aki",
            "Rin",
            "Kaori",
            "Ren",
            "Mika",
            "Yoru",
            "Sena",
            "Haru",
            "Kira",
            "Nami",
            "Rei",
            "Toma",
            "Aya",
            "Kuro",
            "Mio",
            "Sora",
            "Yuna",
            "Rika",
            "Nero",
            "Eli",
        ],

        "npc_last": [
            "Kuro",
            "Vale",
            "Aster",
            "Mori",
            "Vey",
            "Rook",
            "Kade",
            "Nyx",
            "Rune",
            "Ash",
            "Locke",
            "Crow",
            "Ren",
            "Sol",
            "Pike",
            "Wren",
            "Cross",
            "Voss",
        ],

        "npc_roles": [
            "royal archivist",
            "rogue engineer",
            "guild strategist",
            "wandering healer",
            "reality cartographer",
            "black-market compiler",
            "moon priest",
            "systems investigator",
            "contract hunter",
            "forbidden librarian",
            "airship navigator",
            "security captain",
            "dimension merchant",
            "exiled prince",
            "night-shift mechanic",
            "oracle",
            "data alchemist",
            "underground journalist",
            "monster negotiator",
            "government auditor",
        ],

        "npc_types": [
            "human",
            "awakened human",
            "synthetic human",
            "moon-born",
            "void-touched",
            "forest spirit",
            "dragon-blooded",
            "android",
            "star wanderer",
            "archive entity",
            "masked hunter",
            "dimension traveler",
        ],

        "npc_traits": [
            "suspiciously polite",
            "fearlessly curious",
            "emotionally unreadable",
            "dramatic",
            "extremely practical",
            "secretly sentimental",
            "dangerously competent",
            "chaotically helpful",
            "quietly ambitious",
            "obsessed with tea",
            "unreasonably loyal",
            "professionally intimidating",
        ],

        "quests": [
            "repair the infrastructure before the next artificial eclipse",
            "find out who deployed directly to production",
            "convince the royal council that version control is necessary",
            "retrieve a missing database from the lower city",
            "investigate an API that answers questions nobody asked",
            "escort an unstable artifact across seven districts",
            "document the forbidden deployment procedure",
            "stop the maintenance robot from becoming mayor",
            "recover the lost architecture diagram",
            "determine why the moon has a status page",
            "find the engineer who keeps renaming production servers",
            "debug the ancient transit gate",
            "prevent the guild from replacing PostgreSQL with magic",
            "locate the missing incident report",
            "survive the quarterly dungeon audit",
        ],

        "secrets": [
            "knows why the previous civilization disappeared",
            "owns a key to an impossible server room",
            "has seen the original source code of reality",
            "is secretly employed by a rival faction",
            "can remember deleted timelines",
            "maintains a private map of forbidden infrastructure",
            "knows the true identity of the city's administrator",
            "once defeated a production outage with a handwritten note",
            "has access to a database that predates civilization",
            "is afraid of automated deployment systems",
        ],

        "statuses": [
            "ONLINE",
            "STANDBY",
            "UNDER INVESTIGATION",
            "ACTIVE",
            "DEEP COVER",
            "MISSING",
            "DEPLOYED",
            "OBSERVING",
            "UNKNOWN",
            "HIGH PRIORITY",
        ],

        "education": [
            "B.Tech. Computer Science",
            "B.Sc. Computer Science",
            "M.Sc. Software Systems",
            "M.Tech. Distributed Systems",
            "Computer Engineering",
            "Self-taught engineering background",
            "Applied Computing",
            "Software Systems Research",
        ],

        "locations": [
            "Hansi",
            "Velorum City",
            "The Neon Archive",
            "Sector Null",
            "Aster-09",
            "Moonfall District",
            "The Glass Continent",
            "Kurovale",
            "The Infinite Metro",
            "Ashen Republic",
        ],
    }

    # Generate additional combinations at build time.
    config["generated_project_seeds"] = [
        {
            "name": rng.choice(config["project_names"]),
            "type": rng.choice(config["project_types"]),
            "industry": rng.choice(config["industries"]),
        }
        for _ in range(32)
    ]

    config["generated_npc_seeds"] = [
        {
            "first": rng.choice(config["npc_first"]),
            "last": rng.choice(config["npc_last"]),
            "role": rng.choice(config["npc_roles"]),
            "type": rng.choice(config["npc_types"]),
        }
        for _ in range(32)
    ]

    config["build_identity"] = f"{rng.getrandbits(64):016x}"

    return config


def main():
    config = build_config()

    template = TEMPLATE_FILE.read_text(encoding="utf-8")
    css = CSS_FILE.read_text(encoding="utf-8")
    js = JS_FILE.read_text(encoding="utf-8")

    config_json = json.dumps(
        config,
        ensure_ascii=False,
        separators=(",", ":"),
    )

    html = (
        template
        .replace("{{GENERATED_CONFIG}}", config_json)
        .replace("{{GENERATED_CSS}}", css)
        .replace("{{GENERATED_JS}}", js)
    )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(html, encoding="utf-8")

    print(f"Generated: {OUTPUT_FILE}")
    print(f"Build identity: {config['build_identity']}")
    print("Static output is ready.")


if __name__ == "__main__":
    main()
