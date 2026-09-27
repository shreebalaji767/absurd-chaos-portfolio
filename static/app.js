(() => {
    "use strict";

    /*
     * ==========================================================
     * ABSURD CHAOS PORTFOLIO
     *
     * IMPORTANT:
     *
     * This file intentionally does NOT use:
     *
     * localStorage
     * sessionStorage
     * IndexedDB
     * cookies
     * fetch()
     * XMLHttpRequest
     * databases
     * external APIs
     *
     * Everything exists only in JavaScript memory.
     *
     * A browser refresh creates a completely new portfolio.
     * ==========================================================
     */


    /* ==========================================================
       CONFIGURATION
       ========================================================== */

    const CONFIG = window.__ABSURD_CONFIG__;

    if (!CONFIG || typeof CONFIG !== "object") {
        document.body.innerHTML = `
            <main class="noscript">
                <div class="noscript-card">
                    <span class="eyebrow">CONFIGURATION ERROR</span>
                    <h1>Configuration Missing</h1>
                    <p>
                        The generated portfolio configuration was not found.
                    </p>
                </div>
            </main>
        `;
        return;
    }


    /* ==========================================================
       RUNTIME MEMORY
       ========================================================== */

    const runtime = {
        current: null,
        generationCount: 0,
        history: [],
        usedSignatures: new Set(),
        npcIndex: new Map(),
        worldIndex: new Map()
    };


    /* ==========================================================
       DOM HELPERS
       ========================================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));


    /* ==========================================================
       RANDOMNESS
       ========================================================== */

    function random() {
        try {
            if (
                window.crypto &&
                typeof window.crypto.getRandomValues === "function"
            ) {
                const buffer = new Uint32Array(1);
                window.crypto.getRandomValues(buffer);
                return buffer[0] / 4294967296;
            }
        } catch (_) {
            // Fall through to Math.random.
        }

        return Math.random();
    }


    function integer(min, max) {
        const low = Math.ceil(min);
        const high = Math.floor(max);

        if (high <= low) {
            return low;
        }

        return Math.floor(
            random() * (high - low + 1)
        ) + low;
    }


    function pick(array, fallback = "") {
        if (!Array.isArray(array) || array.length === 0) {
            return fallback;
        }

        return array[
            integer(0, array.length - 1)
        ];
    }


    function sample(array, minimum = 1, maximum = minimum) {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }

        const source = [...array];

        const min = Math.max(
            0,
            Math.min(minimum, source.length)
        );

        const max = Math.max(
            min,
            Math.min(maximum, source.length)
        );

        const count = integer(min, max);

        for (let i = source.length - 1; i > 0; i--) {
            const j = integer(0, i);

            [
                source[i],
                source[j]
            ] = [
                source[j],
                source[i]
            ];
        }

        return source.slice(0, count);
    }


    function uniqueStrings(array) {
        if (!Array.isArray(array)) {
            return [];
        }

        return [
            ...new Set(
                array
                    .map(value => String(value))
                    .filter(Boolean)
            )
        ];
    }


    /* ==========================================================
       CONFIG POOLS
       ========================================================== */

    const POOLS = CONFIG.pools || {};
    const UI = CONFIG.ui_system || {};
    const LIMITS = CONFIG.limits || {};


    function pool(name) {
        const value = POOLS[name];

        return Array.isArray(value)
            ? value
            : [];
    }


    function uiPool(name) {
        const value = UI[name];

        return Array.isArray(value)
            ? value
            : [];
    }


    /* ==========================================================
       TEXT HELPERS
       ========================================================== */

    function safe(value, fallback = "") {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return fallback;
        }

        return String(value);
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
        const text = safe(value, "").trim();

        if (!text) {
            return "a";
        }

        const lower = text.toLowerCase();

        if (
            /^(honest|hour|honor|heir|heirloom|owl|engineer|architect|archive|artifact|oracle|operator|observer|incident|infrastructure|impossible|interdimensional|underground|unregistered|orbital|automated|ancient|emergency|experimental|event|exception|error)/.test(lower)
        ) {
            return "an";
        }

        if (/^[aeiou]/.test(lower)) {
            return "an";
        }

        if (/^(one|once|university|user|unit|unique|use|useful|euro)/.test(lower)) {
            return "a";
        }

        return "a";
    }


    function capitalize(value) {
        const text = safe(value);

        if (!text) {
            return "";
        }

        return text.charAt(0).toUpperCase() + text.slice(1);
    }


    function initials(name) {
        const parts = safe(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (!parts.length) {
            return "??";
        }

        return parts
            .slice(0, 2)
            .map(part => part.charAt(0))
            .join("")
            .toUpperCase();
    }


    function slug(value) {
        return safe(value)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 80);
    }


    function hashString(value) {
        let hash = 2166136261;

        const text = safe(value);

        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash +=
                (hash << 1) +
                (hash << 4) +
                (hash << 7) +
                (hash << 8) +
                (hash << 24);

            hash >>>= 0;
        }

        return hash.toString(16).padStart(8, "0");
    }


    function randomId(prefix = "id") {
        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            integer(100000, 999999).toString(36)
        );
    }


    function randomCode(prefix = "ARC") {
        return (
            prefix +
            "-" +
            integer(100, 999) +
            "-" +
            integer(1000, 9999)
        );
    }


    function randomDateLabel(yearOffset = 0) {
        const year =
            new Date().getFullYear() - yearOffset;

        const month = integer(1, 12)
            .toString()
            .padStart(2, "0");

        const day = integer(1, 28)
            .toString()
            .padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function formatNumber(value) {
        return Number(value).toLocaleString(
            "en-US"
        );
    }


    function formatPercent(value) {
        return `${Number(value).toFixed(2)}%`;
    }


    /* ==========================================================
       WORLD GENERATION
       ========================================================== */

    function generateWorld() {
        const seeds = pool("worlds");

        const seed = pick(
            seeds,
            {
                name: "Unknown World",
                genre: "unknown",
                classification: "unclassified",
                description: "A place nobody has properly documented.",
                sky: "unknown",
                technology: "unknown",
                social_rule: "Do not assume anything.",
                danger: "Unknown.",
                conflict: "Unknown.",
                population: "unknown",
                age: "unknown",
                stability: "unknown",
                rules: [],
                factions: []
            }
        );

        const world = {
            id: randomId("world"),

            name: safe(seed.name, "Unknown World"),

            genre: safe(
                seed.genre,
                "unknown genre"
            ),

            classification: safe(
                seed.classification,
                "unclassified"
            ),

            description: safe(
                seed.description,
                "A world waiting to be documented."
            ),

            sky: safe(seed.sky, "unknown"),

            technology: safe(
                seed.technology,
                "unknown"
            ),

            socialRule: safe(
                seed.social_rule,
                "No documented rule."
            ),

            danger: safe(
                seed.danger,
                "Unknown danger."
            ),

            conflict: safe(
                seed.conflict,
                "No documented conflict."
            ),

            population: safe(
                seed.population,
                "unknown"
            ),

            age: safe(
                seed.age,
                "unknown"
            ),

            stability: safe(
                seed.stability,
                "unknown"
            ),

            rules: uniqueStrings(
                sample(
                    Array.isArray(seed.rules)
                        ? seed.rules
                        : [],
                    3,
                    5
                )
            ),

            factions: uniqueStrings(
                sample(
                    Array.isArray(seed.factions)
                        ? seed.factions
                        : pool("factions"),
                    3,
                    5
                )
            )
        };

        runtime.worldIndex.set(
            world.id,
            world
        );

        return world;
    }


    /* ==========================================================
       NPC GENERATION
       ========================================================== */

    function generateNPC(
        world,
        faction,
        usedNames
    ) {
        const seeds = pool("npc_seeds");

        let seed = pick(
            seeds,
            {
                first: "Unknown",
                last: "Person",
                role: "mysterious consultant",
                trait: "unclassified",
                secret: "Nobody knows."
            }
        );

        let name =
            `${safe(seed.first, "Unknown")} ${safe(seed.last, "Person")}`;

        let attempts = 0;

        while (
            usedNames.has(name) &&
            attempts < 50
        ) {
            seed = pick(seeds);

            name =
                `${safe(seed.first, "Unknown")} ${safe(seed.last, "Person")}`;

            attempts++;
        }

        if (usedNames.has(name)) {
            name =
                `${name} ${integer(2, 99)}`;
        }

        usedNames.add(name);

        const first = safe(seed.first);
        const last = safe(seed.last);

        const relationship = pick([
            "client",
            "mentor",
            "employer",
            "guild contact",
            "rival",
            "project owner",
            "technical witness",
            "unexpected ally",
            "government contact",
            "mysterious stakeholder"
        ]);

        const reputation = integer(12, 99);
        const danger = integer(3, 97);

        const npc = {
            id: randomId("npc"),

            name,

            first,

            last,

            role: safe(
                seed.role,
                "mysterious consultant"
            ),

            type: pick([
                "civilian",
                "administrator",
                "engineer",
                "guild member",
                "royal official",
                "artifact user",
                "researcher",
                "operator",
                "unknown entity"
            ]),

            trait: safe(
                seed.trait,
                "difficult to classify"
            ),

            secret: safe(
                seed.secret,
                "The archive has no record."
            ),

            relationship,

            faction: safe(
                faction,
                pick(pool("factions"))
            ),

            world: world.name,

            location: pick([
                world.name,
                "Central Operations",
                "Archive District",
                "North Terminal",
                "Underground Level 7",
                "Royal Systems Office",
                "Maintenance Sector",
                "Unknown Location"
            ]),

            reputation,

            danger,

            encounters: integer(1, 38),

            status: pick([
                "active",
                "verified",
                "missing",
                "watchlisted",
                "unavailable",
                "retired",
                "classified"
            ]),

            dialogue: pick([
                "If this works, nobody will know how.",
                "I already approved the impossible part.",
                "Please do not restart the moon.",
                "The documentation is technically alive.",
                "That was not supposed to happen.",
                "I know a person who knows a dragon.",
                "The old system is still listening.",
                "You should probably not click that.",
                "Everything is under control. Probably.",
                "I filed the incident before the incident happened."
            ]),

            biography: "",

            rumors: [],

            projectIds: [],

            experienceIds: []
        };

        npc.biography =
            `${npc.name} is ${articleFor(npc.role)} ${npc.role} operating inside ${world.name}. ` +
            `Known for being ${npc.trait}, ${npc.name} became connected to the portfolio through ${npc.relationship}. ` +
            `Their current reputation score is ${npc.reputation}/100, although the archive explicitly warns that this number is unreliable.`;

        npc.rumors = sample([
            `${npc.name} has access to a system nobody admits exists.`,
            `${npc.name} once solved an incident before it was reported.`,
            `${npc.name} keeps a private copy of obsolete infrastructure.`,
            `${npc.name} knows where the missing deployment went.`,
            `${npc.name} may have administrator access.`,
            `${npc.name} has been seen speaking to an empty terminal.`,
            `${npc.name} refuses to explain one particular Tuesday.`,
            `${npc.name} appears in records from three different years.`
        ], 2, 2);

        runtime.npcIndex.set(
            npc.id,
            npc
        );

        return npc;
    }


    /* ==========================================================
       EXPERIENCE GENERATION
       ========================================================== */

    function generateExperience(
        world,
        faction,
        specialties,
        npc,
        index
    ) {
        const role = pick(pool("titles"));

        const technologies = sample(
            specialties,
            4,
            Math.min(
                7,
                Math.max(4, specialties.length)
            )
        );

        const opening = pick(pool("openings"));
        const incident = pick(pool("incidents"));
        const lesson = pick(pool("lessons"));

        const organization = pick([
            faction,
            `${faction} — ${world.name}`,
            pick(pool("factions")),
            "Independent Operations"
        ]);

        const experience = {
            id: randomId("exp"),

            index: index + 1,

            role,

            organization,

            world: world.name,

            years: `${integer(1, 8)} years`,

            status: pick([
                "completed",
                "active",
                "archived",
                "classified"
            ]),

            npcId: npc.id,

            npcName: npc.name,

            npcRole: npc.role,

            technologies,

            assignment:
                `${npc.name} requested an engineering intervention involving ${pick(pool("project_types"))}.`,

            context:
                `${opening} The assignment took place in ${world.name}, where ${world.socialRule.toLowerCase()}`,

            incident,

            response:
                `The response combined ${pick(technologies)} with ${pick(pool("solutions"))}. ` +
                `${npc.name} remained responsible for the operational decision while the engineering layer was rebuilt.`,

            lesson,

            achievements: [
                `Worked directly with ${npc.name}.`,
                `Reduced a dangerous manual workflow.`,
                `Documented the previously undocumented system.`,
                `Delivered a stable recovery path.`
            ],

            narrative:
                `${opening} ${npc.name} was the primary contact. ` +
                `The work involved ${pick(pool("project_types"))} inside ${world.name}. ` +
                `The central complication was ${incident}. ` +
                `The final lesson was simple: ${lesson}.`
        };

        return experience;
    }


    /* ==========================================================
       PROJECT GENERATION
       ========================================================== */

    function generateProject(
        world,
        specialties,
        npc,
        index
    ) {
        const baseName = pick(
            pool("project_names"),
            "Unknown"
        );

        const suffix = pick([
            "Core",
            "Prime",
            "Zero",
            "Protocol",
            "Engine",
            "Grid",
            "OS",
            "Network",
            "System",
            "Archive",
            "Fabric",
            "Works",
            "Node"
        ]);

        const name =
            `${baseName} ${suffix}`;

        const skills = sample(
            specialties,
            3,
            Math.min(
                7,
                specialties.length
            )
        );

        const problem = pick(pool("problems"));
        const solution = pick(pool("solutions"));
        const failure = pick(pool("failures"));
        const outcome = pick(pool("outcomes"));

        const project = {
            id: randomId("project"),

            index: index + 1,

            name,

            type: pick(pool("project_types")),

            industry: pick(pool("industries")),

            world: world.name,

            skills,

            client: npc.name,

            clientRole: npc.role,

            npcId: npc.id,

            problem,

            solution,

            failure,

            outcome,

            status: pick([
                "shipped",
                "operational",
                "experimental",
                "archived",
                "classified",
                "legendary"
            ]),

            complexity: pick([
                "moderate",
                "high",
                "severe",
                "absurd",
                "reality-breaking"
            ]),

            users:
                formatNumber(
                    integer(
                        250,
                        9900000
                    )
                ),

            duration:
                `${integer(2, 28)} weeks`,

            summary:
                `${npc.name} needed ${articleFor(pick(pool("project_types")))} system because ${problem}.`,

            architecture:
                `${solution}. Built around ${skills.join(", ")} with explicit recovery paths.`,

            technicalNotes: [
                `Primary stack: ${skills.slice(0, 3).join(", ")}.`,
                `Operational environment: ${world.name}.`,
                `Primary stakeholder: ${npc.name}.`,
                `Failure mode observed: ${failure}.`
            ],

            narrative:
                `The ${name} project began when ${npc.name} reported that ${problem}. ` +
                `The resulting system used ${skills.slice(0, 3).join(", ")} and eventually ${outcome}.`
        };

        return project;
    }


    /* ==========================================================
       INCIDENT GENERATION
       ========================================================== */

    function generateIncident(
        world,
        npcs,
        projects,
        index
    ) {
        const witness = pick(
            npcs,
            null
        );

        const project = pick(
            projects,
            null
        );

        const type = pick([
            "deployment anomaly",
            "infrastructure failure",
            "security event",
            "reality synchronization error",
            "data corruption",
            "unexpected automation",
            "access control failure",
            "temporal inconsistency",
            "artifact malfunction",
            "human misunderstanding"
        ]);

        const opener = pick(pool("incidents"));

        const consequence = pick([
            "the service stopped responding",
            "three departments lost access",
            "an entire district received the wrong notification",
            "the archive generated duplicate people",
            "production became temporarily philosophical",
            "a maintenance robot obtained administrative privileges",
            "the city clock skipped an hour",
            "the monitoring system became the incident",
            "a portal opened inside the documentation",
            "the backup system refused to cooperate"
        ]);

        const response = pick([
            "isolated the failure and restored the previous stable state",
            "disabled the affected automation and rebuilt the deployment",
            "created a temporary compatibility layer",
            "recovered the system from an independent archive",
            "manually verified every affected record",
            "introduced monitoring before restoring service",
            "rolled back the dangerous configuration"
        ]);

        return {
            id: randomId("incident"),

            index: index + 1,

            code: randomCode("INC"),

            type,

            risk: pick([
                "low",
                "medium",
                "high",
                "critical",
                "absurd"
            ]),

            status: pick([
                "resolved",
                "contained",
                "monitoring",
                "archived"
            ]),

            date: randomDateLabel(
                integer(0, 6)
            ),

            world: world.name,

            witness: witness
                ? witness.name
                : "Unknown",

            projectId: project
                ? project.id
                : null,

            projectName: project
                ? project.name
                : "Unassociated",

            summary:
                `${capitalize(opener)}. ${consequence}.`,

            observation:
                `The incident originated inside ${world.name} and was witnessed by ${witness ? witness.name : "an unidentified operator"}.`,

            consequence,

            response,

            recommendation:
                `Document the failure, keep an independent recovery path, and do not assume the same system will behave normally next Tuesday.`
        };
    }


    /* ==========================================================
       QUEST GENERATION
       ========================================================== */

    function generateQuest(
        world,
        npc,
        faction,
        index
    ) {
        const objective = pick(pool("quests"));

        return {
            id: randomId("quest"),

            index: index + 1,

            objective,

            reward: pick(pool("rewards")),

            risk: pick([
                "manageable",
                "dangerous",
                "severe",
                "extreme",
                "unknown"
            ]),

            status: pick([
                "active",
                "queued",
                "optional",
                "classified"
            ]),

            world: world.name,

            assignedBy: faction,

            client: npc.name,

            description:
                `${npc.name} has been identified as the primary contact for this objective. ` +
                `The assignment requires operating inside ${world.name} without making the situation significantly worse.`
        };
    }


    /* ==========================================================
       TIMELINE
       ========================================================== */

    function generateTimeline(
        experiences,
        industry
    ) {
        const count = integer(6, 8);

        const years = [];

        const currentYear =
            new Date().getFullYear();

        for (let i = 0; i < count; i++) {
            years.push(
                currentYear - i * integer(1, 2)
            );
        }

        return years
            .sort((a, b) => a - b)
            .map((year, index) => {
                const experience =
                    experiences[index % experiences.length];

                return {
                    year,

                    title: pick([
                        "Entered the archive",
                        "Built the first impossible system",
                        "Joined an emergency operation",
                        "Recovered a legacy platform",
                        "Crossed into production",
                        "Designed a stranger workflow",
                        "Survived a major incident",
                        "Opened a new operational chapter"
                    ]),

                    text:
                        `${experience.role} work expanded into ${industry} while working with ${experience.npcName}.`
                };
            });
    }


    /* ==========================================================
       UI PALETTES
       ========================================================== */

    function choosePalette(family) {
        const palettes = {
            executive: [
                "#8b7cff",
                "#58e0bd",
                "#090a0c",
                "#101216"
            ],

            terminal: [
                "#63ff9a",
                "#5ad8ff",
                "#050807",
                "#0b110e"
            ],

            rpg: [
                "#ffca63",
                "#7de3ff",
                "#0d0b08",
                "#15120d"
            ],

            manhwa: [
                "#d69cff",
                "#74e8ff",
                "#08090d",
                "#10121a"
            ],

            dossier: [
                "#d7e06e",
                "#88d8c0",
                "#0b0d09",
                "#12150f"
            ],

            research: [
                "#6eb6ff",
                "#7de0bc",
                "#080b10",
                "#10151c"
            ],

            luxury: [
                "#d9b56f",
                "#b8a98d",
                "#0d0c0b",
                "#151311"
            ],

            brutalist: [
                "#ffffff",
                "#ff405d",
                "#050505",
                "#111111"
            ],

            space: [
                "#8fa8ff",
                "#72e0e7",
                "#060812",
                "#0d1020"
            ],

            detective: [
                "#e8b34e",
                "#7da9c9",
                "#0c0b09",
                "#151310"
            ],

            spellbook: [
                "#e0a75e",
                "#9cc7a7",
                "#0c0908",
                "#17110e"
            ],

            underground: [
                "#ff744f",
                "#a6e06f",
                "#090a08",
                "#11140e"
            ],

            newspaper: [
                "#8b1e25",
                "#183e4a",
                "#e8e3d5",
                "#f5f0e4"
            ],

            "operating-system": [
                "#6df3ff",
                "#77ff8b",
                "#05090b",
                "#0b1115"
            ],

            chaotic: [
                "#ff4fd8",
                "#58e8ff",
                "#08070b",
                "#130d18"
            ]
        };

        const palette =
            palettes[family] ||
            palettes.executive;

        return {
            accent: palette[0],
            accent2: palette[1],
            background: palette[2],
            surface: palette[3]
        };
    }


    /* ==========================================================
       UI DNA
       ========================================================== */

    function generateUIDNA({
        world,
        title,
        personality,
        genre,
        chaos,
        specialties
    }) {
        const families = uiPool("families");
        const layouts = uiPool("layouts");
        const navs = uiPool("navs");
        const heroes = uiPool("hero_modes");
        const densities = uiPool("densities");
        const decorations = uiPool("decorations");

        let preferred = [];

        const combined = (
            `${title} ${personality} ${genre} ${world.name}`
        ).toLowerCase();

        if (
            combined.includes("security") ||
            combined.includes("detective") ||
            combined.includes("classified")
        ) {
            preferred.push(
                "dossier",
                "detective"
            );
        }

        if (
            combined.includes("space") ||
            combined.includes("orbital") ||
            combined.includes("science")
        ) {
            preferred.push(
                "space",
                "research"
            );
        }

        if (
            combined.includes("fantasy") ||
            combined.includes("kingdom") ||
            combined.includes("guild") ||
            combined.includes("artifact")
        ) {
            preferred.push(
                "rpg",
                "spellbook",
                "manhwa"
            );
        }

        if (
            combined.includes("platform") ||
            combined.includes("systems") ||
            combined.includes("infrastructure") ||
            combined.includes("devops")
        ) {
            preferred.push(
                "terminal",
                "operating-system",
                "executive"
            );
        }

        if (
            specialties.length >= 7
        ) {
            preferred.push(
                "research",
                "dashboard",
                "terminal"
            );
        }

        if (
            chaos >= 75
        ) {
            preferred.push(
                "chaotic",
                "brutalist",
                "underground"
            );
        }

        if (
            chaos >= 90
        ) {
            preferred.push(
                "chaotic"
            );
        }

        const availablePreferred =
            preferred.filter(
                value =>
                    families.includes(value)
            );

        let family;

        if (
            availablePreferred.length &&
            random() < 0.72
        ) {
            family =
                pick(availablePreferred);
        } else {
            family =
                pick(
                    families,
                    "executive"
                );
        }

        const palette =
            choosePalette(family);

        let density;

        if (chaos >= 80) {
            density =
                pick(
                    densities,
                    "compact"
                );
        } else if (chaos <= 35) {
            density =
                pick(
                    densities,
                    "spacious"
                );
        } else {
            density =
                pick(
                    densities,
                    "normal"
                );
        }

        return {
            family,

            layout:
                pick(
                    layouts,
                    "dashboard"
                ),

            nav:
                pick(
                    navs,
                    "top"
                ),

            hero:
                pick(
                    heroes,
                    "identity"
                ),

            density,

            decoration:
                pick(
                    decorations,
                    "grid"
                ),

            radius:
                integer(0, 24),

            ...palette,

            voice:
                POOLS.voice_packs &&
                POOLS.voice_packs[family]
                    ? POOLS.voice_packs[family]
                    : {},

            chaos,

            cardFirst: true,

            textHeavy: false,

            longForm: false
        };
    }


    /* ==========================================================
       PORTFOLIO GENERATION
       ========================================================== */

    function generatePortfolio() {
        const world =
            generateWorld();

        const name =
            pick(
                pool("names"),
                "Unknown Engineer"
            );

        const title =
            pick(
                pool("titles"),
                "Systems Engineer"
            );

        const personality =
            pick(
                pool("personalities"),
                "methodical"
            );

        const industry =
            pick(
                pool("industries"),
                "infrastructure"
            );

        const education =
            pick(
                pool("education"),
                "Self-Taught Systems Engineer"
            );

        const faction =
            pick(
                world.factions.length
                    ? world.factions
                    : pool("factions"),
                "Independent Operations"
            );

        const specialties =
            sample(
                pool("specialties"),
                LIMITS.specialties_min || 5,
                LIMITS.specialties_max || 9
            );

        const chaos =
            integer(1, 100);

        const npcCount =
            integer(
                LIMITS.npcs_min || 7,
                LIMITS.npcs_max || 10
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
                    faction,
                    usedNames
                )
            );
        }


        /*
         * IMPORTANT:
         *
         * Every NPC receives at least one
         * project and one experience.
         *
         * This guarantees that NPCs are not
         * decorative filler.
         */

        const experiences = [];

        npcs.forEach(
            (npc, index) => {
                const experience =
                    generateExperience(
                        world,
                        faction,
                        specialties,
                        npc,
                        index
                    );

                experiences.push(
                    experience
                );

                npc.experienceIds.push(
                    experience.id
                );
            }
        );


        const projects = [];

        npcs.forEach(
            (npc, index) => {
                const project =
                    generateProject(
                        world,
                        specialties,
                        npc,
                        index
                    );

                projects.push(project);

                npc.projectIds.push(
                    project.id
                );
            }
        );


        /*
         * Additional projects make the portfolio
         * feel like a real portfolio instead of
         * one project per character.
         */

        const extraProjects =
            integer(1, 3);

        for (
            let i = 0;
            i < extraProjects;
            i++
        ) {
            const npc =
                pick(npcs);

            const project =
                generateProject(
                    world,
                    specialties,
                    npc,
                    projects.length
                );

            projects.push(project);

            npc.projectIds.push(
                project.id
            );
        }


        const incidentCount =
            integer(
                LIMITS.incidents_min || 5,
                LIMITS.incidents_max || 8
            );

        const incidents = [];

        for (
            let i = 0;
            i < incidentCount;
            i++
        ) {
            incidents.push(
                generateIncident(
                    world,
                    npcs,
                    projects,
                    i
                )
            );
        }


        const questCount =
            integer(
                LIMITS.quests_min || 3,
                LIMITS.quests_max || 5
            );

        const quests = [];

        for (
            let i = 0;
            i < questCount;
            i++
        ) {
            quests.push(
                generateQuest(
                    world,
                    pick(npcs),
                    faction,
                    i
                )
            );
        }


        const years =
            integer(2, 12);

        const ui =
            generateUIDNA({
                world,
                title,
                personality,
                genre: world.genre,
                chaos,
                specialties
            });


        const metrics = {
            deployments:
                integer(180, 1800),

            systems:
                integer(7, 49),

            incidents:
                integer(8, 72),

            users:
                integer(
                    2500,
                    99000000
                ),

            uptime:
                (
                    99 +
                    random() * 0.99
                ).toFixed(2),

            coffee:
                integer(
                    731,
                    29821
                ),

            worldsVisited:
                integer(2, 19),

            unresolvedMysteries:
                integer(1, 37),

            realityStability:
                integer(11, 99)
        };


        const timeline =
            generateTimeline(
                experiences,
                industry
            );


        const createdYear =
            new Date().getFullYear() -
            integer(1, 8);

        const createdDate =
            `${createdYear}-${String(integer(1, 12)).padStart(2, "0")}-${String(integer(1, 28)).padStart(2, "0")}`;

        const updatedDate =
            randomDateLabel(0);


        const archiveNumber =
            `ARCH-${integer(1000, 9999)}-${integer(10, 99)}`;


        const signatureBase = [
            name,
            title,
            world.name,
            faction,
            ui.family,
            ui.layout,
            ui.nav,
            ...npcs.map(npc => npc.id),
            ...projects.map(project => project.id),
            ...experiences.map(exp => exp.id)
        ].join("|");


        const signature =
            hashString(signatureBase);


        return {
            id: randomId("portfolio"),

            name,

            title,

            personality,

            industry,

            education,

            faction,

            world,

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

            archive: {
                number: archiveNumber,
                created: createdDate,
                updated: updatedDate,
                classification:
                    pick([
                        "PUBLIC",
                        "INTERNAL",
                        "RESTRICTED",
                        "CLASSIFIED",
                        "ABSURDLY CLASSIFIED"
                    ])
            },

            signature,

            generatedAt:
                new Date().toISOString()
        };
    }


    /* ==========================================================
       UNIQUE GENERATION
       ========================================================== */

    function makePortfolioSignature(
        portfolio
    ) {
        return hashString(
            [
                portfolio.name,
                portfolio.title,
                portfolio.world.name,
                portfolio.faction,
                portfolio.ui.family,
                portfolio.ui.layout,
                portfolio.ui.nav,
                portfolio.signature
            ].join("|")
        );
    }


    function generateUniquePortfolio() {
        let portfolio =
            generatePortfolio();

        let signature =
            makePortfolioSignature(
                portfolio
            );

        let attempts = 0;

        while (
            runtime.usedSignatures.has(signature) &&
            attempts < 20
        ) {
            portfolio =
                generatePortfolio();

            signature =
                makePortfolioSignature(
                    portfolio
                );

            attempts++;
        }

        runtime.usedSignatures.add(
            signature
        );

        return portfolio;
    }


    /* ==========================================================
       THEME
       ========================================================== */

    function applyTheme(portfolio) {
        const root =
            document.documentElement;

        const ui =
            portfolio.ui;

        root.style.setProperty(
            "--accent",
            ui.accent
        );

        root.style.setProperty(
            "--accent-2",
            ui.accent2
        );

        root.style.setProperty(
            "--bg",
            ui.background
        );

        root.style.setProperty(
            "--surface",
            ui.surface
        );

        root.style.setProperty(
            "--radius",
            `${ui.radius}px`
        );


        /*
         * Estimate whether white or black
         * text is better on the accent.
         */

        const hex =
            safe(ui.accent, "#8b7cff")
                .replace("#", "");

        let r = 139;
        let g = 124;
        let b = 255;

        if (hex.length === 6) {
            r = parseInt(
                hex.substring(0, 2),
                16
            );

            g = parseInt(
                hex.substring(2, 4),
                16
            );

            b = parseInt(
                hex.substring(4, 6),
                16
            );
        }

        const brightness =
            (
                r * 299 +
                g * 587 +
                b * 114
            ) / 1000;

        root.style.setProperty(
            "--text-on-accent",
            brightness > 160
                ? "#08090b"
                : "#ffffff"
        );
    }


    /* ==========================================================
       NAVIGATION
       ========================================================== */

    function navLink(
        target,
        label
    ) {
        return `
            <a href="#${escapeHTML(target)}">
                ${escapeHTML(label)}
            </a>
        `;
    }


    function renderNavigation(
        portfolio
    ) {
        const voice =
            portfolio.ui.voice || {};

        const navClass =
            `nav nav-${slug(portfolio.ui.nav)}`;

        return `
            <header class="topbar">
                <a
                    class="brand"
                    href="#top"
                    aria-label="Return to portfolio top"
                >
                    <span class="brand-mark">
                        ${escapeHTML(
                            initials(portfolio.name)
                        )}
                    </span>

                    <span class="brand-copy">
                        <span class="brand-name">
                            ${escapeHTML(
                                portfolio.name
                            )}
                        </span>

                        <span class="brand-meta">
                            ${escapeHTML(
                                portfolio.archive.number
                            )}
                        </span>
                    </span>
                </a>

                <nav
                    class="${navClass}"
                    aria-label="Portfolio navigation"
                >
                    ${navLink(
                        "experiences",
                        voice.experience || "Experience"
                    )}

                    ${navLink(
                        "work",
                        voice.project || "Projects"
                    )}

                    ${navLink(
                        "world",
                        voice.world || "World"
                    )}

                    ${navLink(
                        "characters",
                        voice.npc || "NPCs"
                    )}

                    ${navLink(
                        "incidents",
                        voice.incident || "Incidents"
                    )}

                    ${navLink(
                        "quests",
                        voice.quest || "Quests"
                    )}

                    ${navLink(
                        "archive",
                        voice.archive || "Archive"
                    )}

                    <button
                        type="button"
                        data-generate
                    >
                        Generate
                    </button>
                </nav>
            </header>
        `;
    }


    /* ==========================================================
       HERO
       ========================================================== */

    function heroCopy(
        portfolio
    ) {
        const ui =
            portfolio.ui;

        const world =
            portfolio.world;

        const modes = {
            identity:
                `${portfolio.name} / ${portfolio.title}`,

            mission:
                `Engineering systems that survive impossible missions.`,

            profile:
                `A ${portfolio.personality} systems engineer operating across ${world.name}.`,

            case:
                `Case ${portfolio.archive.number}: ${portfolio.name}`,

            status:
                `STATUS: ${portfolio.chaos >= 75 ? "UNREASONABLY ACTIVE" : "OPERATIONAL"}`,

            command:
                `COMMAND NODE: ${portfolio.name}`,

            character:
                `A new character has entered the engineering arc.`,

            manifesto:
                `Build it. Break it. Document it. Ship it anyway.`,

            classified:
                `CLASSIFIED PERSONNEL RECORD`,

            "field-report":
                `FIELD REPORT FROM ${world.name}`
        };

        return modes[ui.hero] ||
            modes.identity;
    }


    function renderHero(
        portfolio
    ) {
        const world =
            portfolio.world;

        const ui =
            portfolio.ui;

        return `
            <section
                class="hero"
                id="top"
                aria-labelledby="portfolio-title"
            >
                <div class="hero-grid">
                    <div class="hero-copy">

                        <div class="eyebrow">
                            ${escapeHTML(
                                portfolio.ui.voice?.section ||
                                "Procedural Portfolio"
                            )}
                        </div>

                        <h1 id="portfolio-title">
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
                            ${escapeHTML(
                                heroCopy(portfolio)
                            )}
                            This portfolio was generated
                            entirely in browser memory and
                            has no persistent identity.
                        </p>

                        <div class="hero-actions">

                            <button
                                type="button"
                                class="button button-primary"
                                data-generate
                            >
                                Generate New Reality
                            </button>

                            <a
                                class="button"
                                href="#work"
                            >
                                View Work
                            </a>

                        </div>
                    </div>


                    <aside
                        class="hero-meta"
                        aria-label="Portfolio metadata"
                    >

                        <div class="hero-meta-item">
                            <div class="hero-meta-label">
                                World
                            </div>

                            <div class="hero-meta-value">
                                ${escapeHTML(
                                    world.name
                                )}
                            </div>
                        </div>

                        <div class="hero-meta-item">
                            <div class="hero-meta-label">
                                Classification
                            </div>

                            <div class="hero-meta-value">
                                ${escapeHTML(
                                    world.classification
                                )}
                            </div>
                        </div>

                        <div class="hero-meta-item">
                            <div class="hero-meta-label">
                                Faction
                            </div>

                            <div class="hero-meta-value">
                                ${escapeHTML(
                                    portfolio.faction
                                )}
                            </div>
                        </div>

                        <div class="hero-meta-item">
                            <div class="hero-meta-label">
                                Chaos Index
                            </div>

                            <div class="hero-meta-value">
                                ${portfolio.chaos}/100
                            </div>
                        </div>

                    </aside>
                </div>
            </section>
        `;
    }


    /* ==========================================================
       STATS
       ========================================================== */

    function renderStats(
        portfolio
    ) {
        const metrics =
            portfolio.metrics;

        return `
            <div class="stat-grid">

                <div class="stat-card">
                    <div class="stat-value">
                        ${formatNumber(
                            metrics.systems
                        )}
                    </div>

                    <div class="stat-label">
                        Systems
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-value">
                        ${formatNumber(
                            metrics.deployments
                        )}
                    </div>

                    <div class="stat-label">
                        Deployments
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-value">
                        ${formatPercent(
                            metrics.uptime
                        )}
                    </div>

                    <div class="stat-label">
                        Fictional Uptime
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-value">
                        ${formatNumber(
                            metrics.users
                        )}
                    </div>

                    <div class="stat-label">
                        Users / Records
                    </div>
                </div>

            </div>
        `;
    }


    /* ==========================================================
       SECTION HEADER
       ========================================================== */

    function sectionHeader(
        label,
        title,
        description
    ) {
        return `
            <div class="section-header">
                <div class="section-header-copy">

                    <div class="section-kicker">
                        ${escapeHTML(label)}
                    </div>

                    <h2 class="section-title">
                        ${escapeHTML(title)}
                    </h2>

                    ${
                        description
                            ? `
                                <p class="section-description">
                                    ${escapeHTML(
                                        description
                                    )}
                                </p>
                            `
                            : ""
                    }

                </div>
            </div>
        `;
    }


    /* ==========================================================
       TEXT CARD
       ========================================================== */

    function textCard(
        label,
        text,
        extraClass = ""
    ) {
        return `
            <article
                class="card content-card ${escapeHTML(
                    extraClass
                )}"
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


    /* ==========================================================
       TAGS
       ========================================================== */

    function tagList(
        values,
        accent = false
    ) {
        const items =
            uniqueStrings(values);

        if (!items.length) {
            return "";
        }

        return `
            <div class="tag-list">
                ${items
                    .map(
                        value => `
                            <span
                                class="tag ${
                                    accent
                                        ? "tag-accent"
                                        : ""
                                }"
                            >
                                ${escapeHTML(value)}
                            </span>
                        `
                    )
                    .join("")}
            </div>
        `;
    }


    /* ==========================================================
       PROFILE
       ========================================================== */

    function renderProfile(
        portfolio
    ) {
        const world =
            portfolio.world;

        return `
            <section
                class="section"
                id="profile"
                aria-labelledby="profile-title"
            >

                ${sectionHeader(
                    portfolio.ui.voice?.section ||
                    "Profile",
                    "Operating Profile",
                    `A procedural professional identity generated inside ${world.name}.`
                )}

                <div class="profile-card-grid">

                    <div class="profile-main">

                        ${textCard(
                            "Professional Summary",
                            `${portfolio.name} works as ${articleFor(portfolio.title)} ${portfolio.title} specializing in ${portfolio.specialties.slice(0, 4).join(", ")}. The current operating environment is ${world.name}, where ${world.description.toLowerCase()}`
                        )}

                        ${textCard(
                            "Engineering Philosophy",
                            `The operating philosophy is ${portfolio.personality}: build systems that remain understandable after the original author disappears, create recovery paths before disasters, and never assume production is behaving normally.`
                        )}

                        <article class="card content-card">
                            <div class="section-kicker">
                                Specialties
                            </div>

                            ${tagList(
                                portfolio.specialties,
                                true
                            )}
                        </article>

                    </div>


                    <aside class="profile-side">

                        <article class="card content-card">

                            <div class="section-kicker">
                                Identity Record
                            </div>

                            <div class="profile-facts">

                                ${renderProfileFact(
                                    "Primary Specialty",
                                    portfolio.specialties[0]
                                )}

                                ${renderProfileFact(
                                    "Secondary Specialty",
                                    portfolio.specialties[1]
                                )}

                                ${renderProfileFact(
                                    "Current World",
                                    world.name
                                )}

                                ${renderProfileFact(
                                    "World Type",
                                    world.genre
                                )}

                                ${renderProfileFact(
                                    "Education",
                                    portfolio.education
                                )}

                                ${renderProfileFact(
                                    "Faction",
                                    portfolio.faction
                                )}

                                ${renderProfileFact(
                                    "Professional Status",
                                    "Operational"
                                )}

                                ${renderProfileFact(
                                    "Reality Stability",
                                    `${portfolio.metrics.realityStability}%`
                                )}

                            </div>

                        </article>

                    </aside>

                </div>
            </section>
        `;
    }


    function renderProfileFact(
        label,
        value
    ) {
        return `
            <div class="profile-fact">

                <div class="profile-fact-label">
                    ${escapeHTML(label)}
                </div>

                <div class="profile-fact-value">
                    ${escapeHTML(value)}
                </div>

            </div>
        `;
    }


    /* ==========================================================
       EXPERIENCES
       ========================================================== */

    function renderExperiences(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="experiences"
                aria-labelledby="experiences-title"
            >

                ${sectionHeader(
                    portfolio.ui.voice?.experience ||
                    "Experience",
                    "Absurd Career History",
                    "Every record is connected to an NPC, because the people inside the world actually caused the work to exist."
                )}

                <div class="experience-stack">
                    ${portfolio.experiences
                        .map(
                            renderExperience
                        )
                        .join("")}
                </div>

            </section>
        `;
    }


    function renderExperience(
        experience
    ) {
        return `
            <article
                class="experience-card card dossier-entry"
            >

                <div class="experience-header">

                    <div class="record-number">
                        EXP-${String(
                            experience.index
                        ).padStart(2, "0")}
                    </div>

                    <div>
                        <h3 class="experience-role">
                            ${escapeHTML(
                                experience.role
                            )}
                        </h3>

                        <div class="experience-org">
                            ${escapeHTML(
                                experience.organization
                            )}
                            ·
                            ${escapeHTML(
                                experience.world
                            )}
                            ·
                            Primary contact:
                            ${escapeHTML(
                                experience.npcName
                            )}
                        </div>
                    </div>

                    <div class="experience-status">
                        ${escapeHTML(
                            experience.status
                        )}
                    </div>

                </div>


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

                    ${textCard(
                        "NPC Connection",
                        `${experience.npcName} — ${experience.npcRole}`
                    )}

                </div>


                <div class="experience-lower-grid">

                    <article class="experience-card">
                        <div class="section-kicker">
                            Technologies
                        </div>

                        ${tagList(
                            experience.technologies,
                            true
                        )}
                    </article>

                    <article class="experience-card">
                        <div class="section-kicker">
                            Achievements
                        </div>

                        <div class="tag-list">
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
                                .join("")}
                        </div>
                    </article>

                </div>

            </article>
        `;
    }


    /* ==========================================================
       PROJECTS
       ========================================================== */

    function renderProjects(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="work"
                aria-labelledby="work-title"
            >

                ${sectionHeader(
                    portfolio.ui.voice?.project ||
                    "Projects",
                    "Questionable Things That Were Built",
                    "Card-first case studies generated around actual fictional stakeholders, incidents and worlds."
                )}

                <div class="project-grid">
                    ${portfolio.projects
                        .map(
                            renderProjectStory
                        )
                        .join("")}
                </div>

            </section>
        `;
    }


    function renderProjectStory(
        project
    ) {
        return `
            <article class="project-card card">

                <header class="project-card-header">

                    <div class="project-index">
                        BUILD-${String(
                            project.index
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

                </header>


                <div class="project-body">

                    <div class="project-metrics">

                        ${projectMetric(
                            "Complexity",
                            project.complexity
                        )}

                        ${projectMetric(
                            "Users",
                            project.users
                        )}

                        ${projectMetric(
                            "Duration",
                            project.duration
                        )}

                        ${projectMetric(
                            "Client",
                            project.client
                        )}

                    </div>


                    <div class="project-card-grid">

                        ${textCard(
                            "Summary",
                            project.summary
                        )}

                        ${textCard(
                            "Problem",
                            project.problem
                        )}

                        ${textCard(
                            "Architecture",
                            project.architecture
                        )}

                        ${textCard(
                            "Client / NPC",
                            `${project.client} — ${project.clientRole}`
                        )}

                        ${textCard(
                            "Failure",
                            project.failure
                        )}

                        ${textCard(
                            "Solution",
                            project.solution
                        )}

                        ${textCard(
                            "Outcome",
                            project.outcome
                        )}

                    </div>


                    <article class="project-note">
                        <div class="project-note-label">
                            Technical Notes
                        </div>

                        ${project.technicalNotes
                            .map(
                                note => `
                                    <p>
                                        ${escapeHTML(
                                            note
                                        )}
                                    </p>
                                `
                            )
                            .join("")}
                    </article>


                    ${tagList(
                        project.skills,
                        true
                    )}

                </div>

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


    /* ==========================================================
       WORLD
       ========================================================== */

    function renderWorld(
        portfolio
    ) {
        const world =
            portfolio.world;

        return `
            <section
                class="section"
                id="world"
                aria-labelledby="world-title"
            >

                ${sectionHeader(
                    portfolio.ui.voice?.world ||
                    "World",
                    "The Operating Environment",
                    "The portfolio is not floating in an empty template. It belongs to a fictional world with rules, factions, conflicts and consequences."
                )}

                <div class="world-panel">

                    <div class="world-main">

                        <article class="card content-card">

                            <div class="section-kicker">
                                ${escapeHTML(
                                    world.classification
                                )}
                            </div>

                            <h3 class="world-title">
                                ${escapeHTML(
                                    world.name
                                )}
                            </h3>

                            <p class="world-description">
                                ${escapeHTML(
                                    world.description
                                )}
                            </p>

                            ${tagList(
                                [
                                    world.genre,
                                    world.classification,
                                    world.stability,
                                    world.age
                                ],
                                true
                            )}

                        </article>


                        <div class="card-grid">

                            ${textCard(
                                "Sky",
                                world.sky
                            )}

                            ${textCard(
                                "Technology",
                                world.technology
                            )}

                            ${textCard(
                                "Social Rule",
                                world.socialRule
                            )}

                            ${textCard(
                                "Danger",
                                world.danger
                            )}

                            ${textCard(
                                "Current Conflict",
                                world.conflict
                            )}

                            ${textCard(
                                "Population",
                                world.population
                            )}

                        </div>

                    </div>


                    <aside class="world-side">

                        <article class="card content-card">

                            <div class="section-kicker">
                                World Metrics
                            </div>

                            <div class="profile-facts">

                                ${renderProfileFact(
                                    "Age",
                                    world.age
                                )}

                                ${renderProfileFact(
                                    "Population",
                                    world.population
                                )}

                                ${renderProfileFact(
                                    "Stability",
                                    world.stability
                                )}

                                ${renderProfileFact(
                                    "Genre",
                                    world.genre
                                )}

                            </div>

                        </article>

                    </aside>

                </div>


                ${renderWorldRules(world)}

                ${renderWorldFactions(world)}

            </section>
        `;
    }


    function renderWorldRules(
        world
    ) {
        return `
            <div class="section" style="padding-top: 1rem;">

                ${sectionHeader(
                    "Rules",
                    "Rules That Should Probably Not Be Broken",
                    ""
                )}

                <div class="world-rules">

                    ${world.rules
                        .map(
                            (rule, index) => `
                                <article class="world-rule">
                                    <div class="world-rule-number">
                                        RULE-${String(
                                            index + 1
                                        ).padStart(2, "0")}
                                    </div>

                                    <div class="world-rule-text">
                                        ${escapeHTML(
                                            rule
                                        )}
                                    </div>
                                </article>
                            `
                        )
                        .join("")}

                </div>

            </div>
        `;
    }


    function renderWorldFactions(
        world
    ) {
        return `
            <div class="section" style="padding-top: 1rem;">

                ${sectionHeader(
                    "Factions",
                    "Organizations With Too Much Access",
                    ""
                )}

                <div class="world-factions">

                    ${world.factions
                        .map(
                            faction => `
                                <article class="world-faction">
                                    ${escapeHTML(
                                        faction
                                    )}
                                </article>
                            `
                        )
                        .join("")}

                </div>

            </div>
        `;
    }


    /* ==========================================================
       NPCs
       ========================================================== */

    function renderNPCs(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="characters"
                aria-labelledby="characters-title"
            >

                ${sectionHeader(
                    portfolio.ui.voice?.npc ||
                    "NPCs",
                    "People Who Made This Portfolio Weird",
                    "Every generated NPC is connected to at least one project and one experience."
                )}

                <div class="npc-grid">
                    ${portfolio.npcs
                        .map(
                            npc =>
                                renderNPC(
                                    npc,
                                    portfolio
                                )
                        )
                        .join("")}
                </div>

            </section>
        `;
    }


    function renderNPC(
        npc,
        portfolio
    ) {
        const projectNames =
            portfolio.projects
                .filter(
                    project =>
                        project.npcId === npc.id
                )
                .map(
                    project =>
                        project.name
                );

        const experienceNames =
            portfolio.experiences
                .filter(
                    experience =>
                        experience.npcId === npc.id
                )
                .map(
                    experience =>
                        experience.role
                );

        return `
            <article class="npc npc-card dossier-entry card">

                <header class="npc-header">

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

                        <div class="npc-type">
                            ${escapeHTML(
                                npc.type
                            )}
                        </div>

                    </div>

                </header>


                <div class="npc-body">

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
                            `${npc.reputation}/100`
                        )}

                        ${npcFact(
                            "Danger",
                            `${npc.danger}/100`
                        )}

                        ${npcFact(
                            "Encounters",
                            npc.encounters
                        )}

                    </div>


                    ${textCard(
                        "Biography",
                        npc.biography
                    )}

                    ${textCard(
                        "Known Secret",
                        npc.secret
                    )}


                    <div class="npc-statement">
                        “${escapeHTML(
                            npc.dialogue
                        )}”
                    </div>


                    <div class="npc-links">

                        <div class="section-kicker">
                            Associated Projects
                        </div>

                        ${projectNames
                            .map(
                                project => `
                                    <div class="npc-link-row">
                                        <div class="npc-link-kind">
                                            BUILD
                                        </div>

                                        <div>
                                            ${escapeHTML(
                                                project
                                            )}
                                        </div>
                                    </div>
                                `
                            )
                            .join("")}

                    </div>


                    <div class="npc-links">

                        <div class="section-kicker">
                            Associated Experiences
                        </div>

                        ${experienceNames
                            .map(
                                experience => `
                                    <div class="npc-link-row">
                                        <div class="npc-link-kind">
                                            EXP
                                        </div>

                                        <div>
                                            ${escapeHTML(
                                                experience
                                            )}
                                        </div>
                                    </div>
                                `
                            )
                            .join("")}

                    </div>


                    <div>
                        <div class="section-kicker">
                            Rumors
                        </div>

                        ${tagList(
                            npc.rumors
                        )}
                    </div>

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


    /* ==========================================================
       INCIDENTS
       ========================================================== */

    function renderIncidents(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="incidents"
                aria-labelledby="incidents-title"
            >

                ${sectionHeader(
                    portfolio.ui.voice?.incident ||
                    "Incidents",
                    "Things That Went Wrong",
                    "A believable portfolio should contain failures. This universe contains significantly more than necessary."
                )}

                <div class="incident-grid">

                    ${portfolio.incidents
                        .map(
                            renderIncident
                        )
                        .join("")}

                </div>

            </section>
        `;
    }


    function renderIncident(
        incident
    ) {
        return `
            <article class="incident-card card">

                <header class="incident-header">

                    <div class="incident-code">
                        ${escapeHTML(
                            incident.code
                        )}
                    </div>

                    <div class="incident-risk">
                        ${escapeHTML(
                            incident.risk
                        )}
                    </div>

                </header>


                <div class="incident-body">

                    <h3 class="incident-title">
                        ${escapeHTML(
                            incident.type
                        )}
                    </h3>


                    <div class="incident-meta">

                        <span>
                            ${escapeHTML(
                                incident.status
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                incident.date
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                incident.world
                            )}
                        </span>

                        <span>
                            Witness:
                            ${escapeHTML(
                                incident.witness
                            )}
                        </span>

                    </div>


                    <div class="incident-notes">

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

                    </div>


                    <div style="margin-top: 0.75rem;">
                        <div class="section-kicker">
                            Related Project
                        </div>

                        <div class="tag-list">
                            <span class="tag tag-accent">
                                ${escapeHTML(
                                    incident.projectName
                                )}
                            </span>
                        </div>
                    </div>

                </div>

            </article>
        `;
    }


    function incidentNote(
        label,
        text
    ) {
        return `
            <div class="incident-note">

                <div class="incident-note-label">
                    ${escapeHTML(label)}
                </div>

                <p>
                    ${escapeHTML(text)}
                </p>

            </div>
        `;
    }


    /* ==========================================================
       QUESTS
       ========================================================== */

    function renderQuests(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="quests"
                aria-labelledby="quests-title"
            >

                ${sectionHeader(
                    portfolio.ui.voice?.quest ||
                    "Quests",
                    "Current Objectives",
                    "Not everything here qualifies as a sensible career goal."
                )}

                <div class="quest-grid">

                    ${portfolio.quests
                        .map(
                            renderQuest
                        )
                        .join("")}

                </div>

            </section>
        `;
    }


    function renderQuest(
        quest
    ) {
        return `
            <article class="quest-card card">

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


                <div class="quest-facts">

                    ${renderProfileFact(
                        "World",
                        quest.world
                    )}

                    ${renderProfileFact(
                        "Risk",
                        quest.risk
                    )}

                    ${renderProfileFact(
                        "Assigned By",
                        quest.assignedBy
                    )}

                    ${renderProfileFact(
                        "Contact",
                        quest.client
                    )}

                    ${renderProfileFact(
                        "Reward",
                        quest.reward
                    )}

                </div>

            </article>
        `;
    }


    /* ==========================================================
       TIMELINE
       ========================================================== */

    function renderTimeline(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="timeline"
                aria-labelledby="timeline-title"
            >

                ${sectionHeader(
                    portfolio.ui.voice?.timeline ||
                    "Timeline",
                    "Things That Happened",
                    "A procedural history generated from the current reality."
                )}

                <div class="timeline">

                    ${portfolio.timeline
                        .map(
                            item => `
                                <article class="timeline-item">

                                    <div class="timeline-year">
                                        ${escapeHTML(
                                            item.year
                                        )}
                                    </div>

                                    <div class="timeline-content">

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
                        .join("")}

                </div>

            </section>
        `;
    }


    /* ==========================================================
       ARCHIVE
       ========================================================== */

    function renderArchiveNotice(
        portfolio
    ) {
        const archive =
            portfolio.archive;

        return `
            <section
                class="section"
                id="archive"
                aria-labelledby="archive-title"
            >

                <div class="archive-notice">

                    <div>

                        <div class="archive-warning">
                            Archive Control
                        </div>

                        <div
                            class="archive-title"
                            id="archive-title"
                        >
                            This portfolio does not persist.
                        </div>

                        <p class="card-text">
                            Every browser refresh creates a new
                            fictional identity, new world,
                            new NPC network, new projects and
                            new career history. Nothing is saved.
                        </p>

                    </div>


                    <div class="archive-meta">

                        <span>
                            ${escapeHTML(
                                archive.number
                            )}
                        </span>

                        <span>
                            Created:
                            ${escapeHTML(
                                archive.created
                            )}
                        </span>

                        <span>
                            Updated:
                            ${escapeHTML(
                                archive.updated
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                archive.classification
                            )}
                        </span>

                        <span>
                            Generation:
                            ${runtime.generationCount}
                        </span>

                    </div>

                </div>

            </section>
        `;
    }


    /* ==========================================================
       FOOTER
       ========================================================== */

    function renderFooter(
        portfolio
    ) {
        return `
            <footer class="site-footer">

                <div class="footer-grid">

                    <div>

                        <div class="footer-title">
                            ${escapeHTML(
                                portfolio.name
                            )}
                        </div>

                        <div class="footer-meta">
                            ${escapeHTML(
                                portfolio.title
                            )}
                            ·
                            Browser-memory portfolio
                            ·
                            No persistent storage
                        </div>

                    </div>


                    <div class="footer-signature">
                        ${escapeHTML(
                            portfolio.signature
                        )}
                        <br>
                        Reality #${runtime.generationCount}
                    </div>

                </div>

            </footer>
        `;
    }


    /* ==========================================================
       MAIN RENDER
       ========================================================== */

    function render(
        portfolio
    ) {
        runtime.current =
            portfolio;

        runtime.generationCount++;

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
            $("#app");

        if (!app) {
            throw new Error(
                "Application mount element #app was not found."
            );
        }


        const ui =
            portfolio.ui;


        app.className = [
            "app",
            `ui-${slug(ui.family)}`,
            `layout-${slug(ui.layout)}`,
            `density-${slug(ui.density)}`,
            `nav-${slug(ui.nav)}`
        ].join(" ");


        app.dataset.decoration =
            safe(
                ui.decoration,
                "none"
            );

        app.dataset.generation =
            String(
                runtime.generationCount
            );


        app.innerHTML = `
            ${renderNavigation(
                portfolio
            )}

            <main id="main-content">

                ${renderHero(
                    portfolio
                )}

                <section
                    class="section"
                    aria-label="Portfolio statistics"
                >
                    ${renderStats(
                        portfolio
                    )}
                </section>

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


        app.setAttribute(
            "aria-busy",
            "false"
        );


        wireInteractions();


        try {
            window.scrollTo({
                top: 0,
                behavior: "instant"
            });
        } catch (_) {
            window.scrollTo(
                0,
                0
            );
        }
    }


    /* ==========================================================
       INTERACTIONS
       ========================================================== */

    function wireInteractions() {
        $$("[data-generate]")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    event => {
                        event.preventDefault();
                        generateAndRender();
                    }
                );
            });


        $$('a[href^="#"]')
            .forEach(link => {
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
            });
    }


    /* ==========================================================
       GENERATION
       ========================================================== */

    function generateAndRender() {
        try {
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


    /* ==========================================================
       ERROR SCREEN
       ========================================================== */

    function showRuntimeError(
        error
    ) {
        console.error(
            "Absurd portfolio generation failed:",
            error
        );

        const app =
            $("#app");

        if (!app) {
            return;
        }

        app.className =
            "app";

        app.innerHTML = `
            <main class="runtime-error">

                <div class="eyebrow">
                    RUNTIME ERROR
                </div>

                <h1>
                    Portfolio generation failed.
                </h1>

                <p>
                    The page caught the error instead of
                    silently displaying a blank screen.
                </p>

                <div class="runtime-error-details">
                    ${escapeHTML(
                        error &&
                        error.stack
                            ? error.stack
                            : String(error)
                    )}
                </div>

                <div class="runtime-error-actions">

                    <button
                        type="button"
                        class="button button-primary"
                        id="retry-generation"
                    >
                        Try Again
                    </button>

                    <button
                        type="button"
                        class="button"
                        id="reload-page"
                    >
                        Reload Page
                    </button>

                </div>

            </main>
        `;


        const retry =
            $("#retry-generation");

        if (retry) {
            retry.addEventListener(
                "click",
                () => {
                    generateAndRender();
                }
            );
        }


        const reload =
            $("#reload-page");

        if (reload) {
            reload.addEventListener(
                "click",
                () => {
                    window.location.reload();
                }
            );
        }
    }


    /* ==========================================================
       GLOBAL ERROR HANDLING
       ========================================================== */

    window.addEventListener(
        "error",
        event => {
            console.error(
                "Global JavaScript error:",
                event.error || event.message
            );

            if (
                runtime.generationCount === 0
            ) {
                showRuntimeError(
                    event.error ||
                    new Error(
                        event.message ||
                        "Unknown JavaScript error."
                    )
                );
            }
        }
    );


    window.addEventListener(
        "unhandledrejection",
        event => {
            console.error(
                "Unhandled promise rejection:",
                event.reason
            );

            if (
                runtime.generationCount === 0
            ) {
                showRuntimeError(
                    event.reason instanceof Error
                        ? event.reason
                        : new Error(
                            String(
                                event.reason
                            )
                        )
                );
            }
        }
    );


    /* ==========================================================
       KEYBOARD SHORTCUT
       ========================================================== */

    document.addEventListener(
        "keydown",
        event => {
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

            if (
                event.key.toLowerCase() === "g"
            ) {
                generateAndRender();
            }
        }
    );


    /* ==========================================================
       BOOT
       ========================================================== */

    function boot() {
        try {
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


    boot();

})();
