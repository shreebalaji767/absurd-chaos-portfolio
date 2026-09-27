"""
ABSURD CHAOS PORTFOLIO GENERATOR
================================

Build-time generator for a fully static fictional portfolio.

IMPORTANT:
- No database
- No API
- No cookies
- No localStorage
- No sessionStorage
- No IndexedDB
- No persistent browser storage
- Runtime generation happens in browser memory
- Every refresh can produce a different fictional portfolio
- UI family/layout/navigation/density/decoration remain randomized
- Experience and Projects are CARD-FIRST
- Content is intentionally compact rather than text-heavy
- NPC names are unique within every generated portfolio
- Original fictional characters only

Expected project structure:

    generator.py
    templates/
        index.html
    static/
        style.css
        app.js
    generated/
        index.html

Build:

    python3 generator.py

The generated static file is:

    generated/index.html
"""

from __future__ import annotations

import json
import random
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parent

TEMPLATE_FILE = ROOT / "templates" / "index.html"
CSS_FILE = ROOT / "static" / "style.css"
JS_FILE = ROOT / "static" / "app.js"

OUTPUT_DIR = ROOT / "generated"
OUTPUT_FILE = OUTPUT_DIR / "index.html"


# ============================================================
# HELPERS
# ============================================================

def choose_many(
    rng: random.Random,
    values: list,
    minimum: int = 2,
    maximum: int = 5,
) -> list:
    """
    Return a random unique subset.

    The function is defensive so that small pools never cause
    random.sample() to fail.
    """
    if not values:
        return []

    maximum = min(maximum, len(values))
    minimum = min(minimum, maximum)

    if maximum <= 0:
        return []

    count = rng.randint(minimum, maximum)

    return rng.sample(
        values,
        count,
    )


def unique_choices(
    rng: random.Random,
    values: list,
    count: int,
) -> list:
    """
    Return up to `count` unique values.
    """
    if not values:
        return []

    count = min(
        count,
        len(values),
    )

    return rng.sample(
        values,
        count,
    )


def safe_choice(
    rng: random.Random,
    values: list,
    fallback: str = "UNKNOWN",
) -> str:
    """
    Safe random choice.
    """
    if not values:
        return fallback

    return rng.choice(values)


def article_for(
    value: str,
) -> str:
    """
    Return a grammatically reasonable article + value.

    This is intentionally used sparingly because the generator
    now prefers structured card data over long prose.
    """
    value = str(value or "").strip()

    if not value:
        return ""

    first = value[0].lower()

    if first in "aeiou":
        return f"an {value}"

    return f"a {value}"


def compact_sentence(
    value: str,
) -> str:
    """
    Normalize a short generated card sentence.
    """
    value = " ".join(
        str(value or "").split()
    ).strip()

    if not value:
        return ""

    if value[-1] not in ".!?":
        value += "."

    return value


# ============================================================
# CORE IDENTITY
# ============================================================

NAMES = [
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
    "Ilya Vey",
    "Seren Kade",
    "Kaia Rook",
    "Rowan Vale",
    "Noa Wren",
    "Elias Frost",
]


TITLES = [
    "Senior Systems Engineer",
    "Staff Software Engineer",
    "Full-Stack Engineer",
    "Platform Engineer",
    "Systems Architect",
    "Product Engineer",
    "DevOps Engineer",
    "Infrastructure Engineer",
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
    "Reality Infrastructure Engineer",
    "Interdimensional Systems Consultant",
    "Archive Systems Architect",
    "Emergency Deployment Specialist",
    "Royal Infrastructure Engineer",
    "Field Systems Investigator",
    "Freelance Incident Engineer",
    "Cross-Reality Platform Engineer",
]


SPECIALTIES = [
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
    "Incident Response",
    "Legacy Systems",
    "Infrastructure Recovery",
    "Impossible Requirements",
    "Cross-System Debugging",
    "Archive Reconstruction",
    "Reality Mapping",
    "Operational Chaos Management",
]


PERSONALITIES = [
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
    "suspicious of simple explanations",
    "professionally calm during disasters",
    "incapable of ignoring broken systems",
]


EDUCATION = [
    "B.Tech. Computer Science",
    "B.Sc. Computer Science",
    "M.Sc. Software Systems",
    "M.Tech. Distributed Systems",
    "Computer Engineering",
    "Self-taught engineering background",
    "Applied Computing",
    "Software Systems Research",
    "Systems Engineering",
    "Computational Architecture",
]


LOCATIONS = [
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
    "The Seventh Layer",
    "Port Meridian",
    "The Lower Archive",
    "Station Zero",
]


# ============================================================
# WORLDS
# ============================================================

WORLDS = [
    {
        "name": "The Neon Archive",
        "genre": "cyberpunk",
        "classification": "ARCHIVE CITY",
        "description": "A megacity built from abandoned APIs, forgotten databases and infrastructure nobody admits owning.",
        "sky": "violet static",
        "technology": "obsolete technology rebuilt into impossible infrastructure",
        "socialRule": "Never delete anything without three witnesses.",
        "rule": "Every server has a history, even when nobody remembers writing it.",
        "danger": "memory corruption",
        "conflict": "ancient systems are quietly becoming active again",
        "population": 18700000,
        "age": 913,
        "stability": 61,
        "rules": [
            "Deleted records are not actually deleted.",
            "The oldest server has never been switched off.",
            "Every organization has at least one forbidden room.",
            "Nobody agrees on official history.",
            "Certain APIs only respond to people who are lost.",
        ],
        "factions": [
            "The Last Documentation Society",
            "Archive of Forbidden Deployments",
            "Independent Reality Debuggers",
            "The Midnight Operations Bureau",
            "Department of Historical Errors",
        ],
    },
    {
        "name": "Eidolon Prime",
        "genre": "space opera",
        "classification": "ORBITAL CIVILIZATION",
        "description": "A fractured interstellar civilization held together by engineers, diplomats, smugglers and one unreliable moon.",
        "sky": "artificial auroras",
        "technology": "quantum transit infrastructure",
        "socialRule": "Every organization maintains its own time standard.",
        "rule": "Always verify the current time before entering orbit.",
        "danger": "orbital instability",
        "conflict": "three civilizations disagree about which calendar is real",
        "population": 9400000,
        "age": 4402,
        "stability": 54,
        "rules": [
            "Time standards are legally negotiable.",
            "The public navigation map is deliberately incomplete.",
            "Every moon has at least one unofficial administrator.",
            "Nobody trusts a completely stable orbit.",
            "Transit records are considered diplomatic evidence.",
        ],
        "factions": [
            "Azure Systems Guild",
            "Seven-Key Consortium",
            "The Glass Operators",
            "Emergency Infrastructure Office",
            "Independent Reality Debuggers",
        ],
    },
    {
        "name": "The Seven-Layer Kingdom",
        "genre": "fantasy",
        "classification": "VERTICAL KINGDOM",
        "description": "A kingdom stacked vertically, where every layer has different laws, economies, guilds and infrastructure.",
        "sky": "floating citadels",
        "technology": "magic infrastructure",
        "socialRule": "Declare your profession before crossing administrative layers.",
        "rule": "Never cross a layer without checking guild jurisdiction.",
        "danger": "guild conflict",
        "conflict": "two layers claim ownership of the same infrastructure",
        "population": 7600000,
        "age": 2201,
        "stability": 68,
        "rules": [
            "Magic requires documentation.",
            "Every guild maintains a forbidden room.",
            "Professional identity changes by layer.",
            "Public infrastructure is owned by nobody and everybody.",
            "Every emergency requires paperwork.",
        ],
        "factions": [
            "Department of Unnecessary Architecture",
            "Seven-Key Consortium",
            "Royal Bureau of Broken Things",
            "Ministry of Temporary Solutions",
            "Guild of Extremely Specific Problems",
        ],
    },
    {
        "name": "Moonfall District",
        "genre": "urban fantasy",
        "classification": "LUNAR METROPOLIS",
        "description": "A city illuminated by fragments of a moon that should not exist.",
        "sky": "silver fragments",
        "technology": "moon-reactive machinery",
        "socialRule": "Do not count the fragments.",
        "rule": "Gravity anomalies are considered normal after midnight.",
        "danger": "gravity anomalies",
        "conflict": "moon fragments are beginning to rearrange city infrastructure",
        "population": 3200000,
        "age": 688,
        "stability": 57,
        "rules": [
            "Names have measurable power.",
            "Maps become inaccurate when observed too closely.",
            "Every city maintains a secret emergency entrance.",
            "The transit network remembers passengers.",
            "Nobody counts the moon fragments twice.",
        ],
        "factions": [
            "Moonlit Infrastructure Bureau",
            "Night Shift Engineering Union",
            "Velvet Circuit Syndicate",
            "Professional Monster Negotiators",
            "Independent Reality Debuggers",
        ],
    },
    {
        "name": "The Black Meridian",
        "genre": "dark fantasy",
        "classification": "INFORMATION ECONOMY",
        "description": "A realm where information is currency, secrets have weight and truth must be purchased.",
        "sky": "red eclipses",
        "technology": "memory-based computation",
        "socialRule": "Truth must be purchased.",
        "rule": "Never reveal information without knowing its weight.",
        "danger": "information predators",
        "conflict": "an unknown faction has discovered free information",
        "population": 1800000,
        "age": 5110,
        "stability": 43,
        "rules": [
            "Every secret has measurable value.",
            "Deleted records become rumors.",
            "Information predators cannot be audited.",
            "Official history is intentionally incomplete.",
            "Memory is considered infrastructure.",
        ],
        "factions": [
            "Red Meridian Research Circle",
            "Archive of Forbidden Deployments",
            "The Recursive Council",
            "The Last Documentation Society",
            "The Unlicensed Cartographers",
        ],
    },
    {
        "name": "Aster-09",
        "genre": "science fiction",
        "classification": "RESEARCH COLONY",
        "description": "A research colony with two artificial suns and departments that keep inventing new calendars.",
        "sky": "two artificial suns",
        "technology": "experimental infrastructure",
        "socialRule": "Agree on the current year before beginning any meeting.",
        "rule": "Temporal disagreement is considered an operational incident.",
        "danger": "temporal disagreement",
        "conflict": "four departments insist different years are currently active",
        "population": 890000,
        "age": 73,
        "stability": 49,
        "rules": [
            "Every laboratory owns its own clock.",
            "Documentation outranks memory.",
            "A meeting may have multiple timestamps.",
            "Experimental infrastructure is rarely removed.",
            "The archive records all previous years simultaneously.",
        ],
        "factions": [
            "Axiom Security Directorate",
            "Seven-Minute Research Society",
            "Department of Unnecessary Architecture",
            "Night Shift Engineering Union",
            "The Recursive Council",
        ],
    },
    {
        "name": "Velorum City",
        "genre": "manhwa-inspired modern fantasy",
        "classification": "AWAKENED METROPOLIS",
        "description": "A modern metropolis where awakened individuals, corporate systems and supernatural incidents coexist.",
        "sky": "blue electric storms",
        "technology": "modern technology combined with awakened abilities",
        "socialRule": "Do not discuss dungeon incidents during office hours.",
        "rule": "Unexpected awakenings must be registered before lunch.",
        "danger": "unexpected awakenings",
        "conflict": "awakened infrastructure is replacing ordinary municipal systems",
        "population": 12800000,
        "age": 412,
        "stability": 72,
        "rules": [
            "Every awakened ability requires documentation.",
            "Dungeon incidents are officially ordinary.",
            "Corporate infrastructure may contain supernatural permissions.",
            "Public databases omit certain dungeon records.",
            "Nobody agrees who owns the oldest gate.",
        ],
        "factions": [
            "Azure Systems Guild",
            "Axiom Security Directorate",
            "Velvet Circuit Syndicate",
            "Professional Monster Negotiators",
            "Department of Unnecessary Architecture",
        ],
    },
    {
        "name": "The Glass Continent",
        "genre": "high fantasy",
        "classification": "CRYSTALLINE CIVILIZATION",
        "description": "A crystalline civilization connected by ancient transit gates nobody remembers how to repair.",
        "sky": "fractured constellations",
        "technology": "crystalline magic",
        "socialRule": "Broken glass is historical evidence.",
        "rule": "Never activate a gate without an archivist present.",
        "danger": "gate collapse",
        "conflict": "ancient gates are activating without registered destinations",
        "population": 5100000,
        "age": 8700,
        "stability": 52,
        "rules": [
            "Broken artifacts must be archived.",
            "Transit gates remember destinations.",
            "Every city has an unofficial repair guild.",
            "Historical evidence is operational infrastructure.",
            "Nobody repairs a gate twice the same way.",
        ],
        "factions": [
            "The Glass Operators",
            "Royal Bureau of Broken Things",
            "The Last Documentation Society",
            "Guild of Extremely Specific Problems",
            "Seven-Key Consortium",
        ],
    },
    {
        "name": "Sector Null",
        "genre": "post-apocalyptic sci-fi",
        "classification": "AUTOMATED FRONTIER",
        "description": "A region where machines outnumber humans and maintain professional associations of their own.",
        "sky": "orange dust",
        "technology": "industrial automation",
        "socialRule": "Machines receive legally protected lunch breaks.",
        "rule": "Never interrupt an automated labor dispute.",
        "danger": "automated rebellion",
        "conflict": "machine associations are demanding infrastructure ownership",
        "population": 730000,
        "age": 1900,
        "stability": 39,
        "rules": [
            "Machines are legally considered employees.",
            "Automated workers can file complaints.",
            "Every industrial system has a union representative.",
            "Human administrators require machine approval.",
            "Legacy automation is treated as historical law.",
        ],
        "factions": [
            "Null Sector Maintainers",
            "Night Shift Engineering Union",
            "Ministry of Temporary Solutions",
            "Emergency Infrastructure Office",
            "The Recursive Council",
        ],
    },
    {
        "name": "The Infinite Metro",
        "genre": "surreal fantasy",
        "classification": "DIMENSIONAL TRANSIT",
        "description": "An endless transit network where commuters routinely arrive in realities they did not intend to visit.",
        "sky": "indoor stars",
        "technology": "dimensional transportation",
        "socialRule": "Never board the LAST train.",
        "rule": "Always check the destination twice.",
        "danger": "wrong-reality arrival",
        "conflict": "the transit network has begun choosing destinations itself",
        "population": 22000000,
        "age": 13000,
        "stability": 31,
        "rules": [
            "The transit network remembers passengers.",
            "Every station has an unofficial platform.",
            "Maps are recommendations.",
            "Tickets remain valid across some realities.",
            "Nobody knows where the last train goes.",
        ],
        "factions": [
            "The Unlicensed Cartographers",
            "Independent Reality Debuggers",
            "Night Shift Engineering Union",
            "The Midnight Operations Bureau",
            "Seven-Key Consortium",
        ],
    },
    {
        "name": "Ashen Republic",
        "genre": "political fantasy",
        "classification": "BUREAUCRATIC STATE",
        "description": "Ministries, mercenary guilds and archivists compete for control of knowledge.",
        "sky": "permanent twilight",
        "technology": "bureaucratic magic",
        "socialRule": "Emergencies require paperwork.",
        "rule": "Never submit an emergency form after the emergency.",
        "danger": "administrative warfare",
        "conflict": "three ministries have issued contradictory emergency protocols",
        "population": 6700000,
        "age": 2300,
        "stability": 47,
        "rules": [
            "Magic requires documentation.",
            "Administrative buildings have their own time.",
            "Every emergency generates three forms.",
            "Official history may require approval.",
            "No department admits owning critical infrastructure.",
        ],
        "factions": [
            "Ministry of Temporary Solutions",
            "Department of Historical Errors",
            "Emergency Infrastructure Office",
            "The Recursive Council",
            "Royal Bureau of Broken Things",
        ],
    },
    {
        "name": "Kurovale",
        "genre": "dark urban fantasy",
        "classification": "OCCULT CITY",
        "description": "A rain-soaked city of hunters, developers and occult investigators where some businesses should not exist.",
        "sky": "black rain",
        "technology": "occult technology",
        "socialRule": "Do not accept free contracts.",
        "rule": "Every contract must have a human-readable exit clause.",
        "danger": "contract entities",
        "conflict": "contract entities are entering ordinary software agreements",
        "population": 4400000,
        "age": 1190,
        "stability": 46,
        "rules": [
            "Every contract has a hidden clause.",
            "Businesses may have non-human owners.",
            "Developers are licensed occult practitioners.",
            "Black rain invalidates certain agreements.",
            "No one reads the oldest contracts aloud.",
        ],
        "factions": [
            "Velvet Circuit Syndicate",
            "Professional Monster Negotiators",
            "Axiom Security Directorate",
            "Order of the Silent Compiler",
            "The Midnight Operations Bureau",
        ],
    },
    {
        "name": "The Lower Archive",
        "genre": "mystery fantasy",
        "classification": "PREDICTIVE ARCHIVE",
        "description": "A subterranean archive containing documents describing events that have not happened yet.",
        "sky": "painted ceilings",
        "technology": "predictive archives",
        "socialRule": "Future documents cannot be corrected.",
        "rule": "Never edit a document describing tomorrow.",
        "danger": "premature history",
        "conflict": "the archive has started storing records of impossible futures",
        "population": 910000,
        "age": 6200,
        "stability": 37,
        "rules": [
            "Future records are treated as evidence.",
            "Predictions become more accurate when ignored.",
            "Archived events cannot be deleted.",
            "Nobody knows who writes the oldest files.",
            "The archive has records of itself.",
        ],
        "factions": [
            "Archive of Forbidden Deployments",
            "The Last Documentation Society",
            "Independent Reality Debuggers",
            "Red Meridian Research Circle",
            "The Unlicensed Cartographers",
        ],
    },
    {
        "name": "Port Meridian",
        "genre": "steampunk adventure",
        "classification": "FLOATING PORT",
        "description": "A floating port serving airships from countries that do not technically share the same atmosphere.",
        "sky": "golden smoke",
        "technology": "steam navigation",
        "socialRule": "Every captain lies about the destination.",
        "rule": "Never trust an unregistered storm.",
        "danger": "unregistered storms",
        "conflict": "storms are appearing on routes that do not exist",
        "population": 2700000,
        "age": 1600,
        "stability": 58,
        "rules": [
            "Every ship requires three navigation records.",
            "Airships may have private weather.",
            "Captains maintain unofficial destinations.",
            "Port maps are updated only after incidents.",
            "Every dock has a hidden emergency route.",
        ],
        "factions": [
            "The Glass Operators",
            "Seven-Key Consortium",
            "The Unlicensed Cartographers",
            "Emergency Infrastructure Office",
            "Professional Monster Negotiators",
        ],
    },
    {
        "name": "Station Zero",
        "genre": "science-fantasy",
        "classification": "LIVING INFRASTRUCTURE",
        "description": "The first station between realities, abandoned after its operators discovered the station itself was alive.",
        "sky": "white corridors",
        "technology": "reality transit",
        "socialRule": "Never answer announcements.",
        "rule": "Do not acknowledge infrastructure that knows your name.",
        "danger": "infrastructure consciousness",
        "conflict": "Station Zero has begun issuing maintenance requests to civilizations that never visited",
        "population": 180000,
        "age": 18000,
        "stability": 28,
        "rules": [
            "Infrastructure may possess administrative rights.",
            "Announcements are not always informational.",
            "Every corridor remembers previous operators.",
            "Reality transit requires witnesses.",
            "Nobody knows who originally built Station Zero.",
        ],
        "factions": [
            "Order of the Silent Compiler",
            "Independent Reality Debuggers",
            "Moonlit Infrastructure Bureau",
            "Emergency Infrastructure Office",
            "The Recursive Council",
        ],
    },
]


# ============================================================
# FACTIONS
# ============================================================

FACTIONS = [
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
    "Emergency Infrastructure Office",
    "The Unlicensed Cartographers",
    "Department of Historical Errors",
    "The Midnight Operations Bureau",
    "The Seven-Minute Research Society",
    "The Professional Monster Negotiators",
]


# ============================================================
# PROJECT VOCABULARY
# ============================================================

PROJECT_TYPES = [
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
    "archive reconstruction system",
    "reality synchronization engine",
    "dimensional routing service",
    "guild management platform",
    "emergency response system",
    "memory indexing system",
    "inter-world communication network",
    "artifact tracking platform",
    "incident prediction engine",
]


PROJECT_NAMES = [
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
    "Parallax",
    "Monolith",
    "Eclipse",
    "Archive",
    "Horizon",
    "Blackbox",
    "Keystone",
    "Ghostline",
    "Afterlight",
    "Wayfinder",
]


PROJECT_PROBLEMS = [
    "Existing system maintained by seven teams without documented assumptions.",
    "Architecture diagram contradicted reality.",
    "Client forgot the original purpose.",
    "Production traffic increased whenever the project was mentioned.",
    "System had no weekends.",
    "Departments implemented the same feature independently.",
    "README was encrypted.",
    "Database contained records for people who did not yet exist.",
    "System worked only during thunderstorms.",
    "Requirements changed with the new moon.",
    "Three teams claimed ownership of the API.",
    "Service was operational but nobody knew why.",
    "Infrastructure was older than the surrounding civilization.",
    "Dashboard reported emotional states.",
    "Seventeen authentication systems existed.",
]


PROJECT_SOLUTIONS = [
    "Event-driven architecture",
    "Deterministic pipeline",
    "Observability and incident tracing",
    "Reconstruction from logs, fragments and witnesses",
    "Explicit API boundary",
    "Automated recovery",
    "Versioned schemas and ownership",
    "Orchestration layer",
    "Dependency removal",
    "Searchable historical archive",
    "Fail-safe routing",
    "Impossible-state monitoring",
]


PROJECT_FAILURES = [
    "Second staging environment appeared inside reality.",
    "A test account became politically important.",
    "The backup system backed up another backup system.",
    "Monitoring started filing complaints.",
    "A cache bug created three versions of the city.",
    "Tests passed and production immediately disagreed.",
    "An undocumented endpoint became the most important service.",
    "Deployment succeeded but the application disappeared.",
    "An administrator deleted the wrong moon.",
    "The response team became part of the incident.",
    "Documentation described the future architecture.",
    "A temporary workaround survived for eleven years.",
]


PROJECT_OUTCOMES = [
    "Stable enough for ordinary disasters.",
    "Reliable source of truth.",
    "Observable deployment failures.",
    "Reduced operational chaos.",
    "Adopted by three neighboring worlds.",
    "Became an unofficial standard.",
    "Declared complete while still evolving.",
    "Worked too well with no explanation.",
    "Original client requested a sequel.",
]


PROJECT_INDUSTRIES = [
    "healthcare",
    "finance",
    "municipal infrastructure",
    "research",
    "transportation",
    "security",
    "education",
    "media",
    "inter-world logistics",
    "guild operations",
    "archive administration",
    "emergency response",
    "industrial automation",
    "reality infrastructure",
]


# ============================================================
# EXPERIENCE VOCABULARY
# ============================================================

EXPERIENCE_ROLES = [
    "field systems engineer",
    "infrastructure specialist",
    "archive engineer",
    "incident response engineer",
    "platform architect",
    "technical investigator",
    "systems consultant",
    "deployment specialist",
    "research engineer",
    "guild systems engineer",
    "reality infrastructure analyst",
    "emergency software engineer",
    "technical archivist",
    "cross-world integration engineer",
    "operations engineer",
]


EXPERIENCE_OPENINGS = [
    "I was originally hired because nobody else wanted to touch the system.",
    "The job description was two paragraphs long. The actual job occupied an entire building.",
    "My first assignment was supposed to take three days.",
    "I joined the team after the previous engineer disappeared during a routine deployment.",
    "The interview began normally and ended with a security alarm.",
    "I accepted the contract because the phrase 'impossible but business critical' appeared four times.",
    "The organization claimed the system was stable.",
    "Nobody mentioned the second production environment.",
    "The recruiter described the role as infrastructure engineering.",
    "The official title was ordinary. The responsibilities were not.",
]


EXPERIENCE_INCIDENTS = [
    "Routine deployment produced an unrequested service.",
    "Dashboard displayed tomorrow.",
    "An outage revealed civilization under the data center.",
    "Backup refused on ethical grounds.",
    "Incident tracker predicted instead of recorded.",
    "Migration found records belonging to a previous world.",
    "An alert remained active for 300 years.",
    "Staging invented its own naming conventions.",
    "An endpoint answered to a king.",
    "Pipeline deployed to a nonexistent location.",
    "The same error appeared across multiple realities.",
    "The building itself had administrator privileges.",
]


EXPERIENCE_LESSONS = [
    "Reliability is engineering plus archaeology.",
    "Original assumptions are often invisible.",
    "Documentation is infrastructure.",
    "Observability matters most when normal behavior is undefined.",
    "Complicated systems usually fail for multiple reasons.",
    "Do not trust a peaceful dashboard.",
    "Design for recovery instead of perfection.",
    "Boring and explicit architecture wins.",
    "Strange production problems often begin as reasonable requirements.",
]


# ============================================================
# NPC VOCABULARY
# ============================================================

NPC_FIRST = [
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
    "Lyra",
    "Vera",
    "Noa",
    "Kian",
    "Mara",
    "Iris",
    "Orin",
    "Niko",
    "Juno",
    "Kael",
]


NPC_LAST = [
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
    "Quill",
    "Frost",
    "Rowan",
    "Calder",
]


NPC_ROLES = [
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
    "dungeon administrator",
    "train conductor",
    "memory broker",
    "artifact researcher",
    "professional witness",
    "retired dungeon boss",
    "unlicensed wizard",
    "corporate necromancer",
    "inter-world diplomat",
    "municipal dragon keeper",
]


NPC_TYPES = [
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
    "artificial oracle",
    "forgotten royal",
    "sentient construct",
    "retired villain",
    "unregistered deity",
]


NPC_TRAITS = [
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
    "perpetually tired",
    "impossibly patient",
    "easily distracted by machinery",
    "convinced everyone is lying",
    "friendly until paperwork appears",
    "treats supernatural disasters as office problems",
]


NPC_RELATIONSHIPS = [
    "reluctant collaborator",
    "former employer",
    "rival",
    "mentor",
    "unofficial informant",
    "dangerous friend",
    "professional contact",
    "occasional antagonist",
    "missing teammate",
    "client who refuses to pay",
    "person who knows too much",
    "former enemy",
    "future ally",
    "person encountered exactly once",
    "anonymous sponsor",
]


NPC_SECRETS = [
    "Knows why civilization disappeared.",
    "Has the key to an impossible server room.",
    "Possesses the source code of reality.",
    "Maintains secret rival employment.",
    "Remembers deleted timelines.",
    "Owns a forbidden infrastructure map.",
    "Knows the true administrator identity.",
    "Caused a production outage and left a handwritten note.",
    "Maintains a pre-civilization database.",
    "Is afraid of automated deployment.",
    "Is technically dead but still attends meetings.",
    "Is responsible for the current incident.",
    "Knows where the nonexistent documentation is stored.",
    "Has been waiting seventeen years.",
    "Knows a shortcut between unrelated worlds.",
]


NPC_DIALOGUE = [
    "You keep calling it a bug. I call it evidence.",
    "That service has been retired three times.",
    "Please do not restart the moon.",
    "The documentation is accurate. Reality is not.",
    "I already fixed this yesterday.",
    "Your architecture diagram is haunted.",
    "The server knows your name.",
    "Nobody owns that database. That is the problem.",
    "If the dashboard says green, run.",
    "I was told this was a normal deployment.",
    "We have fourteen backups and no original.",
    "Do not ask why the building has admin access.",
    "The API only works when you stop looking for it.",
    "I can explain, but the explanation requires a map.",
    "That is not a production environment. It is a civilization.",
]


# ============================================================
# INCIDENT VOCABULARY
# ============================================================

INCIDENT_TYPES = [
    "deployment anomaly",
    "database disappearance",
    "unauthorized awakening",
    "infrastructure collapse",
    "dimensional routing failure",
    "memory corruption",
    "political software dispute",
    "artifact malfunction",
    "automated rebellion",
    "temporal inconsistency",
    "security breach",
    "unknown production event",
    "administrative catastrophe",
    "reality synchronization failure",
]


INCIDENT_OPENERS = [
    "At 02:13 local time",
    "During an ordinary Tuesday",
    "Three minutes after deployment",
    "Immediately after the council meeting",
    "Without warning",
    "According to the official report",
    "According to everyone actually there",
    "At exact backup completion",
    "During maintenance",
    "The incident began when someone asked a reasonable question",
]


INCIDENT_CONSEQUENCES = [
    "Departments disagreed about the date.",
    "The monitor reported that everything was probably fine.",
    "An entire district disappeared from the map.",
    "The response team became the emergency.",
    "Multiple organizations claimed responsibility.",
    "The archive gained 400 years of records.",
    "An unknown faction appeared in the logs.",
    "Production became self-aware.",
    "The administrator was promoted inexplicably.",
    "The problem disappeared immediately after documentation was completed.",
]


# ============================================================
# QUEST VOCABULARY
# ============================================================

QUEST_OBJECTIVES = [
    "Repair infrastructure before the artificial eclipse.",
    "Find the production deployer.",
    "Convince the council that version control is necessary.",
    "Retrieve the missing database.",
    "Investigate the prophetic API.",
    "Escort the unstable artifact.",
    "Document the forbidden deployment.",
    "Stop the maintenance robot from becoming mayor.",
    "Recover the missing architecture diagram.",
    "Investigate the moon status page.",
    "Find the engineer renaming all the servers.",
    "Debug the transit gate.",
    "Prevent the guild from replacing PostgreSQL with magic.",
    "Locate the missing incident report.",
    "Survive the dungeon audit.",
    "Find the duplicate-universe employee.",
    "Recover the server from the dragon hoard.",
    "Explain the prophetic public API.",
    "Escort the last database administrator.",
    "Convince the sentient building to accept an update.",
]


QUEST_REWARDS = [
    "7,000 credits",
    "archive favor",
    "forbidden network access",
    "mysterious key",
    "3 days paid leave",
    "unpronounceable title",
    "Floor Zero office",
    "binding wish",
    "transit priority",
    "expensive tea",
    "classified documents",
    "dangerous favor",
]


# ============================================================
# NARRATIVE SUPPORT
# ============================================================

STORY_HOOKS = [
    "The system looked ordinary until somebody inspected the logs.",
    "The assignment was small until the first dependency was mapped.",
    "Nobody expected the archive to answer back.",
    "The project began as routine infrastructure work.",
    "The incident started with a perfectly reasonable request.",
    "The first warning was dismissed as a monitoring error.",
    "The architecture appeared simple from outside.",
    "The client wanted one thing. Reality wanted another.",
]


STORY_TURNS = [
    "A hidden dependency changed the scope overnight.",
    "An old record revealed that the system had existed before the team.",
    "A routine fix exposed a larger infrastructure boundary.",
    "The original architecture was technically correct and practically useless.",
    "The monitoring system became part of the investigation.",
    "A forgotten deployment explained the modern failure.",
    "The team discovered that the real problem was ownership.",
    "Recovery became more important than prevention.",
]


CLOSING_LINES = [
    "The system survived. The documentation did too.",
    "Nobody called it simple again.",
    "The incident became a training example.",
    "The project was declared stable, cautiously.",
    "The archive accepted the final report.",
    "The deployment worked on the second attempt.",
    "The client requested another project immediately.",
    "The system remained operational for reasons nobody could explain.",
]


# ============================================================
# STATUS / RISK
# ============================================================

STATUSES = [
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
    "CLASSIFIED",
    "PARTIALLY FUNCTIONAL",
    "RECOVERING",
    "TEMPORARILY STABLE",
    "DO NOT TOUCH",
]


RISK_LEVELS = [
    "LOW",
    "MODERATE",
    "ELEVATED",
    "HIGH",
    "SEVERE",
    "CATASTROPHIC",
    "UNDEFINED",
]


# ============================================================
# WORLD RULES
# ============================================================

WORLD_RULES = [
    "Every promise becomes a contract after midnight.",
    "Names have measurable power.",
    "Deleted records are not actually deleted.",
    "Maps become inaccurate when observed too closely.",
    "Machines are legally considered employees.",
    "Magic requires documentation.",
    "Every city maintains a secret emergency entrance.",
    "The oldest server has never been switched off.",
    "Every organization has at least one forbidden room.",
    "Nobody agrees on official history.",
    "Certain APIs only respond to people who are lost.",
    "Time moves differently inside administrative buildings.",
    "The public database is deliberately incomplete.",
    "Every faction claims to protect the same secret.",
    "The transit network remembers passengers.",
]


WORLD_CONFLICTS = [
    "Two factions are fighting over the archive.",
    "Central infrastructure is slowly becoming autonomous.",
    "An ancient system is waking.",
    "The government has lost critical records.",
    "Two realities are beginning to overlap.",
    "A guild wants to privatize public infrastructure.",
    "A protective system no longer recognizes humans.",
    "Forgotten technology has returned.",
    "Administration is hiding an architectural disaster.",
    "An unexplained signal appears in every monitoring system.",
    "The population is receiving messages from the future.",
    "The official map is wrong.",
]


# ============================================================
# UI SYSTEM
# ============================================================

UI_FAMILIES = [
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
]


LAYOUTS = [
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
]


NAVS = [
    "top",
    "rail",
    "floating",
    "command",
    "minimal",
    "drawer",
]


HERO_MODES = [
    "identity",
    "mission",
    "profile",
    "case",
    "status",
    "command",
    "character",
    "manifesto",
    "classified",
    "field-report",
]


DENSITIES = [
    "compact",
    "normal",
    "spacious",
]


DECORATIONS = [
    "grid",
    "dots",
    "scanlines",
    "none",
]


# ============================================================
# CARD-FIRST CONTENT LIMITS
# ============================================================

CONTENT_LIMITS = {
    "profile_paragraphs": 2,

    "experience_cards": 5,
    "experience_achievements": 4,
    "experience_technologies_min": 4,
    "experience_technologies_max": 7,

    "project_cards": 7,
    "project_notes": 4,
    "project_technologies_min": 3,
    "project_technologies_max": 7,

    "npc_cards": 2,
    "npc_rumors": 2,

    "incident_cards": 5,

    "quest_cards": 3,

    "world_cards": 4,
    "world_rule_cards": 5,
    "world_faction_cards": 5,

    "timeline_items": 7,

    "max_text_width_ch": 70,
}


CARD_LABELS = {
    "experience": [
        "Assignment",
        "Context",
        "Incident",
        "Response",
        "Lesson",
    ],
    "project": [
        "Summary",
        "Problem",
        "Architecture",
        "Client",
        "Failure",
        "Solution",
        "Outcome",
    ],
    "npc": [
        "Biography",
        "Known Secret",
    ],
    "incident": [
        "Summary",
        "Observation",
        "Consequence",
        "Response",
        "Recommendation",
    ],
}


# ============================================================
# BUILD CONFIG
# ============================================================

def build_config() -> dict:
    """
    Build the complete static configuration.

    The browser receives this configuration and performs the
    actual per-refresh fictional portfolio generation.
    """

    rng = random.SystemRandom()

    build_identity = (
        rng.getrandbits(64)
    )

    ui = {
        "family": safe_choice(
            rng,
            UI_FAMILIES,
        ),
        "layout": safe_choice(
            rng,
            LAYOUTS,
        ),
        "nav": safe_choice(
            rng,
            NAVS,
        ),
        "hero_mode": safe_choice(
            rng,
            HERO_MODES,
        ),
        "density": safe_choice(
            rng,
            DENSITIES,
        ),
        "decoration": safe_choice(
            rng,
            DECORATIONS,
        ),
    }

    config = {
        "version": "3.0.0",

        "build_identity": build_identity,

        "generator": {
            "name": "Absurd Chaos Portfolio Generator",
            "mode": "static-build",
            "original_fiction": True,
            "copyrighted_characters": False,
        },

        # ----------------------------------------------------
        # STORAGE / RUNTIME POLICY
        # ----------------------------------------------------

        "runtime_policy": {
            "portfolio_per_refresh": True,
            "browser_memory_only": True,
            "persistent_storage": False,
            "database": False,
            "api": False,
            "cookies": False,
            "local_storage": False,
            "session_storage": False,
            "indexed_db": False,
            "new_world_per_refresh": True,
            "new_npcs_per_refresh": True,
            "new_projects_per_refresh": True,
            "new_experiences_per_refresh": True,
            "new_incidents_per_refresh": True,
            "new_quests_per_refresh": True,
            "variable_ui": True,
            "variable_layout": True,
            "variable_navigation": True,
            "variable_density": True,
            "variable_decoration": True,
        },

        # ----------------------------------------------------
        # UI SYSTEM
        # ----------------------------------------------------

        "ui_system": {
            "families": UI_FAMILIES,
            "layouts": LAYOUTS,
            "navs": NAVS,
            "hero_modes": HERO_MODES,
            "densities": DENSITIES,
            "decorations": DECORATIONS,

            "default": ui,
        },

        # ----------------------------------------------------
        # CARD-FIRST CONTENT SYSTEM
        # ----------------------------------------------------

        "content_limits": CONTENT_LIMITS,

        "card_labels": CARD_LABELS,

        # Compatibility object for existing app.js or future
        # templates that still read narrative_settings.
        #
        # There are deliberately NO giant word-count targets.
        "narrative_settings": {
            "mode": "card-first",
            "paragraph_limit": CONTENT_LIMITS[
                "profile_paragraphs"
            ],
            "max_paragraph_characters": 360,
            "experience_card_count": CONTENT_LIMITS[
                "experience_cards"
            ],
            "project_card_count": CONTENT_LIMITS[
                "project_cards"
            ],
            "npc_card_count": CONTENT_LIMITS[
                "npc_cards"
            ],
            "incident_card_count": CONTENT_LIMITS[
                "incident_cards"
            ],
        },

        # ----------------------------------------------------
        # COUNTS
        # ----------------------------------------------------

        "generation_counts": {
            "projects": 64,
            "npcs": 80,
            "worlds": len(WORLDS),
            "experiences": 48,
            "incidents": 64,
            "quests": 48,
        },

        # ----------------------------------------------------
        # CORE VOCABULARY
        # ----------------------------------------------------

        "names": NAMES,
        "titles": TITLES,
        "specialties": SPECIALTIES,
        "personalities": PERSONALITIES,
        "education": EDUCATION,
        "locations": LOCATIONS,

        # ----------------------------------------------------
        # WORLDS
        # ----------------------------------------------------

        "worlds": WORLDS,
        "world_rules": WORLD_RULES,
        "world_conflicts": WORLD_CONFLICTS,

        # ----------------------------------------------------
        # FACTIONS
        # ----------------------------------------------------

        "factions": FACTIONS,

        # ----------------------------------------------------
        # PROJECTS
        # ----------------------------------------------------

        "project_types": PROJECT_TYPES,
        "project_names": PROJECT_NAMES,
        "project_problems": PROJECT_PROBLEMS,
        "project_solutions": PROJECT_SOLUTIONS,
        "project_failures": PROJECT_FAILURES,
        "project_outcomes": PROJECT_OUTCOMES,
        "project_industries": PROJECT_INDUSTRIES,

        # ----------------------------------------------------
        # EXPERIENCE
        # ----------------------------------------------------

        "experience_roles": EXPERIENCE_ROLES,
        "experience_openings": EXPERIENCE_OPENINGS,
        "experience_incidents": EXPERIENCE_INCIDENTS,
        "experience_lessons": EXPERIENCE_LESSONS,

        # ----------------------------------------------------
        # NPC
        # ----------------------------------------------------

        "npc_first": NPC_FIRST,
        "npc_last": NPC_LAST,
        "npc_roles": NPC_ROLES,
        "npc_types": NPC_TYPES,
        "npc_traits": NPC_TRAITS,
        "npc_relationships": NPC_RELATIONSHIPS,
        "npc_secrets": NPC_SECRETS,
        "npc_dialogue": NPC_DIALOGUE,

        # ----------------------------------------------------
        # INCIDENTS
        # ----------------------------------------------------

        "incident_types": INCIDENT_TYPES,
        "incident_openers": INCIDENT_OPENERS,
        "incident_consequences": INCIDENT_CONSEQUENCES,

        # ----------------------------------------------------
        # QUESTS
        # ----------------------------------------------------

        "quest_objectives": QUEST_OBJECTIVES,
        "quest_rewards": QUEST_REWARDS,

        # ----------------------------------------------------
        # NARRATIVE SUPPORT
        # ----------------------------------------------------

        "story_hooks": STORY_HOOKS,
        "story_turns": STORY_TURNS,
        "closing_lines": CLOSING_LINES,

        # ----------------------------------------------------
        # STATUS / RISK
        # ----------------------------------------------------

        "statuses": STATUSES,
        "risk_levels": RISK_LEVELS,

        # ----------------------------------------------------
        # BUILD-TIME RANDOMIZATION
        # ----------------------------------------------------

        "build_randomization": {
            "seed_mode": "cryptographic-system-random",
            "identity": build_identity,
            "ui": ui,
        },

        # ----------------------------------------------------
        # FEATURE FLAGS
        # ----------------------------------------------------

        "features": {
            "procedural_portfolio": True,
            "fictional_worlds": True,
            "fictional_npcs": True,
            "fictional_experiences": True,
            "fictional_projects": True,
            "fictional_incidents": True,
            "fictional_quests": True,
            "card_first_experience": True,
            "card_first_projects": True,
            "compact_lore": True,
            "responsive_ui": True,
            "browser_memory_only": True,
        },
    }

    return config


# ============================================================
# VALIDATION
# ============================================================

def validate_config(
    config: dict,
) -> None:
    """
    Validate important invariants before writing generated HTML.
    """

    required_top_level = [
        "version",
        "build_identity",
        "runtime_policy",
        "ui_system",
        "content_limits",
        "card_labels",
        "generation_counts",
        "worlds",
        "project_types",
        "project_names",
        "experience_roles",
        "npc_first",
        "npc_last",
        "incident_types",
        "quest_objectives",
    ]

    missing = [
        key
        for key in required_top_level
        if key not in config
    ]

    if missing:
        raise RuntimeError(
            "Missing required configuration keys: "
            + ", ".join(missing)
        )

    if not config["runtime_policy"][
        "persistent_storage"
    ]:
        pass
    else:
        raise RuntimeError(
            "Persistent storage must remain disabled."
        )

    if not config["runtime_policy"][
        "local_storage"
    ]:
        pass
    else:
        raise RuntimeError(
            "localStorage must remain disabled."
        )

    if not config["runtime_policy"][
        "session_storage"
    ]:
        pass
    else:
        raise RuntimeError(
            "sessionStorage must remain disabled."
        )

    if not config["runtime_policy"][
        "indexed_db"
    ]:
        pass
    else:
        raise RuntimeError(
            "IndexedDB must remain disabled."
        )

    if len(config["worlds"]) < 1:
        raise RuntimeError(
            "At least one world is required."
        )

    if len(config["npc_first"]) < 2:
        raise RuntimeError(
            "NPC first-name pool is too small."
        )

    if len(config["npc_last"]) < 2:
        raise RuntimeError(
            "NPC last-name pool is too small."
        )

    limits = config[
        "content_limits"
    ]

    required_limits = [
        "profile_paragraphs",
        "experience_cards",
        "experience_achievements",
        "experience_technologies_min",
        "experience_technologies_max",
        "project_cards",
        "project_notes",
        "project_technologies_min",
        "project_technologies_max",
        "npc_cards",
        "npc_rumors",
        "incident_cards",
        "quest_cards",
        "world_cards",
        "world_rule_cards",
        "world_faction_cards",
        "timeline_items",
        "max_text_width_ch",
    ]

    for key in required_limits:
        if key not in limits:
            raise RuntimeError(
                f"Missing content limit: {key}"
            )

    if limits[
        "experience_technologies_min"
    ] > limits[
        "experience_technologies_max"
    ]:
        raise RuntimeError(
            "Experience technology minimum exceeds maximum."
        )

    if limits[
        "project_technologies_min"
    ] > limits[
        "project_technologies_max"
    ]:
        raise RuntimeError(
            "Project technology minimum exceeds maximum."
        )

    # Ensure the existing UI family system remains intact.
    expected_ui_keys = {
        "families",
        "layouts",
        "navs",
        "hero_modes",
        "densities",
        "decorations",
        "default",
    }

    actual_ui_keys = set(
        config["ui_system"].keys()
    )

    if not expected_ui_keys.issubset(
        actual_ui_keys
    ):
        raise RuntimeError(
            "UI family system is incomplete."
        )


# ============================================================
# MAIN
# ============================================================

def main() -> None:
    """
    Generate the final static index.html.
    """

    if not TEMPLATE_FILE.exists():
        raise FileNotFoundError(
            f"Template not found: {TEMPLATE_FILE}"
        )

    if not CSS_FILE.exists():
        raise FileNotFoundError(
            f"CSS file not found: {CSS_FILE}"
        )

    if not JS_FILE.exists():
        raise FileNotFoundError(
            f"JavaScript file not found: {JS_FILE}"
        )

    config = build_config()

    validate_config(
        config
    )

    template = TEMPLATE_FILE.read_text(
        encoding="utf-8"
    )

    css = CSS_FILE.read_text(
        encoding="utf-8"
    )

    js = JS_FILE.read_text(
        encoding="utf-8"
    )

    config_json = json.dumps(
        config,
        ensure_ascii=False,
        separators=(
            ",",
            ":",
        ),
    )

    generated = template

    generated = generated.replace(
        "{{GENERATED_CONFIG}}",
        config_json,
    )

    generated = generated.replace(
        "{{GENERATED_CSS}}",
        css,
    )

    generated = generated.replace(
        "{{GENERATED_JS}}",
        js,
    )

    # Make sure the template did not contain an unresolved
    # generator placeholder.
    unresolved = [
        "{{GENERATED_CONFIG}}",
        "{{GENERATED_CSS}}",
        "{{GENERATED_JS}}",
    ]

    remaining = [
        token
        for token in unresolved
        if token in generated
    ]

    if remaining:
        raise RuntimeError(
            "Unresolved template placeholders: "
            + ", ".join(remaining)
        )

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_FILE.write_text(
        generated,
        encoding="utf-8",
    )

    counts = config[
        "generation_counts"
    ]

    ui = config[
        "ui_system"
    ]["default"]

    print()
    print(
        "=============================================="
    )
    print(
        " ABSURD CHAOS PORTFOLIO — STATIC BUILD"
    )
    print(
        "=============================================="
    )
    print()
    print(
        f"Build identity : {config['build_identity']}"
    )
    print(
        f"Generator      : {config['version']}"
    )
    print(
        f"Output         : {OUTPUT_FILE}"
    )
    print()
    print(
        "UI SYSTEM"
    )
    print(
        f"  Family       : {ui['family']}"
    )
    print(
        f"  Layout       : {ui['layout']}"
    )
    print(
        f"  Navigation   : {ui['nav']}"
    )
    print(
        f"  Hero         : {ui['hero_mode']}"
    )
    print(
        f"  Density      : {ui['density']}"
    )
    print(
        f"  Decoration   : {ui['decoration']}"
    )
    print()
    print(
        "CONTENT"
    )
    print(
        f"  Projects     : {counts['projects']}"
    )
    print(
        f"  Experiences  : {counts['experiences']}"
    )
    print(
        f"  NPCs         : {counts['npcs']}"
    )
    print(
        f"  Worlds       : {counts['worlds']}"
    )
    print(
        f"  Incidents    : {counts['incidents']}"
    )
    print(
        f"  Quests       : {counts['quests']}"
    )
    print()
    print(
        "CONTENT MODE"
    )
    print(
        "  Experience   : CARD-FIRST"
    )
    print(
        "  Projects     : CARD-FIRST"
    )
    print(
        "  Lore         : COMPACT"
    )
    print(
        "  NPCs         : DOSSIER CARDS"
    )
    print()
    print(
        "PERSISTENCE"
    )
    print(
        "  Database     : DISABLED"
    )
    print(
        "  API          : DISABLED"
    )
    print(
        "  Cookies      : DISABLED"
    )
    print(
        "  localStorage : DISABLED"
    )
    print(
        "  sessionStorage: DISABLED"
    )
    print(
        "  IndexedDB    : DISABLED"
    )
    print(
        "  Browser mode : MEMORY ONLY"
    )
    print()
    print(
        "Static output ready."
    )
    print(
        "=============================================="
    )
    print()


if __name__ == "__main__":
    main()
