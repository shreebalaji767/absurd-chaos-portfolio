# ============================================================
# ABSURD CHAOS PORTFOLIO GENERATOR
# ============================================================
#
# Build-time generator for:
#
#   templates/index.html
#   static/style.css
#   static/app.js
#   generated/index.html
#
# IMPORTANT:
# - Static site
# - No database
# - No API
# - No cookies
# - No localStorage
# - No sessionStorage
# - No IndexedDB
# - Browser memory only
# - Every refresh creates a new fictional portfolio
# - UI family/layout/navigation/density/decoration remain random
# - Projects and experiences are CARD-FIRST
# - Fictional absurd/anime/manhwa-inspired world
# - Original characters only
#
# Run:
#
#   python3 generator.py
#
# ============================================================

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

def choose_many(rng, values, minimum=2, maximum=5):
    if not values:
        return []

    maximum = min(maximum, len(values))
    minimum = min(minimum, maximum)

    count = rng.randint(minimum, maximum)

    return rng.sample(values, count)


def unique_choices(rng, values, count):
    if not values:
        return []

    if count >= len(values):
        copied = list(values)
        rng.shuffle(copied)
        return copied

    return rng.sample(values, count)


def article_for(value):
    value = str(value).strip()

    if not value:
        return ""

    first = value[0].lower()

    if first in "aeiou":
        return f"an {value}"

    return f"a {value}"


def clean_text(value):
    if value is None:
        return ""

    return str(value).strip()


def card(label, text):
    return {
        "label": clean_text(label),
        "text": clean_text(text),
    }


def cards_from_pairs(pairs):
    return [
        card(label, text)
        for label, text in pairs
        if clean_text(label) and clean_text(text)
    ]


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
        "genre": "Cyberpunk",
        "description": "A megacity built around abandoned APIs, sacred databases, violet static, and infrastructure nobody remembers commissioning.",
        "technology": [
            "obsolete technology",
            "memory systems",
            "forgotten APIs",
            "archive infrastructure",
        ],
        "rules": [
            "Never delete anything without three witnesses.",
            "Nobody knows who owns the oldest server.",
            "Old infrastructure is treated as historical evidence.",
            "Backups are considered cultural artifacts.",
        ],
        "danger": "Memory corruption",
        "conflict": "Ancient infrastructure is being rebuilt without anyone knowing its original purpose.",
        "factions": [
            "The Last Documentation Society",
            "Archive of Forbidden Deployments",
            "Independent Reality Debuggers",
        ],
    },
    {
        "name": "Eidolon Prime",
        "genre": "Space Opera",
        "description": "A fractured interstellar civilization where engineers, diplomats, smugglers, and an unreliable moon share the same infrastructure.",
        "technology": [
            "quantum transit",
            "orbital infrastructure",
            "artificial auroras",
            "stellar routing",
        ],
        "rules": [
            "Every station uses its own time standard.",
            "Never trust an orbital status page.",
            "Moon ownership is still under negotiation.",
        ],
        "danger": "Orbital instability",
        "conflict": "A transit network has started routing ships through places that do not officially exist.",
        "factions": [
            "Azure Systems Guild",
            "Seven-Key Consortium",
            "Moonlit Infrastructure Bureau",
        ],
    },
    {
        "name": "The Seven-Layer Kingdom",
        "genre": "Fantasy",
        "description": "A vertical kingdom where every layer has its own economy, guilds, politics, laws, and infrastructure.",
        "technology": [
            "magic infrastructure",
            "floating citadels",
            "guild systems",
            "vertical transit",
        ],
        "rules": [
            "Profession must be declared before crossing layers.",
            "Every guild maintains its own infrastructure.",
            "Unauthorized elevator magic is punishable.",
        ],
        "danger": "Guild conflict",
        "conflict": "Three guilds are attempting to privatize the kingdom's public infrastructure.",
        "factions": [
            "Department of Unnecessary Architecture",
            "Royal Bureau of Broken Things",
            "The Recursive Council",
        ],
    },
    {
        "name": "Moonfall District",
        "genre": "Urban Fantasy",
        "description": "A city illuminated by moon fragments that should not exist and machinery that reacts whenever one disappears.",
        "technology": [
            "moon-reactive machinery",
            "gravity systems",
            "silver fragments",
            "urban automation",
        ],
        "rules": [
            "Do not count moon fragments.",
            "Never repair gravity during a full moon.",
            "Unknown moonlight is considered a maintenance warning.",
        ],
        "danger": "Gravity anomalies",
        "conflict": "A municipal system is trying to determine which moon the city belongs to.",
        "factions": [
            "Moonlit Infrastructure Bureau",
            "Night Shift Engineering Union",
            "The Glass Operators",
        ],
    },
    {
        "name": "The Black Meridian",
        "genre": "Dark Fantasy",
        "description": "A world where information has weight, secrets are currency, and memory is used as computational infrastructure.",
        "technology": [
            "memory computation",
            "secret markets",
            "information systems",
            "truth engines",
        ],
        "rules": [
            "Truth must be purchased.",
            "Secrets become heavier when repeated.",
            "Never publish undocumented historical data.",
        ],
        "danger": "Information predators",
        "conflict": "An unknown entity is consuming archived knowledge faster than it can be documented.",
        "factions": [
            "Red Meridian Research Circle",
            "The Last Documentation Society",
            "Professional Monster Negotiators",
        ],
    },
    {
        "name": "Aster-09",
        "genre": "Science Fiction",
        "description": "A research colony with two artificial suns where departments have invented incompatible calendars.",
        "technology": [
            "experimental infrastructure",
            "colony systems",
            "temporal services",
            "research automation",
        ],
        "rules": [
            "Agree on the current year before beginning a meeting.",
            "Every department maintains its own calendar.",
            "Do not schedule maintenance during artificial sunrise.",
        ],
        "danger": "Temporal disagreement",
        "conflict": "Two departments are simultaneously operating in different years.",
        "factions": [
            "Seven-Minute Research Society",
            "Axiom Security Directorate",
            "Independent Reality Debuggers",
        ],
    },
    {
        "name": "Velorum City",
        "genre": "Modern Fantasy",
        "description": "A modern metropolis where awakened individuals, supernatural incidents, corporate infrastructure, and dungeon events coexist.",
        "technology": [
            "modern cloud systems",
            "awakened technology",
            "incident platforms",
            "supernatural monitoring",
        ],
        "rules": [
            "Do not discuss dungeon incidents during office hours.",
            "Awakened abilities must be registered.",
            "Blue electric storms trigger emergency procedures.",
        ],
        "danger": "Unexpected awakenings",
        "conflict": "A city monitoring platform has begun assigning supernatural classifications to software bugs.",
        "factions": [
            "Emergency Infrastructure Office",
            "Guild of Extremely Specific Problems",
            "Axiom Security Directorate",
        ],
    },
    {
        "name": "The Glass Continent",
        "genre": "High Fantasy",
        "description": "A crystalline civilization built around ancient transit gates nobody remembers how to repair.",
        "technology": [
            "crystalline magic",
            "transit gates",
            "constellation systems",
            "artifact networks",
        ],
        "rules": [
            "Broken glass is historical evidence.",
            "Never activate a gate without recording its destination.",
            "Constellations may not be trusted after midnight.",
        ],
        "danger": "Gate collapse",
        "conflict": "A transit gate has opened into an archived version of the continent.",
        "factions": [
            "The Glass Operators",
            "The Unlicensed Cartographers",
            "Archive of Forbidden Deployments",
        ],
    },
    {
        "name": "Sector Null",
        "genre": "Post-Apocalyptic Sci-Fi",
        "description": "Machines outnumber humans and have formed professional associations to negotiate working conditions.",
        "technology": [
            "industrial automation",
            "machine networks",
            "robot logistics",
            "autonomous infrastructure",
        ],
        "rules": [
            "Machines get lunch breaks.",
            "Automated labor disputes require human witnesses.",
            "Never restart a machine union server.",
        ],
        "danger": "Automated labor disputes",
        "conflict": "Industrial machines have requested infrastructure ownership.",
        "factions": [
            "Null Sector Maintainers",
            "Night Shift Engineering Union",
            "Department of Unnecessary Architecture",
        ],
    },
    {
        "name": "The Infinite Metro",
        "genre": "Surreal Fantasy",
        "description": "An endless transit network where commuters regularly arrive in realities they never intended to visit.",
        "technology": [
            "dimensional transportation",
            "transit routing",
            "reality gates",
            "passenger memory systems",
        ],
        "rules": [
            "Never board the LAST train.",
            "Keep your ticket even after arriving.",
            "Do not ask the conductor where the train is going.",
        ],
        "danger": "Wrong-reality arrival",
        "conflict": "A station has appeared between two realities that officially do not connect.",
        "factions": [
            "The Unlicensed Cartographers",
            "Independent Reality Debuggers",
            "The Recursive Council",
        ],
    },
    {
        "name": "Ashen Republic",
        "genre": "Political Fantasy",
        "description": "A permanent-twilight republic where ministries, guilds, mercenaries, and archivists fight over knowledge.",
        "technology": [
            "bureaucratic magic",
            "administrative systems",
            "document engines",
            "ministry networks",
        ],
        "rules": [
            "Emergencies require paperwork.",
            "Every document needs three signatures.",
            "Missing paperwork can invalidate reality.",
        ],
        "danger": "Administrative warfare",
        "conflict": "Two ministries have issued contradictory versions of the same infrastructure.",
        "factions": [
            "Ministry of Temporary Solutions",
            "Department of Historical Errors",
            "Emergency Infrastructure Office",
        ],
    },
    {
        "name": "Kurovale",
        "genre": "Dark Urban Fantasy",
        "description": "A rain-soaked city of hunters, developers, occult investigators, and businesses that should not exist.",
        "technology": [
            "occult technology",
            "contract systems",
            "urban automation",
            "black-market software",
        ],
        "rules": [
            "Do not accept free contracts.",
            "Black rain is an infrastructure warning.",
            "Unknown businesses must be reported.",
        ],
        "danger": "Contract entities",
        "conflict": "A contract engine has started assigning obligations to software services.",
        "factions": [
            "Velvet Circuit Syndicate",
            "Professional Monster Negotiators",
            "Night Shift Engineering Union",
        ],
    },
    {
        "name": "The Lower Archive",
        "genre": "Mystery Fantasy",
        "description": "A subterranean archive containing documents describing future events.",
        "technology": [
            "predictive archives",
            "future records",
            "memory indexing",
            "temporal databases",
        ],
        "rules": [
            "Future documents cannot be corrected.",
            "Never read a record dated tomorrow.",
            "Historical evidence may arrive early.",
        ],
        "danger": "Premature history",
        "conflict": "An incident report has appeared before the incident occurred.",
        "factions": [
            "The Last Documentation Society",
            "Red Meridian Research Circle",
            "Department of Historical Errors",
        ],
    },
    {
        "name": "Port Meridian",
        "genre": "Steampunk Adventure",
        "description": "A floating port where airships arrive from countries that technically do not share the same atmosphere.",
        "technology": [
            "steam navigation",
            "airship logistics",
            "mechanical automation",
            "weather routing",
        ],
        "rules": [
            "Every captain lies about the destination.",
            "Unregistered storms are treated as passengers.",
            "Never trust an airship manifest.",
        ],
        "danger": "Unregistered storms",
        "conflict": "An airship has arrived carrying cargo from a future version of the port.",
        "factions": [
            "The Unlicensed Cartographers",
            "Royal Bureau of Broken Things",
            "Seven-Key Consortium",
        ],
    },
    {
        "name": "Station Zero",
        "genre": "Science Fantasy",
        "description": "The first station between realities, abandoned after its operators discovered that the station itself was alive.",
        "technology": [
            "reality transit",
            "living infrastructure",
            "dimensional routing",
            "conscious architecture",
        ],
        "rules": [
            "Never answer station announcements.",
            "Do not rename corridors.",
            "The station remembers every visitor.",
        ],
        "danger": "Infrastructure consciousness",
        "conflict": "Station Zero is requesting an infrastructure upgrade.",
        "factions": [
            "Independent Reality Debuggers",
            "Archive of Forbidden Deployments",
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
    "The existing system was maintained by seven teams without documented assumptions.",
    "The architecture diagram contradicted production reality.",
    "The client forgot why the system existed.",
    "Production traffic increased whenever the project was mentioned.",
    "The system had no weekends.",
    "Three departments implemented the same feature independently.",
    "The README was encrypted.",
    "The database contained records for people who did not exist yet.",
    "The system worked only during thunderstorms.",
    "Requirements changed with every new moon.",
    "Three teams claimed ownership of the same API.",
    "The service was operational but nobody knew why.",
    "The infrastructure was older than the civilization using it.",
    "The dashboard reported emotional states.",
    "There were seventeen authentication systems.",
    "The backup contained another backup that contained nothing.",
    "The staging environment had more production traffic than production.",
    "Nobody could identify the original deployer.",
    "The application had an undocumented administrator.",
    "The monitoring system had started monitoring itself.",
]


PROJECT_SOLUTIONS = [
    "Rebuilt the system around an event-driven architecture.",
    "Created deterministic pipelines and explicit ownership boundaries.",
    "Introduced observability, incident tracing, and structured recovery.",
    "Reconstructed the platform from logs, fragments, and witness reports.",
    "Added an API boundary between incompatible departments.",
    "Implemented automated recovery and rollback verification.",
    "Introduced versioned schemas with explicit service ownership.",
    "Built an orchestration layer around legacy systems.",
    "Removed undocumented dependencies and isolated dangerous integrations.",
    "Created a searchable historical archive of infrastructure decisions.",
    "Added fail-safe routing for impossible states.",
    "Built monitoring specifically for reality-level inconsistencies.",
    "Separated operational telemetry from predictive data.",
    "Replaced implicit assumptions with boring explicit architecture.",
    "Added deployment verification before declaring a release successful.",
]


PROJECT_FAILURES = [
    "The second staging environment turned out to exist inside another reality.",
    "A test account became politically important.",
    "The backup system backed up the backup system.",
    "Monitoring submitted a formal complaint.",
    "A cache bug created three versions of the same city.",
    "Everything passed tests and failed in production.",
    "An undocumented endpoint turned out to be the most important service.",
    "The deployment succeeded but the application disappeared.",
    "An administrator deleted the wrong moon.",
    "The response team accidentally became part of the incident.",
    "The documentation described a future architecture.",
    "A temporary workaround lasted eleven years.",
    "A rollback restored an older version of reality.",
    "A health check began reporting philosophical objections.",
    "A staging database developed its own naming conventions.",
]


PROJECT_OUTCOMES = [
    "Stable enough for ordinary disasters.",
    "A reliable source of truth finally existed.",
    "Deployment failures became observable.",
    "Operational chaos was reduced to measurable chaos.",
    "The system was adopted by three neighboring worlds.",
    "The project became an unofficial standard.",
    "The platform was declared complete while still evolving.",
    "It worked far too well and nobody could explain why.",
    "The original client requested a sequel.",
    "The system survived the incident that created it.",
    "The infrastructure became boring, which was considered a major victory.",
    "The project remained operational after its original civilization disappeared.",
]


PROJECT_ARCHITECTURE = [
    "Event-driven services with explicit ownership boundaries.",
    "Layered architecture with a deterministic recovery path.",
    "API gateway, service registry, and versioned contracts.",
    "Pipeline architecture with immutable event history.",
    "Modular monolith with carefully isolated legacy boundaries.",
    "Distributed workers coordinated through a central queue.",
    "Observability-first infrastructure with structured incident traces.",
    "Hybrid legacy platform wrapped behind stable APIs.",
    "Fail-safe routing layer with environment verification.",
    "Archive-driven architecture with searchable historical state.",
    "Multi-stage deployment system with automatic rollback verification.",
]


PROJECT_IMPACTS = [
    "Reduced operational ambiguity.",
    "Made deployment state visible.",
    "Removed undocumented dependencies.",
    "Created reproducible infrastructure.",
    "Improved incident response.",
    "Reduced manual recovery work.",
    "Made ownership explicit.",
    "Turned impossible states into monitored states.",
    "Allowed multiple factions to share one platform.",
    "Prevented accidental cross-reality deployment.",
    "Made legacy systems explain themselves.",
]


PROJECT_NOTES = [
    "The strangest requirement became the most useful monitoring rule.",
    "Documentation was treated as part of the infrastructure.",
    "Every failure became a test case.",
    "Unknown behavior was logged before being 'fixed'.",
    "Recovery was designed before optimization.",
    "The architecture assumes someone will eventually misunderstand it.",
    "Every critical dependency has an owner.",
    "No service is allowed to silently change reality.",
    "Operational history is considered production data.",
    "The system prefers boring failure over mysterious success.",
]


PROJECT_TECHNOLOGY = [
    "Python",
    "JavaScript",
    "TypeScript",
    "PostgreSQL",
    "Redis",
    "Docker",
    "Linux",
    "REST",
    "GraphQL",
    "CI/CD",
    "Event Streams",
    "Observability",
    "Automation",
    "Cloud Infrastructure",
    "Security",
    "Workflow Engines",
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
    "The hiring manager said the system was simple.",
    "The first meeting included an emergency evacuation.",
]


EXPERIENCE_INCIDENTS = [
    "A routine deployment produced an unrequested service.",
    "The dashboard displayed tomorrow.",
    "An outage revealed another civilization underneath the data center.",
    "The backup refused to run on ethical grounds.",
    "The incident tracker began predicting incidents instead of recording them.",
    "A migration discovered records from a previous world.",
    "An alert had been active for three hundred years.",
    "The staging environment invented its own naming conventions.",
    "An endpoint answered to a king.",
    "A pipeline deployed to a location that did not exist.",
    "The same production error appeared across three realities.",
    "The building itself had administrator privileges.",
    "A monitoring agent became the incident commander.",
    "A rollback restored a historical version of the company.",
    "A routine health check triggered a city-wide emergency.",
]


EXPERIENCE_LESSONS = [
    "Reliability is engineering plus archaeology.",
    "Original assumptions become invisible infrastructure.",
    "Documentation is infrastructure.",
    "Observability matters most when normal behavior is undefined.",
    "Complicated systems usually fail for multiple reasons at once.",
    "Never trust a peaceful dashboard.",
    "Design for recovery before optimizing performance.",
    "Boring explicit architecture survives strange requirements.",
    "The strangest production problems usually begin as reasonable requirements.",
    "Every undocumented dependency eventually becomes somebody's emergency.",
    "If nobody knows who owns a service, the service owns everyone.",
    "A successful deployment is not proof that the correct thing was deployed.",
]


EXPERIENCE_RESPONSES = [
    "Mapped the system from logs, services, deployment history, and surviving documentation.",
    "Separated known behavior from unexplained behavior before changing anything.",
    "Built a recovery path first and optimized the system afterward.",
    "Introduced ownership boundaries and explicit service contracts.",
    "Reproduced the failure in an isolated environment before touching production.",
    "Added structured telemetry around every previously invisible boundary.",
    "Created a deployment verification layer.",
    "Reconstructed missing architecture from operational evidence.",
    "Converted undocumented behavior into explicit tests.",
    "Created a rollback strategy that verified destination before execution.",
    "Isolated legacy components behind stable interfaces.",
    "Replaced emergency scripts with repeatable automation.",
]


EXPERIENCE_OUTCOMES = [
    "The system became boring enough to operate.",
    "The incident stopped repeating.",
    "Production became observable.",
    "Recovery became repeatable.",
    "Ownership became explicit.",
    "Three teams stopped deploying the same service.",
    "The organization finally had a reliable architecture map.",
    "The system survived its next disaster without heroic intervention.",
    "The platform remained stable even after the original team left.",
    "The incident became a permanent regression test.",
    "Nobody fully understood the system, but everyone understood how to recover it.",
]


EXPERIENCE_ACHIEVEMENTS = [
    "Recovered undocumented services",
    "Built deployment verification",
    "Introduced structured observability",
    "Reduced manual incident response",
    "Reconstructed missing architecture",
    "Removed legacy dependencies",
    "Automated rollback verification",
    "Documented ownership boundaries",
    "Created recovery runbooks",
    "Converted incidents into regression tests",
    "Stabilized unreliable pipelines",
    "Recovered historical production data",
    "Built cross-system tracing",
    "Eliminated duplicate services",
    "Introduced explicit API contracts",
]


EXPERIENCE_TECHNOLOGIES = [
    "Python",
    "JavaScript",
    "TypeScript",
    "PostgreSQL",
    "Docker",
    "Linux",
    "Redis",
    "CI/CD",
    "REST APIs",
    "GraphQL",
    "Observability",
    "Automation",
    "Incident Response",
    "System Design",
    "Infrastructure",
]


# ============================================================
# NPC SYSTEM
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
    "knows why civilization disappeared",
    "holds the key to an impossible server room",
    "knows the source code of reality",
    "has secret rival employment",
    "remembers deleted timelines",
    "owns a forbidden infrastructure map",
    "knows the true administrator identity",
    "caused a production outage with a handwritten note",
    "possesses a pre-civilization database",
    "is afraid of automated deployment",
    "is technically dead but still attends meetings",
    "is responsible for the current incident",
    "knows where the nonexistent documentation is",
    "has been waiting for seventeen years",
    "knows a shortcut between unrelated worlds",
]


NPC_DIALOGUE = [
    "You keep calling it a bug. I call it evidence.",
    "That server has been here longer than the government.",
    "Please stop deploying things you cannot explain.",
    "The logs are lying, but only slightly.",
    "I know where production is. I cannot tell you which production.",
    "Do not touch the red button. It is currently working.",
    "The architecture diagram is technically a historical document.",
    "Someone deployed this before you were born.",
    "The outage is not the problem. The outage is the symptom.",
    "I can fix it. I cannot promise what it will become.",
    "Why does your monitoring system know my name?",
    "The database is not missing. It is elsewhere.",
    "We should probably not restart the moon.",
    "That endpoint belongs to nobody.",
    "The building has rejected your credentials.",
]


# ============================================================
# INCIDENTS
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
    "Immediately after a council meeting",
    "Without warning",
    "According to the official report",
    "According to everyone actually there",
    "At exact backup completion",
    "During scheduled maintenance",
    "The incident began when someone asked a reasonable question",
]


INCIDENT_CONSEQUENCES = [
    "Departments immediately disagreed about the date.",
    "The monitoring system reported that everything was probably fine.",
    "An entire district temporarily disappeared from the dashboard.",
    "The response team became the emergency.",
    "Multiple organizations claimed responsibility.",
    "The archive gained four hundred years of history.",
    "An unknown faction appeared in the logs.",
    "Production became self-aware.",
    "The administrator was promoted inexplicably.",
    "The problem disappeared immediately after documentation was completed.",
    "Three versions of the incident began circulating.",
    "Nobody could reproduce the event after it was fixed.",
]


# ============================================================
# QUESTS
# ============================================================

QUESTS = [
    "Repair infrastructure before the artificial eclipse.",
    "Find the person who deployed production.",
    "Convince the council that version control is necessary.",
    "Retrieve the missing database.",
    "Investigate the prophetic API.",
    "Escort the unstable artifact.",
    "Document the forbidden deployment.",
    "Stop the maintenance robot from becoming mayor.",
    "Recover the missing architecture diagram.",
    "Build a moon status page.",
    "Find the engineer who keeps renaming servers.",
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
    "three days paid leave",
    "an unpronounceable title",
    "Floor Zero office",
    "one binding wish",
    "transit priority",
    "expensive tea",
    "classified documentation",
    "one dangerous favor",
]


# ============================================================
# NARRATIVE HOOKS
# ============================================================

STORY_HOOKS = [
    "The system looked ordinary until someone opened the logs.",
    "Nobody remembered commissioning the infrastructure.",
    "The portfolio begins after the disaster, not before it.",
    "Every project started with a requirement that sounded reasonable.",
    "The official version of events is technically correct.",
    "Somewhere between deployment and recovery, the system became interesting.",
    "The strangest projects were the ones that actually worked.",
    "The architecture was understandable until reality became involved.",
]


STORY_TURNS = [
    "The original problem was not the real problem.",
    "The documentation contradicted the system.",
    "The monitoring data revealed a second environment.",
    "A temporary solution became permanent infrastructure.",
    "The incident had already happened somewhere else.",
    "The client knew more than they admitted.",
    "The failed deployment contained the missing architecture.",
    "The system had been quietly preparing for this event.",
]


CLOSING_LINES = [
    "The system survived. That was considered success.",
    "Nobody celebrated until the logs stayed boring for a week.",
    "The architecture was finally documented, which created a new problem.",
    "The incident became a regression test.",
    "The project ended officially and continued unofficially.",
    "The infrastructure remained operational despite everything.",
    "The original requirement was forgotten. The solution was not.",
    "The system became boring. Everyone was relieved.",
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
    "Two factions are fighting over an archive.",
    "Central infrastructure is slowly becoming autonomous.",
    "An ancient system is waking.",
    "The government has lost critical records.",
    "Two realities are beginning to overlap.",
    "A guild wants to privatize public infrastructure.",
    "A protective system no longer recognizes humans.",
    "Forgotten technology has returned.",
    "The administration is hiding an architectural disaster.",
    "An unexplained signal appears in every monitoring system.",
    "The population is receiving messages from the future.",
    "The official map is wrong.",
]


# ============================================================
# UI DNA
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
# BUILD CONFIGURATION
# ============================================================

def build_config():
    rng = random.SystemRandom()

    build_identity = rng.getrandbits(64)

    selected_name = rng.choice(NAMES)
    selected_title = rng.choice(TITLES)
    selected_personality = rng.choice(PERSONALITIES)
    selected_education = rng.choice(EDUCATION)
    selected_location = rng.choice(LOCATIONS)

    selected_specialties = choose_many(
        rng,
        SPECIALTIES,
        minimum=6,
        maximum=10,
    )

    selected_worlds = unique_choices(
        rng,
        WORLDS,
        len(WORLDS),
    )

    # --------------------------------------------------------
    # RANDOM UI
    # --------------------------------------------------------

    ui = {
        "family": rng.choice(UI_FAMILIES),
        "layout": rng.choice(LAYOUTS),
        "nav": rng.choice(NAVS),
        "hero_mode": rng.choice(HERO_MODES),
        "density": rng.choice(DENSITIES),
        "decoration": rng.choice(DECORATIONS),
    }

    # --------------------------------------------------------
    # CARD-FIRST CONTENT LIMITS
    # --------------------------------------------------------

    content_limits = {
        "profile_paragraphs": 2,

        "experience_cards": 6,
        "experience_achievements": 4,
        "experience_technologies_min": 4,
        "experience_technologies_max": 7,

        "project_cards": 6,
        "project_notes": 3,
        "project_technologies_min": 3,
        "project_technologies_max": 7,

        "npc_cards": 4,
        "incident_cards": 4,
        "quest_cards": 3,

        "world_cards": 5,
        "world_rule_cards": 4,
        "world_faction_cards": 4,

        "timeline_items": 7,

        "max_text_width_ch": 70,

        "max_project_problem_characters": 240,
        "max_project_solution_characters": 240,
        "max_experience_incident_characters": 240,
        "max_experience_response_characters": 240,
    }

    # --------------------------------------------------------
    # CARD LABELS
    # --------------------------------------------------------

    card_labels = {
        "experience": [
            "ASSIGNMENT",
            "INCIDENT",
            "RESPONSE",
            "LESSON",
            "OUTCOME",
            "ACHIEVEMENTS",
        ],
        "project": [
            "PROBLEM",
            "ARCHITECTURE",
            "FAILURE",
            "SOLUTION",
            "OUTCOME",
            "TECHNICAL NOTES",
        ],
        "npc": [
            "ROLE",
            "TRAIT",
            "RELATION",
            "SECRET",
        ],
        "incident": [
            "EVENT",
            "CONSEQUENCE",
            "STATUS",
            "RISK",
        ],
        "quest": [
            "OBJECTIVE",
            "REWARD",
            "RISK",
        ],
    }

    # --------------------------------------------------------
    # PROFILE
    # --------------------------------------------------------

    profile = {
        "name": selected_name,
        "title": selected_title,
        "personality": selected_personality,
        "education": selected_education,
        "location": selected_location,
        "specialties": selected_specialties,
        "paragraphs": [
            (
                f"{selected_name} operates where ordinary software engineering "
                f"meets infrastructure nobody remembers creating."
            ),
            (
                f"The work focuses on {selected_personality} systems engineering, "
                f"recovery, automation, and projects that become considerably stranger "
                f"after deployment."
            ),
        ],
    }

    # --------------------------------------------------------
    # EXPERIENCE SEEDS
    # --------------------------------------------------------

    experiences = []

    for index in range(48):
        world = rng.choice(selected_worlds)

        role = rng.choice(EXPERIENCE_ROLES)
        organization = rng.choice(FACTIONS)

        opening = rng.choice(EXPERIENCE_OPENINGS)
        incident = rng.choice(EXPERIENCE_INCIDENTS)
        response = rng.choice(EXPERIENCE_RESPONSES)
        lesson = rng.choice(EXPERIENCE_LESSONS)
        outcome = rng.choice(EXPERIENCE_OUTCOMES)

        achievement_count = rng.randint(3, 5)

        achievements = unique_choices(
            rng,
            EXPERIENCE_ACHIEVEMENTS,
            achievement_count,
        )

        technology_count = rng.randint(
            content_limits["experience_technologies_min"],
            content_limits["experience_technologies_max"],
        )

        technologies = unique_choices(
            rng,
            EXPERIENCE_TECHNOLOGIES,
            technology_count,
        )

        experience_cards = cards_from_pairs([
            ("ASSIGNMENT", opening),
            ("INCIDENT", incident),
            ("RESPONSE", response),
            ("LESSON", lesson),
            ("OUTCOME", outcome),
        ])

        experiences.append({
            "id": f"experience-{index + 1}",
            "organization": organization,
            "world": world["name"],
            "world_genre": world["genre"],
            "role": role,
            "opening": opening,
            "incident": incident,
            "response": response,
            "lesson": lesson,
            "outcome": outcome,
            "status": rng.choice(STATUSES),
            "risk": rng.choice(RISK_LEVELS),
            "years": rng.choice([
                "2021–2022",
                "2022–2023",
                "2023–2024",
                "2024–2025",
                "2025–2026",
                "2026–Present",
                "Unknown",
                "Classified",
            ]),
            "technologies": technologies,
            "achievements": achievements,
            "cards": experience_cards,
            "hook": rng.choice(STORY_HOOKS),
            "turn": rng.choice(STORY_TURNS),
            "closing": rng.choice(CLOSING_LINES),
        })

    # --------------------------------------------------------
    # PROJECT SEEDS
    # --------------------------------------------------------

    projects = []

    for index in range(64):
        world = rng.choice(selected_worlds)

        project_name = rng.choice(PROJECT_NAMES)

        # Give repeated names a strange suffix rather than allowing
        # visually identical project cards.
        project_variant = rng.choice([
            "Protocol",
            "System",
            "Engine",
            "Platform",
            "Archive",
            "Network",
            "Directive",
            "Recovery",
            "Core",
            "Project",
        ])

        full_project_name = f"{project_name} {project_variant}"

        project_type = rng.choice(PROJECT_TYPES)

        problem = rng.choice(PROJECT_PROBLEMS)
        architecture = rng.choice(PROJECT_ARCHITECTURE)
        failure = rng.choice(PROJECT_FAILURES)
        solution = rng.choice(PROJECT_SOLUTIONS)
        outcome = rng.choice(PROJECT_OUTCOMES)
        impact = rng.choice(PROJECT_IMPACTS)

        notes = unique_choices(
            rng,
            PROJECT_NOTES,
            content_limits["project_notes"],
        )

        technology_count = rng.randint(
            content_limits["project_technologies_min"],
            content_limits["project_technologies_max"],
        )

        technologies = unique_choices(
            rng,
            PROJECT_TECHNOLOGY,
            technology_count,
        )

        project_cards = cards_from_pairs([
            ("PROBLEM", problem),
            ("ARCHITECTURE", architecture),
            ("FAILURE", failure),
            ("SOLUTION", solution),
            ("OUTCOME", outcome),
            ("IMPACT", impact),
        ])

        projects.append({
            "id": f"project-{index + 1}",
            "name": full_project_name,
            "base_name": project_name,
            "type": project_type,
            "world": world["name"],
            "world_genre": world["genre"],
            "problem": problem,
            "architecture": architecture,
            "failure": failure,
            "solution": solution,
            "outcome": outcome,
            "impact": impact,
            "technology": technologies,
            "technologies": technologies,
            "notes": notes,
            "cards": project_cards,
            "status": rng.choice(STATUSES),
            "risk": rng.choice(RISK_LEVELS),
            "commissioned_by": rng.choice(FACTIONS),
            "hook": rng.choice(STORY_HOOKS),
            "turn": rng.choice(STORY_TURNS),
            "closing": rng.choice(CLOSING_LINES),
        })

    # --------------------------------------------------------
    # NPC SEEDS
    # --------------------------------------------------------

    npcs = []

    used_npc_names = set()

    for index in range(80):

        name = None

        for _attempt in range(200):
            first = rng.choice(NPC_FIRST)
            last = rng.choice(NPC_LAST)

            candidate = f"{first} {last}"

            if candidate not in used_npc_names:
                name = candidate
                used_npc_names.add(candidate)
                break

        if name is None:
            name = f"Unknown NPC {index + 1}"

        world = rng.choice(selected_worlds)

        role = rng.choice(NPC_ROLES)
        npc_type = rng.choice(NPC_TYPES)
        trait = rng.choice(NPC_TRAITS)
        relationship = rng.choice(NPC_RELATIONSHIPS)
        secret = rng.choice(NPC_SECRETS)
        dialogue = rng.choice(NPC_DIALOGUE)

        npc_cards = cards_from_pairs([
            ("ROLE", role),
            ("TRAIT", trait),
            ("RELATION", relationship),
            ("SECRET", secret),
        ])

        npcs.append({
            "id": f"npc-{index + 1}",
            "name": name,
            "role": role,
            "type": npc_type,
            "trait": trait,
            "relationship": relationship,
            "secret": secret,
            "dialogue": dialogue,
            "world": world["name"],
            "status": rng.choice(STATUSES),
            "cards": npc_cards,
        })

    # --------------------------------------------------------
    # INCIDENT SEEDS
    # --------------------------------------------------------

    incidents = []

    for index in range(64):
        world = rng.choice(selected_worlds)

        incident_type = rng.choice(INCIDENT_TYPES)
        opener = rng.choice(INCIDENT_OPENERS)
        consequence = rng.choice(INCIDENT_CONSEQUENCES)

        title = rng.choice([
            "The Deployment That Answered Back",
            "The Database Disappearance",
            "The Unauthorized Awakening",
            "The Three-Reality Outage",
            "The Incident Inside the Incident",
            "The Backup That Refused",
            "The Server Nobody Owned",
            "The Missing Production",
            "The Predictive Outage",
            "The Impossible Rollback",
            "The Administrative Catastrophe",
            "The Dashboard From Tomorrow",
            "The Unauthorized API",
            "The Building With Credentials",
        ])

        incident_cards = cards_from_pairs([
            ("EVENT", f"{opener}, a {incident_type} began."),
            ("CONSEQUENCE", consequence),
            ("STATUS", rng.choice(STATUSES)),
            ("RISK", rng.choice(RISK_LEVELS)),
        ])

        incidents.append({
            "id": f"incident-{index + 1}",
            "title": title,
            "type": incident_type,
            "world": world["name"],
            "genre": world["genre"],
            "opener": opener,
            "consequence": consequence,
            "status": rng.choice(STATUSES),
            "risk": rng.choice(RISK_LEVELS),
            "faction": rng.choice(FACTIONS),
            "cards": incident_cards,
        })

    # --------------------------------------------------------
    # QUEST SEEDS
    # --------------------------------------------------------

    quests = []

    for index in range(48):
        world = rng.choice(selected_worlds)

        objective = rng.choice(QUESTS)
        reward = rng.choice(QUEST_REWARDS)

        risk = rng.choice(RISK_LEVELS)

        quests.append({
            "id": f"quest-{index + 1}",
            "objective": objective,
            "reward": reward,
            "risk": risk,
            "world": world["name"],
            "faction": rng.choice(FACTIONS),
            "status": rng.choice(STATUSES),
            "cards": cards_from_pairs([
                ("OBJECTIVE", objective),
                ("REWARD", reward),
                ("RISK", risk),
            ]),
        })

    # --------------------------------------------------------
    # WORLD DATA
    # --------------------------------------------------------

    worlds = []

    for world in selected_worlds:

        world_rules = unique_choices(
            rng,
            world["rules"] + WORLD_RULES,
            content_limits["world_rule_cards"],
        )

        world_factions = unique_choices(
            rng,
            list(dict.fromkeys(
                world["factions"] + FACTIONS
            )),
            content_limits["world_faction_cards"],
        )

        worlds.append({
            "name": world["name"],
            "genre": world["genre"],
            "description": world["description"],
            "technology": world["technology"],
            "danger": world["danger"],
            "conflict": world["conflict"],
            "rules": world_rules,
            "factions": world_factions,
            "status": rng.choice(STATUSES),
            "risk": rng.choice(RISK_LEVELS),
            "cards": [
                {
                    "label": "WORLD",
                    "text": world["name"],
                },
                {
                    "label": "GENRE",
                    "text": world["genre"],
                },
                {
                    "label": "DANGER",
                    "text": world["danger"],
                },
                {
                    "label": "CONFLICT",
                    "text": world["conflict"],
                },
                {
                    "label": "STATUS",
                    "text": rng.choice(STATUSES),
                },
            ],
        })

    # --------------------------------------------------------
    # TIMELINE
    # --------------------------------------------------------

    timeline_source = []

    for experience in experiences:
        timeline_source.append({
            "kind": "EXPERIENCE",
            "title": experience["role"],
            "subtitle": experience["organization"],
            "world": experience["world"],
            "status": experience["status"],
        })

    for project in projects:
        timeline_source.append({
            "kind": "PROJECT",
            "title": project["name"],
            "subtitle": project["type"],
            "world": project["world"],
            "status": project["status"],
        })

    rng.shuffle(timeline_source)

    timeline = timeline_source[:content_limits["timeline_items"]]

    # --------------------------------------------------------
    # RUNTIME / STORAGE RULES
    # --------------------------------------------------------

    runtime_rules = {
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

        "original_fiction": True,
        "copyrighted_characters": False,
    }

    # --------------------------------------------------------
    # COMPATIBILITY NARRATIVE SETTINGS
    # --------------------------------------------------------
    #
    # Kept so an existing app.js that still checks
    # narrative_settings does not break.
    #
    # There are intentionally NO giant word-count targets.
    #

    narrative_settings = {
        "mode": "card-first",
        "paragraph_limit": content_limits["profile_paragraphs"],
        "max_paragraph_characters": 360,

        "experience_card_count": content_limits["experience_cards"],
        "experience_achievement_count": content_limits["experience_achievements"],

        "project_card_count": content_limits["project_cards"],
        "project_note_count": content_limits["project_notes"],

        "npc_card_count": content_limits["npc_cards"],
        "incident_card_count": content_limits["incident_cards"],
        "quest_card_count": content_limits["quest_cards"],

        "world_card_count": content_limits["world_cards"],
        "timeline_item_count": content_limits["timeline_items"],
    }

    # --------------------------------------------------------
    # FINAL CONFIG
    # --------------------------------------------------------

    config = {
        "version": "3.0.0",

        "build_identity": str(build_identity),

        "generator": {
            "name": "Absurd Chaos Portfolio Generator",
            "mode": "structured-card-generation",
            "seed_source": "cryptographic-system-random",
        },

        "profile": profile,

        "ui": ui,

        "content_limits": content_limits,

        "card_labels": card_labels,

        "narrative_settings": narrative_settings,

        "runtime_rules": runtime_rules,

        "worlds": worlds,

        "projects": projects,

        "experiences": experiences,

        "npcs": npcs,

        "incidents": incidents,

        "quests": quests,

        "timeline": timeline,

        "story": {
            "hooks": unique_choices(
                rng,
                STORY_HOOKS,
                4,
            ),
            "turns": unique_choices(
                rng,
                STORY_TURNS,
                4,
            ),
            "closings": unique_choices(
                rng,
                CLOSING_LINES,
                4,
            ),
        },

        "statuses": STATUSES,

        "risk_levels": RISK_LEVELS,

        "world_rules": unique_choices(
            rng,
            WORLD_RULES,
            8,
        ),

        "world_conflicts": unique_choices(
            rng,
            WORLD_CONFLICTS,
            6,
        ),

        "statistics": {
            "project_seeds": len(projects),
            "experience_seeds": len(experiences),
            "npc_seeds": len(npcs),
            "incident_seeds": len(incidents),
            "quest_seeds": len(quests),
            "worlds": len(worlds),
            "timeline_items": len(timeline),
        },
    }

    return config


# ============================================================
# FILE VALIDATION
# ============================================================

def require_file(path):
    if not path.exists():
        raise FileNotFoundError(
            f"Required file does not exist: {path}"
        )

    if not path.is_file():
        raise RuntimeError(
            f"Required path is not a file: {path}"
        )


# ============================================================
# MAIN BUILD
# ============================================================

def main():
    require_file(TEMPLATE_FILE)
    require_file(CSS_FILE)
    require_file(JS_FILE)

    template = TEMPLATE_FILE.read_text(
        encoding="utf-8"
    )

    css = CSS_FILE.read_text(
        encoding="utf-8"
    )

    js = JS_FILE.read_text(
        encoding="utf-8"
    )

    config = build_config()

    generated_config = json.dumps(
        config,
        ensure_ascii=False,
        separators=(",", ":"),
    )

    output = template

    # --------------------------------------------------------
    # TEMPLATE INJECTION
    # --------------------------------------------------------

    replacements = {
        "{{GENERATED_CONFIG}}": generated_config,
        "{{GENERATED_CSS}}": css,
        "{{GENERATED_JS}}": js,
    }

    for placeholder, value in replacements.items():
        if placeholder not in output:
            raise RuntimeError(
                f"Template placeholder missing: {placeholder}"
            )

        output = output.replace(
            placeholder,
            value,
        )

    # --------------------------------------------------------
    # OUTPUT
    # --------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_FILE.write_text(
        output,
        encoding="utf-8",
    )

    # --------------------------------------------------------
    # BUILD REPORT
    # --------------------------------------------------------

    print()
    print("=" * 72)
    print(" ABSURD CHAOS PORTFOLIO — BUILD COMPLETE")
    print("=" * 72)

    print(f"Build identity : {config['build_identity']}")
    print(f"Version        : {config['version']}")
    print()

    print("RANDOM UI")
    print(f"  Family       : {config['ui']['family']}")
    print(f"  Layout       : {config['ui']['layout']}")
    print(f"  Navigation   : {config['ui']['nav']}")
    print(f"  Hero         : {config['ui']['hero_mode']}")
    print(f"  Density      : {config['ui']['density']}")
    print(f"  Decoration   : {config['ui']['decoration']}")
    print()

    print("GENERATED CONTENT")
    print(f"  Worlds       : {len(config['worlds'])}")
    print(f"  Projects     : {len(config['projects'])}")
    print(f"  Experiences  : {len(config['experiences'])}")
    print(f"  NPCs         : {len(config['npcs'])}")
    print(f"  Incidents    : {len(config['incidents'])}")
    print(f"  Quests       : {len(config['quests'])}")
    print(f"  Timeline     : {len(config['timeline'])}")
    print()

    print("CONTENT MODE")
    print("  Projects     : CARD-FIRST / CHAOTIC")
    print("  Experiences  : CARD-FIRST / CHAOTIC")
    print("  NPCs         : COMPACT")
    print("  Worlds       : COMPACT LORE")
    print("  Incidents    : COMPACT")
    print("  Quests       : COMPACT")
    print()

    print("STORAGE")
    print("  Database     : DISABLED")
    print("  API          : DISABLED")
    print("  Cookies      : DISABLED")
    print("  LocalStorage : DISABLED")
    print("  SessionStore : DISABLED")
    print("  IndexedDB    : DISABLED")
    print("  Browser      : MEMORY ONLY")
    print()

    print("OUTPUT")
    print(f"  {OUTPUT_FILE}")
    print()

    print("STATUS")
    print("  Static output ready.")
    print("  Refresh generates a different portfolio at runtime.")
    print("=" * 72)
    print()


if __name__ == "__main__":
    main()
