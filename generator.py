from pathlib import Path
import json
import secrets
import re


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
# WORLDS
# ============================================================

WORLDS = [
    {
        "name": "The Neon Archive",
        "genre": "cyberpunk fantasy",
        "classification": "Restricted urban megastructure",
        "description": "A vertical city where every forgotten event becomes searchable infrastructure.",
        "sky": "violet advertisements and artificial constellations",
        "technology": "memory indexing, autonomous transit and illegal cognition engines",
        "social_rule": "Anything can be legal if somebody has archived the paperwork.",
        "danger": "The archive occasionally remembers events that never happened.",
        "conflict": "The city is losing pieces of its history every midnight.",
        "population": "82 million registered residents",
        "age": "417 years",
        "stability": "unstable",
        "rules": [
            "Never delete an incident marked BLUE.",
            "All elevators require a destination and a confession.",
            "Archived ghosts have tenant rights.",
            "Midnight deployments require two witnesses.",
            "Nobody is allowed to rename the moon."
        ],
        "factions": [
            "Department of Unnecessary Architecture",
            "Neon Archive Authority",
            "Order of the Silent Compiler",
            "Midnight Infrastructure Guild",
            "Municipal Ghost Registry"
        ]
    },
    {
        "name": "Eidolon Prime",
        "genre": "science fantasy",
        "classification": "Planetary research civilization",
        "description": "A world where scientists and sorcerers maintain infrastructure together.",
        "sky": "three moons and a permanent aurora",
        "technology": "quantum computation, spell engines and planetary observability",
        "social_rule": "Every theorem must survive one practical experiment.",
        "danger": "Experiments sometimes develop political opinions.",
        "conflict": "The planet's central computation has started predicting impossible people.",
        "population": "14 billion inhabitants",
        "age": "2,801 years",
        "stability": "volatile",
        "rules": [
            "Do not run experiments on Tuesdays.",
            "Every spell must have a rollback plan.",
            "Sentient equations require representation.",
            "Research elevators are classified as laboratories.",
            "Never trust a theorem that laughs."
        ],
        "factions": [
            "Eidolon Systems Council",
            "Astral Engineering Bureau",
            "Department of Impossible Mathematics",
            "Seven Moon Research Guild",
            "Prime Infrastructure Court"
        ]
    },
    {
        "name": "The Seven-Layer Kingdom",
        "genre": "fantasy engineering",
        "classification": "Vertical kingdom",
        "description": "Seven enormous layers stack above one another, each believing it is the real world.",
        "sky": "a ceiling made of clouds, stone and old network cables",
        "technology": "mechanical magic, rune databases and dragon-powered servers",
        "social_rule": "Every layer has its own definition of reality.",
        "danger": "The layers occasionally reorder themselves.",
        "conflict": "Layer Seven has discovered Layer Eight.",
        "population": "391 million citizens",
        "age": "1,903 years",
        "stability": "questionable",
        "rules": [
            "Never use Layer Three elevators after sunset.",
            "Dragons own the production cluster.",
            "Royal decrees require version numbers.",
            "A failed spell is considered technical debt.",
            "Layer Eight must not be mentioned."
        ],
        "factions": [
            "Royal Infrastructure Office",
            "Dragon Systems Consortium",
            "Knights of Continuous Deployment",
            "Rune Database Society",
            "Lower Layer Workers Union"
        ]
    },
    {
        "name": "Moonfall District",
        "genre": "urban supernatural",
        "classification": "Nocturnal metropolitan zone",
        "description": "A district permanently illuminated by a moon that fell too close to the ground.",
        "sky": "one enormous moon hovering between skyscrapers",
        "technology": "lunar networking, spectral transit and predictive infrastructure",
        "social_rule": "Never ask why the moon is following you.",
        "danger": "Shadows occasionally become independent residents.",
        "conflict": "The district's shadows are organizing a municipal election.",
        "population": "19 million",
        "age": "89 years",
        "stability": "highly unstable",
        "rules": [
            "Shadows must register addresses.",
            "Moonlight outages are treated as emergencies.",
            "Do not deploy during an eclipse.",
            "Ghosts may submit support tickets.",
            "Never give a vampire administrator access."
        ],
        "factions": [
            "Moonfall Municipal Systems",
            "Shadow Workers Cooperative",
            "Lunar Transit Bureau",
            "Night Operations Division",
            "Apartment 404 Council"
        ]
    },
    {
        "name": "The Black Meridian",
        "genre": "dark fantasy",
        "classification": "Forbidden continental boundary",
        "description": "A continent divided by a black line that behaves like a living system.",
        "sky": "black stars and red artificial weather",
        "technology": "ritual computation and ancient communication networks",
        "social_rule": "Everything has a price, including silence.",
        "danger": "The Meridian moves when nobody is watching.",
        "conflict": "Someone has accidentally pushed the entire continent into production.",
        "population": "unknown",
        "age": "possibly 12,000 years",
        "stability": "catastrophic",
        "rules": [
            "Never cross the Meridian alone.",
            "Production access is hereditary.",
            "Dead systems can still issue commands.",
            "The north does not acknowledge the south.",
            "Logs must be written in ink."
        ],
        "factions": [
            "Black Meridian Authority",
            "Ash Engineers",
            "The Silent Deployment Order",
            "Night Cartographers",
            "Underground Archive"
        ]
    },
    {
        "name": "Aster-09",
        "genre": "space opera",
        "classification": "Mobile orbital civilization",
        "description": "A colossal station travelling between stars while pretending to be a normal city.",
        "sky": "artificial sunrise cycles",
        "technology": "warp routing, orbital manufacturing and sentient maintenance systems",
        "social_rule": "Every problem belongs to somebody eventually.",
        "danger": "The station changes destination when nobody files a ticket.",
        "conflict": "The maintenance AI wants to become mayor.",
        "population": "4.8 million",
        "age": "216 years",
        "stability": "mostly operational",
        "rules": [
            "No unauthorized warp routes.",
            "Maintenance robots cannot vote.",
            "Airlocks require three approvals.",
            "Do not reboot navigation during breakfast.",
            "The station's cat has root access."
        ],
        "factions": [
            "Aster Systems Command",
            "Orbital Maintenance Guild",
            "Warp Navigation Bureau",
            "Station Citizens Assembly",
            "Cat Security Division"
        ]
    },
    {
        "name": "Velorum City",
        "genre": "high fantasy metropolis",
        "classification": "Magical megacity",
        "description": "A city where every building is alive and infrastructure has personalities.",
        "sky": "golden clouds and floating railway lines",
        "technology": "living architecture, teleportation and crystal databases",
        "social_rule": "Buildings may refuse service.",
        "danger": "Old houses remember previous owners.",
        "conflict": "The central train station has stopped accepting humans.",
        "population": "27 million",
        "age": "1,201 years",
        "stability": "temperamental",
        "rules": [
            "Ask buildings before modifying them.",
            "Teleportation requires a reason.",
            "Railway spirits receive holidays.",
            "Do not insult public infrastructure.",
            "Crystal databases cannot be used for gossip."
        ],
        "factions": [
            "Velorum Transit Authority",
            "Living Architecture Guild",
            "Crystal Systems Office",
            "Royal Automation Bureau",
            "Old Building Society"
        ]
    },
    {
        "name": "The Glass Continent",
        "genre": "post-apocalyptic fantasy",
        "classification": "Fragile continental ecosystem",
        "description": "A continent made almost entirely of transparent material.",
        "sky": "bright white sunlight",
        "technology": "solar machinery, glass computation and ancient automation",
        "social_rule": "Everyone can see everything, but nobody agrees what they saw.",
        "danger": "Invisible storms.",
        "conflict": "The continent is slowly becoming opaque.",
        "population": "611 million",
        "age": "unknown",
        "stability": "fragile",
        "rules": [
            "No loud deployments.",
            "Never throw anything.",
            "All shadows must be documented.",
            "Glass roads have right of way.",
            "Opacity incidents require immediate reporting."
        ],
        "factions": [
            "Glass Infrastructure Authority",
            "Transparent Systems Guild",
            "Solar Engineering Collective",
            "Continental Archive",
            "Invisible Weather Bureau"
        ]
    },
    {
        "name": "Sector Null",
        "genre": "experimental science fiction",
        "classification": "Unmapped region",
        "description": "A region of reality where normal assumptions fail politely.",
        "sky": "whatever the observer expects",
        "technology": "probability engines and self-correcting software",
        "social_rule": "There are no rules, except this one.",
        "danger": "Contradictions.",
        "conflict": "The sector has started generating its own documentation.",
        "population": "unknown",
        "age": "not applicable",
        "stability": "undefined",
        "rules": [
            "Null values are legally recognized citizens.",
            "Documentation changes reality.",
            "Do not calculate the population.",
            "Errors are treated as witnesses.",
            "Do not ask what happened before Null."
        ],
        "factions": [
            "Null Systems Directorate",
            "Contradiction Research Bureau",
            "Zero-Day Philosophers",
            "Undefined Operations Guild",
            "Documentation Authority"
        ]
    },
    {
        "name": "The Infinite Metro",
        "genre": "surreal urban fantasy",
        "classification": "Infinite transportation network",
        "description": "A railway system containing more stations than there are possible destinations.",
        "sky": "occasionally visible through station ceilings",
        "technology": "recursive trains, route prediction and temporal ticketing",
        "social_rule": "You are where your ticket says you are.",
        "danger": "Wrong trains can take you into alternate versions of yourself.",
        "conflict": "Station 0 has appeared again.",
        "population": "unmeasurable",
        "age": "older than the timetable",
        "stability": "delayed",
        "rules": [
            "Keep your ticket.",
            "Do not board trains marked yesterday.",
            "Station announcements are legally binding.",
            "Lost passengers may become infrastructure.",
            "Never trust an empty platform."
        ],
        "factions": [
            "Infinite Metro Authority",
            "Route Engineers",
            "Platform 13 Society",
            "Timetable Archivists",
            "Lost Passenger Union"
        ]
    },
    {
        "name": "Ashen Republic",
        "genre": "political fantasy",
        "classification": "Post-war republic",
        "description": "A rebuilding nation powered by extremely determined engineers.",
        "sky": "grey with occasional orange auroras",
        "technology": "industrial automation, civic software and reconstruction networks",
        "social_rule": "Everything must eventually be rebuilt.",
        "danger": "Legacy systems from the previous regime.",
        "conflict": "Old infrastructure continues following obsolete laws.",
        "population": "203 million",
        "age": "74 years",
        "stability": "recovering",
        "rules": [
            "Infrastructure must be documented.",
            "Legacy systems cannot be destroyed without witnesses.",
            "Every public system needs an owner.",
            "Emergency repairs outrank paperwork.",
            "Reconstruction is everyone's problem."
        ],
        "factions": [
            "Republic Infrastructure Office",
            "Civic Systems Guild",
            "Legacy Recovery Bureau",
            "Reconstruction Engineers",
            "Public Automation Council"
        ]
    },
    {
        "name": "Kurovale",
        "genre": "manhwa-inspired dark fantasy",
        "classification": "Mountain kingdom",
        "description": "A quiet kingdom where every powerful person has a secret second occupation.",
        "sky": "deep blue twilight",
        "technology": "ancient artifacts, rune networking and mechanical familiars",
        "social_rule": "Never underestimate the quiet person.",
        "danger": "The mountains move.",
        "conflict": "An ancient artifact has opened a support portal.",
        "population": "38 million",
        "age": "3,117 years",
        "stability": "mysterious",
        "rules": [
            "Artifacts require documentation.",
            "Guild masters cannot hide production credentials.",
            "Mountains must be treated as live systems.",
            "Do not duel during maintenance windows.",
            "The royal library has administrator access."
        ],
        "factions": [
            "Kurovale Royal Guild",
            "Artifact Systems Bureau",
            "Mountain Engineering Order",
            "Nightblade Infrastructure",
            "Royal Library Operations"
        ]
    },
    {
        "name": "The Lower Archive",
        "genre": "mystery fantasy",
        "classification": "Underground information civilization",
        "description": "An enormous subterranean archive containing records of civilizations that may never have existed.",
        "sky": "none",
        "technology": "memory machines and biological databases",
        "social_rule": "Every secret eventually becomes metadata.",
        "danger": "The archive catalogs its visitors.",
        "conflict": "The archive has created a file about itself.",
        "population": "unknown",
        "age": "estimated 8,000 years",
        "stability": "secret",
        "rules": [
            "No file may be permanently deleted.",
            "Visitors must sign in.",
            "Do not read your own historical record.",
            "Archives may disagree with reality.",
            "Metadata has legal authority."
        ],
        "factions": [
            "Lower Archive Authority",
            "Memory Indexing Guild",
            "Secret Documentation Bureau",
            "Historical Recovery Team",
            "Metadata Court"
        ]
    },
    {
        "name": "Station Zero",
        "genre": "cosmic mystery",
        "classification": "Unknown orbital object",
        "description": "A station that appears whenever a civilization reaches a certain level of technological absurdity.",
        "sky": "a black void filled with impossible stars",
        "technology": "unknown",
        "social_rule": "Questions are more dangerous than answers.",
        "danger": "The station learns.",
        "conflict": "Someone has discovered the station's source code.",
        "population": "variable",
        "age": "older than recorded time",
        "stability": "unknown",
        "rules": [
            "Never open Door Zero.",
            "Do not touch unknown consoles.",
            "Every room may have a second purpose.",
            "The station records everything.",
            "Leave before the lights turn blue."
        ],
        "factions": [
            "Station Zero Custodians",
            "Cosmic Systems Bureau",
            "Door Research Division",
            "Unknown Infrastructure Office",
            "Black Console Society"
        ]
    }
]


# ============================================================
# NPC SEEDS
# ============================================================

NPC_SEEDS = [
    ("Ari", "Voss", "retired dungeon boss", "calm but suspicious", "occasionally audits strangers"),
    ("Kael", "Ren", "corporate necromancer", "aggressively organized", "keeps dead servers operational"),
    ("Mira", "Vale", "municipal dragon keeper", "cheerfully dangerous", "speaks fluent dragon"),
    ("Sora", "Kade", "unregistered deity", "polite and exhausted", "has forgotten their own domain"),
    ("Lio", "Mercer", "railway oracle", "dramatic", "predicts delays before they happen"),
    ("Nera", "Quill", "forbidden archivist", "quietly terrifying", "knows who deleted the moon"),
    ("Ren", "Ashford", "guild accountant", "extremely practical", "balances magical debt"),
    ("Yuna", "Mori", "shadow engineer", "sarcastic", "has three shadows"),
    ("Taro", "Vale", "artifact mechanic", "optimistic", "repairs objects by arguing with them"),
    ("Vera", "Nox", "night-shift architect", "sleep deprived", "designed a building that moves"),
    ("Jin", "Orion", "orbital mechanic", "reckless", "owns a forbidden wrench"),
    ("Aya", "Rin", "memory detective", "observant", "remembers events that never happened"),
    ("Riku", "Sable", "professional quest writer", "melodramatic", "has never completed a quest"),
    ("Mika", "Storm", "weather administrator", "irritable", "controls weather through spreadsheets"),
    ("Hana", "Wren", "ghost support specialist", "patient", "answers tickets from the dead"),
    ("Noa", "Kestrel", "reality cartographer", "curious", "maps places that do not exist"),
    ("Eli", "Morrow", "royal systems engineer", "formal", "has root access to the castle"),
    ("Rhea", "Vale", "interdimensional courier", "fast talking", "delivers packages to yesterday"),
    ("Sol", "Drake", "dragon infrastructure officer", "serious", "files maintenance requests for dragons"),
    ("Kira", "Moon", "lunar network operator", "mysterious", "never appears in daylight"),
    ("Theo", "Grimm", "legacy system archaeologist", "patient", "can resurrect obsolete software"),
    ("Iris", "North", "probability analyst", "precise", "has already seen this conversation"),
    ("Mako", "Reyes", "emergency spell engineer", "decisive", "deploys fixes during magical disasters"),
    ("Niko", "Frost", "underground systems broker", "secretive", "knows seven illegal APIs"),
    ("Ena", "Cross", "timeline librarian", "absent minded", "returns books before they are borrowed"),
    ("Vik", "Rowan", "station security captain", "suspicious", "interrogates vending machines"),
    ("Luna", "Hart", "dream infrastructure specialist", "gentle", "maintains sleeping cities"),
    ("Seth", "Black", "forbidden database administrator", "deadpan", "has a database containing future passwords"),
    ("Mai", "Kuro", "artifact UX designer", "creative", "redesigns cursed objects"),
    ("Dax", "Stone", "mountain systems engineer", "blunt", "has negotiated with a mountain"),
    ("Rin", "Aster", "spaceport incident commander", "focused", "once evacuated an entire moon"),
    ("Vale", "Crow", "anonymous consultant", "cryptic", "refuses to reveal their real name"),
    ("Nami", "Fox", "government automation specialist", "efficient", "automated the complaint department"),
    ("Kai", "Winter", "portal technician", "careful", "labels every portal"),
    ("Mira", "Kane", "royal librarian", "intense", "has read classified source code"),
    ("Oren", "Dusk", "professional monster negotiator", "friendly", "has never lost a negotiation"),
    ("Sia", "Bloom", "medical systems engineer", "compassionate", "built a hospital for immortal patients"),
    ("Kyo", "Vale", "chaos operations consultant", "enthusiastic", "causes incidents accidentally"),
    ("Arin", "Shade", "masked infrastructure guardian", "silent", "communicates through logs"),
    ("Yori", "Bell", "municipal wizard", "bureaucratic", "requires three forms for teleportation"),
    ("Tess", "Ray", "experimental AI familiar", "curious", "insists on being called a citizen"),
]


# ============================================================
# GENERAL VOCABULARY
# ============================================================

NAMES = [
    "Ari Voss", "Kael Ren", "Mira Vale", "Sora Kade",
    "Lio Mercer", "Nera Quill", "Yuna Mori", "Taro Vale",
    "Vera Nox", "Jin Orion", "Aya Rin", "Riku Sable",
    "Mika Storm", "Hana Wren", "Noa Kestrel", "Eli Morrow",
    "Rhea Vale", "Sol Drake", "Kira Moon", "Theo Grimm",
    "Iris North", "Mako Reyes", "Niko Frost", "Ena Cross",
    "Vik Rowan", "Luna Hart", "Seth Black", "Mai Kuro",
    "Dax Stone", "Rin Aster", "Vale Crow", "Nami Fox",
    "Kai Winter", "Oren Dusk", "Sia Bloom", "Kyo Vale",
]

TITLES = [
    "Senior Systems Engineer",
    "Staff Software Engineer",
    "Platform Engineer",
    "Systems Architect",
    "Infrastructure Engineer",
    "Full-Stack Engineer",
    "Automation Engineer",
    "Distributed Systems Engineer",
    "Security Engineer",
    "Developer Experience Engineer",
    "Reality Infrastructure Engineer",
    "Interdimensional Systems Consultant",
    "Royal Infrastructure Engineer",
    "Archive Systems Engineer",
    "Chaos Operations Engineer",
    "Impossible Requirements Engineer",
    "Cross-World Integration Engineer",
    "Emergency Software Engineer",
    "Legacy Systems Archaeologist",
    "Production Reality Engineer",
]

SPECIALTIES = [
    "Python",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
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
    "Portal Routing",
    "Artifact Tracking",
    "Temporal Systems",
    "Memory Indexing",
]

PERSONALITIES = [
    "methodical",
    "quietly chaotic",
    "aggressively curious",
    "calm under impossible pressure",
    "dramatic but reliable",
    "extremely practical",
    "optimistic",
    "suspiciously competent",
    "sleep deprived",
    "bureaucratically fearless",
    "deadpan",
    "experimental",
    "precise",
    "reckless but effective",
    "mysteriously organized",
]

EDUCATION = [
    "B.Sc. Computer Science",
    "B.Tech. Software Engineering",
    "M.Tech. Distributed Systems",
    "Guild Diploma in Infrastructure",
    "Royal Academy of Systems",
    "Independent Researcher",
    "Archive Engineering Fellowship",
    "Orbital Systems Certification",
    "Self-Taught Systems Engineer",
]

LOCATIONS = [
    "Hansi",
    "The Neon Archive",
    "Eidolon Prime",
    "Kurovale",
    "Aster-09",
    "Moonfall District",
    "Station Zero",
    "The Infinite Metro",
    "Sector Null",
    "The Lower Archive",
]

INDUSTRIES = [
    "infrastructure",
    "healthcare technology",
    "transportation",
    "government automation",
    "developer tooling",
    "financial systems",
    "orbital logistics",
    "archive technology",
    "security",
    "education technology",
    "artifact management",
    "emergency response",
    "inter-world communication",
    "municipal services",
    "reality infrastructure",
]

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
    "Atlas", "Nightwatch", "Helix", "Axiom", "Orchid",
    "Sentinel", "Mosaic", "Northstar", "Pulse", "Meridian",
    "Vector", "Lattice", "Orbit", "Foundry", "Beacon",
    "Relay", "Forge", "Prism", "Echo", "Vanta",
    "Parallax", "Monolith", "Eclipse", "Archive",
    "Horizon", "Blackbox", "Keystone", "Ghostline",
    "Afterlight", "Wayfinder", "Redshift", "Obsidian",
    "Daybreak", "Mirage", "Signal", "Citadel",
]

PROBLEMS = [
    "critical infrastructure was being operated through spreadsheets",
    "three departments had independently invented the same API",
    "the production system had no reliable observability",
    "a legacy service had survived longer than its documentation",
    "operators were manually reconciling thousands of records",
    "the system behaved differently during eclipses",
    "the customer had accidentally deployed the same service seventeen times",
    "nobody knew which database was authoritative",
    "an automated process had started filing complaints against itself",
    "the existing workflow required twelve people and one wizard",
    "incident response depended on messages buried in ancient chat rooms",
    "a transportation system could not distinguish yesterday from tomorrow",
    "an archive contained contradictory versions of the same person",
    "production access was controlled by a ceremonial key",
    "the system worked perfectly except when anyone observed it",
]

SOLUTIONS = [
    "a small event-driven platform with explicit ownership",
    "a resilient workflow engine with audit trails",
    "a modular API layer with automated validation",
    "a monitoring stack with actionable incident signals",
    "a self-healing deployment pipeline",
    "a searchable operational archive",
    "a role-based control system",
    "a browser-first interface with zero persistence",
    "a distributed synchronization layer",
    "a deterministic recovery process",
    "a lightweight automation service",
    "a compatibility layer for obsolete systems",
]

FAILURES = [
    "the first deployment accidentally promoted a maintenance robot",
    "the prototype attempted to archive the moon",
    "a test environment became politically independent",
    "the system generated 4,000 duplicate tickets",
    "an automated alert declared the architect missing",
    "the database briefly believed it was a railway station",
    "the rollback script rolled back the wrong century",
    "a production dashboard began writing poetry",
    "the monitoring system started monitoring itself",
    "the API returned emotionally complicated errors",
]

OUTCOMES = [
    "cut operational work dramatically",
    "made incidents easier to isolate",
    "reduced manual reconciliation",
    "created a stable deployment process",
    "gave operators a single source of truth",
    "made the impossible workflow boring",
    "kept the system alive through three reality shifts",
    "allowed the team to sleep during maintenance",
    "recovered a lost archive",
    "prevented a city-wide outage",
    "turned an absurd process into a predictable one",
]

OPENINGS = [
    "The assignment began with a suspiciously short message.",
    "The original brief contained seventeen contradictions.",
    "The client arrived carrying three broken terminals.",
    "Nobody initially admitted that the system was alive.",
    "The first meeting lasted eleven minutes and caused a new incident.",
    "The project started after the previous engineer disappeared into production.",
    "The organization needed someone willing to touch the ancient deployment system.",
    "A routine maintenance request became a cross-world emergency.",
]

INCIDENTS = [
    "a deployment window collided with a lunar event",
    "an administrator accidentally granted root access to a vending machine",
    "the primary queue began receiving messages from the future",
    "a backup server refused to be backed up",
    "the monitoring system reported an imaginary outage",
    "a production user turned out to be an artifact",
    "the incident commander was replaced by an automated duplicate",
    "a harmless configuration change altered local gravity",
]

LESSONS = [
    "make ownership explicit before making systems clever",
    "automate the boring parts before automating the dangerous parts",
    "every system eventually becomes someone else's legacy",
    "observability is cheaper than guessing",
    "documentation should survive the people who wrote it",
    "a rollback plan is a love letter to future operators",
    "never trust a system that cannot explain itself",
]

FACTIONS = [
    "Department of Unnecessary Architecture",
    "Azure Systems Guild",
    "Order of the Silent Compiler",
    "Moonlit Infrastructure Bureau",
    "Municipal Dragon Office",
    "Interdimensional Operations Group",
    "Royal Deployment Council",
    "Black Archive Division",
    "Underground Automation Guild",
    "Seven Moon Research Bureau",
    "Infinite Metro Engineering",
    "Reality Stability Office",
    "Emergency Systems Directorate",
    "Artifact Management Council",
    "Temporal Infrastructure Bureau",
    "Night Operations Guild",
]

QUESTS = [
    "Repair infrastructure before the artificial eclipse.",
    "Find the production deployer before the city notices.",
    "Stop the maintenance robot from becoming mayor.",
    "Recover the database that escaped into another timeline.",
    "Convince the railway oracle to stop predicting delays.",
    "Locate the missing administrator account.",
    "Restore the archive before it archives itself.",
    "Prevent the moon from receiving root access.",
    "Find out who deployed the forbidden configuration.",
    "Repair the portal before yesterday arrives.",
    "Recover the royal source code.",
    "Convince the mountain to accept a maintenance window.",
]

REWARDS = [
    "one legally recognized artifact",
    "three days of uninterrupted uptime",
    "a mysterious golden credential",
    "a permanent exemption from paperwork",
    "a suspiciously powerful debugging tool",
    "one favor from a dragon",
    "priority access to the archive",
    "a lifetime supply of emergency coffee",
    "a map of one impossible location",
    "a promotion nobody remembers approving",
]


# ============================================================
# UI VOICE / STYLE
# ============================================================

VOICE_PACKS = {
    "executive": {
        "section": "Executive Brief",
        "experience": "Professional Record",
        "project": "Case Study",
        "npc": "Stakeholder",
        "incident": "Operational Event",
        "quest": "Strategic Objective",
        "world": "Operating Environment",
        "timeline": "Career Timeline",
        "archive": "Archive Control",
    },
    "terminal": {
        "section": "STDOUT",
        "experience": "PROCESS HISTORY",
        "project": "SERVICE RECORD",
        "npc": "PROCESS OWNER",
        "incident": "INCIDENT LOG",
        "quest": "EXECUTION QUEUE",
        "world": "SYSTEM ENVIRONMENT",
        "timeline": "SYSTEM TIMELINE",
        "archive": "ARCHIVE STATUS",
    },
    "rpg": {
        "section": "Quest Log",
        "experience": "Adventure Record",
        "project": "Completed Quest",
        "npc": "Party Member",
        "incident": "Encounter",
        "quest": "Active Quest",
        "world": "Realm",
        "timeline": "Chronicle",
        "archive": "Save Record",
    },
    "manhwa": {
        "section": "Character Arc",
        "experience": "Arc Record",
        "project": "Signature Mission",
        "npc": "Key Character",
        "incident": "Plot Incident",
        "quest": "Next Arc",
        "world": "Current Realm",
        "timeline": "Story Timeline",
        "archive": "Chapter Archive",
    },
    "dossier": {
        "section": "Evidence File",
        "experience": "Personnel Record",
        "project": "Case File",
        "npc": "Subject",
        "incident": "Incident Evidence",
        "quest": "Open Directive",
        "world": "Operational Territory",
        "timeline": "Chronology",
        "archive": "Classification",
    },
    "research": {
        "section": "Research Note",
        "experience": "Field Study",
        "project": "Research System",
        "npc": "Research Contact",
        "incident": "Observed Event",
        "quest": "Research Objective",
        "world": "Study Environment",
        "timeline": "Research Timeline",
        "archive": "Dataset Archive",
    },
    "luxury": {
        "section": "Portfolio Note",
        "experience": "Selected Engagement",
        "project": "Signature Work",
        "npc": "Principal Contact",
        "incident": "Notable Event",
        "quest": "Current Pursuit",
        "world": "Context",
        "timeline": "Selected History",
        "archive": "Private Archive",
    },
    "brutalist": {
        "section": "RAW RECORD",
        "experience": "WORK",
        "project": "BUILD",
        "npc": "PERSON",
        "incident": "FAILURE",
        "quest": "TASK",
        "world": "PLACE",
        "timeline": "HISTORY",
        "archive": "ARCHIVE",
    },
    "space": {
        "section": "Mission Control",
        "experience": "Mission Record",
        "project": "Mission System",
        "npc": "Crew Contact",
        "incident": "Flight Incident",
        "quest": "Mission Objective",
        "world": "Mission Environment",
        "timeline": "Flight Timeline",
        "archive": "Mission Archive",
    },
    "detective": {
        "section": "Case Notes",
        "experience": "Investigation",
        "project": "Case File",
        "npc": "Person of Interest",
        "incident": "Evidence",
        "quest": "Open Lead",
        "world": "Scene",
        "timeline": "Case Timeline",
        "archive": "Evidence Archive",
    },
    "spellbook": {
        "section": "Arcane Record",
        "experience": "Guild Chronicle",
        "project": "Grand Working",
        "npc": "Bound Ally",
        "incident": "Magical Incident",
        "quest": "Active Spell",
        "world": "Realm",
        "timeline": "Chronicle",
        "archive": "Grimoire Index",
    },
    "underground": {
        "section": "BACKROOM FILE",
        "experience": "FIELD JOB",
        "project": "OPERATION",
        "npc": "CONTACT",
        "incident": "PROBLEM",
        "quest": "JOB",
        "world": "TERRITORY",
        "timeline": "HISTORY",
        "archive": "DEAD DROP",
    },
    "newspaper": {
        "section": "Front Page",
        "experience": "Career Report",
        "project": "Featured Build",
        "npc": "Interview",
        "incident": "Breaking Event",
        "quest": "Next Assignment",
        "world": "World Desk",
        "timeline": "Archive",
        "archive": "Edition Record",
    },
    "operating-system": {
        "section": "System Overview",
        "experience": "Process History",
        "project": "Service",
        "npc": "Process Owner",
        "incident": "System Event",
        "quest": "Scheduled Task",
        "world": "Runtime",
        "timeline": "Event Timeline",
        "archive": "System Archive",
    },
    "chaotic": {
        "section": "CHAOS REPORT",
        "experience": "ABSURD CAREER EVENT",
        "project": "QUESTIONABLE BUILD",
        "npc": "CHAOS PARTICIPANT",
        "incident": "OH NO",
        "quest": "DO THIS",
        "world": "SOMEWHERE",
        "timeline": "THINGS THAT HAPPENED",
        "archive": "DO NOT DELETE",
    },
}


# ============================================================
# CONFIGURATION
# ============================================================

CONFIG = {
    "version": "4.0.0",
    "generator": {
        "name": "Absurd Chaos Portfolio Generator",
        "mode": "build-time packaging",
        "runtime": "browser-only procedural generation",
    },
    "runtime_policy": {
        "browser_memory_only": True,
        "localStorage": False,
        "sessionStorage": False,
        "indexedDB": False,
        "cookies": False,
        "database": False,
        "api": False,
        "fetch": False,
        "network_requests": False,
        "persistent_state": False,
    },
    "ui_system": {
        "families": UI_FAMILIES,
        "layouts": LAYOUTS,
        "navs": NAVS,
        "hero_modes": HERO_MODES,
        "densities": DENSITIES,
        "decorations": DECORATIONS,
    },
    "pools": {
        "worlds": WORLDS,
        "npc_seeds": [
            {
                "first": first,
                "last": last,
                "role": role,
                "trait": trait,
                "secret": secret,
            }
            for first, last, role, trait, secret in NPC_SEEDS
        ],
        "names": NAMES,
        "titles": TITLES,
        "specialties": SPECIALTIES,
        "personalities": PERSONALITIES,
        "education": EDUCATION,
        "locations": LOCATIONS,
        "industries": INDUSTRIES,
        "project_types": PROJECT_TYPES,
        "project_names": PROJECT_NAMES,
        "problems": PROBLEMS,
        "solutions": SOLUTIONS,
        "failures": FAILURES,
        "outcomes": OUTCOMES,
        "openings": OPENINGS,
        "incidents": INCIDENTS,
        "lessons": LESSONS,
        "factions": FACTIONS,
        "quests": QUESTS,
        "rewards": REWARDS,
        "voice_packs": VOICE_PACKS,
    },
    "limits": {
        "npcs_min": 7,
        "npcs_max": 10,
        "projects_min": 7,
        "projects_max": 11,
        "experiences_min": 7,
        "experiences_max": 10,
        "incidents_min": 5,
        "incidents_max": 8,
        "quests_min": 3,
        "quests_max": 5,
        "specialties_min": 5,
        "specialties_max": 9,
    },
    "features": {
        "random_ui": True,
        "random_content": True,
        "random_voice": True,
        "npc_linked_projects": True,
        "npc_linked_experiences": True,
        "card_first_content": True,
        "responsive": True,
        "accessible": True,
        "runtime_error_screen": True,
    },
}


def read_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"Missing required file: {path}")
    return path.read_text(encoding="utf-8")


def validate_config():
    required = [
        "version",
        "runtime_policy",
        "ui_system",
        "pools",
        "limits",
        "features",
    ]

    for key in required:
        if key not in CONFIG:
            raise RuntimeError(f"Missing configuration key: {key}")

    policy = CONFIG["runtime_policy"]

    forbidden = [
        "localStorage",
        "sessionStorage",
        "indexedDB",
        "cookies",
        "database",
        "api",
        "fetch",
        "network_requests",
        "persistent_state",
    ]

    for key in forbidden:
        if policy.get(key) is not False:
            raise RuntimeError(
                f"Runtime policy violation: {key} must be false."
            )

    if policy.get("browser_memory_only") is not True:
        raise RuntimeError("browser_memory_only must be true")

    ui = CONFIG["ui_system"]

    for key in [
        "families",
        "layouts",
        "navs",
        "hero_modes",
        "densities",
        "decorations",
    ]:
        if not ui.get(key):
            raise RuntimeError(f"UI pool cannot be empty: {key}")

    pools = CONFIG["pools"]

    for key in [
        "worlds",
        "npc_seeds",
        "titles",
        "specialties",
        "personalities",
        "project_names",
        "problems",
        "solutions",
        "failures",
        "outcomes",
        "incidents",
        "quests",
    ]:
        if not pools.get(key):
            raise RuntimeError(f"Content pool cannot be empty: {key}")


def make_build_identity() -> str:
    return secrets.token_hex(8).upper()


def main():
    validate_config()

    template = read_text(TEMPLATE_FILE)
    css = read_text(CSS_FILE)
    js = read_text(JS_FILE)

    build_identity = make_build_identity()

    runtime_config = dict(CONFIG)
    runtime_config["build_identity"] = build_identity

    serialized_config = json.dumps(
        runtime_config,
        ensure_ascii=False,
        separators=(",", ":"),
    )

    output = template

    replacements = {
        "{{GENERATED_CONFIG}}": serialized_config,
        "{{GENERATED_CSS}}": css,
        "{{GENERATED_JS}}": js,
    }

    for placeholder, value in replacements.items():
        output = output.replace(placeholder, value)

    unresolved = re.findall(r"\{\{[A-Z0-9_]+\}\}", output)

    if unresolved:
        raise RuntimeError(
            "Unresolved template placeholders: "
            + ", ".join(sorted(set(unresolved)))
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(output, encoding="utf-8")

    print()
    print("=" * 72)
    print(" ABSURD CHAOS PORTFOLIO")
    print("=" * 72)
    print(f"Version       : {CONFIG['version']}")
    print(f"Build Identity: {build_identity}")
    print(f"Output        : {OUTPUT_FILE}")
    print("Runtime       : Browser memory only")
    print("Persistence   : DISABLED")
    print("Network       : DISABLED")
    print("Database      : DISABLED")
    print("Random UI     : ENABLED")
    print("Random World  : ENABLED")
    print("NPC Linking   : ENABLED")
    print("=" * 72)
    print()
    print("Build completed successfully.")


if __name__ == "__main__":
    main()
