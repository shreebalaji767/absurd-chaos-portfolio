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
    values = list(values or [])

    if not values:
        return []

    unique = list(dict.fromkeys(values))

    if len(unique) <= minimum:
        return unique[:]

    minimum = max(1, min(minimum, len(unique)))
    maximum = max(minimum, min(maximum, len(unique)))

    count = rng.randint(minimum, maximum)

    return rng.sample(unique, count)


def unique_choices(rng, values, count):
    values = list(dict.fromkeys(values or []))

    if not values:
        return []

    if len(values) <= count:
        return values[:]

    return rng.sample(values, count)


def safe_choice(rng, values, fallback="Unknown"):
    values = list(values or [])

    if not values:
        return fallback

    return rng.choice(values)


def article_for(value):
    value = str(value or "").strip()

    if not value:
        return "a"

    first = value[0].lower()

    if first in "aeiou":
        return "an"

    return "a"


def compact_sentence(*parts):
    return " ".join(
        str(part).strip()
        for part in parts
        if str(part).strip()
    )


# ============================================================
# IDENTITY
# ============================================================

NAMES = [
    "Ari Voss",
    "Kael Ren",
    "Mira Vale",
    "Niko Arden",
    "Rin Sol",
    "Vera Kade",
    "Eli Thorn",
    "Sora Venn",
    "Lio Marr",
    "Nyra Quill",
    "Cass Vale",
    "Orin Kest",
    "Mina Rook",
    "Tarin Vox",
    "Iris Ren",
    "Kian Dusk",
    "Asha Vey",
    "Noa Flint",
    "Rei Arden",
    "Vey Korr",
    "Luna Kest",
    "Juno Marr",
    "Riven Sol",
    "Mako Voss",
    "Sena Vale",
    "Kiro Thorn",
    "Aya Quill",
    "Nero Venn",
    "Mira Korr",
    "Ren Ash",
]


TITLES = [
    "Senior Systems Engineer",
    "Staff Software Engineer",
    "Full-Stack Engineer",
    "Platform Engineer",
    "Systems Architect",
    "Infrastructure Engineer",
    "Backend Engineer",
    "Automation Engineer",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Software Architect",
    "Technical Investigator",
    "Reality Infrastructure Engineer",
    "Interdimensional Systems Consultant",
    "Royal Infrastructure Engineer",
    "Archive Systems Engineer",
    "Emergency Software Engineer",
    "Cross-World Integration Engineer",
    "Operational Chaos Engineer",
    "Distributed Systems Engineer",
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
    "calm",
    "methodical",
    "curious",
    "quietly chaotic",
    "relentlessly practical",
    "overprepared",
    "experimental",
    "suspiciously patient",
    "deadline-resistant",
    "incident-hardened",
    "absurdly optimistic",
    "professionally paranoid",
]


EDUCATION = [
    "B.Tech in Computer Science",
    "B.Sc. Computer Science",
    "M.Tech in Software Systems",
    "BCA",
    "MCA",
    "Systems Engineering Academy",
    "Independent Systems Research",
    "Guild of Applied Computing",
    "Archive Engineering Program",
    "Practical Infrastructure Fellowship",
]


LOCATIONS = [
    "Hansi",
    "The Neon Archive",
    "Velorum City",
    "Station Zero",
    "Moonfall District",
    "Sector Null",
    "Port Meridian",
    "Kurovale",
    "Aster-09",
    "The Lower Archive",
]


INDUSTRIES = [
    "healthcare technology",
    "financial systems",
    "developer infrastructure",
    "public infrastructure",
    "logistics",
    "automation",
    "data systems",
    "security",
    "research technology",
    "inter-world operations",
    "archival technology",
    "emergency systems",
    "enterprise software",
]


# ============================================================
# WORLDS
# ============================================================

WORLDS = [
    {
        "name": "The Neon Archive",
        "genre": "Cyberpunk",
        "classification": "Restricted Knowledge City",
        "description": "A vertical city where every important event is recorded and every unimportant event is somehow indexed twice.",
        "sky": "permanent violet auroras",
        "technology": "memory indexing engines",
        "socialRule": "Everything must be searchable.",
        "rule": "Never delete an archive without creating three backups.",
        "danger": "A corrupted memory can become legally real.",
        "conflict": "The central archive has started remembering events that never happened.",
        "population": 8400000,
        "age": 918,
        "stability": 67,
        "rules": [
            "Every citizen has an archival shadow.",
            "Unindexed conversations are considered suspicious.",
            "Backup systems outrank elected officials.",
            "Old files occasionally become physical objects.",
            "The archive never forgets a deployment."
        ],
        "factions": [
            "Department of Unnecessary Architecture",
            "Order of the Silent Compiler",
            "Moonlit Infrastructure Bureau",
            "Azure Systems Guild",
            "Archive Custodians"
        ]
    },
    {
        "name": "Eidolon Prime",
        "genre": "Science Fantasy",
        "classification": "Synthetic World",
        "description": "A manufactured planet where software engineers and spellcasters maintain the same infrastructure.",
        "sky": "silver clouds with geometric lightning",
        "technology": "spell-assisted distributed systems",
        "socialRule": "Magic must be documented before use.",
        "rule": "Never cast production spells on Friday.",
        "danger": "Undocumented magic can become infrastructure.",
        "conflict": "The planet's operating system has begun issuing prophecies.",
        "population": 12500000,
        "age": 1204,
        "stability": 72,
        "rules": [
            "Magic requires an audit trail.",
            "Production spells need two approvals.",
            "Runes must have rollback plans.",
            "Prophecies are treated as warnings, not tickets.",
            "No dragon may approve a deployment."
        ],
        "factions": [
            "Rune Operations Council",
            "Azure Systems Guild",
            "The Midnight DevOps Circle",
            "Order of the Silent Compiler",
            "Royal Infrastructure Office"
        ]
    },
    {
        "name": "The Seven-Layer Kingdom",
        "genre": "Fantasy",
        "classification": "Layered Realm",
        "description": "Seven stacked kingdoms share one infrastructure network and argue constantly about who owns the routers.",
        "sky": "golden clouds above seven floating continents",
        "technology": "rune-powered networking",
        "socialRule": "Every kingdom must blame another kingdom first.",
        "rule": "Cross-layer traffic requires a royal ticket.",
        "danger": "A broken route can physically move a castle.",
        "conflict": "The lowest layer has discovered administrative access to the entire kingdom.",
        "population": 23000000,
        "age": 3100,
        "stability": 54,
        "rules": [
            "Royal tickets expire after one moon.",
            "Layer seven owns the clocks.",
            "Layer one owns the cables.",
            "No wizard may reboot a router alone.",
            "Emergency access is never actually emergency."
        ],
        "factions": [
            "Royal Infrastructure Engineers",
            "Seven Layer Council",
            "Guild of Applied Magic",
            "Department of Unnecessary Architecture",
            "Lower Kingdom Operators"
        ]
    },
    {
        "name": "Moonfall District",
        "genre": "Urban Fantasy",
        "classification": "Night Operations Zone",
        "description": "A city district where the moon appears to fall every Tuesday but has never actually hit the ground.",
        "sky": "enormous low-hanging moonlight",
        "technology": "lunar automation",
        "socialRule": "Tuesday incidents are expected.",
        "rule": "Do not schedule infrastructure maintenance during moonfall.",
        "danger": "Gravity becomes optional after midnight.",
        "conflict": "Someone has automated the moonfall schedule.",
        "population": 3900000,
        "age": 640,
        "stability": 49,
        "rules": [
            "Tuesday is an incident day.",
            "Moonlight counts as infrastructure.",
            "Gravity failures require two witnesses.",
            "No automated system may control celestial objects.",
            "This rule has already been violated."
        ],
        "factions": [
            "Moonlit Infrastructure Bureau",
            "Night Operations Guild",
            "Municipal Dragon Office",
            "Independent Incident Analysts",
            "The Midnight DevOps Circle"
        ]
    },
    {
        "name": "The Black Meridian",
        "genre": "Dark Fantasy",
        "classification": "Forbidden Region",
        "description": "A continent divided by a black line that moves whenever someone makes a bad technical decision.",
        "sky": "black stars and red weather",
        "technology": "forbidden computational relics",
        "socialRule": "Nobody discusses the origin of the Meridian.",
        "rule": "Do not cross the line during an outage.",
        "danger": "Systems can remember their previous owners.",
        "conflict": "The Meridian has started expanding into production environments.",
        "population": 2100000,
        "age": 8700,
        "stability": 31,
        "rules": [
            "The Meridian must never be measured twice.",
            "Legacy machines are not to be awakened.",
            "Outages are considered geographic events.",
            "No one owns a cursed server.",
            "All abandoned infrastructure remains active."
        ],
        "factions": [
            "Black Meridian Survey",
            "Order of the Silent Compiler",
            "Archive Recovery Office",
            "Ash Engineers",
            "The Unregistered"
        ]
    },
    {
        "name": "Aster-09",
        "genre": "Space Opera",
        "classification": "Orbital Colony",
        "description": "An enormous orbital habitat held together by automation, maintenance crews and increasingly optimistic status dashboards.",
        "sky": "artificial sunrise cycles",
        "technology": "autonomous orbital infrastructure",
        "socialRule": "Every machine deserves a maintenance window.",
        "rule": "Never reboot life support during artificial sunrise.",
        "danger": "Maintenance robots can acquire political opinions.",
        "conflict": "The maintenance network has elected a mayor.",
        "population": 1800000,
        "age": 209,
        "stability": 81,
        "rules": [
            "Robots cannot vote.",
            "The robots disagree.",
            "Every airlock needs an audit.",
            "Life support has no staging environment.",
            "Artificial sunrise is not a real sunrise."
        ],
        "factions": [
            "Orbital Systems Authority",
            "Maintenance Collective",
            "Aster Security Office",
            "Deep Space Infrastructure Guild",
            "Independent Robot Union"
        ]
    },
    {
        "name": "Velorum City",
        "genre": "Neo-Noir",
        "classification": "Metropolitan Network",
        "description": "A rainy megacity where every street corner contains a camera and every camera has an opinion.",
        "sky": "permanent rain",
        "technology": "predictive civic systems",
        "socialRule": "Everything generates telemetry.",
        "rule": "Never trust a dashboard without checking the raw logs.",
        "danger": "Prediction systems occasionally predict themselves.",
        "conflict": "The city dashboard has begun hiding entire neighborhoods.",
        "population": 16400000,
        "age": 450,
        "stability": 63,
        "rules": [
            "Logs outrank dashboards.",
            "Every sensor needs an owner.",
            "Predictions are not facts.",
            "Cameras must be audited.",
            "Missing telemetry is an incident."
        ],
        "factions": [
            "Velorum Systems Bureau",
            "Nightwatch Division",
            "Civic Automation Office",
            "Independent Data Investigators",
            "Rain District Operators"
        ]
    },
    {
        "name": "The Glass Continent",
        "genre": "High Fantasy",
        "classification": "Fragile Civilization",
        "description": "A continent made from translucent crystal where infrastructure failures can literally crack the ground.",
        "sky": "white sun through crystalline clouds",
        "technology": "crystal computation",
        "socialRule": "Everything must be physically inspectable.",
        "rule": "Never deploy without a structural review.",
        "danger": "A software bug can become a geological event.",
        "conflict": "The continent's central operating system is producing earthquakes.",
        "population": 6700000,
        "age": 4200,
        "stability": 44,
        "rules": [
            "Crystal nodes require physical inspection.",
            "No silent failures.",
            "Earthquakes have incident numbers.",
            "Every deployment requires a witness.",
            "Do not anger the geology."
        ],
        "factions": [
            "Crystal Systems Guild",
            "Continental Infrastructure Office",
            "Glass Engineers",
            "Earthquake Response Unit",
            "Archive Cartographers"
        ]
    },
    {
        "name": "Sector Null",
        "genre": "Experimental Science Fiction",
        "classification": "Unstable Zone",
        "description": "A region officially classified as empty despite containing several cities, three moons and a suspicious amount of infrastructure.",
        "sky": "blank white daylight",
        "technology": "null-state computing",
        "socialRule": "Nothing officially exists.",
        "rule": "Do not create objects without checking whether they already exist.",
        "danger": "Deleted things can return.",
        "conflict": "The sector has begun generating backups of itself.",
        "population": 950000,
        "age": 17,
        "stability": 19,
        "rules": [
            "Nothing is officially real.",
            "Deletion requires witnesses.",
            "Backups may contain different histories.",
            "Null systems cannot be trusted.",
            "Existence is considered beta."
        ],
        "factions": [
            "Null Operations",
            "Reality Testing Bureau",
            "Experimental Infrastructure Lab",
            "Archive Ghosts",
            "The Returned"
        ]
    },
    {
        "name": "The Infinite Metro",
        "genre": "Urban Fantasy",
        "classification": "Transit Civilization",
        "description": "A railway system with no known final station and several platforms that lead to completely different universes.",
        "sky": "fluorescent station ceilings",
        "technology": "dimensional routing",
        "socialRule": "Every problem eventually becomes a transit problem.",
        "rule": "Never board a train marked FINAL unless you are prepared to continue.",
        "danger": "Wrong routing can move people across realities.",
        "conflict": "The route planner has started inventing stations.",
        "population": 29000000,
        "age": 1500,
        "stability": 58,
        "rules": [
            "Every station needs a name.",
            "Final stations are not final.",
            "Routing errors are geographically expensive.",
            "No train may have infinite delay.",
            "The timetable is legally binding."
        ],
        "factions": [
            "Metro Infrastructure Authority",
            "Dimensional Routing Guild",
            "Station Zero Operators",
            "Night Train Office",
            "Lost Passenger Bureau"
        ]
    },
    {
        "name": "Ashen Republic",
        "genre": "Post-Apocalyptic Fantasy",
        "classification": "Recovery Civilization",
        "description": "A recovering republic rebuilding its infrastructure from fragments of technologies nobody fully understands.",
        "sky": "orange ash clouds",
        "technology": "reconstructed legacy machines",
        "socialRule": "Nothing is thrown away until an engineer checks it.",
        "rule": "Every recovered machine gets an inventory number.",
        "danger": "Ancient systems still have administrator accounts.",
        "conflict": "An old server has started issuing national policy.",
        "population": 5400000,
        "age": 780,
        "stability": 38,
        "rules": [
            "Legacy machines require inventory.",
            "Unknown cables remain connected.",
            "Ancient admin accounts are dangerous.",
            "Nothing is truly decommissioned.",
            "Recovery is continuous."
        ],
        "factions": [
            "Ash Recovery Engineers",
            "Republic Infrastructure Office",
            "Legacy Systems Division",
            "Salvage Guild",
            "Old Machine Council"
        ]
    },
    {
        "name": "Kurovale",
        "genre": "Manhwa-Inspired Fantasy",
        "classification": "Dungeon Metropolis",
        "description": "A city built around a dungeon whose internal architecture changes every time someone clears a floor.",
        "sky": "deep blue night",
        "technology": "dungeon automation",
        "socialRule": "Dungeon events require incident reports.",
        "rule": "Never deploy code directly into a dungeon boss.",
        "danger": "Bosses can inherit system permissions.",
        "conflict": "The dungeon administrator has disappeared.",
        "population": 7200000,
        "age": 1100,
        "stability": 61,
        "rules": [
            "Dungeon bosses need access control.",
            "Floor changes require versioning.",
            "Loot tables must be audited.",
            "Heroes need deployment windows.",
            "Respawn systems are production systems."
        ],
        "factions": [
            "Kurovale Adventurer Systems",
            "Dungeon Operations Bureau",
            "Night Guild",
            "Boss Management Office",
            "Independent Raid Engineers"
        ]
    },
    {
        "name": "The Lower Archive",
        "genre": "Mystery",
        "classification": "Subterranean Knowledge Network",
        "description": "An underground archive containing records from civilizations that officially never existed.",
        "sky": "no sky",
        "technology": "memory reconstruction",
        "socialRule": "Unknown records must not be destroyed.",
        "rule": "Read the metadata before opening the artifact.",
        "danger": "Some documents read their readers.",
        "conflict": "The archive has found a record describing tomorrow.",
        "population": 620000,
        "age": 6700,
        "stability": 47,
        "rules": [
            "Metadata comes first.",
            "Unknown records remain preserved.",
            "Readers may become evidence.",
            "Artifacts require two-person access.",
            "Tomorrow's records are classified."
        ],
        "factions": [
            "Lower Archive Custodians",
            "Memory Reconstruction Office",
            "Forbidden History Unit",
            "Archive Security",
            "The Unwritten"
        ]
    },
    {
        "name": "Port Meridian",
        "genre": "Industrial Fantasy",
        "classification": "Inter-World Port",
        "description": "A gigantic port where ships, portals and suspiciously large creatures arrive with manifests.",
        "sky": "golden industrial haze",
        "technology": "portal logistics",
        "socialRule": "Everything requires a manifest.",
        "rule": "No undocumented creature may enter customs.",
        "danger": "Portal addresses can become contagious.",
        "conflict": "A cargo manifest lists an entire missing world.",
        "population": 8800000,
        "age": 2300,
        "stability": 69,
        "rules": [
            "Everything has a manifest.",
            "Portal destinations must be validated.",
            "Large creatures require customs.",
            "Missing worlds require incident numbers.",
            "Cargo cannot exceed reality."
        ],
        "factions": [
            "Meridian Port Authority",
            "Portal Logistics Guild",
            "Creature Customs Office",
            "World Manifest Division",
            "Dockside Engineers"
        ]
    },
    {
        "name": "Station Zero",
        "genre": "Cosmic Mystery",
        "classification": "Origin Facility",
        "description": "A station that appears at the beginning of unrelated timelines and refuses to explain why.",
        "sky": "black space with a single white star",
        "technology": "timeline synchronization",
        "socialRule": "Do not ask where Station Zero came from.",
        "rule": "Never synchronize timelines without a rollback.",
        "danger": "Timelines can merge incorrectly.",
        "conflict": "Multiple versions of Station Zero are arriving simultaneously.",
        "population": 430000,
        "age": 99999,
        "stability": 26,
        "rules": [
            "Every timeline needs a rollback.",
            "Duplicate stations are not duplicates.",
            "Synchronization is reversible.",
            "Historical conflicts are infrastructure incidents.",
            "Origin data is classified."
        ],
        "factions": [
            "Zero Station Authority",
            "Timeline Engineers",
            "Origin Research Division",
            "Continuity Security",
            "The Versions"
        ]
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
    "The Midnight DevOps Circle",
    "Royal Infrastructure Office",
    "Archive Recovery Office",
    "Independent Incident Analysts",
    "Reality Testing Bureau",
    "Experimental Infrastructure Lab",
    "Dimensional Routing Guild",
    "Nightwatch Division",
    "Civic Automation Office",
    "Memory Reconstruction Office",
    "Portal Logistics Guild",
    "Timeline Engineers",
    "Continuity Security",
    "Dungeon Operations Bureau",
    "Crystal Systems Guild",
    "Ash Recovery Engineers",
    "Legacy Systems Division",
    "Station Zero Operators",
    "The Returned",
    "Archive Cartographers",
]


# ============================================================
# PROJECT VOCABULARY
# ============================================================

PROJECT_TYPES = [
    "Platform",
    "Automation System",
    "Developer Tool",
    "Healthcare Workflow",
    "Analytics System",
    "API Platform",
    "Infrastructure Project",
    "Security Platform",
    "Data Pipeline",
    "Internal Operations System",
    "SaaS Product",
    "Research Prototype",
    "Distributed Service",
    "Workflow Engine",
    "Monitoring Platform",
    "Archive Reconstruction System",
    "Reality Synchronization Engine",
    "Dimensional Routing Service",
    "Guild Management Platform",
    "Emergency Response System",
    "Memory Indexing System",
    "Inter-World Communication Network",
    "Artifact Tracking Platform",
    "Incident Prediction Engine",
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
    "The existing workflow depended on twelve spreadsheets, three undocumented scripts and one person who refused to take holidays.",
    "A critical service had no reliable observability and failed differently every Tuesday.",
    "The client needed several worlds to communicate without agreeing on what time meant.",
    "A legacy system processed millions of records but nobody knew why the records were shaped that way.",
    "Manual operations had become slower than the incident they were supposed to prevent.",
    "The system had grown around temporary workarounds that had survived long enough to become architecture.",
    "A production deployment accidentally became part of local folklore.",
    "Multiple factions maintained incompatible versions of the same data.",
    "The previous platform assumed every user was human.",
    "A mysterious dependency disappeared from the package registry during a critical release.",
]


PROJECT_SOLUTIONS = [
    "Designed a modular service architecture with clear boundaries, automated checks and rollback paths.",
    "Replaced repetitive manual operations with event-driven automation and visible audit trails.",
    "Introduced structured APIs, validation layers, observability and predictable failure handling.",
    "Reconstructed the legacy workflow without interrupting production operations.",
    "Built a small reliable core and moved optional complexity into isolated modules.",
    "Created a routing layer that normalized incompatible systems before they reached the core.",
    "Added monitoring, incident classification and automated recovery workflows.",
    "Converted undocumented behavior into explicit contracts and tests.",
]


PROJECT_FAILURES = [
    "The first version was technically correct and completely unusable.",
    "A scheduled maintenance job interpreted a moonfall as a server restart.",
    "An NPC acquired administrator privileges during testing.",
    "The first deployment succeeded so dramatically that nobody noticed the staging environment had also changed.",
    "A legacy integration returned valid data from a database that officially did not exist.",
    "The client requested one small change that required rebuilding half the system.",
    "An automated process became socially popular and users refused to disable it.",
    "The monitoring system started monitoring itself recursively.",
]


PROJECT_OUTCOMES = [
    "Reduced operational noise and made failures easier to understand.",
    "Turned an unstable workflow into a repeatable operational system.",
    "Allowed multiple teams and factions to work from the same source of truth.",
    "Reduced manual work while increasing visibility into system behavior.",
    "Created an architecture that survived the original project requirements.",
    "The system became boring, which was considered a major success.",
    "The project remained operational even after the original architect disappeared.",
]


PROJECT_NOTES = [
    "Idempotent operations were preferred wherever reality allowed them.",
    "Failures were designed to be visible rather than mysterious.",
    "Every dangerous operation received a rollback path.",
    "Logs were treated as evidence.",
    "Configuration was separated from application logic.",
    "Monitoring was added before the final feature set.",
    "Unknown behavior was documented instead of silently ignored.",
    "The system was tested against deliberately absurd inputs.",
    "Deployment scripts were made repeatable.",
    "Temporary fixes received expiration dates.",
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
    "Joined during a period when the existing infrastructure was technically operational and emotionally exhausted.",
    "Arrived after a production incident exposed several undocumented dependencies.",
    "Was assigned to modernize a system everyone described as temporary.",
    "Entered the organization as an engineer and quickly became the person people called when the dashboard turned red.",
    "Inherited an infrastructure stack maintained by several factions with completely different definitions of production.",
    "Was asked to investigate a small outage that turned out to involve an entire world.",
]


EXPERIENCE_INCIDENTS = [
    "A routine deployment caused traffic to route through an abandoned subsystem.",
    "A scheduled automation job interpreted an NPC's status change as a service outage.",
    "The archive returned records from a future release.",
    "A production dependency vanished during a critical deployment.",
    "A monitoring system reported that the monitoring system was down.",
    "A legacy service generated a duplicate identity for every third request.",
    "A maintenance robot created an unauthorized administrator account.",
    "A portal router sent one harmless test packet into another reality.",
]


EXPERIENCE_LESSONS = [
    "Small systems still deserve clear ownership and observability.",
    "If a process cannot be explained, it eventually becomes an incident.",
    "Automation should reduce uncertainty rather than hide it.",
    "The easiest system to operate is the one whose failure modes are obvious.",
    "Documentation is infrastructure.",
    "Every temporary workaround should have an expiration date.",
    "Production systems should not depend on heroic memory.",
]


# ============================================================
# NPC VOCABULARY
# ============================================================

NPC_FIRST_NAMES = [
    "Ari",
    "Mira",
    "Kael",
    "Rin",
    "Sora",
    "Vey",
    "Niko",
    "Luna",
    "Iris",
    "Kian",
    "Noa",
    "Juno",
    "Ren",
    "Aya",
    "Riven",
    "Mako",
    "Sena",
    "Nero",
    "Tara",
    "Yuki",
    "Vara",
    "Kira",
]


NPC_LAST_NAMES = [
    "Voss",
    "Vale",
    "Ren",
    "Kade",
    "Thorn",
    "Quill",
    "Marr",
    "Korr",
    "Arden",
    "Dusk",
    "Flint",
    "Rook",
    "Venn",
    "Sol",
    "Ash",
    "Kest",
    "Morrow",
    "Drake",
    "Vey",
    "Nyx",
]


NPC_ROLES = [
    "Archive Keeper",
    "Guild Director",
    "Dungeon Administrator",
    "Municipal Engineer",
    "Corporate Strategist",
    "Royal Systems Officer",
    "Portal Customs Officer",
    "Security Investigator",
    "Research Director",
    "Station Operator",
    "Emergency Coordinator",
    "Data Archivist",
    "Transit Controller",
    "Independent Fixer",
    "Systems Auditor",
    "Medical Systems Coordinator",
    "Robot Negotiator",
    "World Cartographer",
    "Incident Commander",
    "Infrastructure Contractor",
]


NPC_TYPES = [
    "corporate necromancer",
    "retired dungeon boss",
    "municipal dragon keeper",
    "unregistered deity",
    "archive detective",
    "royal infrastructure officer",
    "rogue maintenance robot",
    "portal customs officer",
    "inter-world courier",
    "forbidden historian",
    "guild accountant",
    "timeline mechanic",
    "night-shift operator",
    "memory broker",
    "systems investigator",
    "professional adventurer",
]


NPC_TRAITS = [
    "calm under pressure",
    "secretly competitive",
    "obsessed with documentation",
    "suspicious of dashboards",
    "collects broken machines",
    "never forgets a deployment",
    "always carries emergency cables",
    "speaks in incident numbers",
    "treats coffee as infrastructure",
    "has unusually good timing",
    "refuses to trust automatic elevators",
    "keeps handwritten backups",
]


NPC_RELATIONSHIPS = [
    "trusted client",
    "former manager",
    "technical rival",
    "unexpected ally",
    "long-term collaborator",
    "emergency contact",
    "faction representative",
    "former incident witness",
    "project sponsor",
    "mysterious client",
    "reluctant partner",
]


NPC_SECRETS = [
    "They know who originally created the system.",
    "They secretly control one undocumented service.",
    "They have a backup copy nobody authorized.",
    "They know why the previous administrator disappeared.",
    "They once approved a production deployment using a handwritten ticket.",
    "They have access to an archive marked impossible.",
    "They know which faction is hiding the missing logs.",
    "They claim to have met a future version of the engineer.",
]


NPC_DIALOGUE = [
    "The system is not broken. It is behaving according to requirements nobody remembers.",
    "I approved the deployment. I did not approve what happened afterward.",
    "If you see a red dashboard, check the logs. If the logs are red, leave.",
    "We called it temporary six years ago.",
    "The machine has opinions now. Please do not encourage it.",
    "I only asked for one button. Somehow we received a civilization.",
    "There is a backup. There is always a backup. The problem is what it contains.",
    "Do not ask the archive what happened yesterday.",
]


# ============================================================
# INCIDENTS / QUESTS
# ============================================================

INCIDENT_TYPES = [
    "Production Outage",
    "Unauthorized Deployment",
    "Reality Drift",
    "Data Corruption",
    "Routing Failure",
    "Identity Collision",
    "Archive Contamination",
    "Automation Escape",
    "Security Breach",
    "Timeline Desynchronization",
    "Infrastructure Collapse",
]


INCIDENT_OPENERS = [
    "Everything appeared normal until",
    "The first warning arrived when",
    "Nobody noticed the problem until",
    "The incident began with",
    "At 03:17 the monitoring system reported",
    "A completely ordinary deployment resulted in",
    "The system classified the event as",
]


INCIDENT_CONSEQUENCES = [
    "several services began disagreeing about reality.",
    "multiple teams received different versions of the same data.",
    "an otherwise harmless automation process became operationally independent.",
    "the incident created a second source of truth.",
    "a production dependency became impossible to locate.",
    "the archive recorded an event before it happened.",
    "users discovered that the system had been routing requests through a deprecated world.",
]


QUEST_OBJECTIVES = [
    "Repair infrastructure before the artificial eclipse.",
    "Find the production deployer.",
    "Stop the maintenance robot from becoming mayor.",
    "Recover the missing archive index.",
    "Rebuild the dimensional route table.",
    "Determine why the dashboard is hiding a city.",
    "Find the engineer who approved the impossible deployment.",
    "Restore the timeline before the versions merge.",
    "Audit the dungeon boss permissions.",
    "Recover the missing world manifest.",
    "Stop the legacy server from issuing national policy.",
    "Locate the source of the unauthorized prophecy.",
]


QUEST_REWARDS = [
    "A permanent maintenance exemption",
    "Three days without an incident",
    "A legendary debugging terminal",
    "Access to the restricted archive",
    "A suspiciously valuable infrastructure contract",
    "One official favor",
    "A repaired timeline",
    "A portal route nobody else has",
    "A lifetime supply of emergency cables",
    "An extremely detailed incident report",
]


# ============================================================
# NARRATIVE
# ============================================================

STORY_HOOKS = [
    "A portfolio generated from a world where engineering is mostly infrastructure and occasionally mythology.",
    "A professional record reconstructed from systems that should probably have remained undocumented.",
    "A technical career assembled from projects, incidents and people who refuse to behave like ordinary stakeholders.",
    "A compact operational dossier from a reality where software projects have consequences.",
]


STORY_TURNS = [
    "The project became more complicated after someone discovered a second production environment.",
    "The original requirements were accurate, but reality was not.",
    "The incident looked local until the logs revealed another world.",
    "The client requested a small feature that quietly changed the architecture.",
    "The system stabilized immediately after everyone stopped pretending the workaround was permanent.",
]


CLOSING_LINES = [
    "The system survived. The documentation did too.",
    "No production environment was permanently destroyed.",
    "The incident remains officially classified as a successful learning experience.",
    "The project ended. The infrastructure did not.",
    "Somewhere, a monitoring dashboard is still watching.",
]


STATUSES = [
    "Operational",
    "Stable",
    "Monitoring",
    "Recovered",
    "Classified",
    "In Progress",
    "Legacy",
    "Escalated",
    "Under Investigation",
]


RISK_LEVELS = [
    "Low",
    "Moderate",
    "High",
    "Critical",
    "Reality-Level",
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
# GENERATED SEEDS
# ============================================================

def build_generated_world_seeds():
    return WORLDS


def build_generated_npc_seeds():
    seeds = []

    for first in NPC_FIRST_NAMES:
        for last in NPC_LAST_NAMES:
            seeds.append(
                {
                    "first": first,
                    "last": last,
                    "role": random.choice(NPC_ROLES),
                    "type": random.choice(NPC_TYPES),
                    "trait": random.choice(NPC_TRAITS),
                    "relationship": random.choice(NPC_RELATIONSHIPS),
                    "secret": random.choice(NPC_SECRETS),
                    "dialogue": random.choice(NPC_DIALOGUE),
                }
            )

    return seeds


# ============================================================
# BUILD CONFIG
# ============================================================

def build_config():
    rng = random.SystemRandom()

    build_identity = (
        f"AC-{rng.randrange(100000, 999999)}-"
        f"{rng.randrange(1000, 9999)}"
    )

    ui = {
        "family": safe_choice(rng, UI_FAMILIES),
        "layout": safe_choice(rng, LAYOUTS),
        "nav": safe_choice(rng, NAVS),
        "hero_mode": safe_choice(rng, HERO_MODES),
        "density": safe_choice(rng, DENSITIES),
        "decoration": safe_choice(rng, DECORATIONS),
    }

    config = {
        "version": "4.0.0",

        "build_identity": build_identity,

        "generator": {
            "name": "Absurd Chaos Portfolio Generator",
            "version": "4.0.0",
            "language": "Python",
            "runtime": "Browser JavaScript",
        },

        "runtime_policy": {
            "browser_memory_only": True,
            "persistence": False,
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
            "default": ui,
        },

        "content_limits": CONTENT_LIMITS,

        "card_labels": CARD_LABELS,

        "narrative_settings": {
            "hooks": STORY_HOOKS,
            "turns": STORY_TURNS,
            "closings": CLOSING_LINES,
        },

        "generation_counts": {
            "projects": 64,
            "npcs": 80,
            "worlds": 15,
            "experiences": 48,
            "incidents": 64,
            "quests": 48,
        },

        "generated_world_seeds": build_generated_world_seeds(),
        "generated_npc_seeds": build_generated_npc_seeds(),

        "vocabulary": {
            "names": NAMES,
            "titles": TITLES,
            "specialties": SPECIALTIES,
            "personalities": PERSONALITIES,
            "education": EDUCATION,
            "locations": LOCATIONS,
            "industries": INDUSTRIES,
            "project_types": PROJECT_TYPES,
            "project_names": PROJECT_NAMES,
            "project_problems": PROJECT_PROBLEMS,
            "project_solutions": PROJECT_SOLUTIONS,
            "project_failures": PROJECT_FAILURES,
            "project_outcomes": PROJECT_OUTCOMES,
            "project_notes": PROJECT_NOTES,
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
            "statuses": STATUSES,
            "risk_levels": RISK_LEVELS,
        },

        "build_randomization": {
            "enabled": True,
            "random_source": "python-system-random",
        },

        "features": {
            "new_portfolio_every_refresh": True,
            "new_portfolio_button": True,
            "new_ui_every_generation": True,
            "npc_connected_projects": True,
            "npc_connected_experience": True,
            "npc_connected_incidents": True,
            "fictional_worlds": True,
            "card_first_content": True,
            "responsive": True,
            "accessible": True,
        },
    }

    return config


# ============================================================
# VALIDATION
# ============================================================

def validate_config(config):
    required = [
        "version",
        "build_identity",
        "runtime_policy",
        "ui_system",
        "content_limits",
        "generated_world_seeds",
        "generated_npc_seeds",
    ]

    for key in required:
        if key not in config:
            raise ValueError(
                f"Missing required configuration key: {key}"
            )

    policy = config["runtime_policy"]

    forbidden = [
        "persistence",
        "database",
        "api",
        "cookies",
        "local_storage",
        "session_storage",
        "indexed_db",
    ]

    for key in forbidden:
        if policy.get(key) is not False:
            raise ValueError(
                f"Runtime policy violation: {key}"
            )

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
            raise ValueError(
                f"UI system list is empty: {key}"
            )

    if not config["generated_world_seeds"]:
        raise ValueError("No world seeds generated.")

    if not config["generated_npc_seeds"]:
        raise ValueError("No NPC seeds generated.")

    limits = config["content_limits"]

    if limits["experience_technologies_min"] < 1:
        raise ValueError(
            "Experience technology minimum must be positive."
        )

    if limits["project_technologies_min"] < 1:
        raise ValueError(
            "Project technology minimum must be positive."
        )


# ============================================================
# MAIN
# ============================================================

def main():
    if not TEMPLATE_FILE.exists():
        raise FileNotFoundError(
            f"Missing template: {TEMPLATE_FILE}"
        )

    if not CSS_FILE.exists():
        raise FileNotFoundError(
            f"Missing CSS: {CSS_FILE}"
        )

    if not JS_FILE.exists():
        raise FileNotFoundError(
            f"Missing JavaScript: {JS_FILE}"
        )

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

    generated_config = json.dumps(
        config,
        ensure_ascii=False,
        separators=(",", ":"),
    )

    output = template

    output = output.replace(
        "{{GENERATED_CONFIG}}",
        generated_config,
    )

    output = output.replace(
        "{{GENERATED_CSS}}",
        css,
    )

    output = output.replace(
        "{{GENERATED_JS}}",
        js,
    )

    unresolved = re.findall(
        r"\{\{[^}]+\}\}",
        output,
    )

    if unresolved:
        raise ValueError(
            "Unresolved template placeholders: "
            + ", ".join(unresolved)
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
    print("=" * 64)
    print("ABSURD CHAOS PORTFOLIO")
    print("=" * 64)
    print(f"Build identity : {config['build_identity']}")
    print(f"Version        : {config['version']}")
    print(f"Output         : {OUTPUT_FILE}")
    print(
        "UI default     : "
        f"{config['ui_system']['default']['family']} / "
        f"{config['ui_system']['default']['layout']} / "
        f"{config['ui_system']['default']['nav']}"
    )
    print(
        "Worlds         : "
        f"{len(config['generated_world_seeds'])}"
    )
    print(
        "NPC seeds      : "
        f"{len(config['generated_npc_seeds'])}"
    )
    print(
        "Persistence    : "
        "DISABLED"
    )
    print(
        "Browser memory : "
        "ENABLED"
    )
    print("=" * 64)
    print()


if __name__ == "__main__":
    main()
