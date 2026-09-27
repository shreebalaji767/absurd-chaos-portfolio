/* ============================================================
   ABSURD CHAOS PORTFOLIO
   ------------------------------------------------------------
   PROCEDURAL FICTIONAL PORTFOLIO RENDERER

   Runtime:
   - Browser memory only
   - No localStorage
   - No sessionStorage
   - No IndexedDB
   - No cookies
   - No backend requests
   - No database
   - No API calls

   IMPORTANT:
   The UI DNA system remains procedural.

   Every generation can change:
   - UI family
   - layout
   - navigation
   - hero mode
   - density
   - decoration
   - palette
   - identity
   - world
   - NPCs
   - projects
   - experiences
   - incidents
   - quests
   - chronology

   Content is intentionally rendered as contained cards rather
   than unrestricted text walls.
   ============================================================ */

(() => {
    "use strict";

    const CONFIG = window.__ABSURD_CONFIG__;

    /* ========================================================
       CONFIGURATION FAILURE
       ======================================================== */

    if (!CONFIG) {
        document.body.innerHTML = `
            <main style="
                min-height:100vh;
                display:grid;
                place-items:center;
                padding:2rem;
                font-family:system-ui,sans-serif;
                background:#08090b;
                color:white;
            ">
                <div style="
                    max-width:42rem;
                    padding:2rem;
                    border:1px solid rgba(255,255,255,.14);
                    background:#111318;
                ">
                    <h1>Configuration Missing</h1>
                    <p>
                        The fictional archive could not be initialized.
                    </p>
                </div>
            </main>
        `;

        return;
    }

    /* ========================================================
       RUNTIME MEMORY
       ======================================================== */

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

    const $ = (
        selector,
        root = document
    ) => root.querySelector(selector);

    const $$ = (
        selector,
        root = document
    ) => [...root.querySelectorAll(selector)];

    /* ========================================================
       RANDOMNESS
       ======================================================== */

    const random = () => {
        if (
            window.crypto &&
            typeof window.crypto.getRandomValues === "function"
        ) {
            const buffer =
                new Uint32Array(2);

            window.crypto.getRandomValues(
                buffer
            );

            return (
                (
                    buffer[0] *
                    4294967296 +
                    buffer[1]
                ) /
                18446744073709551616
            );
        }

        return Math.random();
    };

    const integer = (
        min,
        max
    ) => {
        return (
            Math.floor(
                random() *
                (
                    max -
                    min +
                    1
                )
            ) +
            min
        );
    };

    const pick = (
        array
    ) => {
        if (
            !Array.isArray(array) ||
            !array.length
        ) {
            return "";
        }

        return array[
            Math.floor(
                random() *
                array.length
            )
        ];
    };

    const sample = (
        array,
        count
    ) => {
        if (
            !Array.isArray(array) ||
            !array.length
        ) {
            return [];
        }

        const copy = [...array];
        const result = [];

        while (
            copy.length &&
            result.length < count
        ) {
            const index =
                Math.floor(
                    random() *
                    copy.length
                );

            result.push(
                copy.splice(
                    index,
                    1
                )[0]
            );
        }

        return result;
    };

    const clamp = (
        value,
        min,
        max
    ) =>
        Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    /* ========================================================
       TEXT HELPERS
       ======================================================== */

    const safe = (
        value,
        fallback = "Unknown"
    ) => {
        const text =
            String(
                value ?? ""
            )
                .replace(/\s+/g, " ")
                .trim();

        return text || fallback;
    };

    const safeArray = (
        value
    ) => {
        if (
            !Array.isArray(value)
        ) {
            return [];
        }

        return value
            .map(
                item =>
                    safe(
                        item,
                        ""
                    )
            )
            .filter(Boolean);
    };

    const slug = (
        value
    ) =>
        String(
            value ?? ""
        )
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                "");

    const capitalize = (
        value
    ) => {
        const text =
            safe(
                value,
                ""
            );

        if (!text) {
            return "";
        }

        return (
            text.charAt(0)
                .toUpperCase() +
            text.slice(1)
        );
    };

    const escapeHTML = (
        value
    ) => {
        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            String(
                value ?? ""
            );

        return div.innerHTML;
    };

    const initials = (
        name
    ) => {
        const result =
            String(
                name ?? ""
            )
                .split(/\s+/)
                .filter(Boolean)
                .map(
                    part =>
                        part.charAt(0)
                )
                .join("")
                .slice(
                    0,
                    2
                )
                .toUpperCase();

        return result || "?";
    };

    const formatNumber = (
        value
    ) => {
        const number =
            Number(value);

        if (
            !Number.isFinite(
                number
            )
        ) {
            return "0";
        }

        return new Intl.NumberFormat(
            "en-US",
            {
                notation:
                    number > 999999
                        ? "compact"
                        : "standard",
                maximumFractionDigits:
                    1
            }
        ).format(
            number
        );
    };

    const hashString = (
        value
    ) => {
        let hash =
            2166136261;

        const text =
            String(
                value ?? ""
            );

        for (
            let i = 0;
            i < text.length;
            i++
        ) {
            hash ^=
                text.charCodeAt(i);

            hash +=
                (
                    hash << 1
                ) +
                (
                    hash << 4
                ) +
                (
                    hash << 7
                ) +
                (
                    hash << 8
                ) +
                (
                    hash << 24
                );
        }

        return Math.abs(
            hash >>> 0
        ).toString(16);
    };

    const randomId = () => {
        return [
            Date.now()
                .toString(36),

            integer(
                100000,
                999999
            ).toString(36),

            integer(
                100000,
                999999
            ).toString(36)
        ].join("-");
    };

    /* ========================================================
       DISPLAY HELPERS
       ======================================================== */

    function sentence(
        parts
    ) {
        return parts
            .filter(Boolean)
            .join(" ")
            .replace(
                /\s+/g,
                " "
            )
            .trim();
    }

    function randomDateLabel(
        minYear = 2012,
        maxYear = new Date()
            .getFullYear() + 3
    ) {
        const year =
            integer(
                minYear,
                maxYear
            );

        const month =
            String(
                integer(
                    1,
                    12
                )
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                integer(
                    1,
                    28
                )
            ).padStart(
                2,
                "0"
            );

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
            integer(
                10,
                99
            ),
            "-",
            integer(
                100,
                999
            )
        ].join("");
    }

    function uniqueStrings(
        values
    ) {
        return [
            ...new Set(
                safeArray(
                    values
                )
            )
        ];
    }

    /* ========================================================
       WORLD GENERATION
       ======================================================== */

    function generateWorld() {
        const seed =
            pick(
                CONFIG.generated_world_seeds
            ) || {};

        const extraRules =
            sample(
                CONFIG.world_rules,
                integer(
                    2,
                    5
                )
            );

        const factions =
            sample(
                CONFIG.factions,
                integer(
                    3,
                    6
                )
            );

        const conflict =
            pick(
                CONFIG.world_conflicts
            );

        const world = {
            id:
                randomId(),

            name:
                safe(
                    seed.name,
                    "Unnamed World"
                ),

            genre:
                safe(
                    seed.genre,
                    "speculative fiction"
                ),

            description:
                safe(
                    seed.description,
                    "A world whose infrastructure has become considerably stranger than its original documentation."
                ),

            sky:
                safe(
                    seed.sky,
                    "an unusually quiet sky"
                ),

            technology:
                safe(
                    seed.technology,
                    "mixed legacy and experimental systems"
                ),

            socialRule:
                safe(
                    seed.social_rule,
                    "Nobody agrees on who owns the infrastructure."
                ),

            danger:
                safe(
                    seed.danger,
                    "unknown"
                ),

            rule:
                safe(
                    seed.rule,
                    "Assume the documentation is incomplete."
                ),

            rules:
                uniqueStrings([
                    seed.social_rule,
                    seed.rule,
                    ...extraRules
                ]),

            conflict:
                safe(
                    conflict,
                    "Several organizations are attempting to solve the same problem differently."
                ),

            factions:
                uniqueStrings(
                    factions
                ),

            population:
                integer(
                    9000,
                    890000000
                ),

            age:
                integer(
                    17,
                    12000
                ),

            stability:
                integer(
                    9,
                    97
                ),

            classification:
                pick([
                    "PUBLIC",
                    "RESTRICTED",
                    "CLASSIFIED",
                    "ARCHIVED",
                    "UNSTABLE",
                    "OBSERVATION ONLY"
                ])
        };

        if (
            !world.factions.length
        ) {
            world.factions = [
                pick(
                    CONFIG.factions
                ) ||
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
        const availableSeeds =
            safeArray(
                CONFIG.generated_npc_seeds
            )
                .map(
                    (_, index) =>
                        CONFIG
                            .generated_npc_seeds[
                                index
                            ]
                )
                .filter(
                    seed => {
                        const name =
                            safe(
                                seed?.name,
                                ""
                            );

                        return (
                            name &&
                            !usedNames.has(
                                name
                            )
                        );
                    }
                );

        let seed =
            pick(
                availableSeeds
            );

        if (!seed) {
            seed =
                pick(
                    CONFIG.generated_npc_seeds
                ) || {};
        }

        const name =
            safe(
                seed.name ||
                `${seed.first || ""} ${seed.last || ""}`,
                "Unknown Contact"
            );

        usedNames.add(
            name
        );

        const dialogue =
            safe(
                seed.dialogue,
                pick(
                    CONFIG.npc_dialogue
                ) ||
                "You keep calling it a bug. I call it evidence."
            );

        const secret =
            safe(
                seed.secret,
                pick(
                    CONFIG.npc_secrets
                ) ||
                "Knows something nobody has successfully documented."
            );

        const relationship =
            safe(
                seed.relationship,
                pick(
                    CONFIG.npc_relationships
                ) ||
                "professional contact"
            );

        const npc = {
            id:
                randomId(),

            name,

            first:
                safe(
                    seed.first,
                    name.split(" ")[0]
                ),

            last:
                safe(
                    seed.last,
                    name.split(" ").slice(1).join(" ")
                ),

            role:
                safe(
                    seed.role,
                    "unregistered specialist"
                ),

            type:
                safe(
                    seed.type,
                    "unknown entity"
                ),

            trait:
                safe(
                    seed.trait,
                    pick(
                        CONFIG.npc_traits
                    ) ||
                    "suspiciously competent"
                ),

            relationship,

            secret,

            dialogue,

            status:
                safe(
                    seed.status,
                    pick(
                        CONFIG.statuses
                    ) ||
                    "UNKNOWN"
                ),

            faction:
                safe(
                    seed.faction,
                    faction
                ),

            world:
                world.name,

            location:
                safe(
                    pick(
                        CONFIG.locations
                    ),
                    world.name
                ),

            reputation:
                integer(
                    4,
                    99
                ),

            danger:
                safe(
                    seed.risk,
                    pick(
                        CONFIG.risk_levels
                    ) ||
                    "UNDEFINED"
                ),

            age:
                integer(
                    17,
                    900
                ),

            encounters:
                integer(
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
                pick(
                    CONFIG.npc_traits
                ) ||
                "quietly suspicious"
            );

        const secret =
            safe(
                seed.secret,
                pick(
                    CONFIG.npc_secrets
                ) ||
                "knows more than the official record suggests"
            );

        return sentence([
            `${first} is a ${type} known in ${world.name} as a ${role}.`,
            `Most records describe them as ${trait}.`,
            `Their involvement with the portfolio owner began after a routine professional interaction became considerably less routine.`,
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
            integer(
                2,
                4
            )
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
        const seed =
            pick(
                CONFIG.generated_experience_seeds
            ) || {};

        const role =
            safe(
                seed.role,
                pick(
                    CONFIG.experience_roles
                ) ||
                "Systems Engineer"
            );

        const opening =
            safe(
                seed.opening,
                pick(
                    CONFIG.experience_openings
                ) ||
                "The assignment looked ordinary from a distance."
            );

        const hook =
            safe(
                seed.hook,
                pick(
                    CONFIG.story_hooks
                ) ||
                "The first investigation revealed that the original assumptions were incomplete."
            );

        const incident =
            safe(
                seed.incident,
                pick(
                    CONFIG.experience_incidents
                ) ||
                "a routine operation produced an unexpected system state"
            );

        const turn =
            safe(
                seed.turn,
                pick(
                    CONFIG.story_turns
                ) ||
                "The investigation moved from symptoms toward system history."
            );

        const lesson =
            safe(
                seed.lesson,
                pick(
                    CONFIG.experience_lessons
                ) ||
                "Reliable systems require clear assumptions, observable behavior and recovery paths."
            );

        const closing =
            safe(
                seed.closing,
                pick(
                    CONFIG.closing_lines
                ) ||
                "The system eventually became boring enough to trust."
            );

        const technologies =
            sample(
                specialties,
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
                )
            );

        const experience = {
            id:
                randomId(),

            organization:
                safe(
                    seed.organization,
                    faction
                ),

            world:
                safe(
                    seed.world,
                    world.name
                ),

            role,

            years:
                Number(
                    seed.years
                ) ||
                integer(
                    1,
                    9
                ),

            status:
                safe(
                    seed.status,
                    pick(
                        CONFIG.statuses
                    ) ||
                    "ACTIVE"
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
                sample(
                    CONFIG.incident_types,
                    integer(
                        2,
                        4
                    )
                )
        };

        return experience;
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
                ? technologies.join(
                    ", "
                )
                : "systems engineering";

        return {
            summary:
                sentence([
                    opening,
                    `The official role was ${role}.`,
                    `The actual assignment involved keeping infrastructure belonging to ${faction} operational inside ${world.name}.`
                ]),

            context:
                sentence([
                    hook,
                    `The work initially appeared to be conventional ${technologyText}.`
                ]),

            incident:
                sentence([
                    incident,
                    "Nobody could initially agree whether the problem was technical, operational or administrative."
                ]),

            response:
                sentence([
                    turn,
                    `The response combined ${technologyText}, explicit boundaries, observability, recovery procedures and documentation.`
                ]),

            lesson:
                sentence([
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
            integer(
                3,
                6
            )
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
        const seed =
            pick(
                CONFIG.generated_project_seeds
            ) || {};

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

        const name =
            `${safe(
                seed.name,
                "Unnamed"
            )} ${suffix}`;

        const skills =
            sample(
                specialties,
                Math.min(
                    specialties.length,
                    integer(
                        3,
                        6
                    )
                )
            );

        const problem =
            safe(
                seed.problem,
                pick(
                    CONFIG.project_problems
                ) ||
                "the existing system had accumulated too many undocumented assumptions"
            );

        const solution =
            safe(
                seed.solution,
                pick(
                    CONFIG.project_solutions
                ) ||
                "introduce explicit boundaries, observability and automated recovery"
            );

        const failure =
            safe(
                seed.failure,
                pick(
                    CONFIG.project_failures
                ) ||
                "a routine deployment exposed a previously unknown dependency"
            );

        const outcome =
            safe(
                seed.outcome,
                pick(
                    CONFIG.project_outcomes
                ) ||
                "the system became stable enough for ordinary disasters"
            );

        const client =
            npcs.length
                ? pick(
                    npcs
                )
                : null;

        const project = {
            id:
                randomId(),

            name,

            type:
                safe(
                    seed.type,
                    "infrastructure project"
                ),

            industry:
                safe(
                    seed.industry,
                    industry
                ),

            world:
                safe(
                    seed.world,
                    world.name
                ),

            skills,

            client:
                client
                    ? client.name
                    : "Unknown client",

            problem,

            solution,

            failure,

            outcome,

            status:
                pick([
                    "Production",
                    "Maintained",
                    "Scaling",
                    "Research",
                    "Archived",
                    "Classified",
                    "Operational",
                    "Partially Operational"
                ]),

            complexity:
                integer(
                    21,
                    99
                ),

            users:
                integer(
                    100,
                    850000
                ),

            duration:
                integer(
                    2,
                    48
                ),

            narrative:
                buildProjectNarrative({
                    name,
                    type: safe(
                        seed.type,
                        "infrastructure project"
                    ),
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
                    safe(
                        seed.type,
                        "infrastructure project"
                    )
                )
        };

        return project;
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

        return {
            summary:
                sentence([
                    `PROJECT ${name} was commissioned as a ${type} for ${industry}.`,
                    `It eventually became useful infrastructure inside ${world.name}.`
                ]),

            problem:
                sentence([
                    "The initial requirement sounded simple.",
                    `The project existed because ${problem}.`
                ]),

            architecture:
                sentence([
                    "The architecture favored clear interfaces, observable state, recoverable failures and explicit ownership.",
                    `The implementation centered around ${skills.join(", ")}.`
                ]),

            client:
                sentence([
                    `The primary requester was ${clientName}.`,
                    "Their most important requirement was not written in the original specification."
                ]),

            failure:
                sentence([
                    `That hidden requirement surfaced when ${failure}.`
                ]),

            solution:
                sentence([
                    `The response was to ${solution}.`,
                    "This reduced unknown failure modes and made the system easier to reason about."
                ]),

            outcome:
                sentence([
                    `The project eventually reached a state where ${outcome}.`,
                    "The final lesson was that good infrastructure does not prevent strange events; it makes them easier to survive."
                ])
        };
    }

    function buildTechnicalNotes(
        skills,
        type
    ) {
        const notes = [
            `Architecture: modular ${type}`,

            `Primary stack: ${skills.slice(0, 3).join(", ")}`,

            "Failure strategy: observable, recoverable, documented",

            "Deployment model: automated where practical",

            "Operational philosophy: boring infrastructure, interesting outcomes",

            "Maintenance requirement: someone must understand why each component exists"
        ];

        return sample(
            notes,
            integer(
                4,
                6
            )
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
        const seed =
            pick(
                CONFIG.generated_incident_seeds
            ) || {};

        const witness =
            npcs.length
                ? pick(
                    npcs
                )
                : null;

        const project =
            projects.length
                ? pick(
                    projects
                )
                : null;

        const incident = {
            id:
                randomId(),

            code:
                randomCode(),

            world:
                safe(
                    seed.world,
                    world.name
                ),

            type:
                safe(
                    seed.type,
                    pick(
                        CONFIG.incident_types
                    ) ||
                    "unknown production event"
                ),

            opener:
                safe(
                    seed.opener,
                    pick(
                        CONFIG.incident_openers
                    ) ||
                    "Without warning"
                ),

            consequence:
                safe(
                    seed.consequence,
                    pick(
                        CONFIG.incident_consequences
                    ) ||
                    "the system entered an unexpected state"
                ),

            risk:
                safe(
                    seed.risk,
                    pick(
                        CONFIG.risk_levels
                    ) ||
                    "UNDEFINED"
                ),

            status:
                safe(
                    seed.status,
                    pick(
                        CONFIG.statuses
                    ) ||
                    "UNDER INVESTIGATION"
                ),

            witness:
                witness
                    ? witness.name
                    : "Unknown",

            project:
                project
                    ? project.name
                    : "Unassigned",

            date:
                randomDateLabel(),

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
            summary:
                sentence([
                    opener,
                    `an incident classified as ${type} occurred in ${world.name}.`,
                    projectText
                ]),

            observation:
                sentence([
                    witnessText,
                    "reported that the environment behaved differently from every previous observation."
                ]),

            consequence:
                sentence([
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
        const seed =
            pick(
                CONFIG.generated_quest_seeds
            ) || {};

        const client =
            npcs.length
                ? pick(
                    npcs
                )
                : null;

        const objective =
            safe(
                seed.objective,
                pick(
                    CONFIG.quests
                ) ||
                "Investigate an unresolved infrastructure problem"
            );

        const reward =
            safe(
                seed.reward,
                pick(
                    CONFIG.quest_rewards
                ) ||
                "Archive favor"
            );

        const risk =
            safe(
                seed.risk,
                pick(
                    CONFIG.risk_levels
                ) ||
                "ELEVATED"
            );

        const assignedBy =
            client
                ? client.name
                : faction;

        return {
            id:
                randomId(),

            world:
                safe(
                    seed.world,
                    world.name
                ),

            objective,

            reward,

            risk,

            client:
                safe(
                    seed.client,
                    faction
                ),

            status:
                safe(
                    seed.status,
                    pick(
                        CONFIG.statuses
                    ) ||
                    "ACTIVE"
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
       PORTFOLIO GENERATION
       ======================================================== */

    function generatePortfolio() {
        const world =
            generateWorld();

        const name =
            safe(
                pick(
                    CONFIG.names
                ),
                "Unknown Engineer"
            );

        const title =
            safe(
                pick(
                    CONFIG.titles
                ),
                "Software Engineer"
            );

        const personality =
            safe(
                pick(
                    CONFIG.personalities
                ),
                "systems-minded"
            );

        const industry =
            safe(
                pick(
                    CONFIG.industries
                ),
                "software infrastructure"
            );

        const education =
            safe(
                pick(
                    CONFIG.education
                ),
                "Self-taught engineering background"
            );

        const faction =
            safe(
                pick(
                    world.factions.length
                        ? world.factions
                        : CONFIG.factions
                ),
                "Independent Operators"
            );

        const genre =
            world.genre;

        const specialties =
            sample(
                CONFIG.specialties,
                integer(
                    6,
                    11
                )
            );

        const years =
            integer(
                3,
                19
            );

        const chaos =
            integer(
                38,
                100
            );

        const npcCount =
            integer(
                6,
                11
            );

        const projectCount =
            integer(
                5,
                9
            );

        const experienceCount =
            integer(
                4,
                7
            );

        const incidentCount =
            integer(
                4,
                8
            );

        const questCount =
            integer(
                2,
                5
            );

        /* ----------------------------------------------------
           NPCS
           ---------------------------------------------------- */

        const npcs = [];

        const usedNPCNames =
            new Set();

        for (
            let i = 0;
            i < npcCount;
            i++
        ) {
            npcs.push(
                generateNPC(
                    world,
                    faction,
                    usedNPCNames
                )
            );
        }

        /* ----------------------------------------------------
           EXPERIENCE
           ---------------------------------------------------- */

        const experiences = [];

        for (
            let i = 0;
            i < experienceCount;
            i++
        ) {
            experiences.push(
                generateExperience(
                    world,
                    faction,
                    specialties
                )
            );
        }

        /* ----------------------------------------------------
           PROJECTS
           ---------------------------------------------------- */

        const projects = [];

        for (
            let i = 0;
            i < projectCount;
            i++
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

        /* ----------------------------------------------------
           INCIDENTS
           ---------------------------------------------------- */

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
                    projects
                )
            );
        }

        /* ----------------------------------------------------
           QUESTS
           ---------------------------------------------------- */

        const quests = [];

        for (
            let i = 0;
            i < questCount;
            i++
        ) {
            quests.push(
                generateQuest(
                    world,
                    npcs,
                    faction
                )
            );
        }

        /* ----------------------------------------------------
           UI
           ---------------------------------------------------- */

        const ui =
            generateUIDNA({
                world,
                title,
                personality,
                genre,
                chaos,
                specialties
            });

        /* ----------------------------------------------------
           METRICS
           ---------------------------------------------------- */

        const metrics = {
            deployments:
                integer(
                    180,
                    1800
                ),

            systems:
                integer(
                    7,
                    49
                ),

            incidents:
                integer(
                    8,
                    72
                ),

            users:
                integer(
                    2500,
                    99000000
                ),

            uptime:
                (
                    99 +
                    random() * 0.99
                ).toFixed(
                    2
                ),

            coffee:
                integer(
                    731,
                    29821
                ),

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

            realityStability:
                integer(
                    11,
                    99
                )
        };

        /* ----------------------------------------------------
           TIMELINE
           ---------------------------------------------------- */

        const timeline =
            generateTimeline(
                years,
                industry,
                experiences
            );

        /* ----------------------------------------------------
           ARCHIVE DATES
           ---------------------------------------------------- */

        const currentYear =
            new Date()
                .getFullYear();

        const createdYear =
            integer(
                Math.max(
                    2012,
                    currentYear - years
                ),
                currentYear
            );

        const updatedYear =
            integer(
                createdYear,
                currentYear + 1
            );

        const created =
            `${createdYear}-${String(
                integer(
                    1,
                    12
                )
            ).padStart(
                2,
                "0"
            )}-${String(
                integer(
                    1,
                    28
                )
            ).padStart(
                2,
                "0"
            )}`;

        const lastUpdated =
            `${updatedYear}-${String(
                integer(
                    1,
                    12
                )
            ).padStart(
                2,
                "0"
            )}-${String(
                integer(
                    1,
                    28
                )
            ).padStart(
                2,
                "0"
            )}`;

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

            archive: {
                classification:
                    pick([
                        "PUBLIC",
                        "PARTIALLY CLASSIFIED",
                        "RESTRICTED",
                        "CONFIDENTIAL",
                        "ARCHIVED",
                        "DO NOT DISTRIBUTE"
                    ]),

                created,

                lastUpdated,

                author:
                    name,

                archiveNumber:
                    randomCode(),

                warning:
                    pick([
                        "Some records may describe events that have not happened yet.",
                        "Several names have been redacted for reasons nobody can explain.",
                        "This archive is considered structurally harmless.",
                        "Reading beyond this point is technically optional.",
                        "The archive has requested that it not be deleted.",
                        "Cross-reference inconsistencies are expected."
                    ])
            },

            quest:
                quests[0]
        };

        portfolio.signature =
            makeSignature(
                portfolio
            );

        return portfolio;
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
            new Date()
                .getFullYear();

        const startYear =
            currentYear -
            years;

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
            let i = 0;
            i < count;
            i++
        ) {
            const progress =
                i /
                Math.max(
                    count - 1,
                    1
                );

            const year =
                Math.round(
                    startYear +
                    progress *
                    (
                        currentYear -
                        startYear
                    )
                );

            let title =
                titles[i] ||
                "Continued operation";

            let text =
                "Built, maintained, documented and occasionally questioned the decision to deploy this on Friday.";

            if (
                i <
                experiences.length
            ) {
                const experience =
                    experiences[i];

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
                i ===
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
        const weights = {};

        for (
            const family of
            CONFIG.ui_families
        ) {
            weights[family] =
                1;
        }

        if (
            /backend|platform|systems|devops|infrastructure/i.test(
                title
            )
        ) {
            weights.terminal += 5;
            weights["operating-system"] += 4;
            weights.executive += 2;
        }

        if (
            /research|AI|data|science/i.test(
                title
            )
        ) {
            weights.research += 5;
            weights.space += 2;
        }

        if (
            /security/i.test(
                title
            )
        ) {
            weights.dossier += 5;
            weights.detective += 4;
        }

        if (
            /creative|designer/i.test(
                title
            )
        ) {
            weights.manhwa += 4;
            weights.luxury += 3;
        }

        if (
            /fantasy|manhwa|dark fantasy/i.test(
                genre
            )
        ) {
            weights.rpg += 5;
            weights.spellbook += 5;
            weights.manhwa += 4;
        }

        if (
            /space|science fiction/i.test(
                world.genre
            )
        ) {
            weights.space += 6;
            weights.research += 3;
        }

        if (
            chaos > 78
        ) {
            weights.chaotic += 7;
            weights.brutalist += 3;
            weights.underground += 3;
        }

        if (
            personality.includes(
                "methodical"
            )
        ) {
            weights.executive += 4;
            weights.research += 2;
        }

        if (
            personality.includes(
                "chaotic"
            )
        ) {
            weights.chaotic += 6;
        }

        const family =
            weightedChoice(
                weights
            );

        const layout =
            pick(
                CONFIG.layouts
            );

        const nav =
            pick(
                CONFIG.navs
            );

        const hero =
            pick(
                CONFIG.hero_modes
            );

        const palette =
            choosePalette(
                family
            );

        let density;

        if (
            chaos > 82
        ) {
            density =
                "compact";
        } else if (
            chaos < 45
        ) {
            density =
                "spacious";
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

            layout,

            nav,

            hero,

            density,

            decoration,

            radius:
                integer(
                    0,
                    24
                ),

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

            longForm:
                true,

            textHeavy:
                true,

            cardFirst:
                true
        };
    }

    function weightedChoice(
        weights
    ) {
        const entries =
            Object.entries(
                weights
            );

        const total =
            entries.reduce(
                (
                    sum,
                    [, weight]
                ) =>
                    sum + weight,
                0
            );

        let cursor =
            random() *
            total;

        for (
            const [
                key,
                weight
            ] of entries
        ) {
            cursor -=
                weight;

            if (
                cursor <= 0
            ) {
                return key;
            }
        }

        return entries[
            entries.length - 1
        ][0];
    }

    function choosePalette(
        family
    ) {
        const palettes = {
            executive: {
                accent: "#6e9cff",
                accent2: "#7fe0c4",
                background: "#090d14",
                surface: "#111722"
            },

            terminal: {
                accent: "#7dff8c",
                accent2: "#35cfff",
                background: "#050807",
                surface: "#08100a"
            },

            rpg: {
                accent: "#e9bd66",
                accent2: "#9e82ff",
                background: "#0e0b13",
                surface: "#17121f"
            },

            manhwa: {
                accent: "#ff719c",
                accent2: "#8a7dff",
                background: "#f4f1ed",
                surface: "#fffdfa"
            },

            dossier: {
                accent: "#e3b75c",
                accent2: "#c94c48",
                background: "#11100d",
                surface: "#1a1813"
            },

            research: {
                accent: "#66c9ff",
                accent2: "#82e0b0",
                background: "#081014",
                surface: "#101b20"
            },

            luxury: {
                accent: "#d9bd75",
                accent2: "#eee2c0",
                background: "#090909",
                surface: "#111111"
            },

            brutalist: {
                accent: "#ffff00",
                accent2: "#ff3b30",
                background: "#e8e8e8",
                surface: "#ffffff"
            },

            space: {
                accent: "#69c7ff",
                accent2: "#b87cff",
                background: "#03050b",
                surface: "#080c16"
            },

            detective: {
                accent: "#d9a951",
                accent2: "#bb5151",
                background: "#15120f",
                surface: "#211c16"
            },

            spellbook: {
                accent: "#cf9cff",
                accent2: "#6fe3cf",
                background: "#100b16",
                surface: "#1b1224"
            },

            underground: {
                accent: "#ff5c9b",
                accent2: "#60e8b0",
                background: "#08090b",
                surface: "#121418"
            },

            newspaper: {
                accent: "#171717",
                accent2: "#555555",
                background: "#e9e6dc",
                surface: "#f7f4eb"
            },

            "operating-system": {
                accent: "#6ea8ff",
                accent2: "#8dffcb",
                background: "#080b11",
                surface: "#111722"
            },

            chaotic: {
                accent: "#ff6bcb",
                accent2: "#65f4ff",
                background: "#0b0810",
                surface: "#17101d"
            }
        };

        return (
            palettes[family] ||
            palettes.executive
        );
    }

    /* ========================================================
       SIGNATURE
       ======================================================== */

    function makeSignature(
        portfolio
    ) {
        return hashString(
            [
                portfolio.name,

                portfolio.title,

                portfolio.world.name,

                portfolio.faction,

                portfolio.genre,

                portfolio.ui.family,

                portfolio.ui.layout,

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
                            item.name
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
            ].join("|")
        );
    }

    function generateUniquePortfolio() {
        let portfolio;

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
                href="#${escapeHTML(
                    target
                )}"
            >
                ${escapeHTML(
                    label
                )}
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
                class="nav ${nav === "rail" ? "nav-rail" : ""}"
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
                            portfolio.archive.archiveNumber
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
                `Command interface for a ${portfolio.title.toLowerCase()} with ${portfolio.years} years of accumulated engineering damage.`,

            character:
                `Character profile unlocked: ${portfolio.name}.`,

            manifesto:
                `Make the system understandable. Then make it impossible for the system to surprise you.`,

            classified:
                `This record was not originally intended to become a portfolio.`,

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
                                portfolio.archive.classification
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
                            portfolio.archive.classification
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
            safeArray(
                values
            );

        if (
            !list.length
        ) {
            return "";
        }

        return `
            <div class="tags ${className}">
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
        return `
            <section
                class="section"
                id="profile"
            >

                ${sectionHeader(
                    "Subject Profile",
                    "The person behind the incidents.",
                    `${portfolio.name} operates as a ${portfolio.title} with a focus on ${portfolio.specialties.slice(0, 5).join(", ")}.`
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
                        portfolio.specialties[0]
                    )}

                    ${renderProfileFact(
                        "Secondary Specialty",
                        portfolio.specialties[1]
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
            experience.narrative || {};

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

                            ${experience.achievements
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
            project.narrative || {};

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

                        ${project.technicalNotes
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
                                `${world.population.toLocaleString()} inhabitants`
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

                    ${world.rules
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

                    ${world.factions
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

                            ${npc.rumors
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
            incident.narrative || {};

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
                        portfolio.archive.archiveNumber
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
         * IMPORTANT:
         * These classes preserve the existing UI-family system.
         * The card-first rendering above does not replace it.
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

        window.scrollTo({
            top: 0,
            behavior: "instant"
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

                        if (
                            !element
                        ) {
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

            live.style.overflow =
                "hidden";

            live.style.clip =
                "rect(0 0 0 0)";

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
        const next =
            generateUniquePortfolio();

        render(
            next
        );
    }

    /* ========================================================
       KEYBOARD SHORTCUT
       ======================================================== */

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key.toLowerCase() ===
                "g" &&
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
        const portfolio =
            generateUniquePortfolio();

        render(
            portfolio
        );
    }

    boot();

})();
