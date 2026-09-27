from __future__ import annotations

import json
import random
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent

TEMPLATE_FILE = ROOT / "templates" / "index.html"
CSS_FILE = ROOT / "static" / "style.css"
JS_FILE = ROOT / "static" / "app.js"

OUTPUT_DIR = ROOT / "generated"
OUTPUT_FILE = OUTPUT_DIR / "index.html"


# ============================================================
# RANDOM HELPERS
# ============================================================

def choose_many(rng, values, minimum=2, maximum=5):
    values = list(values)

    if not values:
        return []

    minimum = max(1, min(minimum, len(values)))
    maximum = max(minimum, min(maximum, len(values)))

    amount = rng.randint(minimum, maximum)

    return rng.sample(values, amount)


def unique_choices(rng, values, count):
    values = list(dict.fromkeys(values))

    if not values:
        return []

    count = max(1, min(count, len(values)))

    return rng.sample(values, count)


def safe_choice(rng, values, fallback):
    values = list(values or [])

    if not values:
        return fallback

    return rng.choice(values)


def article_for(value):
    text = str(value).strip()

    if not text:
        return "a"

    return "an" if text[0].lower() in "aeiou" else "a"


def compact_sentence(value, maximum=240):
    text = re.sub(r"\s+", " ", str(value or "")).strip()

    if len(text) <= maximum:
        return text

    return text[: maximum - 1].rstrip() + "…"


# ============================================================
# PEOPLE
# ============================================================

NAMES = [
    "Ari Voss",
    "Kael Ren",
    "Mira Vale",
    "Nyra Sol",
    "Iven Cross",
    "Sora Venn",
    "Riven Ash",
    "Talia Rune",
    "Kiro Vane",
    "Elian Frost",
    "Vera Nox",
    "Rhea Quill",
    "Darian Vox",
    "Lena Rift",
    "Orin Hale",
    "Mako Renn",
    "Yuna Vey",
    "Cira Moss",
    "Noel Varr",
    "Zane Orr",
    "Asha Wynn",
    "Kane Rook",
    "Nira Bell",
    "Eren Vale",
    "Sena Voss",
    "Ilya Thorn",
    "Mira Kade",
    "Riven Sol",
    "Kael Orr",
    "Nox Arden",
    "Veya Cross",
    "Arden Kiro",
    "Lio Ren",
    "Suri Vex",
    "Tarin Vale",
    "Kara Nox",
    "Juno Rift",
    "Venn Ash",
    "Rai Mercer",
    "Nemi Voss",
]


NPC_FIRST_NAMES = [
    "Aerin",
    "Veyra",
    "Kael",
    "Mira",
    "Nox",
    "Ilya",
    "Rin",
    "Sera",
    "Orin",
    "Tavi",
    "Kira",
    "Vale",
    "Nyx",
    "Rhea",
    "Sol",
    "Daro",
    "Maren",
    "Lio",
    "Eris",
    "Kane",
    "Vira",
    "Ren",
    "Taro",
    "Nemi",
    "Yori",
    "Ciel",
    "Arin",
    "Vexa",
    "Mako",
    "Sorin",
]


NPC_LAST_NAMES = [
    "Voss",
    "Rook",
    "Vale",
    "Ash",
    "Ren",
    "Nox",
    "Quill",
    "Morrow",
    "Cross",
    "Rune",
    "Vey",
    "Hale",
    "Kade",
    "Thorn",
    "Moss",
    "Rift",
    "Sol",
    "Arden",
    "Mercer",
    "Vane",
]


TITLES = [
    "Senior Systems Engineer",
    "Staff Software Engineer",
    "Full-Stack Engineer",
    "Platform Engineer",
    "Systems Architect",
    "Infrastructure Engineer",
    "Automation Engineer",
    "Backend Engineer",
    "DevOps Engineer",
    "Software Architect",
    "Technical Investigator",
    "Research Engineer",
    "Incident Response Engineer",
    "Data Systems Engineer",
    "Developer Tooling Engineer",
    "Reality Infrastructure Engineer",
    "Interdimensional Systems Consultant",
    "Royal Infrastructure Engineer",
    "Archive Systems Engineer",
    "Cross-World Integration Engineer",
    "Emergency Software Engineer",
    "Guild Systems Engineer",
    "Memory Infrastructure Engineer",
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
    "quietly chaotic",
    "overprepared",
    "curious",
    "unreasonably calm",
    "experimental",
    "forensic",
    "pragmatic",
    "obsessively organized",
    "suspiciously optimistic",
    "deadline-powered",
    "systems-minded",
    "incident-resistant",
]


EDUCATION = [
    "B.Tech in Computer Science",
    "B.Sc. in Information Systems",
    "M.Tech in Distributed Systems",
    "B.Sc. in Computational Engineering",
    "Diploma in Applied Systems Engineering",
    "Master of Systems Architecture",
    "Academy of Applied Infrastructure",
    "Royal Institute of Computational Arts",
    "Inter-World Engineering Academy",
    "Archive University — Systems Division",
]


LOCATIONS = [
    "Hansi",
    "Neon Ward",
    "Moonfall District",
    "Velorum City",
    "Archive Sector 7",
    "Port Meridian",
    "Station Zero",
    "Kurovale",
    "Aster-09",
    "The Lower Archive",
]


# ============================================================
# WORLDS
# ============================================================

WORLDS = [
    {
        "name": "The Neon Archive",
        "genre": "Cyberpunk Archive Fantasy",
        "classification": "CLASSIFIED / URBAN",
        "description": "A vertical city where forgotten software becomes physical infrastructure and abandoned databases occasionally wake up.",
        "sky": "permanent violet dusk interrupted by advertising satellites",
        "technology": "memory indexing engines and autonomous archive nodes",
        "socialRule": "Nothing may be forgotten without filing a deletion request.",
        "rule": "Archived information acquires legal personhood after seven years.",
        "danger": "memory corruption",
        "conflict": "A forgotten archive has started rewriting public history.",
        "population": 18400000,
        "age": 814,
        "stability": 63,
        "rules": [
            "Every archive must have a witness.",
            "Deleted data may return during eclipses.",
            "No citizen may own more than three backup identities.",
            "Unverified memories are treated as contraband.",
            "Old servers are protected as historical monuments.",
        ],
        "factions": [
            "Department of Unnecessary Architecture",
            "Order of the Silent Compiler",
            "Moonlit Infrastructure Bureau",
            "Archive Wardens",
            "Azure Systems Guild",
        ],
    },
    {
        "name": "Eidolon Prime",
        "genre": "Space Opera",
        "classification": "ORBITAL / RESTRICTED",
        "description": "A megastructure where software services orbit each other like planets and outages can alter gravity.",
        "sky": "a layered field of artificial stars and maintenance drones",
        "technology": "orbital service meshes and gravitational computation",
        "socialRule": "Every service must maintain an evacuation route.",
        "rule": "Production systems are considered sovereign territories.",
        "danger": "gravity desynchronization",
        "conflict": "Three infrastructure clusters have declared independence.",
        "population": 7200000,
        "age": 1204,
        "stability": 71,
        "rules": [
            "Never deploy during orbital sunrise.",
            "Every API must declare its gravitational footprint.",
            "Failed services receive memorial beacons.",
            "No engineer may disable an alarm without a witness.",
            "Emergency infrastructure outranks civilian infrastructure.",
        ],
        "factions": [
            "Orbital Systems Directorate",
            "Helix Navigation Guild",
            "Nightwatch Command",
            "The Quiet Astronauts",
            "Axiom Infrastructure Union",
        ],
    },
    {
        "name": "The Seven-Layer Kingdom",
        "genre": "Fantasy Systems",
        "classification": "ROYAL / COMPUTATIONAL",
        "description": "A kingdom whose castles are compiled from ancient specifications and whose magic behaves suspiciously like infrastructure.",
        "sky": "golden clouds surrounding seven visible layers of reality",
        "technology": "spell compilers and enchanted deployment pipelines",
        "socialRule": "Every spell must pass a review council before production.",
        "rule": "Magic without documentation is legally classified as technical debt.",
        "danger": "recursive enchantments",
        "conflict": "The royal deployment pipeline has begun generating duplicate kingdoms.",
        "population": 9400000,
        "age": 2317,
        "stability": 48,
        "rules": [
            "Never cast directly into production.",
            "Every dragon requires a capacity plan.",
            "Rollback spells require two witnesses.",
            "Dungeon systems must expose health endpoints.",
            "Royal secrets must be encrypted before prophecy.",
        ],
        "factions": [
            "Royal Infrastructure Bureau",
            "Azure Systems Guild",
            "Order of the Silent Compiler",
            "Moonlit Infrastructure Bureau",
            "The Seven Architects",
        ],
    },
    {
        "name": "Moonfall District",
        "genre": "Noir Manhwa",
        "classification": "URBAN / UNSTABLE",
        "description": "A rain-soaked district where every corporation has a secret department and every secret department has a dashboard.",
        "sky": "a broken moon reflected in endless rain",
        "technology": "surveillance grids, predictive analytics and black-market automation",
        "socialRule": "Nobody asks who owns the infrastructure after midnight.",
        "rule": "All corporate systems must maintain an anonymous emergency account.",
        "danger": "corporate surveillance",
        "conflict": "A predictive system is accusing people of incidents that have not happened yet.",
        "population": 12600000,
        "age": 507,
        "stability": 57,
        "rules": [
            "Night deployments require two signatures.",
            "Unknown dashboards must be investigated.",
            "Never trust a green status indicator alone.",
            "Every incident needs a timestamp.",
            "Anonymous reports cannot be deleted.",
        ],
        "factions": [
            "Midnight Operations Bureau",
            "Black Lantern Systems",
            "Moonlit Infrastructure Bureau",
            "District Seven Investigators",
            "The Quiet Network",
        ],
    },
    {
        "name": "The Black Meridian",
        "genre": "Dark Fantasy",
        "classification": "FORBIDDEN / ANOMALOUS",
        "description": "A world where abandoned systems become monsters and engineers are sometimes hired to debug curses.",
        "sky": "black clouds split by thin red geometric fractures",
        "technology": "artifact networks and cursed automation",
        "socialRule": "Every anomaly must be named before it can be contained.",
        "rule": "Unknown code is considered a living organism.",
        "danger": "sentient failures",
        "conflict": "An ancient automation engine has begun hiring its own operators.",
        "population": 3900000,
        "age": 4011,
        "stability": 31,
        "rules": [
            "Never execute unknown artifacts alone.",
            "Cursed systems require human-readable logs.",
            "Every daemon deserves an owner.",
            "Production rituals must have rollback procedures.",
            "Do not negotiate with unauthorized processes.",
        ],
        "factions": [
            "The Black Systems Order",
            "Archive Wardens",
            "Dungeon Operations Guild",
            "Nightwatch Command",
            "The Silent Maintainers",
        ],
    },
    {
        "name": "Aster-09",
        "genre": "Science Fiction",
        "classification": "RESEARCH / ORBITAL",
        "description": "A research colony where experimental software is allowed to become architecture if it survives long enough.",
        "sky": "six artificial suns arranged around a rotating research ring",
        "technology": "experimental AI, distributed simulation and orbital data centers",
        "socialRule": "Research results must be reproducible somewhere.",
        "rule": "Experiments may fail, but their logs may not.",
        "danger": "simulation drift",
        "conflict": "A research simulation now produces results from worlds that do not exist.",
        "population": 820000,
        "age": 92,
        "stability": 84,
        "rules": [
            "Record every experiment.",
            "Never discard unexplained output.",
            "Production and research environments must be isolated.",
            "Simulation clocks require independent verification.",
            "Unknown signals must be archived.",
        ],
        "factions": [
            "Aster Research Collective",
            "Deep Systems Lab",
            "Orbital Systems Directorate",
            "Signal Cartographers",
            "The Quiet Astronauts",
        ],
    },
    {
        "name": "Velorum City",
        "genre": "Techno Fantasy",
        "classification": "METROPOLITAN",
        "description": "A city powered by infrastructure contracts, enchanted transit systems and municipal robots with political opinions.",
        "sky": "clear blue with enormous floating transit rings",
        "technology": "municipal automation and magical transportation",
        "socialRule": "Every public system must have an offline fallback.",
        "rule": "Robots cannot become officials without passing a civic audit.",
        "danger": "municipal automation",
        "conflict": "The city's maintenance robots have formed a union.",
        "population": 22100000,
        "age": 638,
        "stability": 76,
        "rules": [
            "Transit systems must support emergency routing.",
            "Public APIs cannot be abandoned.",
            "Maintenance robots require identity records.",
            "Citywide changes require staged deployment.",
            "Every bridge needs monitoring.",
        ],
        "factions": [
            "Velorum Civic Systems",
            "Municipal Automation Bureau",
            "Azure Systems Guild",
            "Transit Architects",
            "Department of Unnecessary Architecture",
        ],
    },
    {
        "name": "The Glass Continent",
        "genre": "Mythic Science Fantasy",
        "classification": "CONTINENTAL / FRAGILE",
        "description": "A continent made of translucent infrastructure where information can be seen moving through physical structures.",
        "sky": "silver daylight passing through enormous crystalline clouds",
        "technology": "glass data structures and visible information routing",
        "socialRule": "Secrets are difficult because infrastructure literally displays its state.",
        "rule": "Broken systems become landmarks.",
        "danger": "information exposure",
        "conflict": "Someone has discovered a way to hide information inside structural shadows.",
        "population": 6700000,
        "age": 1711,
        "stability": 59,
        "rules": [
            "Visible systems must have visible owners.",
            "Critical routes need redundant foundations.",
            "Shadow networks require special permits.",
            "Structural failures become public records.",
            "All architecture must expose its dependency graph.",
        ],
        "factions": [
            "Glass Systems Authority",
            "Shadow Infrastructure Guild",
            "Archive Wardens",
            "Continental Engineering Council",
            "The Transparent Network",
        ],
    },
    {
        "name": "Sector Null",
        "genre": "Industrial Horror",
        "classification": "NULL / RESTRICTED",
        "description": "An industrial sector where missing records are more common than existing ones.",
        "sky": "flat gray light with no identifiable source",
        "technology": "legacy systems, isolated terminals and autonomous machinery",
        "socialRule": "If nobody remembers creating a system, nobody is allowed to shut it down.",
        "rule": "Every undocumented process is presumed critical.",
        "danger": "legacy automation",
        "conflict": "A twenty-year-old scheduler is secretly running the entire sector.",
        "population": 2400000,
        "age": 208,
        "stability": 39,
        "rules": [
            "Never delete undocumented jobs.",
            "Every legacy process gets a custodian.",
            "Unknown ports must be monitored.",
            "Backups must be physically separated.",
            "No system is too old to matter.",
        ],
        "factions": [
            "Legacy Systems Authority",
            "The Silent Maintainers",
            "Null Operations",
            "Archive Wardens",
            "Blackbox Engineering",
        ],
    },
    {
        "name": "The Infinite Metro",
        "genre": "Urban Adventure",
        "classification": "TRANSIT / INFINITE",
        "description": "A transportation network with more stations than maps and several lines that terminate in different realities.",
        "sky": "rarely visible beyond station ceilings",
        "technology": "dimensional routing and predictive transit",
        "socialRule": "Every passenger deserves a route home.",
        "rule": "A station cannot be closed if somebody still remembers it.",
        "danger": "dimensional routing",
        "conflict": "A new station has appeared between every existing station.",
        "population": 33000000,
        "age": 3200,
        "stability": 52,
        "rules": [
            "Every route requires a fallback.",
            "Unknown stations must be mapped.",
            "Transit clocks must be synchronized.",
            "No passenger may be stranded indefinitely.",
            "Emergency routes override commercial routes.",
        ],
        "factions": [
            "Infinite Transit Authority",
            "Route Cartographers",
            "Night Platform Guild",
            "Station Zero Engineers",
            "The Lost Commuters",
        ],
    },
    {
        "name": "Ashen Republic",
        "genre": "Post-Apocalyptic Systems",
        "classification": "RECOVERY / FRAGILE",
        "description": "A recovering republic rebuilding its infrastructure one surviving service at a time.",
        "sky": "orange-gray clouds above enormous reconstruction zones",
        "technology": "salvaged systems and improvised networks",
        "socialRule": "Anything that still works must be documented before anyone improves it.",
        "rule": "Recovery systems outrank convenience systems.",
        "danger": "infrastructure collapse",
        "conflict": "Recovered machines are rebuilding structures nobody remembers.",
        "population": 5100000,
        "age": 144,
        "stability": 42,
        "rules": [
            "Document before replacing.",
            "Preserve working systems.",
            "Emergency capacity must remain available.",
            "Every reconstruction has a rollback.",
            "Do not trust pre-collapse credentials.",
        ],
        "factions": [
            "Republic Recovery Bureau",
            "Salvage Systems Guild",
            "Archive Wardens",
            "Emergency Infrastructure Corps",
            "Reconstruction Engineers",
        ],
    },
    {
        "name": "Kurovale",
        "genre": "Manhwa Urban Fantasy",
        "classification": "NIGHT / HIDDEN",
        "description": "A city where supernatural organizations operate behind ordinary technology companies.",
        "sky": "deep blue night even during daylight hours",
        "technology": "mobile networks, hidden magical infrastructure and predictive charms",
        "socialRule": "The public must never learn how many systems are actually magical.",
        "rule": "Every supernatural service requires a mundane cover.",
        "danger": "hidden organizations",
        "conflict": "A software company accidentally published a map of the supernatural city.",
        "population": 9800000,
        "age": 901,
        "stability": 66,
        "rules": [
            "Never expose hidden routes.",
            "Every magical system needs an audit trail.",
            "Cover organizations must remain plausible.",
            "Forbidden APIs require human witnesses.",
            "No prophecy may enter production unreviewed.",
        ],
        "factions": [
            "Kurovale Systems Bureau",
            "Moonlit Infrastructure Bureau",
            "Hidden Architecture Society",
            "Nightwatch Command",
            "The Veiled Network",
        ],
    },
    {
        "name": "The Lower Archive",
        "genre": "Archive Mystery",
        "classification": "SUBTERRANEAN / SECRET",
        "description": "A buried information city containing the technical records of civilizations that may never have existed.",
        "sky": "artificial ceiling panels showing obsolete weather",
        "technology": "memory indexing, ancient databases and reconstruction engines",
        "socialRule": "Every recovered record must be preserved exactly as found.",
        "rule": "Contradictory records cannot be reconciled without a witness.",
        "danger": "historical contradictions",
        "conflict": "The archive contains documentation for the portfolio owner's future career.",
        "population": 760000,
        "age": 5400,
        "stability": 44,
        "rules": [
            "Never overwrite recovered records.",
            "Every reconstruction needs provenance.",
            "Contradictions must be preserved.",
            "Unknown authors remain anonymous.",
            "Archive workers cannot destroy evidence.",
        ],
        "factions": [
            "Lower Archive Authority",
            "Historical Systems Guild",
            "Archive Wardens",
            "Memory Cartographers",
            "The Anonymous Editors",
        ],
    },
    {
        "name": "Port Meridian",
        "genre": "Merchant Fantasy",
        "classification": "PORT / MULTIWORLD",
        "description": "A trade city where software services, magical artifacts and suspiciously advanced tea machines are imported.",
        "sky": "bright turquoise with floating cargo platforms",
        "technology": "cross-world logistics and artifact tracking",
        "socialRule": "Everything entering the port must have provenance.",
        "rule": "Unknown cargo cannot be deployed.",
        "danger": "artifact smuggling",
        "conflict": "A logistics system keeps delivering packages from futures that have not happened.",
        "population": 11800000,
        "age": 1880,
        "stability": 73,
        "rules": [
            "Track every artifact.",
            "Verify origin before deployment.",
            "Cross-world shipments require independent manifests.",
            "Customs systems must remain auditable.",
            "Future-dated packages require containment.",
        ],
        "factions": [
            "Meridian Trade Authority",
            "Artifact Tracking Guild",
            "Azure Systems Guild",
            "Cross-World Logistics Bureau",
            "The Dock Engineers",
        ],
    },
    {
        "name": "Station Zero",
        "genre": "Reality Transit",
        "classification": "ORIGIN / UNKNOWN",
        "description": "The first station on a transit network that appears to connect every fictional world.",
        "sky": "a ceiling of shifting stars and impossible timetables",
        "technology": "reality synchronization and dimensional routing",
        "socialRule": "Nobody is allowed to claim Station Zero belongs to them.",
        "rule": "Every route must have a destination, even if the destination does not exist yet.",
        "danger": "reality synchronization",
        "conflict": "Station Zero has generated a route pointing to the user's browser.",
        "population": 410000,
        "age": 9999,
        "stability": 27,
        "rules": [
            "Never route into an unknown reality alone.",
            "Every portal requires a trace ID.",
            "Unmapped destinations are quarantined.",
            "Timetables must be versioned.",
            "Reality changes require incident reports.",
        ],
        "factions": [
            "Station Zero Authority",
            "Reality Mapping Bureau",
            "Dimensional Routing Guild",
            "Nightwatch Command",
            "The First Engineers",
        ],
    },
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
    "thousands of records were being processed manually",
    "nobody knew which service was responsible for the failures",
    "three different teams had three different versions of reality",
    "the previous system could not survive peak traffic",
    "critical workflows depended on one exhausted operator",
    "production incidents were being discovered through rumors",
    "the client had inherited an undocumented legacy system",
    "multiple worlds were using incompatible identifiers",
    "the monitoring dashboard reported green during disasters",
    "an automation process had become impossible to audit",
    "a temporary script had quietly become mission-critical",
    "users were receiving events from the wrong timeline",
    "the system had no reliable rollback strategy",
    "a public service was being maintained from spreadsheets",
    "the organization's most important process lived inside one person's notebook",
]


PROJECT_SOLUTIONS = [
    "a modular event-driven platform with explicit ownership and recovery paths",
    "a staged deployment system with automated verification",
    "a searchable operational archive with immutable incident records",
    "a resilient workflow engine with replayable events",
    "a distributed routing layer with fallback destinations",
    "a lightweight internal platform with observability built in",
    "a reconstruction pipeline that preserved original provenance",
    "a policy-driven automation system with human approval gates",
    "a multi-tenant service with isolated failure domains",
    "a real-time monitoring layer connected to automated incident response",
]


PROJECT_FAILURES = [
    "the first deployment synchronized with the wrong moon",
    "a cache decided that two different people were the same person",
    "an emergency rollback restored a version from six years earlier",
    "a monitoring service started monitoring itself instead of production",
    "the test environment accidentally became the most important environment",
    "a deployment created duplicate records in three realities",
    "the backup restored successfully but nobody could identify what it contained",
    "a scheduler became convinced that weekends did not exist",
    "an automated repair loop repaired the repair loop",
    "the first architecture diagram became technically classified",
]


PROJECT_OUTCOMES = [
    "reduced operational chaos and made failures traceable",
    "turned an undocumented process into a maintainable platform",
    "gave operators a reliable recovery path",
    "reduced manual work while increasing auditability",
    "created a stable foundation for future systems",
    "prevented a repeat of the original incident",
    "became the organization's unofficial source of truth",
    "was adopted by several neighboring factions",
    "survived long enough to become boring, which was considered success",
]


INDUSTRIES = [
    "infrastructure",
    "healthcare",
    "finance",
    "transportation",
    "research",
    "government",
    "education",
    "logistics",
    "security",
    "entertainment",
    "energy",
    "archive operations",
    "inter-world commerce",
    "municipal systems",
    "guild operations",
]


# ============================================================
# EXPERIENCE VOCABULARY
# ============================================================

EXPERIENCE_ROLES = [
    "Field Systems Engineer",
    "Infrastructure Specialist",
    "Archive Engineer",
    "Incident Response Engineer",
    "Platform Architect",
    "Technical Investigator",
    "Systems Consultant",
    "Deployment Specialist",
    "Research Engineer",
    "Guild Systems Engineer",
    "Reality Infrastructure Analyst",
    "Emergency Software Engineer",
    "Technical Archivist",
    "Cross-World Integration Engineer",
    "Operations Engineer",
]


EXPERIENCE_OPENINGS = [
    "Joined during a period when nobody trusted the existing monitoring.",
    "Was hired to document a system that supposedly had no documentation.",
    "Arrived three days before the largest incident in the organization's history.",
    "Inherited a production environment maintained by six different factions.",
    "Was assigned to a team whose official job description was deliberately vague.",
    "Entered the project after the previous engineer disappeared into another department.",
    "Was asked to make an experimental system boring enough for production.",
]


EXPERIENCE_INCIDENTS = [
    "a routine deployment opened a route into an unauthorized environment",
    "a scheduled maintenance job started executing historical commands",
    "a monitoring service began generating incidents about itself",
    "a database backup contained records from a future date",
    "a production cache merged two unrelated identities",
    "a transit service started routing passengers to abandoned stations",
    "a legacy scheduler refused to acknowledge the current calendar",
    "an automated recovery system became more aggressive than the original failure",
]


EXPERIENCE_LESSONS = [
    "observability is not optional when nobody understands the system",
    "temporary infrastructure has a habit of becoming permanent",
    "documentation is an operational dependency",
    "a rollback plan is more useful than confidence",
    "systems should fail visibly instead of creatively",
    "every automated process needs an owner",
    "complexity should be measured by consequences, not by line count",
]


# ============================================================
# NPC VOCABULARY
# ============================================================

NPC_ROLES = [
    "Guild Director",
    "Systems Client",
    "Archive Curator",
    "Municipal Automation Officer",
    "Research Director",
    "Transit Controller",
    "Security Investigator",
    "Royal Infrastructure Minister",
    "Dungeon Operations Manager",
    "Corporate Systems Lead",
    "Artifact Merchant",
    "Emergency Coordinator",
    "Data Archivist",
    "Network Cartographer",
    "Unknown Executive",
    "Field Commander",
]


NPC_TYPES = [
    "retired dungeon boss",
    "corporate necromancer",
    "municipal dragon keeper",
    "unregistered deity",
    "orbital administrator",
    "memory broker",
    "transit oracle",
    "archive detective",
    "guild accountant",
    "rogue systems architect",
    "forbidden researcher",
    "quiet billionaire",
    "government archivist",
    "professional curse auditor",
    "anonymous client",
]


NPC_TRAITS = [
    "never answers the same question twice",
    "collects obsolete access badges",
    "speaks exclusively in deployment metaphors",
    "keeps emergency documentation in a sword case",
    "knows every maintenance tunnel",
    "refuses to use automatic updates",
    "has memorized the entire incident archive",
    "believes every bug has a personality",
    "maintains a private backup of the city",
    "claims to have met the system architect",
]


NPC_RELATIONSHIPS = [
    "former employer",
    "current client",
    "technical rival",
    "trusted collaborator",
    "reluctant witness",
    "guild sponsor",
    "incident survivor",
    "project owner",
    "mysterious informant",
    "professional adversary",
]


NPC_SECRETS = [
    "owns an undocumented backup of the entire system",
    "knows why the original architecture was abandoned",
    "has a private administrator account",
    "was present during the first incident",
    "knows a route that officially does not exist",
    "has been receiving future-dated notifications",
    "quietly maintains the most important legacy process",
    "knows the identity of the anonymous client",
]


NPC_DIALOGUE = [
    "If the dashboard says everything is fine, check the basement.",
    "I don't need a new system. I need the old system to stop becoming interesting.",
    "We called it temporary three years ago.",
    "Nobody deleted that service. It simply stopped admitting that it existed.",
    "The incident began before the alert.",
    "You are the first engineer who asked what happens after the rollback.",
    "I can explain the architecture. I cannot explain why it works.",
    "Please fix it before the council notices we have been using it.",
]


# ============================================================
# INCIDENTS / QUESTS
# ============================================================

INCIDENT_TYPES = [
    "Unexpected Production Event",
    "Infrastructure Desynchronization",
    "Unauthorized Deployment",
    "Identity Collision",
    "Archive Corruption",
    "Dimensional Routing Failure",
    "Legacy System Awakening",
    "Monitoring Paradox",
    "Automated Recovery Failure",
    "Unknown Service Discovery",
]


INCIDENT_OPENERS = [
    "The first alert looked harmless.",
    "At 03:17, the system reported a condition nobody had configured.",
    "The dashboard remained green while three systems disappeared.",
    "A routine deployment produced an unfamiliar identifier.",
    "The incident began with one missing record.",
    "A maintenance process executed successfully and then refused to stop.",
]


INCIDENT_CONSEQUENCES = [
    "Operators lost confidence in the monitoring system.",
    "Several dependent services entered recovery mode.",
    "An undocumented process became visible to the entire organization.",
    "The event exposed a dependency nobody had recorded.",
    "The client temporarily suspended all deployments.",
    "The incident created a new permanent operational procedure.",
]


QUEST_OBJECTIVES = [
    "Repair infrastructure before the artificial eclipse",
    "Find the production deployer",
    "Stop the maintenance robot from becoming mayor",
    "Recover the missing archive index",
    "Map the station that appears between stations",
    "Find who keeps deploying the forbidden service",
    "Restore the guild's forgotten authentication system",
    "Investigate the dashboard that predicts tomorrow's incidents",
    "Recover a backup from the wrong timeline",
    "Determine why the city has two identical infrastructure teams",
]


QUEST_REWARDS = [
    "one suspiciously powerful access token",
    "priority access to the archive",
    "a permanent infrastructure budget",
    "three months without an incident",
    "an encrypted map of the maintenance network",
    "official permission to ignore one impossible requirement",
    "a legendary rollback key",
    "a sealed technical recommendation from the royal council",
]


# ============================================================
# NARRATIVE
# ============================================================

STORY_HOOKS = [
    "The system was supposed to be temporary.",
    "Nobody remembers approving this project.",
    "The client insists this was never supposed to happen.",
    "The architecture diagram is technically classified.",
    "Someone has been maintaining the system without appearing in the logs.",
    "The original project brief contains one sentence that should not be possible.",
]


STORY_TURNS = [
    "A routine investigation exposed a second system underneath the first.",
    "The apparent failure turned out to be a dependency behaving exactly as designed.",
    "The client revealed that the project had already been attempted twice.",
    "An NPC supplied a missing piece of the architecture.",
    "The incident created a new requirement nobody had anticipated.",
    "The recovery process became more important than the original feature.",
]


CLOSING_LINES = [
    "The system eventually became stable enough to be boring.",
    "The incident was resolved, although the documentation became considerably longer.",
    "The client accepted the result after confirming that reality remained intact.",
    "The final architecture survived every audit except the philosophical one.",
    "The project was declared complete when nobody could find anything else to break.",
]


STATUSES = [
    "Operational",
    "Stable",
    "Monitoring",
    "Restricted",
    "Recovered",
    "Classified",
    "In Production",
    "Under Observation",
    "Archived",
]


RISK_LEVELS = [
    "Low",
    "Moderate",
    "Elevated",
    "High",
    "Critical",
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

def build_config():
    rng = random.SystemRandom()

    build_identity = (
        f"{rng.choice('ABCDEFGHJKLMNPQRSTUVWXYZ')}"
        f"{rng.choice('ABCDEFGHJKLMNPQRSTUVWXYZ')}-"
        f"{rng.randint(100000, 999999)}"
    )

    ui_default = {
        "family": safe_choice(rng, UI_FAMILIES, "executive"),
        "layout": safe_choice(rng, LAYOUTS, "dashboard"),
        "nav": safe_choice(rng, NAVS, "top"),
        "hero_mode": safe_choice(rng, HERO_MODES, "identity"),
        "density": safe_choice(rng, DENSITIES, "normal"),
        "decoration": safe_choice(rng, DECORATIONS, "grid"),
    }

    return {
        "version": "4.0.0",

        "build_identity": build_identity,

        "generator": {
            "name": "Absurd Chaos Portfolio Generator",
            "version": "4.0.0",
            "purpose": "Procedural fictional portfolio generation",
        },

        "runtime_policy": {
            "browser_memory_only": True,
            "database": False,
            "api": False,
            "cookies": False,
            "local_storage": False,
            "session_storage": False,
            "indexed_db": False,
            "network_requests": False,
        },

        "ui_system": {
            "families": UI_FAMILIES,
            "layouts": LAYOUTS,
            "navs": NAVS,
            "hero_modes": HERO_MODES,
            "densities": DENSITIES,
            "decorations": DECORATIONS,
            "default": ui_default,
        },

        "content_limits": CONTENT_LIMITS,

        "card_labels": CARD_LABELS,

        "narrative_settings": {
            "card_first": True,
            "text_heavy": False,
            "experience_rich": True,
            "projects_rich": True,
            "npc_connected": True,
            "world_connected": True,
            "ui_language_connected": True,
        },

        "generation_counts": {
            "projects": 64,
            "npcs": 80,
            "worlds": len(WORLDS),
            "experiences": 48,
            "incidents": 64,
            "quests": 48,
        },

        "pools": {
            "names": NAMES,
            "titles": TITLES,
            "specialties": SPECIALTIES,
            "personalities": PERSONALITIES,
            "education": EDUCATION,
            "locations": LOCATIONS,
            "project_types": PROJECT_TYPES,
            "project_names": PROJECT_NAMES,
            "industries": INDUSTRIES,
            "experience_roles": EXPERIENCE_ROLES,
            "experience_openings": EXPERIENCE_OPENINGS,
            "experience_incidents": EXPERIENCE_INCIDENTS,
            "experience_lessons": EXPERIENCE_LESSONS,
            "npc_first_names": NPC_FIRST_NAMES,
            "npc_last_names": NPC_LAST_NAMES,
            "npc_roles": NPC_ROLES,
            "npc_types": NPC_TYPES,
            "npc_traits": NPC_TRAITS,
            "npc_relationships": NPC_RELATIONSHIPS,
            "npc_secrets": NPC_SECRETS,
            "npc_dialogue": NPC_DIALOGUE,
            "incident_types": INCIDENT_TYPES,
            "incident_openers": INCIDENT_OPENERS,
            "incident_consequences": INCIDENT_CONSEQUENCES,
            "quest_objectives": QUEST_OBJECTIVES,
            "quest_rewards": QUEST_REWARDS,
            "story_hooks": STORY_HOOKS,
            "story_turns": STORY_TURNS,
            "closing_lines": CLOSING_LINES,
            "statuses": STATUSES,
            "risk_levels": RISK_LEVELS,
        },

        "generated_world_seeds": WORLDS,

        "generated_npc_seeds": [
            {
                "first": first,
                "last": last,
                "role": role,
                "type": npc_type,
                "trait": trait,
                "relationship": relationship,
                "secret": secret,
                "dialogue": dialogue,
            }
            for first, last, role, npc_type, trait, relationship, secret, dialogue
            in zip(
                NPC_FIRST_NAMES * 10,
                NPC_LAST_NAMES * 10,
                NPC_ROLES * 5,
                NPC_TYPES * 5,
                NPC_TRAITS * 5,
                NPC_RELATIONSHIPS * 5,
                NPC_SECRETS * 5,
                NPC_DIALOGUE * 5,
            )
        ],

        "build_randomization": {
            "build_identity_random": True,
            "runtime_generation_random": True,
            "runtime_ui_random": True,
            "new_world_each_generation": True,
            "new_npcs_each_generation": True,
            "new_projects_each_generation": True,
            "new_experiences_each_generation": True,
            "new_incidents_each_generation": True,
            "new_quests_each_generation": True,
        },

        "features": {
            "absurd_projects": True,
            "absurd_experiences": True,
            "npc_project_connections": True,
            "npc_experience_connections": True,
            "world_driven_content": True,
            "ui_driven_writing": True,
            "responsive": True,
            "browser_memory_only": True,
        },
    }


def validate_config(config):
    required = [
        "version",
        "runtime_policy",
        "ui_system",
        "content_limits",
        "generation_counts",
        "generated_world_seeds",
        "generated_npc_seeds",
    ]

    for key in required:
        if key not in config:
            raise RuntimeError(
                f"Missing required configuration key: {key}"
            )

    policy = config["runtime_policy"]

    for key in [
        "database",
        "api",
        "cookies",
        "local_storage",
        "session_storage",
        "indexed_db",
        "network_requests",
    ]:
        if policy.get(key) is not False:
            raise RuntimeError(
                f"Runtime persistence/network policy violation: {key}"
            )

    if not config["generated_world_seeds"]:
        raise RuntimeError("World seed pool is empty.")

    if not config["generated_npc_seeds"]:
        raise RuntimeError("NPC seed pool is empty.")

    ui = config["ui_system"]

    for key in [
        "families",
        "layouts",
        "navs",
        "hero_modes",
        "densities",
        "decorations",
    ]:
        if not ui.get(key):
            raise RuntimeError(
                f"UI system pool is empty: {key}"
            )


def main():
    if not TEMPLATE_FILE.exists():
        raise FileNotFoundError(TEMPLATE_FILE)

    if not CSS_FILE.exists():
        raise FileNotFoundError(CSS_FILE)

    if not JS_FILE.exists():
        raise FileNotFoundError(JS_FILE)

    config = build_config()

    validate_config(config)

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
        separators=(",", ":"),
    )

    output = template

    output = output.replace(
        "{{GENERATED_CONFIG}}",
        config_json,
    )

    output = output.replace(
        "{{GENERATED_CSS}}",
        css,
    )

    output = output.replace(
        "{{GENERATED_JS}}",
        js,
    )

    if "{{GENERATED_CONFIG}}" in output:
        raise RuntimeError(
            "Unresolved GENERATED_CONFIG placeholder."
        )

    if "{{GENERATED_CSS}}" in output:
        raise RuntimeError(
            "Unresolved GENERATED_CSS placeholder."
        )

    if "{{GENERATED_JS}}" in output:
        raise RuntimeError(
            "Unresolved GENERATED_JS placeholder."
        )

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_FILE.write_text(
        output,
        encoding="utf-8",
    )

    print()
    print("==============================================")
    print(" ABSURD CHAOS PORTFOLIO")
    print("==============================================")
    print(
        f"Build identity : {config['build_identity']}"
    )
    print(
        f"Version        : {config['version']}"
    )
    print(
        f"Output         : {OUTPUT_FILE}"
    )
    print(
        "Runtime        : browser memory only"
    )
    print(
        "Database       : disabled"
    )
    print(
        "API            : disabled"
    )
    print(
        "LocalStorage   : disabled"
    )
    print(
        "SessionStorage : disabled"
    )
    print(
        "IndexedDB      : disabled"
    )
    print(
        "Cookies        : disabled"
    )
    print(
        "UI families    : "
        f"{len(UI_FAMILIES)}"
    )
    print(
        "Worlds         : "
        f"{len(WORLDS)}"
    )
    print(
        "Projects pool  : "
        f"{len(PROJECT_NAMES)}"
    )
    print(
        "NPC pool       : "
        f"{len(NPC_FIRST_NAMES) * len(NPC_LAST_NAMES)}+"
    )
    print("==============================================")
    print()


if __name__ == "__main__":
    main()
