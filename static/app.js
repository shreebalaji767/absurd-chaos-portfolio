(() => {
    "use strict";

    /*
     * IMPORTANT
     * ---------------------------------------------------------
     * This file intentionally does NOT use:
     *
     * localStorage
     * sessionStorage
     * IndexedDB
     * cookies
     * fetch()
     * XMLHttpRequest
     * WebSocket
     * databases
     *
     * Every portfolio exists only in JavaScript memory.
     * Refreshing the page creates a completely new portfolio.
     */


    /* ========================================================
       CONFIGURATION
       ======================================================== */

    const CONFIG = window.__ABSURD_CONFIG__;

    if (!CONFIG || typeof CONFIG !== "object") {
        document.body.innerHTML = `
            <main class="runtime-error">
                <section class="runtime-error-card">
                    <p class="eyebrow">Configuration Error</p>
                    <h1>Portfolio configuration is missing.</h1>
                    <p>
                        Run <code>python3 generator.py</code> and open
                        generated/index.html.
                    </p>
                </section>
            </main>
        `;
        return;
    }


    const runtime = {
        current: null,
        generation: 0,
        history: [],
        usedSignatures: new Set(),
        npcIndex: new Map(),
        projectIndex: new Map(),
        experienceIndex: new Map(),
        worldIndex: new Map(),
        seed: null,
        rngState: null
    };

    function hashSeed(value) {
        let hash = 2166136261;
        const text = String(value);

        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }

        return hash >>> 0 || 0x9e3779b9;
    }

    function createRandomSeed() {
        try {
            if (window.crypto && typeof window.crypto.getRandomValues === "function") {
                const buffer = new Uint32Array(2);
                window.crypto.getRandomValues(buffer);
                return `${buffer[0].toString(16)}${buffer[1].toString(16)}`;
            }
        } catch (_) {}

        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }

    function setGenerationSeed(seed) {
        const normalized = safe(seed, createRandomSeed()).slice(0, 120);
        runtime.seed = normalized;
        runtime.rngState = hashSeed(normalized);
    }

    function seededRandom() {
        runtime.rngState += 0x6D2B79F5;
        let value = runtime.rngState;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    }


    /* ========================================================
       DOM HELPERS
       ======================================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];


    /* ========================================================
       RANDOMNESS
       ======================================================== */

    function random() {
        if (runtime.rngState !== null) {
            return seededRandom();
        }

        return Math.random();
    }


    function integer(min, max) {
        const low = Math.ceil(min);
        const high = Math.floor(max);

        return Math.floor(
            random() * (high - low + 1)
        ) + low;
    }


    function pick(array, fallback = "") {
        if (!Array.isArray(array) || array.length === 0) {
            return fallback;
        }

        return array[
            Math.floor(random() * array.length)
        ];
    }


    function sample(array, min, max) {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }

        const copy = [...array];

        for (
            let i = copy.length - 1;
            i > 0;
            i--
        ) {
            const j = Math.floor(random() * (i + 1));

            [
                copy[i],
                copy[j]
            ] = [
                copy[j],
                copy[i]
            ];
        }

        const actualMin = Math.max(
            0,
            Math.min(min, copy.length)
        );

        const actualMax = Math.max(
            actualMin,
            Math.min(max, copy.length)
        );

        const count = integer(
            actualMin,
            actualMax
        );

        return copy.slice(0, count);
    }


    function unique(array) {
        return [...new Set(
            Array.isArray(array)
                ? array
                : []
        )];
    }


    function weightedChoice(items) {
        if (!Array.isArray(items) || !items.length) {
            return null;
        }

        const total = items.reduce(
            (sum, item) =>
                sum + Math.max(0, Number(item.weight) || 0),
            0
        );

        if (!total) {
            return pick(items)?.value ?? null;
        }

        let cursor = random() * total;

        for (const item of items) {
            cursor -= Math.max(
                0,
                Number(item.weight) || 0
            );

            if (cursor <= 0) {
                return item.value;
            }
        }

        return items[items.length - 1].value;
    }


    /* ========================================================
       TEXT HELPERS
       ======================================================== */

    function safe(value, fallback = "") {
        if (
            value === undefined ||
            value === null
        ) {
            return fallback;
        }

        const text = String(value).trim();

        return text || fallback;
    }


    function safeArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .filter(
                item =>
                    item !== null &&
                    item !== undefined
            )
            .map(item => String(item));
    }


    function escapeHTML(value) {
        return safe(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function articleFor(value) {
        const word = safe(value, "system")
            .trim()
            .replace(/^[^a-zA-Z]+/, "");

        if (!word) {
            return "a";
        }

        const lower = word.toLowerCase();

        if (
            lower.startsWith("hour") ||
            lower.startsWith("honest") ||
            lower.startsWith("honor") ||
            lower.startsWith("heir") ||
            lower.startsWith("x") ||
            lower.startsWith("f") ||
            lower.startsWith("m")
        ) {
            return "an";
        }

        return "aeiou".includes(lower[0])
            ? "an"
            : "a";
    }


    function capitalize(value) {
        const text = safe(value);

        if (!text) {
            return "";
        }

        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );
    }


    function initials(name) {
        return safe(name, "PR")
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0])
            .join("")
            .toUpperCase();
    }


    function slug(value) {
        return safe(value, "item")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }


    function formatNumber(value) {
        return new Intl.NumberFormat(
            "en-IN"
        ).format(Number(value) || 0);
    }


    function sentence(parts) {
        return parts
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
    }


    function hashString(value) {
        let hash = 2166136261;

        const text = String(value);

        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash +=
                (hash << 1) +
                (hash << 4) +
                (hash << 7) +
                (hash << 8) +
                (hash << 24);
        }

        return (
            hash >>> 0
        ).toString(16);
    }


    function randomId(prefix) {
        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            integer(
                100000,
                999999
            ).toString(36)
        );
    }


    function randomDate(yearMin = 2018, yearMax = 2026) {
        const year = integer(
            yearMin,
            yearMax
        );

        const month = String(
            integer(1, 12)
        ).padStart(2, "0");

        const day = String(
            integer(1, 28)
        ).padStart(2, "0");

        return `${day} ${new Intl.DateTimeFormat(
            "en",
            { month: "short" }
        ).format(
            new Date(
                year,
                Number(month) - 1,
                Number(day)
            )
        )} ${year}`;
    }


    function configPool(name) {
        return (
            CONFIG.pools &&
            Array.isArray(CONFIG.pools[name])
        )
            ? CONFIG.pools[name]
            : [];
    }


    function configPick(name, fallback = "") {
        return pick(
            configPool(name),
            fallback
        );
    }


    function configSample(name, min, max) {
        return sample(
            configPool(name),
            min,
            max
        );
    }


    /* ========================================================
       WORLD GENERATION
       ======================================================== */

    function generateWorld() {
        const seed = pick(
            configPool("worlds")
        );

        const world = {
            id: randomId("world"),

            name: safe(
                seed?.name,
                "Unknown World"
            ),

            genre: safe(
                seed?.genre,
                "fictional setting"
            ),

            classification: safe(
                seed?.classification,
                "unclassified"
            ),

            description: safe(
                seed?.description,
                "A place with more infrastructure than documentation."
            ),

            technology: safe(
                seed?.technology,
                "distributed infrastructure"
            ),

            rule: safe(
                seed?.rule,
                "Systems should remain operational."
            ),

            danger: safe(
                seed?.danger,
                "Unknown operational risk."
            ),

            conflict: safe(
                seed?.conflict,
                "A complex infrastructure problem."
            ),

            sky: safe(
                seed?.sky,
                "unknown"
            ),

            population: safe(
                seed?.population,
                "unknown"
            ),

            stability: Number(
                seed?.stability
            ) || integer(30, 95),

            factions: sample(
                safeArray(seed?.factions),
                2,
                4
            ),

            rules: [
                safe(
                    seed?.rule,
                    "Document every critical system."
                ),
                safe(
                    seed?.danger,
                    "Unknown systems require investigation."
                ),
                "Operational ownership must be established.",
                "Critical changes require an observable rollback path.",
                "No undocumented dependency may remain permanently invisible."
            ]
        };

        runtime.worldIndex.set(
            world.id,
            world
        );

        return world;
    }


    /* ========================================================
       NPC GENERATION
       ======================================================== */

    function generateNPC(
        world,
        usedNames,
        faction
    ) {
        let name = "";

        for (let attempt = 0; attempt < 30; attempt++) {
            const candidate = configPick(
                "names",
                "Unknown Operator"
            );

            if (!usedNames.has(candidate)) {
                name = candidate;
                break;
            }
        }

        if (!name) {
            name =
                "Operator " +
                integer(100, 999);
        }

        usedNames.add(name);

        const role = configPick(
            "npc_roles",
            "systems specialist"
        );

        const type = configPick(
            "npc_types",
            "contact"
        );

        const trait = configPick(
            "npc_traits",
            "keeps unusually detailed records"
        );

        const relationship = pick([
            "primary client",
            "technical counterpart",
            "long-term collaborator",
            "project owner",
            "former manager",
            "field contact",
            "research partner",
            "systems liaison",
            "incident witness",
        ]);

        const secret = pick([
            `${name} maintains an undocumented backup of a deprecated system.`,
            `${name} knows why one production service has never been restarted.`,
            `${name} has a private architecture diagram nobody else has seen.`,
            `${name} once approved a deployment that technically did not exist.`,
            `${name} keeps records of systems that were officially decommissioned.`,
            `${name} knows a maintenance route that is absent from every map.`,
        ]);

        const dialogue = pick([
            `"It is working. I would prefer to know why."`,
            `"The documentation is correct. The system is not."`,
            `"Do not fix the old service until we know what depends on it."`,
            `"That behavior has been there longer than the team."`,
            `"We only need one more deployment."`,
            `"I would call it stable if I trusted the definition of stable."`,
        ]);

        const npc = {
            id: randomId("npc"),

            name,
            first: name.split(" ")[0],
            last: name.split(" ").slice(1).join(" "),

            role,
            type,
            trait,
            relationship,
            secret,
            dialogue,

            worldId: world.id,
            world: world.name,

            faction: safe(
                faction,
                pick(world.factions, "Independent Systems Guild")
            ),

            location: configPick(
                "locations",
                "Unknown"
            ),

            reputation: integer(35, 98),
            danger: integer(5, 91),
            age: integer(23, 67),
            encounters: integer(3, 48),

            status: pick([
                "Active",
                "Operational",
                "Consulting",
                "Field Assignment",
                "Research",
                "Restricted",
            ]),

            biography: sentence([
                name,
                `is a ${role} associated with ${world.name}.`,
                capitalize(trait) + ".",
                "Their work has repeatedly intersected with infrastructure projects requiring unusual operational judgment."
            ]),

            rumors: sample([
                `${name} has an unusually complete map of ${world.name}.`,
                `${name} once solved an incident without changing any code.`,
                `${name} refuses to delete deprecated infrastructure.`,
                `${name} keeps a private list of services that should not be restarted.`,
                `${name} has access to an archive nobody remembers creating.`,
                `${name} reportedly knows where the oldest production server is located.`,
            ], 2, 2),

            projectIds: [],
            experienceIds: []
        };

        runtime.npcIndex.set(
            npc.id,
            npc
        );

        return npc;
    }


    /* ========================================================
       EXPERIENCE GENERATION
       ======================================================== */

    function generateExperience(
        world,
        npc,
        specialtyPool
    ) {
        const role = configPick(
            "experience_roles",
            "Systems Engineer"
        );

        const opening = configPick(
            "experience_openings",
            "Joined during a major infrastructure transition."
        );

        const incident = configPick(
            "experience_incidents",
            "A production dependency failed without appearing unhealthy."
        );

        const lesson = configPick(
            "experience_lessons",
            "Reliable systems require clear boundaries."
        );

        const hook = configPick(
            "story_hooks",
            "The assignment looked ordinary until the infrastructure map disagreed with reality."
        );

        const turn = configPick(
            "story_turns",
            "A previously unknown dependency changed the scope."
        );

        const closing = configPick(
            "closing_lines",
            "The resulting system remained operational."
        );

        const technologies = sample(
            specialtyPool.length
                ? specialtyPool
                : configPool("technologies"),
            4,
            7
        );

        const experience = {
            id: randomId("exp"),

            role,

            organization: pick([
                `${npc.faction}`,
                `${world.name} Infrastructure Office`,
                `${world.name} Systems Directorate`,
                `${npc.name}'s Operations Group`,
                `${capitalize(world.genre)} Systems Bureau`,
            ]),

            world: world.name,
            worldId: world.id,

            years:
                integer(2016, 2024) +
                "–" +
                integer(2024, 2026),

            status: pick([
                "Completed",
                "Current",
                "Consulting",
                "Archived",
                "Active",
            ]),

            npcId: npc.id,
            npcName: npc.name,
            npcRole: npc.role,

            technologies,

            assignment: sentence([
                opening,
                `${npc.name} was the primary contact.`,
            ]),

            context: sentence([
                hook,
                `The environment was ${world.name}, where ${world.technology} supported a population of ${world.population}.`,
            ]),

            incident: sentence([
                incident,
                turn,
            ]),

            response: sentence([
                `Mapped the dependency chain, isolated the operational boundary, and introduced ${pick([
                    "a staged deployment path",
                    "an observable rollback path",
                    "a queue-based recovery process",
                    "a controlled migration layer",
                    "a dedicated monitoring boundary",
                ])}.`,
            ]),

            lesson,

            achievements: sample([
                "Reduced manual operational work.",
                "Created clearer ownership boundaries.",
                "Introduced repeatable deployment procedures.",
                "Improved system observability.",
                "Documented previously implicit dependencies.",
                "Stabilized a critical production workflow.",
                "Built a migration path without full downtime.",
                `Established a reliable working relationship with ${npc.name}.`,
            ], 3, 4),

            narrative: sentence([
                hook,
                turn,
                `The work involved ${technologies.slice(0, 3).join(", ")}.`,
                closing,
            ])
        };

        runtime.experienceIndex.set(
            experience.id,
            experience
        );

        npc.experienceIds.push(
            experience.id
        );

        return experience;
    }


    /* ========================================================
       PROJECT GENERATION
       ======================================================== */

    function generateProject(
        world,
        npc,
        specialties
    ) {
        const baseName = configPick(
            "project_names",
            "Atlas"
        );

        const suffix = pick([
            "Core",
            "Prime",
            "One",
            "Grid",
            "Protocol",
            "Runtime",
            "Mesh",
            "Engine",
            "Control",
            "Network",
            "Service",
            "Gateway",
            "System",
        ]);

        const type = configPick(
            "project_types",
            "platform"
        );

        const industry = configPick(
            "industries",
            "infrastructure"
        );

        const technologies = sample(
            configPool("technologies"),
            5,
            8
        );

        const skills = sample(
            specialties,
            3,
            6
        );

        const problem = configPick(
            "problems",
            "The existing system had become difficult to operate."
        );

        const solution = configPick(
            "solutions",
            "A controlled service architecture."
        );

        const failure = configPick(
            "failures",
            "The first deployment exposed an undocumented dependency."
        );

        const outcome = configPick(
            "outcomes",
            "The system became more predictable."
        );

        const project = {
            id: randomId("project"),

            name:
                baseName +
                " " +
                suffix,

            type,
            industry,

            world: world.name,
            worldId: world.id,

            clientId: npc.id,
            clientName: npc.name,
            clientRole: npc.role,

            status: pick([
                "Delivered",
                "Operational",
                "Maintained",
                "Archived",
                "In Production",
                "Under Expansion",
            ]),

            complexity: pick([
                "High",
                "Very High",
                "Cross-system",
                "Distributed",
                "Unusually high",
            ]),

            users: pick([
                formatNumber(integer(2400, 920000)),
                formatNumber(integer(120, 89000)) + " records",
                formatNumber(integer(12, 340)) + " services",
                formatNumber(integer(4, 38)) + " regions",
                "multiple operational domains",
            ]),

            duration:
                integer(3, 19) +
                " months",

            summary: sentence([
                `${npc.name} commissioned ${articleFor(type)} ${type}.`,
                `The system operated inside ${world.name}.`,
                `Its purpose was to make ${problem.replace(/\.$/, "")}.`,
            ]),

            problem,

            architecture: sentence([
                solution,
                `Primary technologies included ${technologies.slice(0, 4).join(", ")}.`,
            ]),

            client: sentence([
                `${npc.name} served as the primary ${npc.role}.`,
                `${npc.name} is known for being someone who ${npc.trait}.`,
            ]),

            failure,

            solution,

            outcome,

            skills,

            technologies,

            technicalNotes: [
                `Primary environment: ${world.name}.`,
                `Operational model: ${pick([
                    "event-driven",
                    "service-oriented",
                    "queue-based",
                    "distributed",
                    "hybrid",
                    "layered",
                ])}.`,
                `Reliability strategy: ${pick([
                    "graceful degradation",
                    "replayable events",
                    "controlled rollback",
                    "redundant routing",
                    "manual failover",
                ])}.`,
                `The most unusual dependency involved ${pick(configPool("technologies"))}.`,
            ],

            narrative: sentence([
                configPick(
                    "story_hooks",
                    "The assignment looked ordinary."
                ),
                `${npc.name} provided the original requirement.`,
                configPick(
                    "story_turns",
                    "A hidden dependency changed the scope."
                ),
                configPick(
                    "closing_lines",
                    "The system remained operational."
                ),
            ])
        };

        runtime.projectIndex.set(
            project.id,
            project
        );

        npc.projectIds.push(
            project.id
        );

        return project;
    }


    /* ========================================================
       INCIDENTS
       ======================================================== */

    function generateIncident(
        world,
        npcs,
        projects
    ) {
        const witness = pick(
            npcs
        );

        const project = pick(
            projects
        );

        const risk = pick([
            "Low",
            "Moderate",
            "Elevated",
            "High",
            "Critical",
        ]);

        const type = pick([
            "Deployment",
            "Infrastructure",
            "Security",
            "Data",
            "Integration",
            "Performance",
            "Automation",
            "Unknown Dependency",
        ]);

        const code =
            "INC-" +
            integer(100, 999) +
            "-" +
            integer(10, 99);

        return {
            id: randomId("incident"),

            code,
            type,
            risk,

            world: world.name,

            witnessName: witness?.name || "Unknown",
            witnessId: witness?.id || "",

            projectName:
                project?.name ||
                "Unassigned System",

            projectId:
                project?.id ||
                "",

            status: pick([
                "Resolved",
                "Contained",
                "Monitoring",
                "Closed",
                "Under Review",
            ]),

            date: randomDate(),

            summary: pick([
                "A service behaved differently after a routine change.",
                "A dependency became unavailable without reporting failure.",
                "A scheduled process generated unexpected output.",
                "A previously undocumented integration became visible.",
                "An automated workflow exceeded its expected scope.",
            ]),

            observation: pick([
                "The failure could not be reproduced in the documented environment.",
                "Logs showed a valid request path with an unexpected destination.",
                "The system remained partially operational throughout the event.",
                "Monitoring detected the effect but not the cause.",
            ]),

            consequence: pick([
                "Several downstream services entered a degraded state.",
                "Manual intervention was required.",
                "Operational records temporarily disagreed.",
                "The incident exposed an undocumented dependency.",
            ]),

            response: pick([
                "Traffic was isolated and the affected dependency was mapped.",
                "The workflow was paused and replayed after verification.",
                "A temporary routing layer was introduced.",
                "The service was restored using a controlled rollback.",
            ]),

            recommendation: pick([
                "Document the dependency.",
                "Add a dedicated monitoring boundary.",
                "Introduce an explicit ownership model.",
                "Keep the rollback path tested.",
                "Do not remove the legacy service until its dependencies are measured.",
            ])
        };
    }


    /* ========================================================
       QUESTS
       ======================================================== */

    function generateQuest(
        world,
        npcs
    ) {
        const assignedBy = pick(npcs);

        return {
            id: randomId("quest"),

            world: world.name,

            objective: pick([
                "Stabilize the production routing layer.",
                "Recover the missing deployment history.",
                "Identify the owner of an undocumented service.",
                "Rebuild the archive index.",
                "Investigate an infrastructure dependency that predates the current team.",
                "Move a critical workflow without interrupting public services.",
                "Determine why the monitoring system has started creating tickets.",
                "Locate the original architecture diagram.",
            ]),

            reward: pick([
                "Operational clearance",
                "Infrastructure access",
                "A permanent maintenance contract",
                "Priority deployment rights",
                "Archive authorization",
                "Guild recognition",
                "Research clearance",
            ]),

            risk: pick([
                "Low",
                "Moderate",
                "High",
                "Unknown",
                "Operationally sensitive",
            ]),

            status: pick([
                "Open",
                "Active",
                "Assigned",
                "Investigating",
                "Pending Review",
            ]),

            assignedBy:
                assignedBy?.name ||
                "Unknown Director",

            client:
                assignedBy?.role ||
                "Systems Director",

            description: sentence([
                "The assignment appears straightforward.",
                pick([
                    "The existing documentation disagrees.",
                    "The system has several undocumented dependencies.",
                    "The last person assigned to it left no final report.",
                    "The service is considered operational despite having no documented owner.",
                ]),
            ])
        };
    }


    /* ========================================================
       TIMELINE
       ======================================================== */

    function generateTimeline(
        experiences,
        world
    ) {
        const years = unique(
            experiences.map(
                item =>
                    safe(item.years)
                        .split("–")[0]
            )
        )
            .sort()
            .slice(0, 7);

        return years.map(
            (year, index) => ({
                id: randomId("timeline"),

                year,

                title: pick([
                    "Systems Engineering Assignment",
                    "Platform Migration",
                    "Infrastructure Stabilization",
                    "Distributed Systems Project",
                    "Operational Architecture Review",
                    "Major Deployment",
                    "Research & Integration Assignment",
                ]),

                text: sentence([
                    `Worked across ${world.name}.`,
                    pick([
                        "Focused on reliability and automation.",
                        "Built infrastructure around a growing service ecosystem.",
                        "Investigated a difficult operational dependency.",
                        "Introduced clearer system boundaries.",
                        "Worked closely with technical stakeholders.",
                    ]),
                ])
            })
        );
    }


    /* ========================================================
       UI GENERATION
       ======================================================== */

    function choosePalette(family) {
        const palettes = {
            executive: {
                accent: "#8b7cff",
                accent2: "#55dfbd",
                background: "#090a0d",
                surface: "#101218",
            },

            terminal: {
                accent: "#6cff9b",
                accent2: "#7ddcff",
                background: "#050806",
                surface: "#0b110d",
            },

            rpg: {
                accent: "#b58cff",
                accent2: "#f2ca72",
                background: "#0d0a14",
                surface: "#151020",
            },

            manhwa: {
                accent: "#765cff",
                accent2: "#d94172",
                background: "#f5f5f2",
                surface: "#ffffff",
            },

            dossier: {
                accent: "#d0b46a",
                accent2: "#7fb3a4",
                background: "#10110f",
                surface: "#181914",
            },

            research: {
                accent: "#55a7ff",
                accent2: "#6fe0c3",
                background: "#071019",
                surface: "#0d1822",
            },

            luxury: {
                accent: "#d6b36a",
                accent2: "#d98c7c",
                background: "#0e0d0b",
                surface: "#181612",
            },

            brutalist: {
                accent: "#111111",
                accent2: "#e03434",
                background: "#f0efe9",
                surface: "#ffffff",
            },

            space: {
                accent: "#8d8cff",
                accent2: "#61d9ff",
                background: "#060914",
                surface: "#0d1220",
            },

            detective: {
                accent: "#d7b45f",
                accent2: "#7db3a7",
                background: "#10110f",
                surface: "#171914",
            },

            spellbook: {
                accent: "#9c6dff",
                accent2: "#66d2b3",
                background: "#0d0a14",
                surface: "#151020",
            },

            underground: {
                accent: "#ff765f",
                accent2: "#7ed6c1",
                background: "#0d0d0d",
                surface: "#151515",
            },

            newspaper: {
                accent: "#151515",
                accent2: "#8f2020",
                background: "#eeeade",
                surface: "#f7f4e8",
            },

            "operating-system": {
                accent: "#6d9cff",
                accent2: "#6be0ba",
                background: "#080c13",
                surface: "#101722",
            },

            chaotic: {
                accent: "#ff5ca8",
                accent2: "#64e7ff",
                background: "#0b0710",
                surface: "#15101b",
            }
        };

        return (
            palettes[family] ||
            palettes.executive
        );
    }


    function generateUIDNA({
        world,
        title,
        personality,
        specialties,
        chaos
    }) {
        const families =
            CONFIG.ui_system.families;

        const weights = families.map(
            family => ({
                value: family,
                weight: 1
            })
        );

        function boost(family, amount) {
            const target = weights.find(
                item => item.value === family
            );

            if (target) {
                target.weight += amount;
            }
        }

        const text = (
            `${title} ${personality} ` +
            `${world.genre} ${specialties.join(" ")}`
        ).toLowerCase();

        if (
            /platform|system|infra|devops|runtime/.test(text)
        ) {
            boost("terminal", 5);
            boost("operating-system", 4);
            boost("executive", 2);
        }

        if (
            /research|science|data|space/.test(text)
        ) {
            boost("research", 4);
            boost("space", 3);
        }

        if (
            /security|incident|detective/.test(text)
        ) {
            boost("dossier", 3);
            boost("detective", 3);
        }

        if (
            /fantasy|guild|manhwa|magic/.test(text)
        ) {
            boost("rpg", 4);
            boost("spellbook", 4);
            boost("manhwa", 3);
        }

        if (
            /cyberpunk|underground/.test(text)
        ) {
            boost("underground", 4);
            boost("terminal", 2);
        }

        if (
            /newspaper|archive|records/.test(text)
        ) {
            boost("newspaper", 2);
            boost("dossier", 3);
        }

        if (
            personality === "methodical" ||
            personality === "precise"
        ) {
            boost("executive", 3);
            boost("research", 2);
        }

        if (
            personality === "restless" ||
            personality === "experimental"
        ) {
            boost("chaotic", 3);
            boost("brutalist", 2);
        }

        if (chaos >= 75) {
            boost("chaotic", 5);
            boost("brutalist", 3);
            boost("underground", 2);
        }

        const family =
            weightedChoice(weights) ||
            pick(families, "executive");

        const palette =
            choosePalette(family);

        const density =
            chaos >= 80
                ? "compact"
                : chaos <= 35
                    ? "spacious"
                    : "normal";

        return {
            family,

            layout: pick(
                CONFIG.ui_system.layouts,
                "dashboard"
            ),

            nav: pick(
                CONFIG.ui_system.navs,
                "top"
            ),

            hero: pick(
                CONFIG.ui_system.hero_modes,
                "identity"
            ),

            density,

            decoration: pick(
                CONFIG.ui_system.decorations,
                "none"
            ),

            voice: family,

            radius: integer(
                0,
                24
            ),

            accent: palette.accent,
            accent2: palette.accent2,
            background: palette.background,
            surface: palette.surface,

            personality,

            chaos,

            cardFirst: true,
            textHeavy: false,
            longForm: false
        };
    }


    /* ========================================================
       PORTFOLIO GENERATION
       ======================================================== */

    function generatePortfolio() {

        runtime.npcIndex.clear();
        runtime.projectIndex.clear();
        runtime.experienceIndex.clear();
        runtime.worldIndex.clear();

        const world =
            generateWorld();

        const name =
            configPick(
                "names",
                "Ari Voss"
            );

        const title =
            configPick(
                "titles",
                "Systems Engineer"
            );

        const personality =
            configPick(
                "personalities",
                "systems-minded"
            );

        const education =
            configPick(
                "education",
                "B.Tech in Computer Science"
            );

        const location =
            configPick(
                "locations",
                "Unknown"
            );

        const faction =
            pick(
                world.factions,
                "Independent Systems Guild"
            );

        const specialties =
            configSample(
                "specialties",
                CONFIG.generation.specialty_min,
                CONFIG.generation.specialty_max
            );

        const chaos =
            integer(
                30,
                96
            );

        const npcCount =
            integer(
                CONFIG.generation.npc_min,
                CONFIG.generation.npc_max
            );

        const usedNames =
            new Set();

        const npcs = [];

        for (
            let i = 0;
            i < npcCount;
            i++
        ) {
            npcs.push(
                generateNPC(
                    world,
                    usedNames,
                    faction
                )
            );
        }

        /*
         * Every NPC gets at least one experience
         * and one project.
         *
         * This is deliberate: NPCs are not decorative.
         * They are part of the career history.
         */

        const experiences = [];

        for (const npc of npcs) {
            experiences.push(
                generateExperience(
                    world,
                    npc,
                    specialties
                )
            );
        }

        const projects = [];

        for (const npc of npcs) {
            projects.push(
                generateProject(
                    world,
                    npc,
                    specialties
                )
            );
        }

        /*
         * Add a few additional records.
         */

        const extraProjects =
            Math.max(
                0,
                integer(
                    0,
                    3
                )
            );

        for (
            let i = 0;
            i < extraProjects;
            i++
        ) {
            projects.push(
                generateProject(
                    world,
                    pick(npcs),
                    specialties
                )
            );
        }

        const incidents = [];

        const incidentCount =
            integer(
                CONFIG.generation.incident_min,
                CONFIG.generation.incident_max
            );

        for (
            let i = 0;
            i < incidentCount;
            i++
        ) {
            incidents.push(
                generateIncident(
                    world,
                    npcs,
                    projects
                )
            );
        }

        const quests = [];

        const questCount =
            integer(
                CONFIG.generation.quest_min,
                CONFIG.generation.quest_max
            );

        for (
            let i = 0;
            i < questCount;
            i++
        ) {
            quests.push(
                generateQuest(
                    world,
                    npcs
                )
            );
        }

        const years =
            integer(
                5,
                14
            );

        const metrics = {
            years,

            systems:
                integer(
                    8,
                    49
                ),

            deployments:
                integer(
                    140,
                    1900
                ),

            incidents:
                integer(
                    9,
                    83
                ),

            users:
                integer(
                    12000,
                    98000000
                ),

            uptime:
                (
                    99 +
                    random() * 0.99
                ).toFixed(2),

            worldsVisited:
                integer(
                    2,
                    19
                ),

            unresolvedMysteries:
                integer(
                    1,
                    37
                ),

            coffee:
                integer(
                    731,
                    29821
                ),

            realityStability:
                integer(
                    11,
                    99
                )
        };

        const ui =
            generateUIDNA({
                world,
                title,
                personality,
                specialties,
                chaos
            });

        const timeline =
            generateTimeline(
                experiences,
                world
            );

        const createdYear =
            integer(
                2017,
                2023
            );

        const createdMonth =
            String(
                integer(1, 12)
            ).padStart(2, "0");

        const updatedYear =
            integer(
                Math.max(
                    createdYear,
                    2025
                ),
                2026
            );

        const updatedMonth =
            String(
                integer(1, 12)
            ).padStart(2, "0");

        const archive = {
            number:
                "ARC-" +
                integer(
                    1000,
                    9999
                ) +
                "-" +
                integer(
                    10,
                    99
                ),

            classification:
                pick([
                    "Professional",
                    "Operational",
                    "Restricted",
                    "Internal",
                    "Field Record",
                    "Research Record",
                ]),

            created:
                `${createdYear}-${createdMonth}`,

            updated:
                `${updatedYear}-${updatedMonth}`
        };

        const portfolio = {
            id: randomId("portfolio"),

            name,
            title,
            personality,
            education,
            location,
            faction,

            world,

            genre:
                world.genre,

            specialties,

            years,

            chaos,

            ui,

            npcs,
            projects,
            experiences,
            incidents,
            quests,
            timeline,

            metrics,

            archive,

            summary: sentence([
                `${name} is a ${title} working across ${world.name}.`,
                `Their work focuses on ${specialties.slice(0, 3).join(", ")}.`,
                `${personality === "experimental"
                    ? "Their projects frequently test unusual operational assumptions."
                    : "Their work combines practical engineering with unusually complex environments."
                }`
            ]),

            philosophy: pick([
                "Build systems that can explain themselves.",
                "Make the complicated observable before trying to make it simple.",
                "Treat infrastructure as a product, not background machinery.",
                "If a system is important, its failure path deserves as much attention as its success path.",
                "Reliable systems are usually the result of clear boundaries.",
            ])
        };

        portfolio.signature =
            hashString(
                [
                    portfolio.name,
                    portfolio.title,
                    world.name,
                    portfolio.faction,
                    ui.family,
                    ui.layout,
                    ui.nav,
                    npcs.map(n => n.id).join("|"),
                    projects.map(p => p.id).join("|"),
                    experiences.map(e => e.id).join("|")
                ].join("::")
            );

        return portfolio;
    }


    function generateUniquePortfolio() {
        for (
            let attempt = 0;
            attempt < 20;
            attempt++
        ) {
            const portfolio =
                generatePortfolio();

            if (
                !runtime.usedSignatures.has(
                    portfolio.signature
                )
            ) {
                runtime.usedSignatures.add(
                    portfolio.signature
                );

                return portfolio;
            }
        }

        const fallback =
            generatePortfolio();

        runtime.usedSignatures.add(
            fallback.signature
        );

        return fallback;
    }


    /* ========================================================
       THEME
       ======================================================== */

    function applyTheme(portfolio) {
        const root =
            document.documentElement;

        root.style.setProperty(
            "--accent",
            portfolio.ui.accent
        );

        root.style.setProperty(
            "--accent-2",
            portfolio.ui.accent2
        );

        root.style.setProperty(
            "--bg",
            portfolio.ui.background
        );

        root.style.setProperty(
            "--surface",
            portfolio.ui.surface
        );

        root.style.setProperty(
            "--radius",
            `${portfolio.ui.radius}px`
        );

        const darkFamilies = [
            "executive",
            "terminal",
            "rpg",
            "dossier",
            "research",
            "luxury",
            "space",
            "detective",
            "spellbook",
            "underground",
            "operating-system",
            "chaotic"
        ];

        const light =
            !darkFamilies.includes(
                portfolio.ui.family
            );

        root.style.setProperty(
            "--text-on-accent",
            light
                ? "#ffffff"
                : "#ffffff"
        );
    }


    /* ========================================================
       UI TEXT
       ======================================================== */

    function voice(portfolio, key, fallback) {
        return (
            CONFIG.ui_system.voices?.[
                portfolio.ui.voice
            ]?.[key] ||
            fallback
        );
    }


    /* ========================================================
       COMPONENTS
       ======================================================== */

    function tagList(
        values,
        accentFirst = false
    ) {
        return `
            <div class="tags">
                ${safeArray(values)
                    .map(
                        (value, index) => `
                            <span
                                class="tag ${
                                    accentFirst && index === 0
                                        ? "accent"
                                        : ""
                                }"
                            >
                                ${escapeHTML(value)}
                            </span>
                        `
                    )
                    .join("")
                }
            </div>
        `;
    }


    function sectionHeader(
        number,
        title,
        description
    ) {
        return `
            <header class="section-header">
                <div>
                    <div class="section-kicker">
                        ${escapeHTML(number)}
                    </div>

                    <h2>
                        ${escapeHTML(title)}
                    </h2>

                    ${
                        description
                            ? `
                                <p>
                                    ${escapeHTML(description)}
                                </p>
                            `
                            : ""
                    }
                </div>
            </header>
        `;
    }


    function textCard(
        label,
        text,
        extraClass = ""
    ) {
        return `
            <article
                class="card content-card ${extraClass}"
            >
                <div class="section-kicker">
                    ${escapeHTML(label)}
                </div>

                <p class="card-text">
                    ${escapeHTML(
                        safe(
                            text,
                            "No record available."
                        )
                    )}
                </p>
            </article>
        `;
    }


    function fact(
        label,
        value
    ) {
        return `
            <div class="fact">
                <div class="fact-label">
                    ${escapeHTML(label)}
                </div>

                <div class="fact-value">
                    ${escapeHTML(value)}
                </div>
            </div>
        `;
    }


    /* ========================================================
       HERO
       ======================================================== */

    function renderHero(portfolio) {
        const heroCopy = {
            identity: [
                "Professional Profile",
                portfolio.summary
            ],

            mission: [
                "Current Mission",
                `${portfolio.name} operates at the intersection of engineering, infrastructure, and ${portfolio.world.name}.`
            ],

            profile: [
                "Engineering Profile",
                portfolio.summary
            ],

            case: [
                "Primary Case",
                `A career record spanning ${portfolio.years} years of systems work.`
            ],

            status: [
                "Operational Status",
                `${portfolio.name} is currently listed as ${portfolio.world.name} / ${portfolio.faction}.`
            ],

            command: [
                "Command Record",
                `Primary specialty cluster: ${portfolio.specialties.slice(0, 4).join(", ")}.`
            ],

            character: [
                "Character Record",
                `${portfolio.name} — ${portfolio.title}.`
            ],

            manifesto: [
                "Engineering Philosophy",
                portfolio.philosophy
            ],

            classified: [
                "Restricted Profile",
                `Archive ${portfolio.archive.number} contains a professional record associated with ${portfolio.world.name}.`
            ],

            "field-report": [
                "Field Report",
                `Observed operating environment: ${portfolio.world.name}.`
            ]
        };

        const copy =
            heroCopy[
                portfolio.ui.hero
            ] ||
            heroCopy.identity;

        return `
            <section class="hero">

                <div class="hero-grid">

                    <div>

                        <p class="eyebrow">
                            ${escapeHTML(copy[0])}
                        </p>

                        <h1>
                            ${escapeHTML(
                                portfolio.name
                            )}
                        </h1>

                        <div class="hero-title">
                            ${escapeHTML(
                                portfolio.title
                            )}
                        </div>

                        <p class="hero-description">
                            ${escapeHTML(copy[1])}
                        </p>

                        <div class="hero-actions">

                            <a
                                class="primary"
                                href="#work"
                            >
                                ${escapeHTML(
                                    voice(
                                        portfolio,
                                        "projects",
                                        "Selected Work"
                                    )
                                )}
                            </a>

                            <a
                                href="#experiences"
                            >
                                ${escapeHTML(
                                    voice(
                                        portfolio,
                                        "experience",
                                        "Career Record"
                                    )
                                )}
                            </a>

                            <button
                                type="button"
                                data-generate
                            >
                                Generate Another
                            </button>

                        </div>

                    </div>


                    <div class="hero-meta">

                        <div class="hero-meta-card">
                            <div class="hero-meta-label">
                                World
                            </div>

                            <div class="hero-meta-value">
                                ${escapeHTML(
                                    portfolio.world.name
                                )}
                            </div>
                        </div>

                        <div class="hero-meta-card">
                            <div class="hero-meta-label">
                                Faction
                            </div>

                            <div class="hero-meta-value">
                                ${escapeHTML(
                                    portfolio.faction
                                )}
                            </div>
                        </div>

                        <div class="hero-meta-card">
                            <div class="hero-meta-label">
                                Archive
                            </div>

                            <div class="hero-meta-value">
                                ${escapeHTML(
                                    portfolio.archive.number
                                )}
                            </div>
                        </div>

                    </div>

                </div>

            </section>
        `;
    }


    /* ========================================================
       STATS
       ======================================================== */

    function renderStats(portfolio) {
        const m =
            portfolio.metrics;

        return `
            <div class="stat-grid">

                <div class="stat">
                    <div class="stat-value">
                        ${formatNumber(m.systems)}
                    </div>
                    <div class="stat-label">
                        Systems
                    </div>
                </div>

                <div class="stat">
                    <div class="stat-value">
                        ${formatNumber(m.deployments)}
                    </div>
                    <div class="stat-label">
                        Deployments
                    </div>
                </div>

                <div class="stat">
                    <div class="stat-value">
                        ${escapeHTML(m.uptime)}%
                    </div>
                    <div class="stat-label">
                        Recorded Uptime
                    </div>
                </div>

                <div class="stat">
                    <div class="stat-value">
                        ${formatNumber(m.users)}
                    </div>
                    <div class="stat-label">
                        Users / Records
                    </div>
                </div>

                <div class="stat">
                    <div class="stat-value">
                        ${formatNumber(m.worldsVisited)}
                    </div>
                    <div class="stat-label">
                        Environments
                    </div>
                </div>

            </div>
        `;
    }


    /* ========================================================
       PROFILE
       ======================================================== */

    function renderProfile(portfolio) {
        return `
            <section
                class="section"
                id="profile"
            >

                ${sectionHeader(
                    "01",
                    voice(
                        portfolio,
                        "section",
                        "Professional Profile"
                    ),
                    "A compact overview of the generated professional record."
                )}

                ${renderStats(portfolio)}

                <div class="profile-card-grid">

                    ${textCard(
                        "Operating Profile",
                        portfolio.summary
                    )}

                    ${textCard(
                        "Background",
                        `${portfolio.name} studied ${portfolio.education} and has worked across ${portfolio.world.name}, with a primary focus on ${portfolio.specialties.slice(0, 4).join(", ")}.`
                    )}

                    ${textCard(
                        "Engineering Philosophy",
                        portfolio.philosophy
                    )}

                </div>

                <div class="profile-facts">

                    ${fact(
                        "Primary Specialty",
                        portfolio.specialties[0]
                    )}

                    ${fact(
                        "Secondary Specialty",
                        portfolio.specialties[1] ||
                            portfolio.specialties[0]
                    )}

                    ${fact(
                        "Current World",
                        portfolio.world.name
                    )}

                    ${fact(
                        "Classification",
                        portfolio.world.classification
                    )}

                    ${fact(
                        "Education",
                        portfolio.education
                    )}

                    ${fact(
                        "Location",
                        portfolio.location
                    )}

                </div>

                <article
                    class="card content-card"
                    style="margin-top:14px"
                >

                    <div class="section-kicker">
                        Technology & Specialization
                    </div>

                    ${tagList(
                        [
                            ...portfolio.specialties,
                            ...sample(
                                configPool("technologies"),
                                5,
                                8
                            )
                        ],
                        true
                    )}

                </article>

            </section>
        `;
    }


    /* ========================================================
       EXPERIENCES
       ======================================================== */

    function renderExperience(
        experience,
        index
    ) {
        return `
            <article
                class="card experience-card dossier-entry"
            >

                <header class="entry-header">

                    <div>

                        <div class="entry-index">
                            RECORD ${String(
                                index + 1
                            ).padStart(2, "0")}
                        </div>

                        <h3 class="entry-title">
                            ${escapeHTML(
                                experience.role
                            )}
                        </h3>

                        <div class="entry-subtitle">
                            ${escapeHTML(
                                experience.organization
                            )}
                            ·
                            ${escapeHTML(
                                experience.world
                            )}
                        </div>

                    </div>

                    <div class="entry-status">
                        ${escapeHTML(
                            experience.status
                        )}
                    </div>

                </header>


                <div class="experience-card-grid">

                    ${textCard(
                        "Assignment",
                        experience.assignment
                    )}

                    ${textCard(
                        "Context",
                        experience.context
                    )}

                    ${textCard(
                        "Incident",
                        experience.incident
                    )}

                    ${textCard(
                        "Response",
                        experience.response
                    )}

                    ${textCard(
                        "Lesson",
                        experience.lesson
                    )}

                </div>


                <div class="experience-lower-grid">

                    <article class="card content-card">

                        <div class="section-kicker">
                            Primary Contact
                        </div>

                        <strong>
                            ${escapeHTML(
                                experience.npcName
                            )}
                        </strong>

                        <p class="card-text">
                            ${escapeHTML(
                                experience.npcRole
                            )}
                        </p>

                    </article>


                    <article class="card content-card">

                        <div class="section-kicker">
                            Technologies
                        </div>

                        ${tagList(
                            experience.technologies,
                            true
                        )}

                    </article>

                </div>


                <article
                    class="card content-card"
                    style="margin-top:12px"
                >

                    <div class="section-kicker">
                        Recorded Achievements
                    </div>

                    <div class="tags">

                        ${experience.achievements
                            .map(
                                achievement => `
                                    <span class="tag">
                                        ${escapeHTML(
                                            achievement
                                        )}
                                    </span>
                                `
                            )
                            .join("")
                        }

                    </div>

                </article>

            </article>
        `;
    }


    function renderExperiences(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="experiences"
            >

                ${sectionHeader(
                    "02",
                    voice(
                        portfolio,
                        "experience",
                        "Career Record"
                    ),
                    `Professional assignments across ${portfolio.world.name} and related operating environments.`
                )}

                <div class="experience-stack">

                    ${portfolio.experiences
                        .map(
                            (item, index) =>
                                renderExperience(
                                    item,
                                    index
                                )
                        )
                        .join("")
                    }

                </div>

            </section>
        `;
    }


    /* ========================================================
       PROJECTS
       ======================================================== */

    function renderProject(
        project,
        index
    ) {
        return `
            <article
                class="card project-card"
            >

                <div class="project-head">

                    <div>

                        <div class="project-number">
                            PROJECT ${String(
                                index + 1
                            ).padStart(2, "0")}
                        </div>

                        <h3 class="project-name">
                            ${escapeHTML(
                                project.name
                            )}
                        </h3>

                        <div class="project-type">
                            ${escapeHTML(
                                project.type
                            )}
                            ·
                            ${escapeHTML(
                                project.industry
                            )}
                        </div>

                    </div>

                    <div class="project-status">
                        ${escapeHTML(
                            project.status
                        )}
                    </div>

                </div>


                <div class="project-metrics">

                    ${projectMetric(
                        "Complexity",
                        project.complexity
                    )}

                    ${projectMetric(
                        "Scale",
                        project.users
                    )}

                    ${projectMetric(
                        "Duration",
                        project.duration
                    )}

                    ${projectMetric(
                        "World",
                        project.world
                    )}

                </div>


                <div class="project-card-grid">

                    ${renderProjectNote(
                        "Summary",
                        project.summary
                    )}

                    ${renderProjectNote(
                        "Problem",
                        project.problem
                    )}

                    ${renderProjectNote(
                        "Architecture",
                        project.architecture
                    )}

                    ${renderProjectNote(
                        "Client",
                        project.client
                    )}

                    ${renderProjectNote(
                        "Failure",
                        project.failure
                    )}

                    ${renderProjectNote(
                        "Solution",
                        project.solution
                    )}

                    ${renderProjectNote(
                        "Outcome",
                        project.outcome
                    )}

                    ${renderProjectNote(
                        "Narrative",
                        project.narrative
                    )}

                </div>


                <article
                    class="project-note"
                    style="margin-top:14px"
                >

                    <div class="section-kicker">
                        Technical Stack
                    </div>

                    ${tagList(
                        project.technologies,
                        true
                    )}

                </article>


                <article
                    class="project-note"
                    style="margin-top:10px"
                >

                    <div class="section-kicker">
                        Specialization
                    </div>

                    ${tagList(
                        project.skills
                    )}

                </article>


                <article
                    class="project-note"
                    style="margin-top:10px"
                >

                    <div class="section-kicker">
                        Technical Notes
                    </div>

                    <p>
                        ${escapeHTML(
                            project.technicalNotes.join(" ")
                        )}
                    </p>

                </article>

            </article>
        `;
    }


    function renderProjectNote(
        label,
        value
    ) {
        return `
            <article class="project-note">

                <div class="section-kicker">
                    ${escapeHTML(label)}
                </div>

                <p>
                    ${escapeHTML(
                        safe(
                            value,
                            "No record available."
                        )
                    )}
                </p>

            </article>
        `;
    }


    function projectMetric(
        label,
        value
    ) {
        return `
            <div class="project-metric">

                <div class="project-metric-label">
                    ${escapeHTML(label)}
                </div>

                <div class="project-metric-value">
                    ${escapeHTML(value)}
                </div>

            </div>
        `;
    }


    function renderProjects(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="work"
            >

                ${sectionHeader(
                    "03",
                    voice(
                        portfolio,
                        "projects",
                        "Selected Work"
                    ),
                    `Projects associated with organizations and people across ${portfolio.world.name}.`
                )}

                <div class="project-grid">

                    ${portfolio.projects
                        .map(
                            (project, index) =>
                                renderProject(
                                    project,
                                    index
                                )
                        )
                        .join("")
                    }

                </div>

            </section>
        `;
    }


    /* ========================================================
       WORLD
       ======================================================== */

    function renderWorld(
        portfolio
    ) {
        const world =
            portfolio.world;

        return `
            <section
                class="section"
                id="world"
            >

                ${sectionHeader(
                    "04",
                    voice(
                        portfolio,
                        "world",
                        "Operating Environment"
                    ),
                    "The setting in which the professional record exists."
                )}

                <div class="world-panel">

                    <article class="card world-main">

                        <div class="section-kicker">
                            ${escapeHTML(
                                world.genre
                            )}
                        </div>

                        <h2 class="world-title">
                            ${escapeHTML(
                                world.name
                            )}
                        </h2>

                        <p class="world-description">
                            ${escapeHTML(
                                world.description
                            )}
                        </p>

                        <div class="profile-facts">

                            ${fact(
                                "Classification",
                                world.classification
                            )}

                            ${fact(
                                "Population",
                                world.population
                            )}

                            ${fact(
                                "Stability",
                                `${world.stability}%`
                            )}

                            ${fact(
                                "Sky",
                                world.sky
                            )}

                            ${fact(
                                "Technology",
                                world.technology
                            )}

                            ${fact(
                                "Primary Rule",
                                world.rule
                            )}

                        </div>

                    </article>


                    <div class="world-side">

                        ${textCard(
                            "Primary Conflict",
                            world.conflict
                        )}

                        ${textCard(
                            "Operational Danger",
                            world.danger
                        )}

                    </div>

                </div>


                <div class="world-rules">

                    ${world.rules
                        .map(
                            (rule, index) => `
                                <article class="world-rule-card">

                                    <strong>
                                        Rule ${index + 1}
                                    </strong>

                                    <p>
                                        ${escapeHTML(rule)}
                                    </p>

                                </article>
                            `
                        )
                        .join("")
                    }

                </div>


                <div class="world-factions">

                    ${world.factions
                        .map(
                            faction => `
                                <article class="world-faction-card">

                                    <strong>
                                        ${escapeHTML(
                                            faction
                                        )}
                                    </strong>

                                    <p>
                                        Active faction associated with
                                        ${escapeHTML(
                                            world.name
                                        )}.
                                    </p>

                                </article>
                            `
                        )
                        .join("")
                    }

                </div>

            </section>
        `;
    }


    /* ========================================================
       NPCS
       ======================================================== */

    function renderNPC(
        npc,
        index
    ) {
        const projectNames =
            npc.projectIds
                .map(
                    id =>
                        runtime.projectIndex.get(id)
                )
                .filter(Boolean)
                .map(
                    project =>
                        project.name
                );

        const experienceRoles =
            npc.experienceIds
                .map(
                    id =>
                        runtime.experienceIndex.get(id)
                )
                .filter(Boolean)
                .map(
                    experience =>
                        experience.role
                );

        return `
            <article
                class="card npc-card dossier-entry"
            >

                <div class="npc-head">

                    <div class="npc-avatar">
                        ${escapeHTML(
                            initials(npc.name)
                        )}
                    </div>

                    <div>

                        <h3 class="npc-name">
                            ${escapeHTML(
                                npc.name
                            )}
                        </h3>

                        <div class="npc-role">
                            ${escapeHTML(
                                npc.role
                            )}
                        </div>

                    </div>

                    <div class="npc-type">
                        ${escapeHTML(
                            npc.type
                        )}
                    </div>

                </div>


                <div class="npc-facts">

                    ${npcFact(
                        "Relationship",
                        npc.relationship
                    )}

                    ${npcFact(
                        "Faction",
                        npc.faction
                    )}

                    ${npcFact(
                        "Location",
                        npc.location
                    )}

                    ${npcFact(
                        "Reputation",
                        `${npc.reputation}%`
                    )}

                    ${npcFact(
                        "Danger",
                        `${npc.danger}%`
                    )}

                    ${npcFact(
                        "Encounters",
                        npc.encounters
                    )}

                </div>


                <div class="npc-story">

                    <p>
                        ${escapeHTML(
                            npc.biography
                        )}
                    </p>

                </div>


                <div class="npc-connection">

                    <div class="npc-connection-label">
                        Associated Projects
                    </div>

                    ${tagList(
                        projectNames
                    )}

                </div>


                <div class="npc-connection">

                    <div class="npc-connection-label">
                        Career Assignments
                    </div>

                    ${tagList(
                        experienceRoles
                    )}

                </div>


                <div class="npc-connection">

                    <div class="npc-connection-label">
                        Recorded Statement
                    </div>

                    <p class="card-text">
                        ${escapeHTML(
                            npc.dialogue
                        )}
                    </p>

                </div>


                <div class="npc-connection">

                    <div class="npc-connection-label">
                        Known Secret
                    </div>

                    <p class="card-text">
                        ${escapeHTML(
                            npc.secret
                        )}
                    </p>

                </div>


                <div class="npc-connection">

                    <div class="npc-connection-label">
                        Rumors
                    </div>

                    ${tagList(
                        npc.rumors
                    )}

                </div>

            </article>
        `;
    }


    function npcFact(
        label,
        value
    ) {
        return `
            <div class="npc-fact">

                <div class="npc-fact-label">
                    ${escapeHTML(label)}
                </div>

                <div class="npc-fact-value">
                    ${escapeHTML(value)}
                </div>

            </div>
        `;
    }


    function renderNPCs(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="characters"
            >

                ${sectionHeader(
                    "05",
                    voice(
                        portfolio,
                        "characters",
                        "Key Stakeholders"
                    ),
                    "People connected to projects, assignments, systems, and operational history."
                )}

                <div class="npc-grid">

                    ${portfolio.npcs
                        .map(
                            (npc, index) =>
                                renderNPC(
                                    npc,
                                    index
                                )
                        )
                        .join("")
                    }

                </div>

            </section>
        `;
    }


    /* ========================================================
       INCIDENTS
       ======================================================== */

    function renderIncident(
        incident,
        index
    ) {
        return `
            <article
                class="card incident-card"
            >

                <div class="incident-head">

                    <div>

                        <div class="incident-code">
                            ${escapeHTML(
                                incident.code
                            )}
                        </div>

                        <h3 class="incident-title">
                            ${escapeHTML(
                                incident.type
                            )}
                        </h3>

                    </div>

                    <div class="risk">
                        ${escapeHTML(
                            incident.risk
                        )}
                    </div>

                </div>


                <div class="project-metrics">

                    ${projectMetric(
                        "Date",
                        incident.date
                    )}

                    ${projectMetric(
                        "Status",
                        incident.status
                    )}

                    ${projectMetric(
                        "World",
                        incident.world
                    )}

                    ${projectMetric(
                        "Witness",
                        incident.witnessName
                    )}

                </div>


                <div class="incident-grid-inner">

                    ${incidentNote(
                        "Summary",
                        incident.summary
                    )}

                    ${incidentNote(
                        "Observation",
                        incident.observation
                    )}

                    ${incidentNote(
                        "Consequence",
                        incident.consequence
                    )}

                    ${incidentNote(
                        "Response",
                        incident.response
                    )}

                    ${incidentNote(
                        "Recommendation",
                        incident.recommendation
                    )}

                    ${incidentNote(
                        "Related Project",
                        incident.projectName
                    )}

                </div>

            </article>
        `;
    }


    function incidentNote(
        label,
        value
    ) {
        return `
            <article class="incident-note">

                <strong>
                    ${escapeHTML(label)}
                </strong>

                <p>
                    ${escapeHTML(value)}
                </p>

            </article>
        `;
    }


    function renderIncidents(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="incidents"
            >

                ${sectionHeader(
                    "06",
                    voice(
                        portfolio,
                        "incidents",
                        "Operational Record"
                    ),
                    "Selected incidents from the generated career history."
                )}

                <div class="incident-grid">

                    ${portfolio.incidents
                        .map(
                            (incident, index) =>
                                renderIncident(
                                    incident,
                                    index
                                )
                        )
                        .join("")
                    }

                </div>

            </section>
        `;
    }


    /* ========================================================
       QUESTS
       ======================================================== */

    function renderQuest(
        quest
    ) {
        return `
            <article
                class="card quest-card"
            >

                <div class="quest-status">
                    ${escapeHTML(
                        quest.status
                    )}
                </div>

                <h3 class="quest-title">
                    ${escapeHTML(
                        quest.objective
                    )}
                </h3>

                <p class="quest-description">
                    ${escapeHTML(
                        quest.description
                    )}
                </p>

                <div class="quest-meta">

                    ${fact(
                        "World",
                        quest.world
                    )}

                    ${fact(
                        "Risk",
                        quest.risk
                    )}

                    ${fact(
                        "Assigned By",
                        quest.assignedBy
                    )}

                    ${fact(
                        "Reward",
                        quest.reward
                    )}

                </div>

            </article>
        `;
    }


    function renderQuests(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="quests"
            >

                ${sectionHeader(
                    "07",
                    voice(
                        portfolio,
                        "quests",
                        "Current Assignments"
                    ),
                    "Open professional objectives generated for this portfolio."
                )}

                <div class="quest-grid">

                    ${portfolio.quests
                        .map(
                            quest =>
                                renderQuest(
                                    quest
                                )
                        )
                        .join("")
                    }

                </div>

            </section>
        `;
    }


    /* ========================================================
       TIMELINE
       ======================================================== */

    function renderTimeline(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="archive"
            >

                ${sectionHeader(
                    "08",
                    "Career Timeline",
                    "A compact chronology of the generated professional record."
                )}

                <div class="timeline">

                    ${portfolio.timeline
                        .map(
                            item => `
                                <article class="timeline-item">

                                    <div class="timeline-dot"></div>

                                    <div class="card timeline-card">

                                        <div class="timeline-year">
                                            ${escapeHTML(
                                                item.year
                                            )}
                                        </div>

                                        <div class="timeline-title">
                                            ${escapeHTML(
                                                item.title
                                            )}
                                        </div>

                                        <div class="timeline-text">
                                            ${escapeHTML(
                                                item.text
                                            )}
                                        </div>

                                    </div>

                                </article>
                            `
                        )
                        .join("")
                    }

                </div>

            </section>
        `;
    }


    /* ========================================================
       ARCHIVE NOTICE
       ======================================================== */

    function renderArchiveNotice(
        portfolio
    ) {
        return `
            <section
                class="section"
            >

                <div class="archive-notice">

                    <div>

                        <div class="section-kicker">
                            Archive Notice
                        </div>

                        <h3>
                            This professional record was generated at runtime.
                        </h3>

                        <p>
                            The portfolio, career history, projects,
                            technologies, people, incidents and world
                            were created in browser memory.
                            Nothing is saved between refreshes.
                        </p>

                    </div>


                    <div class="archive-meta">

                        ${fact(
                            "Archive",
                            portfolio.archive.number
                        )}

                        ${fact(
                            "Classification",
                            portfolio.archive.classification
                        )}

                        ${fact(
                            "Created",
                            portfolio.archive.created
                        )}

                        ${fact(
                            "Updated",
                            portfolio.archive.updated
                        )}

                    </div>

                </div>

            </section>
        `;
    }


    /* ========================================================
       NAVIGATION
       ======================================================== */

    function renderNavigation(
        portfolio
    ) {
        const links = [
            ["#profile", "Profile"],
            ["#experiences", "Experience"],
            ["#work", "Work"],
            ["#world", "World"],
            ["#characters", "People"],
            ["#incidents", "Incidents"],
            ["#quests", "Tasks"],
            ["#archive", "Archive"],
        ];

        return `
            <header class="topbar">

                <div class="topbar-inner">

                    <a
                        class="brand"
                        href="#main-content"
                    >

                        <span class="brand-mark">
                            ${escapeHTML(
                                initials(
                                    portfolio.name
                                )
                            )}
                        </span>

                        <span class="brand-copy">

                            <span class="brand-name">
                                ${escapeHTML(
                                    portfolio.name
                                )}
                            </span>

                            <span class="brand-subtitle">
                                ${escapeHTML(
                                    portfolio.title
                                )}
                            </span>

                        </span>

                    </a>


                    <nav
                        class="topnav"
                        aria-label="Primary"
                    >

                        ${links
                            .map(
                                ([href, label]) => `
                                    <a
                                        href="${href}"
                                    >
                                        ${escapeHTML(
                                            label
                                        )}
                                    </a>
                                `
                            )
                            .join("")
                        }

                    </nav>


                    <button
                        type="button"
                        class="generate-button"
                        data-generate
                    >
                        Generate
                    </button>

                </div>

            </header>
        `;
    }


    /* ========================================================
       FOOTER
       ======================================================== */

    function renderFooter(
        portfolio
    ) {
        return `
            <footer class="footer">

                <div class="footer-grid">

                    <div>

                        <div class="footer-title">
                            ${escapeHTML(
                                portfolio.name
                            )}
                        </div>

                        <div>
                            ${escapeHTML(
                                portfolio.title
                            )}
                            ·
                            ${escapeHTML(
                                portfolio.world.name
                            )}
                        </div>

                        <div style="margin-top:8px">
                            Browser-memory generated professional record.
                        </div>

                    </div>


                    <div class="footer-meta">

                        <div>
                            GENERATION
                            ${runtime.generation}
                        </div>

                        <div>
                            ${escapeHTML(
                                portfolio.signature
                            )}
                        </div>

                        <div>
                            SEED
                            ${escapeHTML(
                                runtime.seed || "runtime"
                            )}
                        </div>

                        <div>
                            BUILD
                            ${escapeHTML(
                                CONFIG.version
                            )}
                        </div>

                    </div>

                </div>

            </footer>
        `;
    }


    /* ========================================================
       COMPLETE RENDER
       ======================================================== */

    function render(
        portfolio
    ) {
        runtime.current =
            portfolio;

        runtime.generation++;

        runtime.history.push(
            portfolio.signature
        );

        if (
            runtime.history.length > 20
        ) {
            runtime.history.shift();
        }

        applyTheme(
            portfolio
        );

        const app =
            document.getElementById(
                "app"
            );

        if (!app) {
            throw new Error(
                "Application mount point #app is missing."
            );
        }

        app.className = [
            "app",
            `ui-${portfolio.ui.family}`,
            `layout-${portfolio.ui.layout}`,
            `density-${portfolio.ui.density}`
        ].join(" ");

        app.dataset.decoration =
            portfolio.ui.decoration;

        app.dataset.nav =
            portfolio.ui.nav;

        app.dataset.generation =
            String(runtime.generation);

        app.innerHTML = `

            ${renderNavigation(
                portfolio
            )}

            <main
                id="main-content"
                class="main-content"
            >

                ${renderHero(
                    portfolio
                )}

                ${renderProfile(
                    portfolio
                )}

                ${renderExperiences(
                    portfolio
                )}

                ${renderProjects(
                    portfolio
                )}

                ${renderWorld(
                    portfolio
                )}

                ${renderNPCs(
                    portfolio
                )}

                ${renderIncidents(
                    portfolio
                )}

                ${renderQuests(
                    portfolio
                )}

                ${renderTimeline(
                    portfolio
                )}

                ${renderArchiveNotice(
                    portfolio
                )}

            </main>

            ${renderFooter(
                portfolio
            )}
        `;

        document.title =
            `${portfolio.name} — ${portfolio.title}`;

        wireInteractions();

        announce(
            `Generated portfolio ${runtime.generation}: ${portfolio.name}`
        );

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });
    }


    /* ========================================================
       INTERACTIONS
       ======================================================== */

    function wireInteractions() {
        $$(
            "[data-generate]"
        ).forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        generateAndRender();
                    }
                );
            }
        );


        $$(
            'a[href^="#"]'
        ).forEach(
            link => {
                link.addEventListener(
                    "click",
                    event => {
                        const href =
                            link.getAttribute(
                                "href"
                            );

                        if (
                            !href ||
                            href === "#"
                        ) {
                            return;
                        }

                        const target =
                            document.querySelector(
                                href
                            );

                        if (!target) {
                            return;
                        }

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior:
                                window.matchMedia(
                                    "(prefers-reduced-motion: reduce)"
                                ).matches
                                    ? "auto"
                                    : "smooth",
                            block: "start"
                        });
                    }
                );
            }
        );
    }


    /* ========================================================
       ACCESSIBILITY ANNOUNCER
       ======================================================== */

    function announce(message) {
        let region =
            document.getElementById(
                "runtime-announcer"
            );

        if (!region) {
            region =
                document.createElement(
                    "div"
                );

            region.id =
                "runtime-announcer";

            region.setAttribute(
                "aria-live",
                "polite"
            );

            region.setAttribute(
                "aria-atomic",
                "true"
            );

            Object.assign(
                region.style,
                {
                    position: "fixed",
                    width: "1px",
                    height: "1px",
                    padding: "0",
                    margin: "-1px",
                    overflow: "hidden",
                    clip: "rect(0,0,0,0)",
                    whiteSpace: "nowrap",
                    border: "0"
                }
            );

            document.body.appendChild(
                region
            );
        }

        region.textContent =
            message;
    }


    /* ========================================================
       ERROR SCREEN
       ======================================================== */

    function showRuntimeError(
        error
    ) {
        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.error(
            "Portfolio generation failed:",
            error
        );

        document.body.innerHTML = `
            <main class="runtime-error">

                <section class="runtime-error-card">

                    <p class="eyebrow">
                        Runtime Error
                    </p>

                    <h1>
                        Portfolio generation failed.
                    </h1>

                    <p>
                        The browser encountered an error while
                        generating the fictional portfolio.
                    </p>

                    <pre>${escapeHTML(
                        message
                    )}</pre>

                    <button
                        class="generate-button"
                        type="button"
                        onclick="location.reload()"
                    >
                        Reload Portfolio
                    </button>

                </section>

            </main>
        `;
    }


    /* ========================================================
       GENERATE
       ======================================================== */

    function generateAndRender() {
        try {
            setGenerationSeed(createRandomSeed());

            const portfolio =
                generateUniquePortfolio();

            render(
                portfolio
            );
        } catch (error) {
            showRuntimeError(
                error
            );
        }
    }


    /* ========================================================
       KEYBOARD
       ======================================================== */

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key.toLowerCase() !== "g"
            ) {
                return;
            }

            const target =
                event.target;

            if (
                target &&
                (
                    target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.tagName === "SELECT" ||
                    target.isContentEditable
                )
            ) {
                return;
            }

            generateAndRender();
        }
    );


    /* ========================================================
       GLOBAL ERROR HANDLERS
       ======================================================== */

    window.addEventListener(
        "error",
        event => {
            console.error(
                "Global error:",
                event.error ||
                event.message
            );
        }
    );


    window.addEventListener(
        "unhandledrejection",
        event => {
            console.error(
                "Unhandled promise rejection:",
                event.reason
            );
        }
    );


    /* ========================================================
       BOOT
       ======================================================== */

    function boot() {
        try {
            const requestedSeed =
                new URLSearchParams(window.location.search).get("seed");

            setGenerationSeed(
                requestedSeed || createRandomSeed()
            );

            window.__ABSURD_RUNTIME__ = {
                getSeed: () => runtime.seed,
                getShareUrl: () => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("seed", runtime.seed);
                    return url.toString();
                }
            };

            const portfolio =
                generateUniquePortfolio();

            render(
                portfolio
            );
        } catch (error) {
            showRuntimeError(
                error
            );
        }
    }


    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once: true
            }
        );
    } else {
        boot();
    }

})();
