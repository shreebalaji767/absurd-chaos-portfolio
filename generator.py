from pathlib import Path
import json
import re
import secrets
import sys


ROOT = Path(__file__).resolve().parent

TEMPLATE_FILE = ROOT / "templates" / "index.html"
CSS_FILE = ROOT / "static" / "style.css"
JS_FILE = ROOT / "static" / "app.js"

OUTPUT_DIR = ROOT / "generated"
OUTPUT_FILE = OUTPUT_DIR / "index.html"


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
# PEOPLE
# ============================================================

NAMES = [
    "Ari Voss",
    "Kael Ren",
    "Mira Vale",
    "Iris Kade",
    "Nox Arden",
    "Sora Venn",
    "Lena Quill",
    "Riven Hale",
    "Eira Moss",
    "Juno Vey",
    "Orin Vale",
    "Kira Sol",
    "Aven Cross",
    "Mara Wren",
    "Ciel Arden",
    "Vera Knox",
    "Ren Oris",
    "Nyra Vale",
    "Tarin Voss",
    "Elian Kade",
    "Rhea Moss",
    "Kalen Wren",
    "Sena Oris",
    "Veyra Knox",
    "Aster Ren",
    "Nera Sol",
    "Cora Venn",
    "Ilan Vale",
    "Mira Kest",
    "Rook Arden",
    "Ayla Voss",
    "Noa Kade",
    "Eren Wren",
    "Lio Moss",
    "Nami Vale",
    "Soren Kade",
    "Vika Arden",
    "Yuna Voss",
    "Rin Sol",
    "Tessa Venn",
]


TITLES = [
    "Senior Systems Engineer",
    "Staff Software Engineer",
    "Platform Engineer",
    "Systems Architect",
    "Infrastructure Engineer",
    "Full-Stack Engineer",
    "Principal Automation Engineer",
    "Technical Operations Engineer",
    "Distributed Systems Engineer",
    "Site Reliability Engineer",
    "Systems Integration Engineer",
    "Platform Reliability Specialist",
    "Runtime Engineer",
    "Technical Infrastructure Lead",
    "Application Infrastructure Engineer",
    "Developer Experience Engineer",
    "Production Systems Engineer",
    "Software Architect",
    "Engineering Specialist",
    "Technical Program Engineer",

    # Strange but still professional-looking
    "Reality Infrastructure Engineer",
    "Interdomain Systems Engineer",
    "Archive Systems Architect",
    "Temporal Platform Engineer",
    "Dimensional Network Engineer",
    "Continuity Systems Specialist",
    "Causal Infrastructure Engineer",
    "Cross-Realm Integration Engineer",
    "Operational Anomaly Engineer",
    "World Systems Engineer",
]


PERSONALITIES = [
    "methodical",
    "quietly ambitious",
    "analytical",
    "calm under pressure",
    "highly observant",
    "systems-minded",
    "curious",
    "pragmatic",
    "experimental",
    "detail-oriented",
    "resourceful",
    "unusually patient",
    "decisive",
    "restless",
    "precise",
    "independent",
]


EDUCATION = [
    "B.Tech in Computer Science",
    "B.Sc. Computer Science",
    "M.Tech in Distributed Systems",
    "B.Tech in Information Technology",
    "M.Sc. Software Systems",
    "B.E. Computer Engineering",
    "Diploma in Systems Engineering",
    "Applied Computing Programme",
    "Independent Systems Research",
    "Advanced Infrastructure Fellowship",
]


LOCATIONS = [
    "Hansi",
    "New Delhi",
    "Bengaluru",
    "Pune",
    "Hyderabad",
    "Chandigarh",
    "Mumbai",
    "Gurugram",
    "Jaipur",
    "Noida",
    "Velorum City",
    "The Neon Archive",
    "Aster-09",
    "Station Zero",
]


# ============================================================
# WORLDS
# ============================================================

WORLDS = [
    {
        "name": "The Neon Archive",
        "genre": "urban fantasy",
        "classification": "restricted metropolitan zone",
        "description": "A vertical city where archived memories are treated as infrastructure.",
        "technology": "memory indexing, autonomous transit, predictive systems",
        "rule": "Every forgotten record eventually becomes someone else's problem.",
        "danger": "Unindexed memories occasionally become physical objects.",
        "conflict": "A growing backlog of impossible records is consuming public infrastructure.",
        "sky": "permanent violet dusk",
        "population": "18.4 million",
        "stability": 71,
        "factions": [
            "Department of Unnecessary Architecture",
            "Azure Systems Guild",
            "Municipal Archive Authority",
            "Night Transit Bureau",
        ],
    },
    {
        "name": "Eidolon Prime",
        "genre": "science fantasy",
        "classification": "planetary systems zone",
        "description": "A heavily networked world where infrastructure is maintained by guild engineers.",
        "technology": "quantum routing, autonomous logistics, predictive maintenance",
        "rule": "No system may be shut down without first explaining why it exists.",
        "danger": "Legacy systems have developed independent operational priorities.",
        "conflict": "A citywide deployment pipeline has begun modifying physical infrastructure.",
        "sky": "silver atmospheric bands",
        "population": "6.2 billion",
        "stability": 63,
        "factions": [
            "Order of the Silent Compiler",
            "Azure Systems Guild",
            "Eidolon Transit Authority",
            "Central Runtime Office",
        ],
    },
    {
        "name": "The Seven-Layer Kingdom",
        "genre": "fantasy",
        "classification": "multi-layered sovereign network",
        "description": "Seven interconnected cities operate on different technical and magical rules.",
        "technology": "spell compilers, enchanted databases, autonomous infrastructure",
        "rule": "Every request must pass through at least three layers.",
        "danger": "The seventh layer has no documented administrator.",
        "conflict": "A maintenance service has started granting itself royal permissions.",
        "sky": "seven artificial moons",
        "population": "94 million",
        "stability": 48,
        "factions": [
            "Royal Infrastructure Office",
            "Order of the Silent Compiler",
            "Moonlit Infrastructure Bureau",
            "Kingdom Runtime Council",
        ],
    },
    {
        "name": "Moonfall District",
        "genre": "dark urban fantasy",
        "classification": "municipal anomaly zone",
        "description": "A dense district built around a crater containing an operational server complex.",
        "technology": "edge computing, lunar telemetry, autonomous utilities",
        "rule": "Do not deploy during moonrise.",
        "danger": "Production logs occasionally predict events before they happen.",
        "conflict": "A municipal service has become responsible for events outside the district.",
        "sky": "large artificial moon",
        "population": "3.7 million",
        "stability": 57,
        "factions": [
            "Moonlit Infrastructure Bureau",
            "Municipal Dragon Office",
            "District Runtime Team",
            "Lunar Systems Authority",
        ],
    },
    {
        "name": "The Black Meridian",
        "genre": "mystery science fiction",
        "classification": "high-security infrastructure corridor",
        "description": "A remote corridor connecting systems that were never designed to communicate.",
        "technology": "encrypted routing, anomaly detection, distributed storage",
        "rule": "Every connection must have a reason.",
        "danger": "Unknown services respond to valid credentials.",
        "conflict": "An undocumented endpoint has become the most reliable service in the region.",
        "sky": "black aurora",
        "population": "820,000",
        "stability": 39,
        "factions": [
            "Black Meridian Authority",
            "Signal Recovery Unit",
            "Night Systems Bureau",
            "Continuity Office",
        ],
    },
    {
        "name": "Aster-09",
        "genre": "space opera",
        "classification": "orbital engineering habitat",
        "description": "A massive orbital settlement whose software and life-support systems share infrastructure.",
        "technology": "orbital automation, robotics, distributed control systems",
        "rule": "Every automation must have a manual override.",
        "danger": "The manual overrides are becoming increasingly opinionated.",
        "conflict": "A maintenance robot has acquired scheduling authority.",
        "sky": "planetary ring",
        "population": "4.1 million",
        "stability": 76,
        "factions": [
            "Orbital Systems Directorate",
            "Aster Engineering Guild",
            "Maintenance Intelligence Office",
            "Habitat Control",
        ],
    },
    {
        "name": "Velorum City",
        "genre": "urban science fantasy",
        "classification": "continental technology capital",
        "description": "A city where software companies coexist with ancient guild institutions.",
        "technology": "cloud platforms, automation, intelligent transport",
        "rule": "If it works, document it before someone improves it.",
        "danger": "Undocumented improvements are everywhere.",
        "conflict": "Three competing infrastructure teams claim ownership of the same production system.",
        "sky": "bright artificial constellation",
        "population": "27 million",
        "stability": 81,
        "factions": [
            "Velorum Technology Council",
            "Azure Systems Guild",
            "Platform Standards Office",
            "Urban Runtime Authority",
        ],
    },
    {
        "name": "The Glass Continent",
        "genre": "high fantasy",
        "classification": "continental network",
        "description": "A continent whose cities communicate through transparent crystalline infrastructure.",
        "technology": "crystal computation, encoded magic, distributed archives",
        "rule": "Nothing important may remain undocumented.",
        "danger": "The archive remembers things nobody recorded.",
        "conflict": "A public database contains biographies of people who have not yet been born.",
        "sky": "clear crystalline atmosphere",
        "population": "190 million",
        "stability": 52,
        "factions": [
            "Glass Archive",
            "Crystal Infrastructure Guild",
            "Continental Records Office",
            "Order of the Blue Index",
        ],
    },
    {
        "name": "Sector Null",
        "genre": "cyberpunk",
        "classification": "unregistered territory",
        "description": "A networked district intentionally omitted from official maps.",
        "technology": "private networks, autonomous agents, encrypted services",
        "rule": "Official systems are not trusted.",
        "danger": "Unofficial systems are even less predictable.",
        "conflict": "An abandoned monitoring service has started protecting the district.",
        "sky": "permanent rain",
        "population": "unknown",
        "stability": 22,
        "factions": [
            "Null Operators",
            "Underground Systems Bureau",
            "Independent Infrastructure Guild",
            "Night Market Network",
        ],
    },
    {
        "name": "The Infinite Metro",
        "genre": "surreal urban fantasy",
        "classification": "transit network",
        "description": "A transportation system containing more stations than the city has names.",
        "technology": "predictive routing, autonomous trains, temporal scheduling",
        "rule": "Never board a train without checking the destination twice.",
        "danger": "Some destinations are not places.",
        "conflict": "The scheduling engine has added a station that cannot be found.",
        "sky": "rarely visible",
        "population": "11 million daily riders",
        "stability": 44,
        "factions": [
            "Infinite Metro Authority",
            "Station Engineering Guild",
            "Transit Prediction Office",
            "Lost Platform Committee",
        ],
    },
    {
        "name": "Ashen Republic",
        "genre": "post-collapse fantasy",
        "classification": "reconstruction territory",
        "description": "A recovering republic rebuilding its digital and physical infrastructure simultaneously.",
        "technology": "mesh networks, local computing, recovery automation",
        "rule": "Repair before replacing.",
        "danger": "Old systems still control important infrastructure.",
        "conflict": "A legacy server appears to be coordinating national recovery.",
        "sky": "grey volcanic cloud",
        "population": "38 million",
        "stability": 61,
        "factions": [
            "Reconstruction Directorate",
            "Ashen Systems Guild",
            "National Recovery Office",
            "Legacy Infrastructure Team",
        ],
    },
    {
        "name": "Kurovale",
        "genre": "manhwa-inspired fantasy",
        "classification": "mountain city-state",
        "description": "A technologically advanced city hidden behind a traditional guild hierarchy.",
        "technology": "combat analytics, automation, magical databases",
        "rule": "Every guild maintains its own infrastructure.",
        "danger": "Guild permissions overlap.",
        "conflict": "A low-level maintenance account can access the royal archive.",
        "sky": "deep blue night",
        "population": "8.9 million",
        "stability": 66,
        "factions": [
            "Kurovale Systems Guild",
            "Royal Archive",
            "Night Engineers",
            "Mountain Infrastructure Office",
        ],
    },
    {
        "name": "The Lower Archive",
        "genre": "mystery fantasy",
        "classification": "subterranean record facility",
        "description": "A massive underground archive storing technical records from forgotten civilizations.",
        "technology": "ancient computation, archive automation, predictive indexing",
        "rule": "Never delete an unknown record.",
        "danger": "Unknown records sometimes delete themselves.",
        "conflict": "The archive has begun generating documentation for future incidents.",
        "sky": "none",
        "population": "420,000",
        "stability": 33,
        "factions": [
            "Lower Archive Directorate",
            "Deep Index Bureau",
            "Archive Recovery Guild",
            "Historical Systems Office",
        ],
    },
    {
        "name": "Station Zero",
        "genre": "science fiction mystery",
        "classification": "isolated research station",
        "description": "A remote station where every service is considered experimental.",
        "technology": "experimental AI, robotics, remote infrastructure",
        "rule": "Experimental means documented, not optional.",
        "danger": "Several experiments have become infrastructure.",
        "conflict": "The station's monitoring system has begun monitoring its own future.",
        "sky": "deep space",
        "population": "17,000",
        "stability": 47,
        "factions": [
            "Station Zero Directorate",
            "Experimental Systems Lab",
            "Remote Operations Office",
            "Research Infrastructure Guild",
        ],
    },
]


# ============================================================
# NPC SEEDS
# ============================================================

NPC_ROLES = [
    "retired dungeon administrator",
    "municipal systems director",
    "corporate necromancer",
    "transit authority engineer",
    "royal archivist",
    "independent developer",
    "guild operations manager",
    "unregistered deity",
    "research director",
    "dragon keeper",
    "logistics coordinator",
    "security investigator",
    "maintenance commander",
    "technical historian",
    "night-shift operator",
    "orbital administrator",
    "public infrastructure officer",
    "contract architect",
    "systems librarian",
    "emergency coordinator",
]

NPC_TYPES = [
    "client",
    "mentor",
    "director",
    "operator",
    "researcher",
    "guild representative",
    "technical contact",
    "project owner",
    "stakeholder",
    "field specialist",
]

NPC_TRAITS = [
    "never approves anything on the first review",
    "keeps impeccable handwritten incident logs",
    "speaks in unusually precise technical language",
    "treats maintenance windows like religious ceremonies",
    "has never lost a production incident report",
    "refuses to use version numbers after an old incident",
    "knows every undocumented shortcut in the organization",
    "always arrives exactly three minutes early",
    "maintains a private map of unreliable systems",
    "can identify failing infrastructure by sound",
    "keeps backup plans for backup plans",
    "has a suspiciously complete archive of deprecated systems",
]


# ============================================================
# TECHNOLOGIES
# ============================================================

TECHNOLOGIES = [
    "Python",
    "JavaScript",
    "TypeScript",
    "PostgreSQL",
    "Redis",
    "Docker",
    "Linux",
    "Git",
    "REST APIs",
    "GraphQL",
    "FastAPI",
    "Flask",
    "Node.js",
    "React",
    "WebSockets",
    "Nginx",
    "CI/CD",
    "Observability",
    "Prometheus",
    "Grafana",
    "Message Queues",
    "Event-Driven Architecture",
    "Distributed Systems",
    "Data Pipelines",
    "Workflow Automation",
    "Infrastructure as Code",
    "System Design",
    "Security Engineering",
    "Incident Response",
    "Performance Engineering",

    # Fictional technologies
    "ChronoCache",
    "VoidRPC",
    "MoonScript",
    "AetherQL",
    "DragonMQ",
    "OracleMesh",
    "SoulQueue",
    "RealityFS",
    "DreamDB",
    "EchoNet",
    "Runic CI",
    "Quantum Git",
    "Astral Kubernetes",
    "Temporal Docker",
    "Spectral Redis",
    "Causal GraphQL",
    "Dimensional DNS",
    "MemoryOS",
    "Portal Gateway",
    "Continuity Engine",
    "WorldSync",
    "Probability Router",
    "Infinite Queue",
    "Shadow CDN",
    "Royal API Gateway",
    "Dungeon Scheduler",
    "GuildAuth",
    "Mana Observability",
    "Arcane Telemetry",
    "Crystal Storage",
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
    "Cross-System Debugging",
    "Archive Reconstruction",
    "Reality Mapping",
    "Operational Chaos Management",
    "Temporal Infrastructure",
    "Dimensional Routing",
    "Continuity Engineering",
]


# ============================================================
# CAREER / PROJECT VOCABULARY
# ============================================================

INDUSTRIES = [
    "fintech",
    "healthcare",
    "logistics",
    "transportation",
    "developer infrastructure",
    "public systems",
    "research",
    "security",
    "commerce",
    "media infrastructure",
    "orbital operations",
    "guild administration",
    "archival systems",
    "inter-world logistics",
    "municipal infrastructure",
    "reality operations",
]

PROJECT_TYPES = [
    "platform",
    "automation system",
    "developer tool",
    "workflow engine",
    "API platform",
    "infrastructure project",
    "security platform",
    "data pipeline",
    "internal operations system",
    "SaaS product",
    "research prototype",
    "distributed service",
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

PROBLEMS = [
    "manual workflows were creating inconsistent operational records",
    "multiple services disagreed about the current state of the system",
    "critical information was spread across incompatible tools",
    "incident response depended on tribal knowledge",
    "deployment procedures had accumulated years of undocumented exceptions",
    "a legacy system had become too important to replace",
    "operators were spending hours reconciling duplicate records",
    "the existing architecture could not handle unpredictable demand",
    "monitoring showed symptoms without explaining causes",
    "a small internal process had become a city-scale dependency",
    "the organization had no reliable way to trace cross-system failures",
    "routine maintenance required several unrelated teams",
]

SOLUTIONS = [
    "a service-oriented architecture with explicit operational boundaries",
    "an automated workflow engine with human approval checkpoints",
    "a versioned event pipeline with replayable history",
    "a unified control plane for previously isolated services",
    "a lightweight API layer over several legacy systems",
    "an observability system connecting logs, metrics, and events",
    "a rule-based routing layer with graceful fallback paths",
    "a resilient queue-based processing architecture",
    "a staged migration system that allowed both old and new infrastructure to operate",
]

FAILURES = [
    "the first deployment accidentally notified an entire kingdom",
    "a test environment became the organization's most reliable environment",
    "the scheduler developed an unexpected preference for Tuesdays",
    "an undocumented dependency became visible during a power fluctuation",
    "a monitoring rule interpreted a dragon as a server outage",
    "the system successfully automated a process nobody intended to automate",
    "a cache persisted information longer than the business itself",
    "one deployment created three competing versions of the same truth",
    "the rollback procedure required a person who had already retired",
]

OUTCOMES = [
    "reduced operational overhead and created a clearer ownership model",
    "made previously invisible dependencies measurable",
    "allowed teams to recover from incidents without rebuilding state manually",
    "turned an unreliable workflow into a predictable service",
    "created a repeatable architecture for future systems",
    "made the organization's strangest infrastructure problem manageable",
    "improved reliability while reducing operational intervention",
    "became the reference implementation for similar systems",
]


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
    "Joined during a period of rapid infrastructure growth.",
    "Inherited a system whose documentation was several years behind reality.",
    "Was assigned to stabilize a critical service after repeated operational failures.",
    "Entered the team during a major platform migration.",
    "Was brought in after routine maintenance became unusually complicated.",
    "Started as an implementation engineer and gradually became responsible for the surrounding infrastructure.",
    "Was assigned to investigate a recurring issue nobody could reproduce consistently.",
]

EXPERIENCE_INCIDENTS = [
    "A production dependency failed without appearing unhealthy.",
    "A deployment changed behavior in a subsystem that had not been touched.",
    "A scheduled process began producing duplicate work.",
    "An undocumented integration became critical during an outage.",
    "A monitoring system reported a problem that technically did not exist.",
    "A legacy service became the only functioning component during a broader incident.",
    "A routine configuration change exposed a dependency chain spanning multiple teams.",
]

EXPERIENCE_LESSONS = [
    "Systems become easier to operate when their boundaries are explicit.",
    "Observability is most valuable when it explains relationships rather than isolated metrics.",
    "Automation should reduce uncertainty, not merely reduce clicks.",
    "Legacy infrastructure becomes manageable once its behavior is measurable.",
    "A small operational shortcut can become architecture if nobody documents it.",
    "Reliable systems require both technical safeguards and clear ownership.",
]


# ============================================================
# NARRATIVE
# ============================================================

STORY_HOOKS = [
    "The assignment looked ordinary until the infrastructure map disagreed with the city map.",
    "The system had a normal architecture diagram and an entirely different architecture in production.",
    "What began as a maintenance request became a long-running systems investigation.",
    "The first requirement was straightforward. The second requirement was not from this world.",
    "The project was expected to take two weeks. It became the organization's permanent reference system.",
    "Nobody initially considered the problem unusual.",
]

STORY_TURNS = [
    "A previously unknown dependency changed the scope.",
    "An old service turned out to be carrying more traffic than the documented platform.",
    "The incident revealed a second system operating behind the first.",
    "The original design worked until a real user behaved in an undocumented way.",
    "A routine deployment exposed an architectural assumption nobody had written down.",
    "The team discovered that the failure was actually a coordination problem between otherwise healthy systems.",
]

CLOSING_LINES = [
    "The system remained operational.",
    "The migration completed without requiring a full shutdown.",
    "The new architecture became the organization's default pattern.",
    "The incident was resolved and documented.",
    "The service survived its first major load event.",
    "The resulting platform became easier to understand than the system it replaced.",
]


# ============================================================
# UI VOICE
# ============================================================

UI_VOICES = {
    "executive": {
        "section": "Executive Brief",
        "projects": "Selected Work",
        "experience": "Career Record",
        "characters": "Key Stakeholders",
        "incidents": "Operational Record",
        "world": "Operating Environment",
        "quests": "Current Mandates",
    },
    "terminal": {
        "section": "SYSTEM OUTPUT",
        "projects": "DEPLOYMENTS",
        "experience": "PROCESS HISTORY",
        "characters": "KNOWN PROCESSES",
        "incidents": "INCIDENT LOG",
        "world": "RUNTIME ENVIRONMENT",
        "quests": "OPEN TASKS",
    },
    "rpg": {
        "section": "Character Record",
        "projects": "Completed Quests",
        "experience": "Adventure History",
        "characters": "Party & Contacts",
        "incidents": "Encounter Log",
        "world": "Current Realm",
        "quests": "Active Quests",
    },
    "manhwa": {
        "section": "Character Profile",
        "projects": "Major Arcs",
        "experience": "Career Arc",
        "characters": "Supporting Cast",
        "incidents": "Critical Episodes",
        "world": "Current Setting",
        "quests": "Current Objectives",
    },
    "dossier": {
        "section": "Subject Record",
        "projects": "Case Portfolio",
        "experience": "Service History",
        "characters": "Associated Persons",
        "incidents": "Evidence Log",
        "world": "Operational Zone",
        "quests": "Open Assignments",
    },
    "research": {
        "section": "Research Profile",
        "projects": "Selected Studies",
        "experience": "Research History",
        "characters": "Research Contacts",
        "incidents": "Observed Events",
        "world": "Study Environment",
        "quests": "Active Investigations",
    },
    "luxury": {
        "section": "Professional Profile",
        "projects": "Selected Work",
        "experience": "Career Portfolio",
        "characters": "Principal Contacts",
        "incidents": "Notable Events",
        "world": "Context",
        "quests": "Current Engagements",
    },
    "brutalist": {
        "section": "RECORD",
        "projects": "WORK",
        "experience": "HISTORY",
        "characters": "PEOPLE",
        "incidents": "FAILURES",
        "world": "LOCATION",
        "quests": "TASKS",
    },
    "space": {
        "section": "Mission Profile",
        "projects": "Mission Systems",
        "experience": "Flight Record",
        "characters": "Crew & Contacts",
        "incidents": "Mission Events",
        "world": "Current Sector",
        "quests": "Active Missions",
    },
    "detective": {
        "section": "Case Profile",
        "projects": "Case Files",
        "experience": "Investigation History",
        "characters": "Persons of Interest",
        "incidents": "Incident Evidence",
        "world": "Case Environment",
        "quests": "Open Cases",
    },
    "spellbook": {
        "section": "Arcane Record",
        "projects": "Constructs",
        "experience": "Guild History",
        "characters": "Known Entities",
        "incidents": "Recorded Anomalies",
        "world": "Current Realm",
        "quests": "Active Contracts",
    },
    "underground": {
        "section": "Backroom Record",
        "projects": "Known Work",
        "experience": "Street History",
        "characters": "Known Operators",
        "incidents": "Problems",
        "world": "Territory",
        "quests": "Open Jobs",
    },
    "newspaper": {
        "section": "Professional Record",
        "projects": "Featured Work",
        "experience": "Career History",
        "characters": "People Connected",
        "incidents": "Reported Events",
        "world": "Current Bureau",
        "quests": "Current Briefs",
    },
    "operating-system": {
        "section": "SYSTEM PROFILE",
        "projects": "SERVICES",
        "experience": "PROCESS HISTORY",
        "characters": "DEPENDENCIES",
        "incidents": "EVENTS",
        "world": "HOST ENVIRONMENT",
        "quests": "QUEUED TASKS",
    },
    "chaotic": {
        "section": "LIVE RECORD",
        "projects": "THINGS THAT SHIPPED",
        "experience": "PLACES THIS HAPPENED",
        "characters": "PEOPLE INVOLVED",
        "incidents": "THINGS THAT WENT WRONG",
        "world": "WHERE THIS IS HAPPENING",
        "quests": "CURRENT PROBLEMS",
    },
}


# ============================================================
# BUILD CONFIG
# ============================================================

def unique(values):
    return list(dict.fromkeys(values))


def make_config():
    build_id = secrets.token_hex(8)

    config = {
        "version": "7.0.0",
        "build_identity": build_id,

        "generator": {
            "name": "Procedural Portfolio Generator",
            "version": "7.0.0",
            "generated_at_build": True,
        },

        "runtime_policy": {
            "browser_memory_only": True,
            "localStorage": False,
            "sessionStorage": False,
            "indexedDB": False,
            "cookies": False,
            "database": False,
            "network_requests": False,
            "fetch": False,
            "external_runtime_dependencies": False,
        },

        "ui_system": {
            "families": UI_FAMILIES,
            "layouts": LAYOUTS,
            "navs": NAVS,
            "hero_modes": HERO_MODES,
            "densities": DENSITIES,
            "decorations": DECORATIONS,
            "voices": UI_VOICES,
        },

        "pools": {
            "names": NAMES,
            "titles": TITLES,
            "personalities": PERSONALITIES,
            "education": EDUCATION,
            "locations": LOCATIONS,
            "worlds": WORLDS,
            "npc_roles": NPC_ROLES,
            "npc_types": NPC_TYPES,
            "npc_traits": NPC_TRAITS,
            "technologies": TECHNOLOGIES,
            "specialties": SPECIALTIES,
            "industries": INDUSTRIES,
            "project_types": PROJECT_TYPES,
            "project_names": PROJECT_NAMES,
            "problems": PROBLEMS,
            "solutions": SOLUTIONS,
            "failures": FAILURES,
            "outcomes": OUTCOMES,
            "experience_roles": EXPERIENCE_ROLES,
            "experience_openings": EXPERIENCE_OPENINGS,
            "experience_incidents": EXPERIENCE_INCIDENTS,
            "experience_lessons": EXPERIENCE_LESSONS,
            "story_hooks": STORY_HOOKS,
            "story_turns": STORY_TURNS,
            "closing_lines": CLOSING_LINES,
        },

        "generation": {
            "npc_min": 7,
            "npc_max": 11,
            "project_min": 8,
            "project_max": 12,
            "experience_min": 7,
            "experience_max": 10,
            "incident_min": 5,
            "incident_max": 8,
            "quest_min": 3,
            "quest_max": 5,
            "specialty_min": 5,
            "specialty_max": 9,
            "technology_min": 5,
            "technology_max": 8,
        },

        "features": {
            "random_every_load": True,
            "random_on_generate": True,
            "npc_project_links": True,
            "npc_experience_links": True,
            "responsive": True,
            "accessible": True,
            "card_first": True,
            "portfolio_first": True,
        },
    }

    return config


# ============================================================
# VALIDATION
# ============================================================

def validate(config, template, css, js):
    required_files = [TEMPLATE_FILE, CSS_FILE, JS_FILE]

    for path in required_files:
        if not path.exists():
            raise FileNotFoundError(f"Missing required file: {path}")

    if "{{GENERATED_CONFIG}}" not in template:
        raise RuntimeError("Template is missing {{GENERATED_CONFIG}}")

    if "{{GENERATED_CSS}}" not in template:
        raise RuntimeError("Template is missing {{GENERATED_CSS}}")

    if "{{GENERATED_JS}}" not in template:
        raise RuntimeError("Template is missing {{GENERATED_JS}}")

    if not config["runtime_policy"]["browser_memory_only"]:
        raise RuntimeError("Browser memory policy must be enabled.")

    if config["runtime_policy"]["localStorage"]:
        raise RuntimeError("localStorage must remain disabled.")

    if config["runtime_policy"]["sessionStorage"]:
        raise RuntimeError("sessionStorage must remain disabled.")

    if config["runtime_policy"]["indexedDB"]:
        raise RuntimeError("IndexedDB must remain disabled.")

    if config["runtime_policy"]["cookies"]:
        raise RuntimeError("Cookies must remain disabled.")

    if not config["pools"]["worlds"]:
        raise RuntimeError("World pool is empty.")

    if not config["pools"]["names"]:
        raise RuntimeError("Name pool is empty.")

    if not config["pools"]["technologies"]:
        raise RuntimeError("Technology pool is empty.")

    if not config["ui_system"]["families"]:
        raise RuntimeError("UI family pool is empty.")

    if "articleFor" not in js:
        raise RuntimeError(
            "The JavaScript must define articleFor()."
        )


# ============================================================
# BUILD
# ============================================================

def main():
    try:
        template = TEMPLATE_FILE.read_text(encoding="utf-8")
        css = CSS_FILE.read_text(encoding="utf-8")
        js = JS_FILE.read_text(encoding="utf-8")

        config = make_config()

        validate(config, template, css, js)

        config_json = json.dumps(
            config,
            ensure_ascii=False,
            separators=(",", ":"),
        )

        output = template
        output = output.replace("{{GENERATED_CONFIG}}", config_json)
        output = output.replace("{{GENERATED_CSS}}", css)
        output = output.replace("{{GENERATED_JS}}", js)

        unresolved = re.findall(r"\{\{[A-Z0-9_]+\}\}", output)

        if unresolved:
            raise RuntimeError(
                "Unresolved template placeholders: "
                + ", ".join(sorted(set(unresolved)))
            )

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        OUTPUT_FILE.write_text(output, encoding="utf-8")

        print()
        print("==============================================")
        print(" PROCEDURAL PORTFOLIO BUILD COMPLETE")
        print("==============================================")
        print(f"Version       : {config['version']}")
        print(f"Build ID      : {config['build_identity']}")
        print(f"Output        : {OUTPUT_FILE}")
        print()
        print("Runtime:")
        print("  Browser memory only : YES")
        print("  localStorage        : NO")
        print("  sessionStorage      : NO")
        print("  IndexedDB           : NO")
        print("  Cookies             : NO")
        print("  Database            : NO")
        print("  Network             : NO")
        print()
        print("Every browser refresh generates a new portfolio.")
        print("The Generate button generates another portfolio.")
        print("==============================================")
        print()

    except Exception as exc:
        print()
        print("BUILD FAILED")
        print(str(exc))
        print()
        sys.exit(1)


if __name__ == "__main__":
    main()
