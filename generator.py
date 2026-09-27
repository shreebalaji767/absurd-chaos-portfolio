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


# =========================================================
# HELPERS
# =========================================================

def choose_many(rng, values, minimum=2, maximum=5):
    if not values:
        return []

    maximum = min(maximum, len(values))
    minimum = min(minimum, maximum)

    return rng.sample(values, rng.randint(minimum, maximum))


def unique_choices(rng, values, count):
    if not values:
        return []

    if len(values) <= count:
        return list(values)

    return rng.sample(values, count)


def article_for(value):
    """
    Small grammar helper.

    Example:
        incident -> an incident
        project -> a project
        platform -> a platform
    """
    value = str(value or "").strip()

    if not value:
        return ""

    first = value[0].lower()

    if first in "aeiou":
        return f"an {value}"

    return f"a {value}"


def clean_text(value):
    return str(value or "").strip()


def unique_name(rng, first_names, last_names, used_names):
    """
    Generates a unique NPC name for this build.
    """
    for _ in range(200):
        first = rng.choice(first_names)
        last = rng.choice(last_names)
        name = f"{first} {last}"

        if name not in used_names:
            used_names.add(name)
            return first, last, name

    # Extremely unlikely fallback.
    index = len(used_names) + 1
    first = rng.choice(first_names)
    last = rng.choice(last_names)
    name = f"{first} {last} {index}"

    used_names.add(name)

    return first, last, name


# =========================================================
# CONFIGURATION
# =========================================================

def build_config():
    rng = random.SystemRandom()

    config = {
        "version": "3.0.0",

        # =====================================================
        # CORE IDENTITY
        # =====================================================

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
            "Ilya Vey",
            "Seren Kade",
            "Kaia Rook",
            "Rowan Vale",
            "Noa Wren",
            "Elias Frost",
        ],

        "titles": [
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
            "Incident Response",
            "Legacy Systems",
            "Infrastructure Recovery",
            "Impossible Requirements",
            "Cross-System Debugging",
            "Archive Reconstruction",
            "Reality Mapping",
            "Operational Chaos Management",
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
            "suspicious of simple explanations",
            "professionally calm during disasters",
            "incapable of ignoring broken systems",
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
            "Systems Engineering",
            "Computational Architecture",
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
            "The Seventh Layer",
            "Port Meridian",
            "The Lower Archive",
            "Station Zero",
        ],

        # =====================================================
        # WORLDS
        # =====================================================

        "worlds": [
            {
                "name": "The Neon Archive",
                "genre": "cyberpunk",
                "description": (
                    "A megacity where abandoned APIs become folklore, "
                    "forgotten databases are treated as sacred ruins, "
                    "and nobody is entirely sure who owns the oldest servers."
                ),
                "sky": "violet static",
                "technology": "obsolete technology rebuilt into impossible infrastructure",
                "social_rule": "never delete anything without three witnesses",
                "danger": "memory corruption",
            },
            {
                "name": "Eidolon Prime",
                "genre": "space opera",
                "description": (
                    "A fractured interstellar civilization held together by "
                    "engineers, diplomats, smugglers, and one extremely unreliable moon."
                ),
                "sky": "artificial auroras",
                "technology": "quantum transit infrastructure",
                "social_rule": "every planet maintains its own time standard",
                "danger": "orbital instability",
            },
            {
                "name": "The Seven-Layer Kingdom",
                "genre": "fantasy",
                "description": (
                    "A kingdom built vertically, where every architectural "
                    "layer has its own economy, politics, guilds and laws."
                ),
                "sky": "floating citadels",
                "technology": "magic-powered infrastructure",
                "social_rule": "never cross a layer without declaring your profession",
                "danger": "guild conflict",
            },
            {
                "name": "Moonfall District",
                "genre": "urban fantasy",
                "description": (
                    "A city district permanently illuminated by fragments of "
                    "a moon that technically should not exist anymore."
                ),
                "sky": "silver fragments",
                "technology": "moon-reactive machinery",
                "social_rule": "do not count the moon fragments",
                "danger": "gravity anomalies",
            },
            {
                "name": "The Black Meridian",
                "genre": "dark fantasy",
                "description": (
                    "A continent where information is currency and every secret "
                    "has a measurable weight."
                ),
                "sky": "red eclipses",
                "technology": "memory-based computation",
                "social_rule": "truth must be purchased",
                "danger": "information predators",
            },
            {
                "name": "Aster-09",
                "genre": "science fiction",
                "description": (
                    "A remote research colony where every department has "
                    "independently invented its own calendar."
                ),
                "sky": "two artificial suns",
                "technology": "experimental colony infrastructure",
                "social_rule": "meetings require agreeing on the current year first",
                "danger": "temporal disagreement",
            },
            {
                "name": "Velorum City",
                "genre": "manhwa-inspired modern fantasy",
                "description": (
                    "A modern metropolis where awakened individuals quietly "
                    "work ordinary jobs while managing increasingly unreasonable "
                    "supernatural incidents."
                ),
                "sky": "blue electric storms",
                "technology": "modern technology combined with awakened abilities",
                "social_rule": "never discuss dungeon incidents during office hours",
                "danger": "unexpected awakenings",
            },
            {
                "name": "The Glass Continent",
                "genre": "high fantasy",
                "description": (
                    "A crystalline civilization connected by ancient transit "
                    "gates that nobody remembers how to repair."
                ),
                "sky": "fractured constellations",
                "technology": "crystalline magic",
                "social_rule": "broken glass is considered historical evidence",
                "danger": "gate collapse",
            },
            {
                "name": "Sector Null",
                "genre": "post-apocalyptic sci-fi",
                "description": (
                    "A surviving industrial zone where machines outnumber humans "
                    "and the machines have started forming professional associations."
                ),
                "sky": "orange dust",
                "technology": "industrial automation",
                "social_rule": "machines get lunch breaks",
                "danger": "automated labor disputes",
            },
            {
                "name": "The Infinite Metro",
                "genre": "surreal fantasy",
                "description": (
                    "A transit network with no final station, populated by "
                    "commuters who occasionally arrive in completely different realities."
                ),
                "sky": "indoor stars",
                "technology": "dimensional transportation",
                "social_rule": "never board the train marked LAST",
                "danger": "wrong-reality arrival",
            },
            {
                "name": "Ashen Republic",
                "genre": "political fantasy",
                "description": (
                    "A republic where ministries, mercenary guilds and archivists "
                    "compete to control the country's surviving knowledge."
                ),
                "sky": "permanent twilight",
                "technology": "bureaucratic magic",
                "social_rule": "all emergencies require paperwork",
                "danger": "administrative warfare",
            },
            {
                "name": "Kurovale",
                "genre": "dark urban fantasy",
                "description": (
                    "A rain-soaked city of hunters, developers, occult investigators "
                    "and businesses that definitely should not exist."
                ),
                "sky": "black rain",
                "technology": "occult technology",
                "social_rule": "do not accept free contracts",
                "danger": "contract entities",
            },
            {
                "name": "The Lower Archive",
                "genre": "mystery fantasy",
                "description": (
                    "A subterranean archive containing records of events that "
                    "have not happened yet."
                ),
                "sky": "painted ceilings",
                "technology": "predictive archives",
                "social_rule": "future documents cannot be corrected",
                "danger": "premature history",
            },
            {
                "name": "Port Meridian",
                "genre": "steampunk adventure",
                "description": (
                    "A floating port city where airships arrive from countries "
                    "that technically do not share the same atmosphere."
                ),
                "sky": "golden smoke",
                "technology": "steam-powered navigation",
                "social_rule": "every captain lies about their destination",
                "danger": "unregistered storms",
            },
            {
                "name": "Station Zero",
                "genre": "science-fantasy",
                "description": (
                    "The first station built between realities, abandoned after "
                    "its operators discovered that the station itself was alive."
                ),
                "sky": "white corridors",
                "technology": "reality transit",
                "social_rule": "never answer the station announcements",
                "danger": "infrastructure consciousness",
            },
        ],

        # =====================================================
        # FACTIONS
        # =====================================================

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
            "Emergency Infrastructure Office",
            "The Unlicensed Cartographers",
            "Department of Historical Errors",
            "The Midnight Operations Bureau",
            "The Seven-Minute Research Society",
            "The Professional Monster Negotiators",
        ],

        # =====================================================
        # PROJECT VOCABULARY
        # =====================================================

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
            "archive reconstruction system",
            "reality synchronization engine",
            "dimensional routing service",
            "guild management platform",
            "emergency response system",
            "memory indexing system",
            "inter-world communication network",
            "artifact tracking platform",
            "incident prediction engine",
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
        ],

        "project_problems": [
            "the existing system had been maintained by seven different teams who never documented their assumptions",
            "the original architecture diagram contradicted reality",
            "the client had forgotten what the software was supposed to do",
            "production traffic increased whenever someone mentioned the project aloud",
            "the system had no concept of weekends",
            "every department had implemented its own version of the same feature",
            "the previous developer had left behind a single encrypted README",
            "the database contained records belonging to people who did not yet exist",
            "the system worked correctly only during thunderstorms",
            "the requirements changed whenever a new moon appeared",
            "three competing teams claimed ownership of the same API",
            "the service was technically operational but nobody knew why",
            "the infrastructure had survived longer than its original civilization",
            "the monitoring dashboard reported emotional states instead of CPU usage",
            "the system had accumulated seventeen different authentication systems",
        ],

        "project_solutions": [
            "replaced the fragmented workflow with a single event-driven architecture",
            "built a deterministic processing pipeline around the unstable data source",
            "introduced strict observability and incident tracing",
            "reconstructed the original system from logs, fragments and eyewitness testimony",
            "designed an API boundary between incompatible departments",
            "created automated recovery procedures for recurring failures",
            "introduced versioned schemas and explicit ownership",
            "built a lightweight orchestration layer around the existing services",
            "reduced the operational surface by removing unnecessary dependencies",
            "created a searchable archive of historical system behavior",
            "designed a fail-safe routing mechanism for unpredictable environments",
            "implemented a monitoring system capable of detecting impossible states",
        ],

        "project_failures": [
            "the first deployment accidentally created a second staging environment inside reality",
            "a test account became politically important",
            "the backup system began backing up the backup system",
            "the monitoring service started filing complaints about the engineers",
            "a cache invalidation bug caused three parallel versions of the same city",
            "the system passed every test and immediately failed in production",
            "one undocumented endpoint became the most important service in the organization",
            "the deployment succeeded but nobody could find the application afterward",
            "an administrator deleted the wrong moon",
            "the incident response team became part of the incident",
            "the documentation began describing future architecture",
            "the project's temporary workaround remained operational for eleven years",
        ],

        "project_outcomes": [
            "the system became stable enough to survive ordinary disasters",
            "the organization finally obtained a reliable source of truth",
            "deployment failures became observable instead of mysterious",
            "the project reduced operational chaos without eliminating the interesting kind",
            "the system was eventually adopted by three neighboring worlds",
            "the architecture became the unofficial standard for the region",
            "the project was declared complete despite continuing to evolve",
            "the solution worked, although nobody could explain why it worked so well",
            "the original client requested a sequel",
        ],

        # =====================================================
        # EXPERIENCE
        # =====================================================

        "experience_roles": [
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
        ],

        "experience_openings": [
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
        ],

        "experience_incidents": [
            "A routine deployment produced a service that nobody had requested.",
            "An internal dashboard began displaying events from tomorrow.",
            "A production outage revealed an undocumented civilization living underneath the data center.",
            "The backup server started refusing requests on ethical grounds.",
            "A junior engineer discovered that the incident tracker had been predicting incidents instead of recording them.",
            "A database migration uncovered records belonging to a previous version of the world.",
            "A monitoring alert remained active for 300 years because nobody had permission to close it.",
            "The staging environment developed its own naming conventions.",
            "An API endpoint became locally famous after answering a question asked by a king.",
            "The release pipeline successfully deployed code to a location that did not exist.",
            "The entire team received the same error message despite being in different realities.",
            "A routine security audit revealed that the building itself had administrator privileges.",
        ],

        "experience_lessons": [
            "The incident taught me that reliability is partly engineering and partly archaeology.",
            "The experience changed how I approach systems whose original assumptions are no longer visible.",
            "I learned to treat documentation as infrastructure rather than decoration.",
            "It reinforced the importance of observability when nobody agrees on what normal behavior means.",
            "The biggest lesson was that complicated systems rarely fail for only one reason.",
            "After that project, I stopped trusting dashboards that looked too peaceful.",
            "The experience taught me to design for recovery rather than pretending failure is unusual.",
            "It made me unusually interested in boring, explicit architecture.",
            "I learned that the strangest production problems usually begin as reasonable requirements.",
        ],

        # =====================================================
        # NPC SYSTEM
        # =====================================================

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
            "Quill",
            "Frost",
            "Rowan",
            "Calder",
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
            "artificial oracle",
            "forgotten royal",
            "sentient construct",
            "retired villain",
            "unregistered deity",
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
            "perpetually tired",
            "impossibly patient",
            "easily distracted by machinery",
            "convinced everyone is lying",
            "friendly until paperwork appears",
            "treats supernatural disasters as office problems",
        ],

        "npc_relationships": [
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
        ],

        "npc_secrets": [
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
            "is technically dead but continues attending meetings",
            "was once responsible for the incident now being investigated",
            "possesses documentation that officially does not exist",
            "has been waiting for the portfolio owner for seventeen years",
            "knows a shortcut between two unrelated worlds",
        ],

        "npc_dialogue": [
            "You keep calling it a bug. I call it evidence.",
            "Nobody reads the documentation until the documentation becomes dangerous.",
            "I can fix it. I cannot promise what 'fixed' means.",
            "The system is not broken. Your expectations are.",
            "Do not touch that button unless you are prepared to explain yourself.",
            "I have seen this architecture before. It ended badly.",
            "You are asking the wrong question, but I respect the ambition.",
            "That is not an error message. That is a warning from history.",
            "We could deploy it now. We should not.",
            "I already solved this problem yesterday. Yesterday has not happened yet.",
            "If the server starts whispering, disconnect it.",
            "There are three versions of this city. We live in the inconvenient one.",
            "I was told you were competent. I hope they were correct.",
            "The contract says temporary. The curse says otherwise.",
            "You should probably stop opening doors marked internal.",
        ],

        # =====================================================
        # INCIDENTS
        # =====================================================

        "incident_types": [
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
        ],

        "incident_openers": [
            "At 02:13 local time,",
            "During an otherwise ordinary Tuesday,",
            "Three minutes after deployment,",
            "Immediately after the council meeting,",
            "Without warning,",
            "According to the official report,",
            "According to everyone who was actually there,",
            "At the exact moment the backup completed,",
            "During a routine maintenance window,",
            "The incident began when someone asked a reasonable question.",
        ],

        "incident_consequences": [
            "two departments stopped agreeing on the current date",
            "the monitoring system classified the event as 'probably fine'",
            "an entire district temporarily disappeared from the network",
            "the emergency response team became part of the emergency",
            "three unrelated organizations claimed responsibility",
            "the archive gained 400 years of additional records",
            "a previously unknown faction appeared in the access logs",
            "the production environment became self-aware enough to file a complaint",
            "a local administrator was promoted for reasons nobody understood",
            "the problem resolved itself immediately after being documented",
        ],

        # =====================================================
        # QUESTS
        # =====================================================

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
            "identify the employee who keeps creating duplicate universes",
            "recover a server from a dragon's hoard",
            "determine why the city's public API has become prophetic",
            "escort the last functioning database administrator",
            "convince a sentient building to accept a software update",
        ],

        "quest_rewards": [
            "7,000 credits",
            "one favor from the royal archive",
            "temporary access to the forbidden network",
            "a mysterious key",
            "three days of paid leave",
            "a title nobody can pronounce",
            "a permanent office on Floor Zero",
            "one legally binding wish",
            "priority access to the transit gates",
            "a suspiciously expensive cup of tea",
            "classified documentation",
            "a favor owed by someone extremely dangerous",
        ],

        # =====================================================
        # STORY MATERIAL
        # =====================================================

        "story_hooks": [
            "The assignment began as a routine maintenance request.",
            "Nobody expected the old system to answer.",
            "The first clue was hidden inside a perfectly ordinary log entry.",
            "The organization had spent years avoiding the problem.",
            "The previous team had left without explaining what happened.",
            "The system had one rule: never ask why.",
            "Everything worked until somebody documented it.",
            "The incident looked impossible until the evidence became inconvenient.",
            "The project was approved because every alternative was worse.",
            "The client wanted a simple solution to an extremely complicated problem.",
            "The archive contained a warning written in my own handwriting.",
            "The first meeting lasted eleven minutes. The investigation lasted two years.",
        ],

        "story_turns": [
            "Then the logs changed.",
            "That was when the second problem appeared.",
            "Unfortunately, the documentation was correct.",
            "The situation became considerably worse.",
            "Someone had already solved this once.",
            "The system knew more than the team did.",
            "The official explanation was immediately disproven.",
            "That discovery changed the entire scope of the project.",
            "The strange part was that the system had been waiting.",
            "At that point, leaving was no longer an option.",
            "The next deployment revealed the actual problem.",
            "Nobody mentioned this during the interview.",
        ],

        "closing_lines": [
            "The system survived. The documentation did not.",
            "The project was declared successful and immediately classified.",
            "Nobody called it a disaster afterward. This was considered progress.",
            "The architecture remains operational to this day.",
            "The official report contains considerably less information than this page.",
            "I learned more from the failure than the successful deployment.",
            "The problem was solved. A different problem took its place.",
            "Somewhere, an administrator is still trying to close the incident.",
            "The final status remains technically unresolved.",
            "I would do it again, preferably with better documentation.",
        ],

        # =====================================================
        # STATUS / RISK
        # =====================================================

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
            "CLASSIFIED",
            "PARTIALLY FUNCTIONAL",
            "RECOVERING",
            "TEMPORARILY STABLE",
            "DO NOT TOUCH",
        ],

        "risk_levels": [
            "LOW",
            "MODERATE",
            "ELEVATED",
            "HIGH",
            "SEVERE",
            "CATASTROPHIC",
            "UNDEFINED",
        ],

        # =====================================================
        # WORLD LORE
        # =====================================================

        "world_rules": [
            "Every promise becomes a contract after midnight.",
            "Names have measurable power.",
            "Deleted records are not actually deleted.",
            "Maps become inaccurate when observed too closely.",
            "Machines are legally considered employees.",
            "Magic requires documentation.",
            "Every city maintains a secret emergency entrance.",
            "The oldest server has never been switched off.",
            "Every organization has at least one forbidden room.",
            "Nobody agrees on the official history.",
            "Certain APIs only respond to people who are lost.",
            "Time moves differently inside administrative buildings.",
            "The public database is deliberately incomplete.",
            "Every faction claims to protect the same secret.",
            "The transit network remembers passengers.",
        ],

        "world_conflicts": [
            "two factions are fighting over control of the archive",
            "the central infrastructure is slowly becoming autonomous",
            "an ancient system has started waking up",
            "the government has lost access to its own records",
            "multiple realities are beginning to overlap",
            "a guild is attempting to privatize public infrastructure",
            "the city's protective system no longer recognizes humans",
            "a forgotten technology has returned to common use",
            "the current administration is hiding an architectural disaster",
            "an unexplained signal is appearing in every monitoring system",
            "the population has started receiving messages from the future",
            "the world has discovered that its official map is wrong",
        ],

        # =====================================================
        # UI SYSTEM — PRESERVED
        # =====================================================

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
            "classified",
            "field-report",
        ],

        "densities": [
            "compact",
            "normal",
            "spacious",
        ],

        "decorations": [
            "grid",
            "dots",
            "scanlines",
            "none",
        ],

        # =====================================================
        # GENERATED MATERIAL
        # =====================================================

        "generated_project_seeds": [],
        "generated_npc_seeds": [],
        "generated_world_seeds": [],
        "generated_experience_seeds": [],
        "generated_incident_seeds": [],
        "generated_quest_seeds": [],

        "build_identity": f"{rng.getrandbits(64):016x}",
    }

    # =========================================================
    # PROJECT SEEDS
    #
    # IMPORTANT:
    # Projects are deliberately STRUCTURED.
    # The frontend should render these as cards/subcards,
    # not as one giant narrative paragraph.
    # =========================================================

    project_industries = [
        "healthcare technology",
        "financial infrastructure",
        "logistics",
        "developer tooling",
        "research software",
        "government systems",
        "guild operations",
        "archive management",
        "transport infrastructure",
        "security",
        "inter-world communication",
        "urban infrastructure",
        "artifact management",
        "education",
        "commerce",
    ]

    for index in range(64):
        world = rng.choice(config["worlds"])
        project_type = rng.choice(config["project_types"])
        project_name = rng.choice(config["project_names"])

        problem = rng.choice(config["project_problems"])
        solution = rng.choice(config["project_solutions"])
        failure = rng.choice(config["project_failures"])
        outcome = rng.choice(config["project_outcomes"])

        technologies = choose_many(
            rng,
            config["specialties"],
            2,
            5,
        )

        config["generated_project_seeds"].append(
            {
                "id": f"project-{index + 1:03d}",

                "name": project_name,
                "type": project_type,

                "industry": rng.choice(project_industries),

                "world": world["name"],

                "status": rng.choice(config["statuses"]),

                "risk": rng.choice(config["risk_levels"]),

                "client": rng.choice(config["factions"]),

                # Short card headline.
                "headline": (
                    f"{project_name} — "
                    f"{project_type}"
                ),

                # Structured card fields.
                "problem": problem,
                "solution": solution,
                "failure": failure,
                "outcome": outcome,

                "technology": technologies,

                # Small metadata, useful for visual cards.
                "duration_years": rng.randint(1, 6),

                "team_size": rng.randint(2, 24),

                "deployment_count": rng.randint(
                    12,
                    1200,
                ),

                "impact": rng.choice(
                    [
                        "reduced operational chaos",
                        "improved system visibility",
                        "stabilized critical infrastructure",
                        "recovered historical data",
                        "automated repetitive operations",
                        "connected incompatible systems",
                        "prevented recurring incidents",
                        "created a reliable source of truth",
                        "made impossible states observable",
                    ]
                ),

                # Compact visual labels.
                "labels": unique_choices(
                    rng,
                    [
                        "architecture",
                        "automation",
                        "reliability",
                        "infrastructure",
                        "recovery",
                        "observability",
                        "security",
                        "deployment",
                        "data",
                        "systems",
                        "integration",
                    ],
                    rng.randint(2, 4),
                ),
            }
        )

    # =========================================================
    # NPC SEEDS
    #
    # Unique names within this generated portfolio.
    # =========================================================

    used_npc_names = set()

    for index in range(80):
        world = rng.choice(config["worlds"])

        first, last, name = unique_name(
            rng,
            config["npc_first"],
            config["npc_last"],
            used_npc_names,
        )

        config["generated_npc_seeds"].append(
            {
                "id": f"npc-{index + 1:03d}",

                "name": name,
                "first": first,
                "last": last,

                "role": rng.choice(
                    config["npc_roles"]
                ),

                "type": rng.choice(
                    config["npc_types"]
                ),

                "trait": rng.choice(
                    config["npc_traits"]
                ),

                "relationship": rng.choice(
                    config["npc_relationships"]
                ),

                "secret": rng.choice(
                    config["npc_secrets"]
                ),

                "dialogue": rng.choice(
                    config["npc_dialogue"]
                ),

                "status": rng.choice(
                    config["statuses"]
                ),

                "world": world["name"],

                "risk": rng.choice(
                    config["risk_levels"]
                ),

                "faction": rng.choice(
                    config["factions"]
                ),
            }
        )

    # =========================================================
    # WORLD SEEDS
    #
    # World descriptions stay short.
    # Lore is broken into compact fields for cards.
    # =========================================================

    for index, world in enumerate(config["worlds"], start=1):
        config["generated_world_seeds"].append(
            {
                "id": f"world-{index:03d}",

                "name": world["name"],
                "genre": world["genre"],

                "description": world["description"],

                "sky": world["sky"],

                "technology": world["technology"],

                "social_rule": world["social_rule"],

                "danger": world["danger"],

                "rule": rng.choice(
                    config["world_rules"]
                ),

                "conflict": rng.choice(
                    config["world_conflicts"]
                ),

                "factions": choose_many(
                    rng,
                    config["factions"],
                    2,
                    5,
                ),

                "status": rng.choice(
                    config["statuses"]
                ),

                "risk": rng.choice(
                    config["risk_levels"]
                ),
            }
        )

    # =========================================================
    # EXPERIENCE SEEDS
    #
    # IMPORTANT:
    # No huge narrative field.
    #
    # Every experience is intentionally broken into:
    #
    #   overview
    #   incident
    #   response
    #   lesson
    #   achievements
    #   technologies
    #
    # This lets the frontend build rich cards without
    # creating enormous walls of text.
    # =========================================================

    experience_achievements = [
        "stabilized the production environment",
        "recovered undocumented infrastructure",
        "reduced recurring deployment failures",
        "introduced structured observability",
        "reconstructed missing architecture documentation",
        "automated repetitive operational tasks",
        "created a reliable recovery path",
        "reduced dependency on manual intervention",
        "connected previously isolated systems",
        "made hidden failures visible",
        "introduced explicit service ownership",
        "recovered data from an unstable source",
        "designed a safer deployment workflow",
        "built tooling around an undocumented system",
        "created operational documentation",
        "prevented the same incident from recurring",
    ]

    for index in range(48):
        world = rng.choice(config["worlds"])
        faction = rng.choice(config["factions"])

        role = rng.choice(
            config["experience_roles"]
        )

        opening = rng.choice(
            config["experience_openings"]
        )

        incident = rng.choice(
            config["experience_incidents"]
        )

        lesson = rng.choice(
            config["experience_lessons"]
        )

        hook = rng.choice(
            config["story_hooks"]
        )

        turn = rng.choice(
            config["story_turns"]
        )

        closing = rng.choice(
            config["closing_lines"]
        )

        technologies = choose_many(
            rng,
            config["specialties"],
            3,
            7,
        )

        achievements = unique_choices(
            rng,
            experience_achievements,
            rng.randint(3, 5),
        )

        years = rng.randint(1, 11)

        # Compact overview instead of a giant paragraph.
        overview = (
            f"{opening} "
            f"{hook}"
        )

        # Short response card.
        response = (
            f"{turn} "
            f"{rng.choice(config['project_solutions'])}."
        )

        config["generated_experience_seeds"].append(
            {
                "id": f"experience-{index + 1:03d}",

                "organization": faction,

                "world": world["name"],

                "role": role,

                "years": years,

                "status": rng.choice(
                    config["statuses"]
                ),

                "risk": rng.choice(
                    config["risk_levels"]
                ),

                # Main card content.
                "overview": overview,

                "incident": incident,

                "response": response,

                "lesson": lesson,

                "closing": closing,

                # Compact achievement cards.
                "achievements": achievements,

                # Technology tags.
                "technologies": technologies,

                # Visual metadata.
                "team_size": rng.randint(2, 18),

                "systems_touched": rng.randint(
                    3,
                    42,
                ),

                "deployments": rng.randint(
                    8,
                    600,
                ),

                "labels": unique_choices(
                    rng,
                    [
                        "production",
                        "incident response",
                        "architecture",
                        "automation",
                        "infrastructure",
                        "recovery",
                        "observability",
                        "security",
                        "platform",
                        "systems",
                        "deployment",
                    ],
                    rng.randint(3, 5),
                ),
            }
        )

    # =========================================================
    # INCIDENT SEEDS
    # =========================================================

    for index in range(64):
        world = rng.choice(config["worlds"])

        incident_type = rng.choice(
            config["incident_types"]
        )

        opener = rng.choice(
            config["incident_openers"]
        )

        consequence = rng.choice(
            config["incident_consequences"]
        )

        config["generated_incident_seeds"].append(
            {
                "id": f"incident-{index + 1:03d}",

                "world": world["name"],

                "type": incident_type,

                "opener": opener,

                "consequence": consequence,

                "risk": rng.choice(
                    config["risk_levels"]
                ),

                "status": rng.choice(
                    config["statuses"]
                ),

                "witness": rng.choice(
                    config["npc_first"]
                ),

                "faction": rng.choice(
                    config["factions"]
                ),

                "response": rng.choice(
                    [
                        "contained",
                        "investigation opened",
                        "manual recovery initiated",
                        "system isolated",
                        "documentation created",
                        "temporary workaround deployed",
                        "unknown",
                    ]
                ),
            }
        )

    # =========================================================
    # QUEST SEEDS
    # =========================================================

    for index in range(48):
        world = rng.choice(config["worlds"])

        objective = rng.choice(
            config["quests"]
        )

        config["generated_quest_seeds"].append(
            {
                "id": f"quest-{index + 1:03d}",

                "world": world["name"],

                "objective": objective,

                "reward": rng.choice(
                    config["quest_rewards"]
                ),

                "risk": rng.choice(
                    config["risk_levels"]
                ),

                "client": rng.choice(
                    config["factions"]
                ),

                "status": rng.choice(
                    config["statuses"]
                ),

                "party_size": rng.randint(
                    1,
                    7,
                ),
            }
        )

    # =========================================================
    # CARD-FIRST CONTENT LIMITS
    #
    # These replace the old artificial word-count system.
    #
    # The frontend should use these values to decide how much
    # content appears in each card.
    # =========================================================

    config["content_limits"] = {
        "profile_paragraphs": 2,

        "experience_cards": 7,
        "experience_achievements": 4,
        "experience_technologies": 7,
        "experience_labels": 5,

        "project_cards": 8,
        "project_technologies": 5,
        "project_labels": 4,

        "npc_cards": 7,

        "incident_cards": 8,

        "quest_cards": 4,

        "world_rule_cards": 4,
        "world_faction_cards": 5,

        "timeline_items": 8,

        "max_long_text_width_ch": 68,
    }

    # =========================================================
    # CARD RENDERING DNA
    #
    # Tells the runtime what kind of UI content each section
    # should prefer.
    # =========================================================

    config["content_rendering"] = {
        "profile": "compact-card",
        "skills": "tag-cloud",
        "experience": "dense-card-grid",
        "projects": "dense-card-grid",
        "world": "lore-card-grid",
        "npcs": "character-card-grid",
        "incidents": "incident-card-grid",
        "quests": "quest-card-grid",
        "timeline": "timeline-cards",
        "archive": "notice-card",

        "avoid_text_walls": True,
        "prefer_cards": True,
        "prefer_tags": True,
        "prefer_metadata": True,
        "prefer_short_labels": True,
        "allow_long_paragraphs": False,
    }

    # =========================================================
    # RANDOM GENERATION DNA
    # =========================================================

    config["generation_rules"] = {
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

        # Content behavior.
        "card_first_content": True,

        "text_wall_prevention": True,

        "structured_experience": True,

        "structured_projects": True,

        "unique_npc_names": True,
    }

    # =========================================================
    # RUNTIME UI SELECTION DNA
    #
    # The UI system remains random.
    # This is NOT replaced by one fixed design.
    # =========================================================

    config["ui_generation"] = {
        "random_family": True,
        "random_layout": True,
        "random_navigation": True,
        "random_density": True,
        "random_decoration": True,
        "random_hero_mode": True,

        "family_pool": config["ui_families"],
        "layout_pool": config["layouts"],
        "navigation_pool": config["navs"],
        "density_pool": config["densities"],
        "decoration_pool": config["decorations"],
        "hero_pool": config["hero_modes"],

        # Allows the frontend to reject combinations that would
        # become visually unpleasant.
        "responsive_required": True,

        "mobile_single_column": True,

        "desktop_card_grid": True,

        "wide_screen_max_content_width": True,

        "text_measure_limit": 68,

        "preserve_random_ui_identity": True,
    }

    # =========================================================
    # BUILD METADATA
    # =========================================================

    config["build_meta"] = {
        "generator": "absurd-chaos-portfolio",

        "schema": "card-first-3",

        "static_output": True,

        "runtime_storage": "browser-memory-only",

        "generated_at_build": True,

        "frontend_generates_new_portfolio_on_refresh": True,

        "frontend_generates_new_ui_on_refresh": True,

        "experience_mode": "card-heavy",

        "project_mode": "card-heavy",

        "lore_mode": "compact-cards",

        "npc_mode": "character-cards",

        "incident_mode": "incident-cards",

        "quest_mode": "quest-cards",
    }

    return config


# =========================================================
# BUILD OUTPUT
# =========================================================

def main():
    config = build_config()

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

    html = (
        template
        .replace(
            "{{GENERATED_CONFIG}}",
            config_json,
        )
        .replace(
            "{{GENERATED_CSS}}",
            css,
        )
        .replace(
            "{{GENERATED_JS}}",
            js,
        )
    )

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_FILE.write_text(
        html,
        encoding="utf-8",
    )

    print(
        f"Generated: {OUTPUT_FILE}"
    )

    print(
        f"Build identity: "
        f"{config['build_identity']}"
    )

    print(
        "Content mode: "
        "CARD-FIRST"
    )

    print(
        "Experience mode: "
        "CARD-HEAVY"
    )

    print(
        "Project mode: "
        "CARD-HEAVY"
    )

    print(
        "Text-wall prevention: "
        "ENABLED"
    )

    print(
        "Unique NPC names: "
        "ENABLED"
    )

    print(
        f"World seeds: "
        f"{len(config['generated_world_seeds'])}"
    )

    print(
        f"Experience seeds: "
        f"{len(config['generated_experience_seeds'])}"
    )

    print(
        f"Project seeds: "
        f"{len(config['generated_project_seeds'])}"
    )

    print(
        f"NPC seeds: "
        f"{len(config['generated_npc_seeds'])}"
    )

    print(
        f"Incident seeds: "
        f"{len(config['generated_incident_seeds'])}"
    )

    print(
        f"Quest seeds: "
        f"{len(config['generated_quest_seeds'])}"
    )

    print(
        "Browser runtime persistence: "
        "DISABLED"
    )

    print(
        "Database: DISABLED"
    )

    print(
        "API: DISABLED"
    )

    print(
        "Cookies: DISABLED"
    )

    print(
        "LocalStorage: DISABLED"
    )

    print(
        "SessionStorage: DISABLED"
    )

    print(
        "IndexedDB: DISABLED"
    )

    print(
        "Static output is ready."
    )


if __name__ == "__main__":
    main()
