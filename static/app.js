/* ============================================================
   ABSURD CHAOS PORTFOLIO
   ------------------------------------------------------------
   PROCEDURAL FICTIONAL PORTFOLIO RENDERER

   Browser memory only.
   No localStorage.
   No sessionStorage.
   No IndexedDB.
   No cookies.
   No API.
   No database.
   No backend requests.

   Every generation can change:
   - identity
   - world
   - faction
   - UI family
   - layout
   - navigation
   - hero mode
   - density
   - decoration
   - palette
   - experiences
   - projects
   - NPCs
   - incidents
   - quests
   - timeline

   Content is card-first rather than text-wall-first.
   ============================================================ */

(() => {
    "use strict";

    /* ========================================================
       CONFIG
       ======================================================== */

    const CONFIG = window.__ABSURD_CONFIG__;

    if (!CONFIG || typeof CONFIG !== "object") {
        document.body.innerHTML = `
            <main style="
                min-height:100vh;
                display:grid;
                place-items:center;
                padding:40px;
                background:#090a0c;
                color:#f5f7fa;
                font-family:system-ui,sans-serif;
            ">
                <div style="
                    max-width:700px;
                    padding:32px;
                    border:1px solid #343944;
                    border-radius:16px;
                    background:#101216;
                ">
                    <h1>Configuration Missing</h1>
                    <p>
                        The procedural portfolio configuration was not loaded.
                    </p>
                </div>
            </main>
        `;
        return;
    }

    const runtime = {
        generatedSignatures: new Set(),
        current: null,
        generationCount: 0,
        history: [],
        npcIndex: new Map(),
        worldIndex: new Map()
    };

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
        if (
            window.crypto &&
            typeof window.crypto.getRandomValues === "function"
        ) {
            const buffer = new Uint32Array(2);

            window.crypto.getRandomValues(buffer);

            return (
                (buffer[0] * 4294967296 + buffer[1]) /
                18446744073709551616
            );
        }

        return Math.random();
    }

    function integer(min, max) {
        min = Number(min);
        max = Number(max);

        if (!Number.isFinite(min)) min = 0;
        if (!Number.isFinite(max)) max = min;

        return Math.floor(
            random() * (max - min + 1)
        ) + min;
    }

    function pick(array) {
        if (!Array.isArray(array) || !array.length) {
            return "";
        }

        return array[
            Math.floor(random() * array.length)
        ];
    }

    function sample(array, count) {
        if (!Array.isArray(array) || !array.length) {
            return [];
        }

        const copy = [...array];
        const result = [];

        count = Math.max(
            0,
            Math.min(
                Number(count) || 0,
                copy.length
            )
        );

        while (
            copy.length &&
            result.length < count
        ) {
            const index = Math.floor(
                random() * copy.length
            );

            result.push(
                copy.splice(index, 1)[0]
            );
        }

        return result;
    }

    function weightedChoice(weights) {
        const entries = Object.entries(weights || {});

        if (!entries.length) {
            return "";
        }

        const total = entries.reduce(
            (sum, [, weight]) =>
                sum + Math.max(0, Number(weight) || 0),
            0
        );

        if (total <= 0) {
            return entries[0][0];
        }

        let cursor = random() * total;

        for (const [key, weight] of entries) {
            cursor -= Math.max(
                0,
                Number(weight) || 0
            );

            if (cursor <= 0) {
                return key;
            }
        }

        return entries[entries.length - 1][0];
    }

    /* ========================================================
       TEXT HELPERS
       ======================================================== */

    function safe(value, fallback = "Unknown") {
        const text = String(
            value ?? ""
        )
            .replace(/\s+/g, " ")
            .trim();

        return text || fallback;
    }

    function safeArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .map(item => safe(item, ""))
            .filter(Boolean);
    }

    function uniqueStrings(values) {
        return [
            ...new Set(
                safeArray(values)
            )
        ];
    }

    function slug(value) {
        return String(value ?? "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function capitalize(value) {
        const text = safe(value, "");

        if (!text) {
            return "";
        }

        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );
    }

    function escapeHTML(value) {
        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;
    }

    function initials(name) {
        const result =
            String(name ?? "")
                .split(/\s+/)
                .filter(Boolean)
                .map(
                    part =>
                        part.charAt(0)
                )
                .join("")
                .slice(0, 2)
                .toUpperCase();

        return result || "?";
    }

    function formatNumber(value) {
        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "0";
        }

        return new Intl.NumberFormat(
            "en-US",
            {
                notation:
                    number > 999999
                        ? "compact"
                        : "standard",
                maximumFractionDigits: 1
            }
        ).format(number);
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

        const text =
            String(value ?? "");

        for (
            let index = 0;
            index < text.length;
            index++
        ) {
            hash ^= text.charCodeAt(index);

            hash +=
                (hash << 1) +
                (hash << 4) +
                (hash << 7) +
                (hash << 8) +
                (hash << 24);
        }

        return Math.abs(
            hash >>> 0
        ).toString(16);
    }

    function randomId() {
        return [
            Date.now().toString(36),
            integer(100000, 999999).toString(36),
            integer(100000, 999999).toString(36)
        ].join("-");
    }

    function randomDateLabel(
        minYear = 2012,
        maxYear = new Date().getFullYear() + 3
    ) {
        const year =
            integer(minYear, maxYear);

        const month =
            String(integer(1, 12))
                .padStart(2, "0");

        const day =
            String(integer(1, 28))
                .padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function randomCode() {
        return [
            pick([
                "ARC",
                "INC",
                "OPS",
                "SYS",
                "WRL",
                "NPC",
                "DEP",
                "VOID",
                "ERR",
                "SEC"
            ]),
            integer(10, 99),
            "-",
            integer(100, 999)
        ].join("");
    }

    /* ========================================================
       CONFIG ACCESS
       ======================================================== */

    function pool(name, fallback = []) {
        const value = CONFIG[name];

        return Array.isArray(value)
            ? value
            : fallback;
    }

    function configPick(
        name,
        fallback = ""
    ) {
        const values =
            pool(name);

        return values.length
            ? pick(values)
            : fallback;
    }

    function configSample(
        name,
        count,
        fallback = []
    ) {
        const values =
            pool(name, fallback);

        return sample(
            values,
            count
        );
    }

    function seedPool(name) {
        const values =
            pool(name);

        return values.filter(
            item =>
                item &&
                typeof item === "object"
        );
    }

    /* ========================================================
       WORLD GENERATION
       ======================================================== */

    function generateWorld() {
        const seeds =
            seedPool(
                "generated_world_seeds"
            );

        const seed =
            seeds.length
                ? pick(seeds)
                : {};

        const extraRules =
            configSample(
                "world_rules",
                integer(2, 5),
                [
                    "Assume the documentation is incomplete."
                ]
            );

        const factions =
            configSample(
                "factions",
                integer(3, 6),
                [
                    "Independent Operators"
                ]
            );

        const conflict =
            configPick(
                "world_conflicts",
                "Several organizations are attempting to solve the same problem differently."
            );

        const world = {
            id: randomId(),

            name: safe(
                seed.name,
                "Unnamed World"
            ),

            genre: safe(
                seed.genre,
                "speculative fiction"
            ),

            description: safe(
                seed.description,
                "A world whose infrastructure has become considerably stranger than its original documentation."
            ),

            sky: safe(
                seed.sky,
                "an unusually quiet sky"
            ),

            technology: safe(
                seed.technology,
                "mixed legacy and experimental systems"
            ),

            socialRule: safe(
                seed.social_rule,
                "Nobody agrees on who owns the infrastructure."
            ),

            danger: safe(
                seed.danger,
                "unknown"
            ),

            rule: safe(
                seed.rule,
                "Assume the documentation is incomplete."
            ),

            rules: uniqueStrings([
                seed.social_rule,
                seed.rule,
                ...extraRules
            ]),

            conflict: safe(
                conflict,
                "Several organizations are attempting to solve the same problem differently."
            ),

            factions: uniqueStrings(
                factions
            ),

            population: integer(
                9000,
                890000000
            ),

            age: integer(
                17,
                12000
            ),

            stability: integer(
                9,
                97
            ),

            classification: configPick(
                "world_classifications",
                pick([
                    "PUBLIC",
                    "RESTRICTED",
                    "CLASSIFIED",
                    "ARCHIVED",
                    "UNSTABLE",
                    "OBSERVATION ONLY"
                ])
            )
        };

        if (!world.factions.length) {
            world.factions = [
                "Independent Operators"
            ];
        }

        runtime.worldIndex.set(
            world.name,
            world
        );

        return world;
    }

    /* ========================================================
       NPC GENERATION
       ======================================================== */

    function generateNPC(
        world,
        faction,
        usedNames
    ) {
        const seeds =
            seedPool(
                "generated_npc_seeds"
            );

        const availableSeeds =
            seeds.filter(seed => {
                const name =
                    safe(
                        seed.name,
                        ""
                    );

                return (
                    name &&
                    !usedNames.has(name)
                );
            });

        let seed =
            availableSeeds.length
                ? pick(availableSeeds)
                : {};

        let name =
            safe(
                seed.name ||
                `${seed.first || ""} ${seed.last || ""}`,
                ""
            );

        if (
            !name ||
            usedNames.has(name)
        ) {
            const firstNames =
                pool(
                    "npc_first_names",
                    ["Kael"]
                );

            const lastNames =
                pool(
                    "npc_last_names",
                    ["Vey"]
                );

            let attempts = 0;

            do {
                name =
                    `${pick(firstNames)} ${pick(lastNames)}`;

                attempts++;

                if (attempts > 100) {
                    name =
                        `${name} ${integer(100, 999)}`;
                    break;
                }
            } while (
                usedNames.has(name)
            );
        }

        usedNames.add(name);

        const dialogue =
            safe(
                seed.dialogue,
                configPick(
                    "npc_dialogue",
                    "You keep calling it a bug. I call it evidence."
                )
            );

        const secret =
            safe(
                seed.secret,
                configPick(
                    "npc_secrets",
                    "Knows something nobody has successfully documented."
                )
            );

        const relationship =
            safe(
                seed.relationship,
                configPick(
                    "npc_relationships",
                    "professional contact"
                )
            );

        const npc = {
            id: randomId(),

            name,

            first: safe(
                seed.first,
                name.split(" ")[0]
            ),

            last: safe(
                seed.last,
                name.split(" ").slice(1).join(" ")
            ),

            role: safe(
                seed.role,
                configPick(
                    "npc_roles",
                    "unregistered specialist"
                )
            ),

            type: safe(
                seed.type,
                configPick(
                    "npc_types",
                    "unknown entity"
                )
            ),

            trait: safe(
                seed.trait,
                configPick(
                    "npc_traits",
                    "suspiciously competent"
                )
            ),

            relationship,

            secret,

            dialogue,

            status: safe(
                seed.status,
                configPick(
                    "statuses",
                    "UNKNOWN"
                )
            ),

            faction: safe(
                seed.faction,
                faction
            ),

            world: world.name,

            location: safe(
                seed.location,
                configPick(
                    "locations",
                    world.name
                )
            ),

            reputation: integer(
                4,
                99
            ),

            danger: safe(
                seed.risk,
                configPick(
                    "risk_levels",
                    "UNDEFINED"
                )
            ),

            age: integer(
                17,
                900
            ),

            encounters: integer(
                1,
                38
            ),

            biography:
                buildNPCBiography(
                    seed,
                    world
                ),

            rumors:
                buildNPCRumors(
                    seed,
                    world
                )
        };

        runtime.npcIndex.set(
            npc.id,
            npc
        );

        return npc;
    }

    function buildNPCBiography(
        seed,
        world
    ) {
        const first =
            safe(
                seed.first,
                "Unknown"
            );

        const role =
            safe(
                seed.role,
                "unregistered specialist"
            );

        const type =
            safe(
                seed.type,
                "unknown entity"
            );

        const trait =
            safe(
                seed.trait,
                configPick(
                    "npc_traits",
                    "quietly suspicious"
                )
            );

        const secret =
            safe(
                seed.secret,
                configPick(
                    "npc_secrets",
                    "knows more than the official record suggests"
                )
            );

        return sentence([
            `${first} is a ${type} known in ${world.name} as a ${role}.`,
            `Most records describe them as ${trait}.`,
            "Their involvement with the portfolio owner began after a routine professional interaction became considerably less routine.",
            `${capitalize(secret)}.`,
            `No reliable source agrees on what they were doing before arriving in ${world.name}.`
        ]);
    }

    function buildNPCRumors(
        seed,
        world
    ) {
        const rumors = [
            `Claims to have worked inside ${world.name} before it had its current name.`,
            "Was allegedly present during an incident that officially never happened.",
            "Keeps a private copy of an architecture diagram nobody else has seen.",
            "Has reportedly met the portfolio owner in another timeline.",
            "Refuses to explain why their access badge works in restricted locations.",
            "Once solved an infrastructure problem by asking the server a question.",
            "May have changed factions without informing anyone.",
            "Appears in historical records several decades earlier than expected.",
            "Insists that the most dangerous system in the world is a perfectly ordinary spreadsheet.",
            "Has never been photographed clearly."
        ];

        return sample(
            rumors,
            integer(2, 4)
        );
    }

    /* ========================================================
       EXPERIENCE GENERATION
       ======================================================== */

    function generateExperience(
        world,
        faction,
        specialties
    ) {
        const seeds =
            seedPool(
                "generated_experience_seeds"
            );

        const seed =
            seeds.length
                ? pick(seeds)
                : {};

        const role =
            safe(
                seed.role,
                configPick(
                    "experience_roles",
                    "Systems Engineer"
                )
            );

        const opening =
            safe(
                seed.opening,
                configPick(
                    "experience_openings",
                    "The assignment looked ordinary from a distance."
                )
            );

        const hook =
            safe(
                seed.hook,
                configPick(
                    "story_hooks",
                    "The first investigation revealed that the original assumptions were incomplete."
                )
            );

        const incident =
            safe(
                seed.incident,
                configPick(
                    "experience_incidents",
                    "a routine operation produced an unexpected system state"
                )
            );

        const turn =
            safe(
                seed.turn,
                configPick(
                    "story_turns",
                    "The investigation moved from symptoms toward system history."
                )
            );

        const lesson =
            safe(
                seed.lesson,
                configPick(
                    "experience_lessons",
                    "Reliable systems require clear assumptions, observable behavior and recovery paths."
                )
            );

        const closing =
            safe(
                seed.closing,
                configPick(
                    "closing_lines",
                    "The system eventually became boring enough to trust."
                )
            );

        const techCount =
            Math.min(
                specialties.length,
                integer(
                    3,
                    Math.min(
                        7,
                        Math.max(
                            3,
                            specialties.length
                        )
                    )
                )
            );

        const technologies =
            sample(
                specialties,
                techCount
            );

        return {
            id: randomId(),

            organization: safe(
                seed.organization,
                faction
            ),

            world: safe(
                seed.world,
                world.name
            ),

            role,

            years:
                Number(seed.years) ||
                integer(1, 9),

            status: safe(
                seed.status,
                configPick(
                    "statuses",
                    "ACTIVE"
                )
            ),

            technologies,

            opening,
            hook,
            incident,
            turn,
            lesson,
            closing,

            narrative:
                buildExperienceNarrative({
                    world,
                    faction,
                    role,
                    opening,
                    hook,
                    incident,
                    turn,
                    lesson,
                    closing,
                    technologies
                }),

            achievements:
                buildExperienceAchievements(
                    world,
                    role
                ),

            incidents:
                configSample(
                    "incident_types",
                    integer(2, 4),
                    [
                        "unexpected production event"
                    ]
                )
        };
    }

    function buildExperienceNarrative({
        world,
        faction,
        role,
        opening,
        hook,
        incident,
        turn,
        lesson,
        closing,
        technologies
    }) {
        const technologyText =
            technologies.length
                ? technologies.join(", ")
                : "systems engineering";

        return {
            summary: sentence([
                opening,
                `The official role was ${role}.`,
                `The actual assignment involved keeping infrastructure belonging to ${faction} operational inside ${world.name}.`
            ]),

            context: sentence([
                hook,
                `The work initially appeared to be conventional ${technologyText}.`
            ]),

            incident: sentence([
                incident,
                "Nobody could initially agree whether the problem was technical, operational or administrative."
            ]),

            response: sentence([
                turn,
                `The response combined ${technologyText}, explicit boundaries, observability, recovery procedures and documentation.`
            ]),

            lesson: sentence([
                lesson,
                closing
            ])
        };
    }

    function buildExperienceAchievements(
        world,
        role
    ) {
        const achievements = [
            `Stabilized a ${world.name} production environment without shutting it down.`,
            "Documented an undocumented dependency that had become operationally critical.",
            "Introduced measurable monitoring to a system previously maintained through intuition.",
            "Reduced repeated incidents by replacing manual intervention with automation.",
            "Created a recovery procedure that eventually became standard practice.",
            "Translated contradictory requirements into a working technical boundary.",
            "Recovered historical information necessary to understand the current architecture.",
            "Established an incident trail that allowed future engineers to reconstruct what happened.",
            "Removed unnecessary dependencies and accidentally made the system more reliable.",
            "Explained the same technical problem to engineers, administrators and a person wearing a crown."
        ];

        return sample(
            achievements,
            integer(3, 6)
        ).map(
            achievement =>
                `${role}: ${achievement}`
        );
    }

    /* ========================================================
       PROJECT GENERATION
       ======================================================== */

    function generateProject(
        world,
        industry,
        specialties,
        npcs
    ) {
        const seeds =
            seedPool(
                "generated_project_seeds"
            );

        const seed =
            seeds.length
                ? pick(seeds)
                : {};

        const suffix =
            pick([
                "Core",
                "Engine",
                "Platform",
                "Control",
                "Protocol",
                "Grid",
                "Stack",
                "Forge",
                "Gateway",
                "Ops",
                "Archive",
                "Network",
                "Matrix",
                "System"
            ]);

        const baseName =
            safe(
                seed.name,
                "Unnamed"
            );

        const name =
            `${baseName} ${suffix}`;

        const skills =
            sample(
                specialties,
                Math.min(
                    specialties.length,
                    integer(3, 6)
                )
            );

        const problem =
            safe(
                seed.problem,
                configPick(
                    "project_problems",
                    "the existing system had accumulated too many undocumented assumptions"
                )
            );

        const solution =
            safe(
                seed.solution,
                configPick(
                    "project_solutions",
                    "introduce explicit boundaries, observability and automated recovery"
                )
            );

        const failure =
            safe(
                seed.failure,
                configPick(
                    "project_failures",
                    "a routine deployment exposed a previously unknown dependency"
                )
            );

        const outcome =
            safe(
                seed.outcome,
                configPick(
                    "project_outcomes",
                    "the system became stable enough for ordinary disasters"
                )
            );

        const client =
            npcs.length
                ? pick(npcs)
                : null;

        const type =
            safe(
                seed.type,
                configPick(
                    "project_types",
                    "infrastructure project"
                )
            );

        return {
            id: randomId(),

            name,

            type,

            industry: safe(
                seed.industry,
                industry
            ),

            world: safe(
                seed.world,
                world.name
            ),

            skills,

            client: client
                ? client.name
                : "Unknown client",

            problem,
            solution,
            failure,
            outcome,

            status: pick([
                "Production",
                "Maintained",
                "Scaling",
                "Research",
                "Archived",
                "Classified",
                "Operational",
                "Partially Operational"
            ]),

            complexity: integer(
                21,
                99
            ),

            users: integer(
                100,
                850000
            ),

            duration: integer(
                2,
                48
            ),

            narrative:
                buildProjectNarrative({
                    name,
                    type,
                    world,
                    industry,
                    problem,
                    solution,
                    failure,
                    outcome,
                    skills,
                    client
                }),

            technicalNotes:
                buildTechnicalNotes(
                    skills,
                    type
                )
        };
    }

    function buildProjectNarrative({
        name,
        type,
        world,
        industry,
        problem,
        solution,
        failure,
        outcome,
        skills,
        client
    }) {
        const clientName =
            client
                ? safe(
                    client.name,
                    "an unnamed client"
                )
                : "an unnamed client";

        const skillText =
            skills.length
                ? skills.join(", ")
                : "systems engineering";

        return {
            summary: sentence([
                `PROJECT ${name} was commissioned as a ${type} for ${industry}.`,
                `It eventually became useful infrastructure inside ${world.name}.`
            ]),

            problem: sentence([
                "The initial requirement sounded simple.",
                `The project existed because ${problem}.`
            ]),

            architecture: sentence([
                "The architecture favored clear interfaces, observable state, recoverable failures and explicit ownership.",
                `The implementation centered around ${skillText}.`
            ]),

            client: sentence([
                `The primary requester was ${clientName}.`,
                "Their most important requirement was not written in the original specification."
            ]),

            failure: sentence([
                `That hidden requirement surfaced when ${failure}.`
            ]),

            solution: sentence([
                `The response was to ${solution}.`,
                "This reduced unknown failure modes and made the system easier to reason about."
            ]),

            outcome: sentence([
                `The project eventually reached a state where ${outcome}.`,
                "The final lesson was that good infrastructure does not prevent strange events; it makes them easier to survive."
            ])
        };
    }

    function buildTechnicalNotes(
        skills,
        type
    ) {
        const skillText =
            skills.length
                ? skills.slice(0, 3).join(", ")
                : "systems engineering";

        const notes = [
            `Architecture: modular ${type}`,
            `Primary stack: ${skillText}`,
            "Failure strategy: observable, recoverable, documented",
            "Deployment model: automated where practical",
            "Operational philosophy: boring infrastructure, interesting outcomes",
            "Maintenance requirement: someone must understand why each component exists"
        ];

        return sample(
            notes,
            integer(4, 6)
        );
    }

    /* ========================================================
       INCIDENT GENERATION
       ======================================================== */

    function generateIncident(
        world,
        npcs,
        projects
    ) {
        const seeds =
            seedPool(
                "generated_incident_seeds"
            );

        const seed =
            seeds.length
                ? pick(seeds)
                : {};

        const witness =
            npcs.length
                ? pick(npcs)
                : null;

        const project =
            projects.length
                ? pick(projects)
                : null;

        const type =
            safe(
                seed.type,
                configPick(
                    "incident_types",
                    "unknown production event"
                )
            );

        const incident = {
            id: randomId(),

            code: randomCode(),

            world: safe(
                seed.world,
                world.name
            ),

            type,

            opener: safe(
                seed.opener,
                configPick(
                    "incident_openers",
                    "Without warning"
                )
            ),

            consequence: safe(
                seed.consequence,
                configPick(
                    "incident_consequences",
                    "the system entered an unexpected state"
                )
            ),

            risk: safe(
                seed.risk,
                configPick(
                    "risk_levels",
                    "UNDEFINED"
                )
            ),

            status: safe(
                seed.status,
                configPick(
                    "statuses",
                    "UNDER INVESTIGATION"
                )
            ),

            witness: witness
                ? witness.name
                : "Unknown",

            project: project
                ? project.name
                : "Unassigned",

            date:
                safe(
                    seed.date,
                    randomDateLabel()
                ),

            narrative:
                buildIncidentNarrative({
                    world,
                    seed,
                    witness,
                    project
                })
        };

        return incident;
    }

    function buildIncidentNarrative({
        world,
        seed,
        witness,
        project
    }) {
        const type =
            safe(
                seed.type,
                "unknown production event"
            );

        const opener =
            safe(
                seed.opener,
                "Without warning"
            );

        const consequence =
            safe(
                seed.consequence,
                "the environment entered an unexpected state"
            );

        const witnessText =
            witness
                ? `${witness.name}, a ${witness.role},`
                : "One unidentified witness";

        const projectText =
            project
                ? `The event was connected to ${project.name}.`
                : "No project was officially associated with the event.";

        return {
            summary: sentence([
                opener,
                `an incident classified as ${type} occurred in ${world.name}.`,
                projectText
            ]),

            observation: sentence([
                witnessText,
                "reported that the environment behaved differently from every previous observation."
            ]),

            consequence: sentence([
                `The immediate consequence was that ${consequence}.`
            ]),

            response:
                "The incident remained open until the evidence was documented clearly enough for another engineer to reproduce the conditions.",

            recommendation:
                "Do not assume that an impossible state is impossible merely because the dashboard has never displayed it before."
        };
    }

    /* ========================================================
       QUEST GENERATION
       ======================================================== */

    function generateQuest(
        world,
        npcs,
        faction
    ) {
        const seeds =
            seedPool(
                "generated_quest_seeds"
            );

        const seed =
            seeds.length
                ? pick(seeds)
                : {};

        const client =
            npcs.length
                ? pick(npcs)
                : null;

        const objective =
            safe(
                seed.objective,
                configPick(
                    "quests",
                    "Investigate an unresolved infrastructure problem"
                )
            );

        const reward =
            safe(
                seed.reward,
                configPick(
                    "quest_rewards",
                    "Archive favor"
                )
            );

        const risk =
            safe(
                seed.risk,
                configPick(
                    "risk_levels",
                    "ELEVATED"
                )
            );

        const assignedBy =
            client
                ? client.name
                : faction;

        return {
            id: randomId(),

            world: safe(
                seed.world,
                world.name
            ),

            objective,

            reward,

            risk,

            client: safe(
                seed.client,
                faction
            ),

            status: safe(
                seed.status,
                configPick(
                    "statuses",
                    "ACTIVE"
                )
            ),

            assignedBy,

            description:
                buildQuestDescription({
                    world,
                    objective,
                    reward,
                    risk
                })
        };
    }

    function buildQuestDescription({
        world,
        objective,
        reward,
        risk
    }) {
        return sentence([
            `The assignment originates in ${world.name}.`,
            `Objective: ${objective}.`,
            `Expected difficulty: ${risk}.`,
            `Compensation: ${reward}.`,
            "The task appears straightforward when written as a sentence.",
            "The sentence does not contain enough information to explain why previous teams refused it."
        ]);
    }

    /* ========================================================
       TIMELINE
       ======================================================== */

    function generateTimeline(
        years,
        industry,
        experiences
    ) {
        const currentYear =
            new Date().getFullYear();

        const startYear =
            Math.max(
                2012,
                currentYear - years
            );

        const events = [];

        const count =
            Math.max(
                6,
                Math.min(
                    11,
                    experiences.length + 3
                )
            );

        const titles = [
            "Entered the field",
            "First production system",
            "First serious outage",
            "Architecture responsibility",
            "Automation phase",
            "Infrastructure migration",
            "Incident response period",
            "Independent engineering",
            "Cross-world assignment",
            "Archive reconstruction",
            "Current operation"
        ];

        for (
            let index = 0;
            index < count;
            index++
        ) {
            const progress =
                index /
                Math.max(
                    count - 1,
                    1
                );

            const year =
                Math.round(
                    startYear +
                    progress *
                        (currentYear - startYear)
                );

            let title =
                titles[index] ||
                "Continued operation";

            let text =
                "Built, maintained, documented and occasionally questioned the decision to deploy this on Friday.";

            if (
                index <
                experiences.length
            ) {
                const experience =
                    experiences[index];

                title =
                    safe(
                        experience.role,
                        title
                    );

                text =
                    sentence([
                        experience.opening,
                        experience.lesson
                    ]);
            }

            if (
                index ===
                count - 1
            ) {
                title =
                    "Current operation";

                text =
                    `Currently operating across ${safe(
                        industry,
                        "software infrastructure"
                    )}, while maintaining an unhealthy amount of curiosity about systems nobody else wants to investigate.`;
            }

            events.push({
                year,
                title,
                text
            });
        }

        return events;
    }

    /* ========================================================
       PALETTES
       --------------------------------------------------------
       IMPORTANT:
       This is deliberately explicit.
       No placeholder syntax.
       ======================================================== */

    function choosePalette(
        family
    ) {
        const palettes = {
            executive: {
                accent: "#8b7cff",
                accent2: "#58e0bd",
                background: "#090a0c",
                surface: "#101216"
            },

            terminal: {
                accent: "#73ff8f",
                accent2: "#4fdcff",
                background: "#050806",
                surface: "#0b120d"
            },

            rpg: {
                accent: "#d69bff",
                accent2: "#ffd166",
                background: "#0d0914",
                surface: "#15101d"
            },

            manhwa: {
                accent: "#ff5e7a",
                accent2: "#63d8ff",
                background: "#0e0a10",
                surface: "#171019"
            },

            dossier: {
                accent: "#d8b36a",
                accent2: "#82a7a0",
                background: "#0d0d0b",
                surface: "#161613"
            },

            research: {
                accent: "#64a9ff",
                accent2: "#67e0ca",
                background: "#080c12",
                surface: "#101721"
            },

            luxury: {
                accent: "#d7b36a",
                accent2: "#efe0b0",
                background: "#0a0908",
                surface: "#151310"
            },

            brutalist: {
                accent: "#ff5b45",
                accent2: "#ffe14d",
                background: "#f2efe8",
                surface: "#ffffff"
            },

            space: {
                accent: "#8b8dff",
                accent2: "#59e4ff",
                background: "#050712",
                surface: "#0c1020"
            },

            detective: {
                accent: "#c9a35b",
                accent2: "#7ba7a1",
                background: "#0b0b0a",
                surface: "#151412"
            },

            spellbook: {
                accent: "#b78cff",
                accent2: "#6ee7c8",
                background: "#0d0912",
                surface: "#17101d"
            },

            underground: {
                accent: "#ff6b82",
                accent2: "#65d6c3",
                background: "#08090a",
                surface: "#111315"
            },

            newspaper: {
                accent: "#111111",
                accent2: "#555555",
                background: "#ece8dc",
                surface: "#faf8f1"
            },

            "operating-system": {
                accent: "#5ea1ff",
                accent2: "#7ee2ff",
                background: "#080b10",
                surface: "#101620"
            },

            chaotic: {
                accent: "#ff4fd8",
                accent2: "#6affdb",
                background: "#0a070c",
                surface: "#140d18"
            }
        };

        return (
            palettes[family] ||
            palettes.executive
        );
    }

    /* ========================================================
       UI DNA
       ======================================================== */

    function generateUIDNA({
        world,
        title,
        personality,
        genre,
        chaos,
        specialties
    }) {
        const families =
            Array.isArray(
                CONFIG.ui_families
            ) &&
            CONFIG.ui_families.length
                ? CONFIG.ui_families
                : [
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
                    "chaotic"
                ];

        const weights = {};

        for (
            const family of families
        ) {
            weights[family] = 1;
        }

        function addWeight(
            key,
            amount
        ) {
            if (
                Object.prototype.hasOwnProperty.call(
                    weights,
                    key
                )
            ) {
                weights[key] += amount;
            }
        }

        if (
            /backend|platform|systems|devops|infrastructure/i.test(
                title
            )
        ) {
            addWeight(
                "terminal",
                5
            );

            addWeight(
                "operating-system",
                4
            );

            addWeight(
                "executive",
                2
            );
        }

        if (
            /research|AI|data|science/i.test(
                title
            )
        ) {
            addWeight(
                "research",
                5
            );

            addWeight(
                "space",
                2
            );
        }

        if (
            /security/i.test(
                title
            )
        ) {
            addWeight(
                "dossier",
                5
            );

            addWeight(
                "detective",
                4
            );
        }

        if (
            /creative|designer/i.test(
                title
            )
        ) {
            addWeight(
                "manhwa",
                4
            );

            addWeight(
                "luxury",
                3
            );
        }

        if (
            /fantasy|manhwa|dark fantasy/i.test(
                genre
            )
        ) {
            addWeight(
                "rpg",
                5
            );

            addWeight(
                "spellbook",
                5
            );

            addWeight(
                "manhwa",
                4
            );
        }

        if (
            /space|science fiction/i.test(
                safe(
                    world.genre,
                    genre
                )
            )
        ) {
            addWeight(
                "space",
                6
            );

            addWeight(
                "research",
                3
            );
        }

        if (
            chaos > 78
        ) {
            addWeight(
                "chaotic",
                7
            );

            addWeight(
                "brutalist",
                3
            );

            addWeight(
                "underground",
                3
            );
        }

        if (
            /methodical/i.test(
                personality
            )
        ) {
            addWeight(
                "executive",
                4
            );

            addWeight(
                "research",
                2
            );
        }

        if (
            /chaotic/i.test(
                personality
            )
        ) {
            addWeight(
                "chaotic",
                6
            );
        }

        const family =
            weightedChoice(
                weights
            ) ||
            pick(families);

        const layouts =
            Array.isArray(
                CONFIG.layouts
            ) &&
            CONFIG.layouts.length
                ? CONFIG.layouts
                : [
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
                    "dense-grid"
                ];

        const navs =
            Array.isArray(
                CONFIG.navs
            ) &&
            CONFIG.navs.length
                ? CONFIG.navs
                : [
                    "top",
                    "rail",
                    "floating",
                    "command",
                    "minimal",
                    "drawer"
                ];

        const heroModes =
            Array.isArray(
                CONFIG.hero_modes
            ) &&
            CONFIG.hero_modes.length
                ? CONFIG.hero_modes
                : [
                    "identity",
                    "mission",
                    "profile",
                    "case",
                    "status",
                    "command",
                    "character",
                    "manifesto",
                    "classified",
                    "field-report"
                ];

        const palette =
            choosePalette(
                family
            );

        let density;

        if (
            chaos > 82
        ) {
            density = "compact";
        } else if (
            chaos < 45
        ) {
            density = "spacious";
        } else {
            density =
                pick([
                    "compact",
                    "normal",
                    "spacious"
                ]);
        }

        const decoration =
            chaos > 80
                ? pick([
                    "grid",
                    "dots",
                    "scanlines"
                ])
                : pick([
                    "none",
                    "grid",
                    "dots"
                ]);

        return {
            family,

            layout:
                pick(layouts),

            nav:
                pick(navs),

            hero:
                pick(heroModes),

            density,

            decoration,

            radius:
                integer(0, 24),

            accent:
                palette.accent,

            accent2:
                palette.accent2,

            background:
                palette.background,

            surface:
                palette.surface,

            personality,

            chaos,

            specialtyCount:
                specialties.length,

            /*
             * Kept for compatibility with the existing
             * UI system. Rendering itself remains card-first.
             */
            longForm: false,
            textHeavy: false,
            cardFirst: true
        };
    }

    /* ========================================================
       PORTFOLIO GENERATION
       ======================================================== */

    function generatePortfolio() {
        const world =
            generateWorld();

        const name =
            safe(
                configPick(
                    "names",
                    "Unknown Engineer"
                ),
                "Unknown Engineer"
            );

        const title =
            safe(
                configPick(
                    "titles",
                    "Software Engineer"
                ),
                "Software Engineer"
            );

        const personality =
            safe(
                configPick(
                    "personalities",
                    "systems-minded"
                ),
                "systems-minded"
            );

        const industry =
            safe(
                configPick(
                    "industries",
                    "software infrastructure"
                ),
                "software infrastructure"
            );

        const education =
            safe(
                configPick(
                    "education",
                    "Self-taught engineering background"
                ),
                "Self-taught engineering background"
            );

        const faction =
            safe(
                pick(
                    world.factions.length
                        ? world.factions
                        : pool(
                            "factions",
                            [
                                "Independent Operators"
                            ]
                        )
                ),
                "Independent Operators"
            );

        const genre =
            safe(
                world.genre,
                "speculative fiction"
            );

        const specialties =
            configSample(
                "specialties",
                integer(6, 11),
                [
                    "Python",
                    "JavaScript",
                    "Systems Design",
                    "Automation",
                    "Web Development",
                    "Infrastructure"
                ]
            );

        const years =
            integer(3, 19);

        const chaos =
            integer(38, 100);

        const npcCount =
            integer(6, 11);

        const projectCount =
            integer(5, 9);

        const experienceCount =
            integer(4, 7);

        const incidentCount =
            integer(4, 8);

        const questCount =
            integer(2, 5);

        /* ---------------- NPCs ---------------- */

        const npcs = [];

        const usedNPCNames =
            new Set();

        for (
            let index = 0;
            index < npcCount;
            index++
        ) {
            npcs.push(
                generateNPC(
                    world,
                    faction,
                    usedNPCNames
                )
            );
        }

        /* ---------------- Experiences ---------------- */

        const experiences = [];

        for (
            let index = 0;
            index < experienceCount;
            index++
        ) {
            experiences.push(
                generateExperience(
                    world,
                    faction,
                    specialties
                )
            );
        }

        /* ---------------- Projects ---------------- */

        const projects = [];

        for (
            let index = 0;
            index < projectCount;
            index++
        ) {
            projects.push(
                generateProject(
                    world,
                    industry,
                    specialties,
                    npcs
                )
            );
        }

        /* ---------------- Incidents ---------------- */

        const incidents = [];

        for (
            let index = 0;
            index < incidentCount;
            index++
        ) {
            incidents.push(
                generateIncident(
                    world,
                    npcs,
                    projects
                )
            );
        }

        /* ---------------- Quests ---------------- */

        const quests = [];

        for (
            let index = 0;
            index < questCount;
            index++
        ) {
            quests.push(
                generateQuest(
                    world,
                    npcs,
                    faction
                )
            );
        }

        /* ---------------- UI ---------------- */

        const ui =
            generateUIDNA({
                world,
                title,
                personality,
                genre,
                chaos,
                specialties
            });

        /* ---------------- Metrics ---------------- */

        const metrics = {
            deployments:
                integer(180, 1800),

            systems:
                integer(7, 49),

            incidents:
                integer(8, 72),

            users:
                integer(2500, 99000000),

            uptime:
                (
                    99 +
                    random() * 0.99
                ).toFixed(2),

            coffee:
                integer(731, 29821),

            worldsVisited:
                integer(2, 19),

            unresolvedMysteries:
                integer(1, 37),

            realityStability:
                integer(11, 99)
        };

        /* ---------------- Timeline ---------------- */

        const timeline =
            generateTimeline(
                years,
                industry,
                experiences
            );

        /* ---------------- Archive dates ---------------- */

        const currentYear =
            new Date().getFullYear();

        const earliestYear =
            Math.max(
                2012,
                currentYear - years
            );

        const createdYear =
            integer(
                earliestYear,
                currentYear
            );

        const updatedYear =
            integer(
                createdYear,
                currentYear + 1
            );

        const created =
            `${createdYear}-${String(
                integer(1, 12)
            ).padStart(2, "0")}-${String(
                integer(1, 28)
            ).padStart(2, "0")}`;

        const lastUpdated =
            `${updatedYear}-${String(
                integer(1, 12)
            ).padStart(2, "0")}-${String(
                integer(1, 28)
            ).padStart(2, "0")}`;

        const archive = {
            classification:
                configPick(
                    "archive_classifications",
                    pick([
                        "PUBLIC",
                        "PARTIALLY CLASSIFIED",
                        "RESTRICTED",
                        "CONFIDENTIAL",
                        "ARCHIVED",
                        "DO NOT DISTRIBUTE"
                    ])
                ),

            created,

            lastUpdated,

            author:
                name,

            archiveNumber:
                randomCode(),

            warning:
                configPick(
                    "archive_warnings",
                    pick([
                        "Some records may describe events that have not happened yet.",
                        "Several names have been redacted for reasons nobody can explain.",
                        "This archive is considered structurally harmless.",
                        "Reading beyond this point is technically optional.",
                        "The archive has requested that it not be deleted.",
                        "Cross-reference inconsistencies are expected."
                    ])
                )
        };

        const portfolio = {
            id:
                randomId(),

            name,

            title,

            personality,

            specialties,

            industry,

            education,

            years,

            world,

            faction,

            genre,

            chaos,

            ui,

            metrics,

            experiences,

            projects,

            npcs,

            incidents,

            quests,

            timeline,

            archive,

            quest:
                quests[0] || null
        };

        portfolio.signature =
            makeSignature(
                portfolio
            );

        return portfolio;
    }

    /* ========================================================
       SIGNATURE
       ======================================================== */

    function makeSignature(
        portfolio
    ) {
        return hashString([
            portfolio.name,
            portfolio.title,
            portfolio.world.name,
            portfolio.faction,
            portfolio.genre,
            portfolio.ui.family,
            portfolio.ui.layout,
            portfolio.ui.nav,
            portfolio.ui.hero,

            portfolio.experiences
                .map(
                    item =>
                        item.id
                )
                .join(","),

            portfolio.projects
                .map(
                    item =>
                        item.id
                )
                .join(","),

            portfolio.npcs
                .map(
                    item =>
                        item.id
                )
                .join(","),

            portfolio.incidents
                .map(
                    item =>
                        item.code
                )
                .join(",")
        ].join("|"));
    }

    function generateUniquePortfolio() {
        let portfolio = null;

        for (
            let attempt = 0;
            attempt < 100;
            attempt++
        ) {
            portfolio =
                generatePortfolio();

            if (
                !runtime.generatedSignatures.has(
                    portfolio.signature
                )
            ) {
                runtime.generatedSignatures.add(
                    portfolio.signature
                );

                return portfolio;
            }
        }

        return portfolio;
    }

    /* ========================================================
       THEME
       ======================================================== */

    function applyTheme(
        portfolio
    ) {
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

        root.dataset.uiFamily =
            ui.family;
    }

    /* ========================================================
       NAVIGATION
       ======================================================== */

    function navLink(
        target,
        label
    ) {
        return `
            <a
                class="nav-link"
                href="#${escapeHTML(target)}"
            >
                ${escapeHTML(label)}
            </a>
        `;
    }

    function renderNavigation(
        portfolio
    ) {
        const nav =
            portfolio.ui.nav;

        const links = [
            navLink(
                "archive",
                "Archive"
            ),

            navLink(
                "experiences",
                "Experiences"
            ),

            navLink(
                "work",
                "Projects"
            ),

            navLink(
                "world",
                "World"
            ),

            navLink(
                "characters",
                "NPCs"
            ),

            navLink(
                "incidents",
                "Incidents"
            ),

            navLink(
                "quests",
                "Quests"
            )
        ].join("");

        const buttonLabel =
            nav === "rail"
                ? "New Reality"
                : "Generate";

        return `
            <nav
                class="nav ${
                    nav === "rail"
                        ? "nav-rail"
                        : ""
                }"
                aria-label="Archive navigation"
            >

                ${links}

                <button
                    class="action-button"
                    type="button"
                    data-generate
                >
                    ${escapeHTML(
                        buttonLabel
                    )}
                </button>

            </nav>
        `;
    }

    /* ========================================================
       TOPBAR
       ======================================================== */

    function renderTopbar(
        portfolio
    ) {
        return `
            <header class="topbar">

                <div class="brand">

                    <div class="brand-mark">
                        ${escapeHTML(
                            initials(
                                portfolio.name
                            )
                        )}
                    </div>

                    <div class="brand-text">
                        ${escapeHTML(
                            portfolio.name
                        )}
                        /
                        ${escapeHTML(
                            portfolio.archive
                                .archiveNumber
                        )}
                    </div>

                </div>

                ${renderNavigation(
                    portfolio
                )}

            </header>
        `;
    }

    /* ========================================================
       HERO
       ======================================================== */

    function renderHero(
        portfolio
    ) {
        const heroCopy = {
            identity:
                `Professional engineer. Unofficial resident of ${portfolio.world.name}.`,

            mission:
                `Building reliable systems while surviving the local laws of ${portfolio.world.genre}.`,

            profile:
                `A ${portfolio.personality} engineer operating across ${portfolio.industry}.`,

            case:
                `Case file opened: ${portfolio.name} has been observed shipping production systems.`,

            status:
                `STATUS: ${pick([
                    "OPERATIONAL",
                    "ACTIVE",
                    "UNREASONABLY PRODUCTIVE",
                    "UNVERIFIED",
                    "UNDER OBSERVATION"
                ])}`,

            command:
                `Command interface for a ${safe(
                    portfolio.title,
                    "software engineer"
                ).toLowerCase()} with ${portfolio.years} years of accumulated engineering damage.`,

            character:
                `Character profile unlocked: ${portfolio.name}.`,

            manifesto:
                "Make the system understandable. Then make it impossible for the system to surprise you.",

            classified:
                "This record was not originally intended to become a portfolio.",

            "field-report":
                `Field report from ${portfolio.world.name}: engineer remains operational. Infrastructure remains questionable.`
        };

        return `
            <section
                class="hero"
                id="archive"
            >

                <div class="hero-grid">

                    <div>

                        <div class="eyebrow">

                            ${escapeHTML(
                                portfolio.archive
                                    .classification
                            )}

                            /

                            ${escapeHTML(
                                portfolio.world.genre
                            )}

                        </div>

                        <h1>
                            ${escapeHTML(
                                portfolio.name
                            )}
                        </h1>

                        <p class="hero-title">

                            ${escapeHTML(
                                portfolio.title
                            )}

                            ·

                            ${escapeHTML(
                                heroCopy[
                                    portfolio.ui.hero
                                ] ||
                                heroCopy.identity
                            )}

                        </p>

                        <div class="hero-actions">

                            <a
                                class="primary-button"
                                href="#experiences"
                            >
                                Open Record
                            </a>

                            <button
                                class="secondary-button"
                                type="button"
                                data-generate
                            >
                                Generate Another Reality
                            </button>

                        </div>

                    </div>

                    <div class="hero-meta">

                        ${metaBox(
                            "Current World",
                            portfolio.world.name
                        )}

                        ${metaBox(
                            "Faction",
                            portfolio.faction
                        )}

                        ${metaBox(
                            "Experience",
                            `${portfolio.years} years`
                        )}

                        ${metaBox(
                            "Chaos Index",
                            `${portfolio.chaos}/100`
                        )}

                        ${metaBox(
                            "Archive Status",
                            portfolio.archive
                                .classification
                        )}

                        ${metaBox(
                            "Reality Stability",
                            `${portfolio.metrics.realityStability}%`
                        )}

                    </div>

                </div>

            </section>
        `;
    }

    function metaBox(
        label,
        value
    ) {
        return `
            <div class="meta-box">

                <span class="meta-label">
                    ${escapeHTML(
                        label
                    )}
                </span>

                <span class="meta-value">
                    ${escapeHTML(
                        safe(
                            value,
                            "Unknown"
                        )
                    )}
                </span>

            </div>
        `;
    }

    /* ========================================================
       STATS
       ======================================================== */

    function renderStats(
        portfolio
    ) {
        return `
            <section class="section">

                <div class="stat-grid">

                    ${stat(
                        portfolio.metrics.systems,
                        "production systems"
                    )}

                    ${stat(
                        portfolio.metrics.deployments,
                        "deployments"
                    )}

                    ${stat(
                        `${portfolio.metrics.uptime}%`,
                        "reported uptime"
                    )}

                    ${stat(
                        formatNumber(
                            portfolio.metrics.users
                        ),
                        "users / records"
                    )}

                </div>

            </section>
        `;
    }

    function stat(
        value,
        label
    ) {
        return `
            <article class="stat card">

                <span class="stat-number">
                    ${escapeHTML(
                        value
                    )}
                </span>

                <span class="stat-label">
                    ${escapeHTML(
                        label
                    )}
                </span>

            </article>
        `;
    }

    /* ========================================================
       SECTION HEADER
       ======================================================== */

    function sectionHeader(
        kicker,
        title,
        description
    ) {
        return `
            <div class="section-header">

                <div>

                    <div class="section-kicker">
                        ${escapeHTML(
                            kicker
                        )}
                    </div>

                    <h2>
                        ${escapeHTML(
                            title
                        )}
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

    /* ========================================================
       SMALL CARD HELPERS
       ======================================================== */

    function infoCard(
        label,
        value,
        extraClass = ""
    ) {
        return `
            <article
                class="card content-card ${extraClass}"
            >

                <span class="meta-label">
                    ${escapeHTML(
                        label
                    )}
                </span>

                <p class="card-text">
                    ${escapeHTML(
                        safe(
                            value,
                            "Unknown"
                        )
                    )}
                </p>

            </article>
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
                    ${escapeHTML(
                        label
                    )}
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

    function tagList(
        values,
        className = ""
    ) {
        const list =
            safeArray(values);

        if (!list.length) {
            return "";
        }

        return `
            <div
                class="tags ${className}"
            >

                ${list
                    .map(
                        value => `
                            <span class="tag">
                                ${escapeHTML(
                                    value
                                )}
                            </span>
                        `
                    )
                    .join("")}

            </div>
        `;
    }

    /* ========================================================
       PROFILE
       ======================================================== */

    function renderProfile(
        portfolio
    ) {
        const primarySpecialty =
            portfolio.specialties[0] ||
            "Systems Engineering";

        const secondarySpecialty =
            portfolio.specialties[1] ||
            primarySpecialty;

        return `
            <section
                class="section"
                id="profile"
            >

                ${sectionHeader(
                    "Subject Profile",
                    "The person behind the incidents.",
                    `${portfolio.name} operates as a ${portfolio.title} with a focus on ${portfolio.specialties
                        .slice(0, 5)
                        .join(", ")}.`
                )}

                <div class="card-grid profile-card-grid">

                    ${textCard(
                        "Operating Profile",
                        `${portfolio.name} is a ${portfolio.personality} ${portfolio.title.toLowerCase()} working primarily in ${portfolio.industry}.`
                    )}

                    ${textCard(
                        "Background",
                        `The formal record lists ${portfolio.education} as the primary educational background. The informal record contains references to ${portfolio.metrics.worldsVisited} worlds, ${portfolio.metrics.unresolvedMysteries} unresolved mysteries and an unreasonable number of systems that were supposedly temporary.`
                    )}

                    ${textCard(
                        "Engineering Philosophy",
                        "Use appropriate technology, make failure visible, automate repetitive work, document important decisions, and never assume that a system is simple merely because the interface has only one button."
                    )}

                </div>

                <div class="card-grid profile-facts">

                    ${renderProfileFact(
                        "Primary Specialty",
                        primarySpecialty
                    )}

                    ${renderProfileFact(
                        "Secondary Specialty",
                        secondarySpecialty
                    )}

                    ${renderProfileFact(
                        "Current World",
                        portfolio.world.name
                    )}

                    ${renderProfileFact(
                        "World Classification",
                        portfolio.world.classification
                    )}

                    ${renderProfileFact(
                        "Education",
                        portfolio.education
                    )}

                    ${renderProfileFact(
                        "Professional Status",
                        portfolio.archive.classification
                    )}

                </div>

                <article class="card skills-card">

                    <div class="section-kicker">
                        Core Specialties
                    </div>

                    ${tagList(
                        portfolio.specialties
                    )}

                </article>

            </section>
        `;
    }

    function renderProfileFact(
        label,
        value
    ) {
        return `
            <article class="card content-card">

                <span class="meta-label">
                    ${escapeHTML(
                        label
                    )}
                </span>

                <h3 class="card-title">
                    ${escapeHTML(
                        safe(
                            value
                        )
                    )}
                </h3>

            </article>
        `;
    }

    /* ========================================================
       EXPERIENCES
       ======================================================== */

    function renderExperiences(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="experiences"
            >

                ${sectionHeader(
                    "Experience Archive",
                    "The jobs were normal. The circumstances were not.",
                    "Professional records from organizations, worlds and systems that somehow considered these assignments reasonable."
                )}

                <div class="experience-stack">

                    ${portfolio.experiences
                        .map(
                            (
                                experience,
                                index
                            ) =>
                                renderExperience(
                                    experience,
                                    index
                                )
                        )
                        .join("")}

                </div>

            </section>
        `;
    }

    function renderExperience(
        experience,
        index
    ) {
        const narrative =
            experience.narrative ||
            {};

        return `
            <article
                class="experience dossier-entry card"
                id="experience-${index + 1}"
            >

                <div class="experience-header">

                    <div>

                        <div class="eyebrow">
                            RECORD
                            ${String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}
                        </div>

                        <h3>
                            ${escapeHTML(
                                experience.role
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                experience.organization
                            )}
                            /
                            ${escapeHTML(
                                experience.world
                            )}
                        </p>

                    </div>

                    <div class="experience-meta">

                        <span>
                            ${escapeHTML(
                                experience.years
                            )}
                            years
                        </span>

                        <span>
                            ${escapeHTML(
                                experience.status
                            )}
                        </span>

                    </div>

                </div>

                <div class="experience-card-grid">

                    ${textCard(
                        "Assignment",
                        narrative.summary
                    )}

                    ${textCard(
                        "Context",
                        narrative.context
                    )}

                    ${textCard(
                        "Incident",
                        narrative.incident
                    )}

                    ${textCard(
                        "Response",
                        narrative.response
                    )}

                    ${textCard(
                        "Lesson",
                        narrative.lesson
                    )}

                </div>

                <div class="experience-lower-grid">

                    <article class="card content-card">

                        <div class="section-kicker">
                            Technologies
                        </div>

                        ${tagList(
                            experience.technologies
                        )}

                    </article>

                    <article class="card content-card">

                        <div class="section-kicker">
                            Achievements
                        </div>

                        <div class="achievement-list">

                            ${safeArray(
                                experience.achievements
                            )
                                .map(
                                    achievement => `
                                        <div class="achievement">
                                            ${escapeHTML(
                                                achievement
                                            )}
                                        </div>
                                    `
                                )
                                .join("")}

                        </div>

                    </article>

                </div>

            </article>
        `;
    }

    /* ========================================================
       PROJECTS
       ======================================================== */

    function renderProjects(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="work"
            >

                ${sectionHeader(
                    "Project Archive",
                    "Projects with unnecessarily complicated histories.",
                    "Each project is presented as a compact case file rather than a giant block of prose."
                )}

                <div class="project-grid">

                    ${portfolio.projects
                        .map(
                            (
                                project,
                                index
                            ) =>
                                renderProjectStory(
                                    project,
                                    index
                                )
                        )
                        .join("")}

                </div>

            </section>
        `;
    }

    function renderProjectStory(
        project,
        index
    ) {
        const narrative =
            project.narrative ||
            {};

        return `
            <article
                class="project-card card"
                id="project-${index + 1}"
            >

                <div class="project-card-header">

                    <div>

                        <div class="section-kicker">
                            ${escapeHTML(
                                project.type
                            )}
                        </div>

                        <div class="project-story-index">
                            ${String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}
                        </div>

                        <h3>
                            ${escapeHTML(
                                project.name
                            )}
                        </h3>

                        <p class="project-subtitle">
                            ${escapeHTML(
                                project.industry
                            )}
                            /
                            ${escapeHTML(
                                project.world
                            )}
                        </p>

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
                        `${project.complexity}/100`
                    )}

                    ${projectMetric(
                        "Users / Records",
                        formatNumber(
                            project.users
                        )
                    )}

                    ${projectMetric(
                        "Duration",
                        `${project.duration} months`
                    )}

                    ${projectMetric(
                        "Client",
                        project.client
                    )}

                </div>

                <div class="project-card-grid">

                    ${textCard(
                        "Summary",
                        narrative.summary
                    )}

                    ${textCard(
                        "Problem",
                        narrative.problem
                    )}

                    ${textCard(
                        "Architecture",
                        narrative.architecture
                    )}

                    ${textCard(
                        "Client",
                        narrative.client
                    )}

                    ${textCard(
                        "Failure",
                        narrative.failure
                    )}

                    ${textCard(
                        "Solution",
                        narrative.solution
                    )}

                    ${textCard(
                        "Outcome",
                        narrative.outcome
                    )}

                </div>

                <article class="card technical-card">

                    <div class="section-kicker">
                        Technical Notes
                    </div>

                    <div class="technical-notes">

                        ${safeArray(
                            project.technicalNotes
                        )
                            .map(
                                note => `
                                    <div class="technical-note">
                                        ${escapeHTML(
                                            note
                                        )}
                                    </div>
                                `
                            )
                            .join("")}

                    </div>

                    ${tagList(
                        project.skills
                    )}

                </article>

            </article>
        `;
    }

    function projectMetric(
        label,
        value
    ) {
        return `
            <div class="project-metric">

                <span>
                    ${escapeHTML(
                        label
                    )}
                </span>

                <strong>
                    ${escapeHTML(
                        safe(
                            value
                        )
                    )}
                </strong>

            </div>
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
                    "World File",
                    world.name,
                    world.description
                )}

                <div class="world-panel">

                    <article class="world-main card">

                        <div class="eyebrow">
                            ${escapeHTML(
                                world.classification
                            )}
                        </div>

                        <h3>
                            ${escapeHTML(
                                world.name
                            )}
                        </h3>

                        <div class="card-grid">

                            ${infoCard(
                                "Genre",
                                world.genre
                            )}

                            ${infoCard(
                                "Population",
                                `${Number(
                                    world.population
                                ).toLocaleString()} inhabitants`
                            )}

                            ${infoCard(
                                "Age",
                                `${world.age} years`
                            )}

                            ${infoCard(
                                "Stability",
                                `${world.stability}%`
                            )}

                        </div>

                        <div class="card-grid">

                            ${textCard(
                                "Environment",
                                `The sky is described as ${world.sky}.`
                            )}

                            ${textCard(
                                "Technology",
                                `Local infrastructure relies on ${world.technology}.`
                            )}

                            ${textCard(
                                "Social Rule",
                                world.socialRule
                            )}

                            ${textCard(
                                "Current Conflict",
                                world.conflict
                            )}

                        </div>

                        ${tagList([
                            world.genre,
                            world.danger,
                            world.classification
                        ])}

                    </article>

                    <aside class="world-side">

                        ${textCard(
                            "Local Rule",
                            world.rule
                        )}

                        ${textCard(
                            "Primary Danger",
                            world.danger
                        )}

                        ${textCard(
                            "Current Stability",
                            `${world.stability}%`
                        )}

                    </aside>

                </div>

                ${renderWorldRules(
                    world
                )}

                ${renderWorldFactions(
                    world
                )}

            </section>
        `;
    }

    function renderWorldRules(
        world
    ) {
        return `
            <div class="section-subblock">

                <div class="section-kicker">
                    World Rules
                </div>

                <div class="card-grid">

                    ${safeArray(
                        world.rules
                    )
                        .map(
                            (
                                rule,
                                index
                            ) => `
                                <article class="card content-card">

                                    <span class="meta-label">
                                        Rule
                                        ${String(
                                            index + 1
                                        ).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>

                                    <p class="card-text">
                                        ${escapeHTML(
                                            rule
                                        )}
                                    </p>

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
            <div class="section-subblock">

                <div class="section-kicker">
                    Active Factions
                </div>

                <div class="card-grid faction-grid">

                    ${safeArray(
                        world.factions
                    )
                        .map(
                            (
                                faction,
                                index
                            ) => `
                                <article class="card content-card">

                                    <span class="meta-label">
                                        FACTION
                                        ${String(
                                            index + 1
                                        ).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>

                                    <h3 class="card-title">
                                        ${escapeHTML(
                                            faction
                                        )}
                                    </h3>

                                </article>
                            `
                        )
                        .join("")}

                </div>

            </div>
        `;
    }

    /* ========================================================
       NPC ARCHIVE
       ======================================================== */

    function renderNPCs(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="characters"
            >

                ${sectionHeader(
                    "NPC Archive",
                    "People who definitely have their own stories.",
                    "Each contact is treated as an individual dossier so the world feels populated without creating giant text walls."
                )}

                <div class="npc-grid">

                    ${portfolio.npcs
                        .map(
                            (
                                npc,
                                index
                            ) =>
                                renderNPC(
                                    npc,
                                    index
                                )
                        )
                        .join("")}

                </div>

            </section>
        `;
    }

    function renderNPC(
        npc,
        index
    ) {
        return `
            <article
                class="npc npc-card dossier-entry card"
                id="npc-${index + 1}"
            >

                <div class="npc-avatar">
                    ${escapeHTML(
                        initials(
                            npc.name
                        )
                    )}
                </div>

                <div class="npc-content">

                    <div class="npc-heading">

                        <div>

                            <div class="section-kicker">
                                NPC
                                ${String(
                                    index + 1
                                ).padStart(
                                    2,
                                    "0"
                                )}
                            </div>

                            <h3 class="npc-name">
                                ${escapeHTML(
                                    npc.name
                                )}
                            </h3>

                            <p class="npc-role">
                                ${escapeHTML(
                                    npc.type
                                )}
                                ·
                                ${escapeHTML(
                                    npc.role
                                )}
                            </p>

                        </div>

                        <div class="npc-status">
                            ${escapeHTML(
                                npc.status
                            )}
                        </div>

                    </div>

                    <div class="npc-data">

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
                            npc.danger
                        )}

                        ${npcFact(
                            "Encounters",
                            npc.encounters
                        )}

                    </div>

                    <div class="npc-card-grid">

                        ${textCard(
                            "Biography",
                            npc.biography
                        )}

                        ${textCard(
                            "Known Secret",
                            npc.secret
                        )}

                    </div>

                    <blockquote class="npc-dialogue card">

                        <span class="meta-label">
                            Recorded Statement
                        </span>

                        <p>
                            “${escapeHTML(
                                npc.dialogue
                            )}”
                        </p>

                    </blockquote>

                    <article class="card npc-rumors">

                        <div class="section-kicker">
                            Rumors
                        </div>

                        <div class="rumor-list">

                            ${safeArray(
                                npc.rumors
                            )
                                .map(
                                    rumor => `
                                        <div class="achievement">
                                            ${escapeHTML(
                                                rumor
                                            )}
                                        </div>
                                    `
                                )
                                .join("")}

                        </div>

                    </article>

                    ${tagList([
                        npc.trait,
                        npc.type,
                        npc.danger
                    ])}

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

                <span>
                    ${escapeHTML(
                        label
                    )}
                </span>

                <strong>
                    ${escapeHTML(
                        safe(
                            value
                        )
                    )}
                </strong>

            </div>
        `;
    }

    /* ========================================================
       INCIDENT ARCHIVE
       ======================================================== */

    function renderIncidents(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="incidents"
            >

                ${sectionHeader(
                    "Incident Archive",
                    "Things that were not supposed to happen.",
                    "Every serious system eventually produces an event that becomes somebody else's story."
                )}

                <div class="incident-grid">

                    ${portfolio.incidents
                        .map(
                            (
                                incident,
                                index
                            ) =>
                                renderIncident(
                                    incident,
                                    index
                                )
                        )
                        .join("")}

                </div>

            </section>
        `;
    }

    function renderIncident(
        incident,
        index
    ) {
        const narrative =
            incident.narrative ||
            {};

        return `
            <article
                class="incident incident-card card"
                id="incident-${index + 1}"
            >

                <div class="incident-index">
                    ${String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    )}
                </div>

                <div class="incident-content">

                    <div class="incident-heading">

                        <div>

                            <div class="section-kicker">
                                ${escapeHTML(
                                    incident.code
                                )}
                            </div>

                            <h3>
                                ${escapeHTML(
                                    incident.type
                                )}
                            </h3>

                        </div>

                        <div class="incident-risk">
                            ${escapeHTML(
                                incident.risk
                            )}
                        </div>

                    </div>

                    <div class="incident-meta-line">

                        <span>
                            ${escapeHTML(
                                incident.date
                            )}
                        </span>

                        <span>
                            World:
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

                        <span>
                            Status:
                            ${escapeHTML(
                                incident.status
                            )}
                        </span>

                    </div>

                    <div class="incident-card-grid">

                        ${textCard(
                            "Summary",
                            narrative.summary
                        )}

                        ${textCard(
                            "Observation",
                            narrative.observation
                        )}

                        ${textCard(
                            "Consequence",
                            narrative.consequence
                        )}

                        ${textCard(
                            "Response",
                            narrative.response
                        )}

                        ${textCard(
                            "Recommendation",
                            narrative.recommendation
                        )}

                    </div>

                    ${infoCard(
                        "Related Project",
                        incident.project
                    )}

                </div>

            </article>
        `;
    }

    /* ========================================================
       QUEST ARCHIVE
       ======================================================== */

    function renderQuests(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="quests"
            >

                ${sectionHeader(
                    "Active Objectives",
                    "There is always another problem.",
                    "Assignments currently circulating through the fictional operational network."
                )}

                <div class="quest-grid">

                    ${portfolio.quests
                        .map(
                            (
                                quest,
                                index
                            ) =>
                                renderQuest(
                                    quest,
                                    index
                                )
                        )
                        .join("")}

                </div>

            </section>
        `;
    }

    function renderQuest(
        quest,
        index
    ) {
        return `
            <article
                class="quest quest-card card"
                id="quest-${index + 1}"
            >

                <div class="quest-header">

                    <div class="quest-label">
                        QUEST
                        ${String(
                            index + 1
                        ).padStart(
                            2,
                            "0"
                        )}
                    </div>

                    <div class="npc-status">
                        ${escapeHTML(
                            quest.status
                        )}
                    </div>

                </div>

                <h3>
                    ${escapeHTML(
                        quest.objective
                    )}
                </h3>

                <div class="quest-description card">

                    <span class="meta-label">
                        Assignment Brief
                    </span>

                    <p class="card-text">
                        ${escapeHTML(
                            quest.description
                        )}
                    </p>

                </div>

                <div class="quest-data-grid">

                    ${npcFact(
                        "World",
                        quest.world
                    )}

                    ${npcFact(
                        "Risk",
                        quest.risk
                    )}

                    ${npcFact(
                        "Assigned By",
                        quest.assignedBy
                    )}

                    ${npcFact(
                        "Client",
                        quest.client
                    )}

                </div>

                <article class="card quest-reward">

                    <span class="meta-label">
                        Reward
                    </span>

                    <strong>
                        ${escapeHTML(
                            quest.reward
                        )}
                    </strong>

                </article>

            </article>
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
                id="timeline"
            >

                ${sectionHeader(
                    "Chronology",
                    "How the situation developed.",
                    "A compact historical record of the portfolio owner's increasingly questionable career decisions."
                )}

                <div class="timeline">

                    ${portfolio.timeline
                        .map(
                            (
                                item,
                                index
                            ) => `
                                <article
                                    class="timeline-item card"
                                >

                                    <div class="timeline-year">
                                        ${escapeHTML(
                                            item.year
                                        )}
                                    </div>

                                    <div class="timeline-card-content">

                                        <span class="meta-label">
                                            EVENT
                                            ${String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        <h3 class="timeline-title">
                                            ${escapeHTML(
                                                item.title
                                            )}
                                        </h3>

                                        <p class="timeline-text">
                                            ${escapeHTML(
                                                item.text
                                            )}
                                        </p>

                                    </div>

                                </article>
                            `
                        )
                        .join("")}

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
            <section class="section">

                <article class="archive-notice card">

                    <div class="section-kicker">
                        ARCHIVE NOTICE
                    </div>

                    <h2>
                        ${escapeHTML(
                            portfolio.archive.warning
                        )}
                    </h2>

                    <div class="card-grid">

                        ${infoCard(
                            "Archive",
                            portfolio.archive.archiveNumber
                        )}

                        ${infoCard(
                            "Created",
                            portfolio.archive.created
                        )}

                        ${infoCard(
                            "Updated",
                            portfolio.archive.lastUpdated
                        )}

                        ${infoCard(
                            "Classification",
                            portfolio.archive.classification
                        )}

                    </div>

                </article>

            </section>
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

                <div>

                    <strong>
                        ${escapeHTML(
                            portfolio.name
                        )}
                    </strong>

                    <div>
                        ${escapeHTML(
                            portfolio.title
                        )}
                    </div>

                    <div>
                        Procedurally generated fictional
                        portfolio / browser memory only.
                    </div>

                </div>

                <div>

                    World:
                    ${escapeHTML(
                        portfolio.world.name
                    )}

                    <br>

                    Archive:
                    ${escapeHTML(
                        portfolio.archive
                            .archiveNumber
                    )}

                    <br>

                    Generation:
                    #${runtime.generationCount}

                    <br>

                    Signature:
                    ${escapeHTML(
                        portfolio.signature
                    )}

                </div>

            </footer>
        `;
    }

    /* ========================================================
       FULL PAGE RENDER
       ======================================================== */

    function render(
        portfolio
    ) {
        runtime.current =
            portfolio;

        runtime.generationCount++;

        runtime.history.push(
            portfolio.signature
        );

        applyTheme(
            portfolio
        );

        const ui =
            portfolio.ui;

        const app =
            document.getElementById(
                "app"
            );

        if (!app) {
            return;
        }

        /*
         * Preserve the existing UI DNA system.
         */
        app.className = [
            "app",

            `ui-${slug(
                ui.family
            )}`,

            `layout-${slug(
                ui.layout
            )}`,

            `density-${slug(
                ui.density
            )}`
        ].join(" ");

        app.dataset.decoration =
            ui.decoration;

        app.dataset.navigation =
            ui.nav;

        app.dataset.generation =
            String(
                runtime.generationCount
            );

        app.innerHTML = `
            ${renderTopbar(
                portfolio
            )}

            <main
                id="main-content"
            >

                ${renderHero(
                    portfolio
                )}

                ${renderStats(
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
            `${safe(
                portfolio.name,
                "Procedural Portfolio"
            )} — ${safe(
                portfolio.title,
                "Fictional Engineer"
            )}`;

        wireInteractions();

        announceGeneration(
            portfolio
        );

        /*
         * Instant reset.
         * Avoid relying on unsupported behavior values.
         */
        window.scrollTo(
            0,
            0
        );
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
                    event => {
                        event.preventDefault();

                        generateAndRender();
                    }
                );
            }
        );

        $$(
            "a[href^='#']"
        ).forEach(
            link => {
                link.addEventListener(
                    "click",
                    event => {
                        const target =
                            link.getAttribute(
                                "href"
                            );

                        if (
                            !target ||
                            target === "#"
                        ) {
                            return;
                        }

                        let element;

                        try {
                            element =
                                document.querySelector(
                                    target
                                );
                        } catch {
                            return;
                        }

                        if (!element) {
                            return;
                        }

                        event.preventDefault();

                        element.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "start"
                        });
                    }
                );
            }
        );
    }

    /* ========================================================
       ACCESSIBILITY ANNOUNCEMENT
       ======================================================== */

    function announceGeneration(
        portfolio
    ) {
        let live =
            document.getElementById(
                "generation-announcement"
            );

        if (!live) {
            live =
                document.createElement(
                    "div"
                );

            live.id =
                "generation-announcement";

            live.setAttribute(
                "aria-live",
                "polite"
            );

            live.setAttribute(
                "aria-atomic",
                "true"
            );

            live.style.position =
                "fixed";

            live.style.width =
                "1px";

            live.style.height =
                "1px";

            live.style.padding =
                "0";

            live.style.margin =
                "-1px";

            live.style.overflow =
                "hidden";

            live.style.clip =
                "rect(0, 0, 0, 0)";

            live.style.whiteSpace =
                "nowrap";

            live.style.border =
                "0";

            document.body.appendChild(
                live
            );
        }

        live.textContent =
            `Generated new fictional portfolio for ${safe(
                portfolio.name
            )} in ${safe(
                portfolio.world.name
            )}.`;
    }

    /* ========================================================
       GENERATE
       ======================================================== */

    function generateAndRender() {
        try {
            const next =
                generateUniquePortfolio();

            render(
                next
            );
        } catch (error) {
            showRuntimeError(
                error
            );
        }
    }

    /* ========================================================
       RUNTIME ERROR SCREEN
       --------------------------------------------------------
       Instead of silently producing a blank page, show the
       actual JavaScript error.
       ======================================================== */

    function showRuntimeError(
        error
    ) {
        console.error(
            "ABSURD CHAOS PORTFOLIO ERROR:",
            error
        );

        const app =
            document.getElementById(
                "app"
            );

        if (!app) {
            return;
        }

        const message =
            error &&
            error.message
                ? error.message
                : String(error);

        app.innerHTML = `
            <main style="
                min-height:100vh;
                display:grid;
                place-items:center;
                padding:32px;
            ">

                <article style="
                    width:min(760px,100%);
                    padding:28px;
                    border:1px solid rgba(255,255,255,.15);
                    border-radius:16px;
                    background:rgba(255,255,255,.04);
                    color:var(--text,#f5f7fa);
                    font-family:system-ui,sans-serif;
                ">

                    <div style="
                        font-size:.75rem;
                        letter-spacing:.14em;
                        text-transform:uppercase;
                        opacity:.65;
                        margin-bottom:10px;
                    ">
                        Runtime Error
                    </div>

                    <h1 style="
                        margin:0 0 12px;
                    ">
                        Portfolio generation failed
                    </h1>

                    <p style="
                        line-height:1.6;
                        opacity:.8;
                    ">
                        The page did not silently fail.
                        A JavaScript error was detected.
                    </p>

                    <pre style="
                        white-space:pre-wrap;
                        overflow:auto;
                        padding:16px;
                        border-radius:10px;
                        background:rgba(0,0,0,.3);
                    ">${escapeHTML(
                        message
                    )}</pre>

                    <button
                        type="button"
                        data-reload-page
                        style="
                            border:0;
                            border-radius:10px;
                            padding:12px 18px;
                            cursor:pointer;
                            font:inherit;
                        "
                    >
                        Reload
                    </button>

                </article>

            </main>
        `;

        const reload =
            $(
                "[data-reload-page]"
            );

        if (reload) {
            reload.addEventListener(
                "click",
                () => {
                    window.location.reload();
                }
            );
        }
    }

    /* ========================================================
       GLOBAL ERROR HANDLING
       ======================================================== */

    window.addEventListener(
        "error",
        event => {
            if (
                event &&
                event.error
            ) {
                console.error(
                    "ABSURD CHAOS GLOBAL ERROR:",
                    event.error
                );
            }
        }
    );

    window.addEventListener(
        "unhandledrejection",
        event => {
            console.error(
                "ABSURD CHAOS UNHANDLED PROMISE:",
                event.reason
            );
        }
    );

    /* ========================================================
       KEYBOARD SHORTCUT
       ======================================================== */

    document.addEventListener(
        "keydown",
        event => {
            if (
                String(
                    event.key
                ).toLowerCase() === "g" &&
                !isTypingTarget(
                    event.target
                )
            ) {
                event.preventDefault();

                generateAndRender();
            }
        }
    );

    function isTypingTarget(
        element
    ) {
        if (!element) {
            return false;
        }

        const tag =
            element.tagName;

        return (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            element.isContentEditable
        );
    }

    /* ========================================================
       BOOT
       ======================================================== */

    function boot() {
        try {
            const portfolio =
                generateUniquePortfolio();

            if (!portfolio) {
                throw new Error(
                    "Portfolio generation returned no portfolio."
                );
            }

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
