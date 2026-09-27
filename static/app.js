/* ============================================================
   ABSURD CHAOS PORTFOLIO
   ------------------------------------------------------------
   COMPLETE BROWSER-MEMORY PROCEDURAL ENGINE

   No:
   - localStorage
   - sessionStorage
   - IndexedDB
   - cookies
   - database
   - API
   - fetch
   - external runtime dependency

   Every generation is created in JavaScript memory.
   ============================================================ */

(() => {
    "use strict";

    const CONFIG =
        window.__ABSURD_CONFIG__;

    if (
        !CONFIG ||
        typeof CONFIG !== "object"
    ) {
        document.body.innerHTML = `
            <main style="
                min-height:100vh;
                display:grid;
                place-items:center;
                padding:32px;
                font-family:system-ui,sans-serif;
            ">
                <article style="
                    max-width:720px;
                    width:100%;
                    padding:32px;
                    border:1px solid #333;
                    border-radius:18px;
                    background:#111;
                    color:#fff;
                ">
                    <small>CONFIGURATION ERROR</small>
                    <h1>Portfolio configuration missing.</h1>
                    <p>
                        Run generator.py again and reload the generated page.
                    </p>
                </article>
            </main>
        `;
        return;
    }

    const runtime = {
        current: null,
        generationCount: 0,
        generatedSignatures: new Set(),
        history: [],
        npcIndex: new Map(),
        worldIndex: new Map(),
        usedNPCNames: new Set(),
    };


    /* ========================================================
       DOM
       ======================================================== */

    const $ = (
        selector,
        root = document
    ) =>
        root.querySelector(
            selector
        );

    const $$ = (
        selector,
        root = document
    ) =>
        [
            ...root.querySelectorAll(
                selector
            ),
        ];


    /* ========================================================
       RANDOM
       ======================================================== */

    function random() {
        if (
            window.crypto &&
            typeof window.crypto.getRandomValues ===
                "function"
        ) {
            const values =
                new Uint32Array(2);

            window.crypto.getRandomValues(
                values
            );

            const high =
                values[0] / 4294967296;

            const low =
                values[1] / 4294967296;

            return (
                high +
                low /
                    4294967296
            );
        }

        return Math.random();
    }


    function integer(
        min,
        max
    ) {
        return (
            Math.floor(
                random() *
                    (max - min + 1)
            ) + min
        );
    }


    function pick(
        values,
        fallback = ""
    ) {
        if (
            !Array.isArray(values) ||
            !values.length
        ) {
            return fallback;
        }

        return values[
            integer(
                0,
                values.length - 1
            )
        ];
    }


    function sample(
        values,
        count
    ) {
        if (
            !Array.isArray(values) ||
            !values.length
        ) {
            return [];
        }

        const copy =
            [...values];

        const amount = Math.max(
            0,
            Math.min(
                Number(count) || 0,
                copy.length
            )
        );

        for (
            let i = copy.length - 1;
            i > 0;
            i--
        ) {
            const j =
                integer(
                    0,
                    i
                );

            [
                copy[i],
                copy[j],
            ] = [
                copy[j],
                copy[i],
            ];
        }

        return copy.slice(
            0,
            amount
        );
    }


    function weightedChoice(
        entries
    ) {
        const valid =
            Array.isArray(entries)
                ? entries.filter(
                      item =>
                          item &&
                          Number(
                              item.weight
                          ) > 0
                  )
                : [];

        if (!valid.length) {
            return null;
        }

        const total =
            valid.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Number(
                        item.weight
                    ),
                0
            );

        let cursor =
            random() * total;

        for (const item of valid) {
            cursor -= Number(
                item.weight
            );

            if (cursor <= 0) {
                return item.value;
            }
        }

        return valid[
            valid.length - 1
        ].value;
    }


    /* ========================================================
       SAFE TEXT
       ======================================================== */

    function safe(
        value,
        fallback = ""
    ) {
        if (
            value === null ||
            value === undefined
        ) {
            return fallback;
        }

        const text =
            String(value).trim();

        return text || fallback;
    }


    function safeArray(
        value
    ) {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .filter(
                item =>
                    typeof item ===
                    "string"
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean);
    }


    function uniqueStrings(
        values
    ) {
        return [
            ...new Set(
                safeArray(values)
            ),
        ];
    }


    function escapeHTML(
        value
    ) {
        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    function slug(
        value
    ) {
        return safe(
            value,
            "unknown"
        )
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            );
    }


    function capitalize(
        value
    ) {
        const text =
            safe(value);

        if (!text) {
            return "";
        }

        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );
    }


    function initials(
        name
    ) {
        const parts =
            safe(name)
                .split(/\s+/)
                .filter(Boolean);

        return parts
            .slice(0, 2)
            .map(
                part =>
                    part.charAt(0)
            )
            .join("")
            .toUpperCase();
    }


    function formatNumber(
        value
    ) {
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
            "en",
            {
                notation:
                    "compact",
                maximumFractionDigits:
                    1,
            }
        ).format(number);
    }


    function sentence(
        value
    ) {
        const text =
            safe(value);

        if (!text) {
            return "";
        }

        return text.endsWith(
            "."
        )
            ? text
            : `${text}.`;
    }


    function hashString(
        value
    ) {
        let hash =
            2166136261;

        const text =
            String(value);

        for (
            let i = 0;
            i < text.length;
            i++
        ) {
            hash ^=
                text.charCodeAt(
                    i
                );

            hash =
                Math.imul(
                    hash,
                    16777619
                );
        }

        return (
            hash >>> 0
        ).toString(16);
    }


    function randomId(
        prefix
    ) {
        return `${prefix}-${Date.now()
            .toString(36)}-${integer(
            100000,
            999999
        )}`;
    }


    function randomDateLabel(
        startYear = 2018,
        endYear = 2026
    ) {
        const year =
            integer(
                startYear,
                endYear
            );

        const month =
            String(
                integer(1, 12)
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                integer(1, 28)
            ).padStart(
                2,
                "0"
            );

        return `${year}-${month}-${day}`;
    }


    function randomCode(
        prefix
    ) {
        return `${prefix}-${String(
            integer(10, 99)
        )}${String(
            integer(100, 999)
        )}-${String(
            integer(10, 99)
        )}`;
    }


    /* ========================================================
       CONFIG ACCESS
       ======================================================== */

    function pool(
        key
    ) {
        return Array.isArray(
            CONFIG?.pools?.[key]
        )
            ? CONFIG.pools[key]
            : [];
    }


    function configPick(
        key,
        fallback
    ) {
        return pick(
            pool(key),
            fallback
        );
    }


    function configSample(
        key,
        count
    ) {
        return sample(
            pool(key),
            count
        );
    }


    function seedPool(
        key
    ) {
        return Array.isArray(
            CONFIG?.[key]
        )
            ? CONFIG[key]
            : [];
    }


    /* ========================================================
       WORLD GENERATION
       ======================================================== */

    function generateWorld() {
        const seeds =
            seedPool(
                "generated_world_seeds"
            );

        if (!seeds.length) {
            throw new Error(
                "World seed pool is empty."
            );
        }

        const source =
            pick(
                seeds,
                seeds[0]
            );

        const world = {
            id: randomId(
                "world"
            ),

            name: safe(
                source.name,
                "Unknown World"
            ),

            genre: safe(
                source.genre,
                "Unknown Genre"
            ),

            classification:
                safe(
                    source.classification,
                    "UNCLASSIFIED"
                ),

            description: safe(
                source.description
            ),

            sky: safe(
                source.sky
            ),

            technology: safe(
                source.technology
            ),

            socialRule: safe(
                source.socialRule
            ),

            rule: safe(
                source.rule
            ),

            danger: safe(
                source.danger,
                "Unknown"
            ),

            conflict: safe(
                source.conflict
            ),

            population:
                Number(
                    source.population
                ) || integer(
                    100000,
                    10000000
                ),

            age:
                Number(
                    source.age
                ) || integer(
                    50,
                    5000
                ),

            stability:
                Number(
                    source.stability
                ) || integer(
                    20,
                    90
                ),

            rules: sample(
                safeArray(
                    source.rules
                ),
                integer(
                    4,
                    5
                )
            ),

            factions: sample(
                safeArray(
                    source.factions
                ),
                integer(
                    4,
                    5
                )
            ),
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
        faction,
        usedNames
    ) {
        const seeds =
            seedPool(
                "generated_npc_seeds"
            );

        let source =
            pick(
                seeds,
                null
            );

        let first =
            safe(
                source?.first,
                configPick(
                    "npc_first_names",
                    "Unknown"
                )
            );

        let last =
            safe(
                source?.last,
                configPick(
                    "npc_last_names",
                    "Contact"
                )
            );

        let name =
            `${first} ${last}`;

        let attempts = 0;

        while (
            usedNames.has(name) ||
            runtime.usedNPCNames.has(
                name
            )
        ) {
            source =
                pick(
                    seeds,
                    source
                );

            first =
                safe(
                    source?.first,
                    configPick(
                        "npc_first_names",
                        "Unknown"
                    )
                );

            last =
                safe(
                    source?.last,
                    configPick(
                        "npc_last_names",
                        "Contact"
                    )
                );

            name =
                `${first} ${last}`;

            attempts++;

            if (attempts > 50) {
                name =
                    `${first} ${last} ${integer(
                        2,
                        999
                    )}`;
                break;
            }
        }

        usedNames.add(
            name
        );

        runtime.usedNPCNames.add(
            name
        );

        const npc = {
            id: randomId(
                "npc"
            ),

            name,

            first,

            last,

            role: safe(
                source?.role,
                configPick(
                    "npc_roles",
                    "Systems Client"
                )
            ),

            type: safe(
                source?.type,
                configPick(
                    "npc_types",
                    "unknown contact"
                )
            ),

            trait: safe(
                source?.trait,
                configPick(
                    "npc_traits",
                    "keeps unusual records"
                )
            ),

            relationship:
                safe(
                    source?.relationship,
                    configPick(
                        "npc_relationships",
                        "contact"
                    )
                ),

            secret: safe(
                source?.secret,
                configPick(
                    "npc_secrets",
                    "knows more than they admit"
                )
            ),

            dialogue: safe(
                source?.dialogue,
                configPick(
                    "npc_dialogue",
                    "Check the logs."
                )
            ),

            status: configPick(
                "statuses",
                "Operational"
            ),

            faction:
                faction ||
                pick(
                    world.factions,
                    "Independent"
                ),

            world:
                world.name,

            location:
                pick(
                    [
                        "Central District",
                        "Archive Quarter",
                        "Maintenance Ring",
                        "Upper Sector",
                        "Lower Sector",
                        "Transit Level",
                        "Restricted Zone",
                        "Guild Hall",
                    ]
                ),

            reputation:
                integer(
                    21,
                    99
                ),

            danger:
                configPick(
                    "risk_levels",
                    "Moderate"
                ),

            age:
                integer(
                    22,
                    84
                ),

            encounters:
                integer(
                    1,
                    27
                ),

            biography: "",

            rumors: [],

            projects: [],

            experiences: [],
        };

        npc.biography =
            buildNPCBiography(
                npc,
                world
            );

        npc.rumors =
            buildNPCRumors(
                npc,
                world
            );

        runtime.npcIndex.set(
            npc.id,
            npc
        );

        return npc;
    }


    function buildNPCBiography(
        npc,
        world
    ) {
        return `${npc.name} serves as ${articleFor(
            npc.role
        )} ${npc.role} in ${world.name}. Known for being ${npc.trait}, they have become involved in ${npc.relationship} assignments where infrastructure failures tend to become political problems.`;
    }


    function buildNPCRumors(
        npc,
        world
    ) {
        const rumorPool = [
            `${npc.name} ${npc.secret}.`,
            `People in ${world.name} claim ${npc.name} knows a route that does not appear on any official map.`,
            `${npc.name} reportedly keeps an emergency copy of something the organization insists does not exist.`,
            `A previous incident mentions ${npc.name} without explaining why.`,
        ];

        return sample(
            rumorPool,
            integer(
                2,
                2
            )
        );
    }


    /* ========================================================
       EXPERIENCE GENERATION
       ======================================================== */

    function generateExperience(
        world,
        faction,
        specialties,
        npcs
    ) {
        const role =
            configPick(
                "experience_roles",
                "Systems Engineer"
            );

        const organization =
            faction ||
            pick(
                world.factions,
                "Independent Systems Group"
            );

        const relatedNPC =
            pick(
                npcs,
                null
            );

        const years =
            integer(
                1,
                7
            );

        const technologies =
            configSample(
                "specialties",
                integer(
                    4,
                    7
                )
            );

        const opening =
            configPick(
                "experience_openings",
                "Joined during an unusual operational period."
            );

        const incident =
            configPick(
                "experience_incidents",
                "an unexpected system event"
            );

        const lesson =
            configPick(
                "experience_lessons",
                "systems should fail visibly"
            );

        const experience = {
            id: randomId(
                "experience"
            ),

            organization,

            world:
                world.name,

            role,

            years,

            status:
                configPick(
                    "statuses",
                    "Operational"
                ),

            technologies,

            npc:
                relatedNPC?.name ||
                "Unknown Contact",

            npcId:
                relatedNPC?.id ||
                "",

            opening,

            hook:
                configPick(
                    "story_hooks",
                    "The system was supposed to be temporary."
                ),

            incident,

            turn:
                configPick(
                    "story_turns",
                    "The investigation exposed another dependency."
                ),

            lesson,

            closing:
                configPick(
                    "closing_lines",
                    "The system became stable enough to be boring."
                ),

            narrative: {},

            achievements: [],

            incidents: [],
        };

        experience.narrative =
            buildExperienceNarrative(
                experience,
                world,
                relatedNPC
            );

        experience.achievements =
            buildExperienceAchievements(
                experience,
                world
            );

        experience.incidents =
            sample(
                [
                    incident,
                    "deployment review",
                    "capacity investigation",
                    "recovery exercise",
                ],
                integer(
                    2,
                    4
                )
            );

        if (relatedNPC) {
            relatedNPC.experiences.push(
                experience.id
            );
        }

        return experience;
    }


    function buildExperienceNarrative(
        experience,
        world,
        npc
    ) {
        const npcName =
            npc?.name ||
            "the assigned client";

        return {
            summary: `${experience.opening} The assignment connected ${experience.role.toLowerCase()} work with ${npcName}, operating inside ${world.name}.`,

            context: `The environment depended on ${world.technology}. The team inherited systems shaped by the local rule that ${world.rule.toLowerCase()}`,

            incident: `During routine operations, ${experience.incident}. The event initially appeared unrelated to the main assignment.`,

            response: `The response focused on observability, controlled recovery, ownership boundaries and ${pick(
                experience.technologies,
                "automation"
            )}. ${experience.turn}`,

            lesson: `${capitalize(
                experience.lesson
            )}. ${experience.closing}`,
        };
    }


    function buildExperienceAchievements(
        experience,
        world
    ) {
        const achievements = [
            `Stabilized an operational workflow inside ${world.name}.`,
            `Introduced stronger observability around ${pick(
                experience.technologies,
                "core infrastructure"
            )}.`,
            `Reduced manual intervention during incident recovery.`,
            `Documented a dependency previously known only by one operator.`,
            `Created a repeatable deployment and rollback procedure.`,
            `Connected technical decisions to measurable operational outcomes.`,
        ];

        return sample(
            achievements,
            integer(
                3,
                4
            )
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
        const npc =
            pick(
                npcs,
                null
            );

        const projectType =
            configPick(
                "project_types",
                "platform"
            );

        const baseName =
            configPick(
                "project_names",
                "Atlas"
            );

        const suffixes = [
            "Core",
            "Prime",
            "Zero",
            "X",
            "Protocol",
            "Grid",
            "Engine",
            "Network",
            "Archive",
            "OS",
            "One",
            "Delta",
            "Black",
            "Field",
            "Vault",
        ];

        const name =
            `${baseName} ${pick(
                suffixes,
                "Core"
            )}`;

        const skills =
            uniqueStrings(
                sample(
                    specialties.length
                        ? specialties
                        : pool(
                              "specialties"
                          ),
                    integer(
                        4,
                        7
                    )
                )
            );

        const problem =
            configPick(
                "project_problems",
                "the existing process had become unreliable"
            );

        const solution =
            configPick(
                "project_solutions",
                "a modular operational platform"
            );

        const failure =
            configPick(
                "project_failures",
                "the first deployment behaved unexpectedly"
            );

        const outcome =
            configPick(
                "project_outcomes",
                "the system became operationally useful"
            );

        const complexity =
            integer(
                38,
                99
            );

        const project = {
            id: randomId(
                "project"
            ),

            name,

            type: projectType,

            industry,

            world:
                world.name,

            skills,

            client:
                npc?.name ||
                "Independent Client",

            clientId:
                npc?.id ||
                "",

            problem,

            solution,

            failure,

            outcome,

            status:
                configPick(
                    "statuses",
                    "Operational"
                ),

            complexity,

            users:
                integer(
                    250,
                    99000000
                ),

            duration:
                integer(
                    1,
                    26
                ),

            narrative: {},

            technicalNotes: [],

            incidents: [],
        };

        project.narrative =
            buildProjectNarrative(
                project,
                world,
                npc
            );

        project.technicalNotes =
            buildTechnicalNotes(
                project
            );

        project.incidents =
            sample(
                [
                    project.failure,
                    "capacity review",
                    "security review",
                    "deployment anomaly",
                    "unexpected dependency",
                ],
                integer(
                    2,
                    4
                )
            );

        if (npc) {
            npc.projects.push(
                project.id
            );
        }

        return project;
    }


    function buildProjectNarrative(
        project,
        world,
        npc
    ) {
        const client =
            npc?.name ||
            "the client";

        return {
            summary: `${project.name} is ${articleFor(
                project.type
            )} ${project.type} built for ${project.industry} operations in ${world.name}.`,

            problem: `The original environment had a fundamental problem: ${project.problem}. The operational consequence was becoming more expensive than the software itself.`,

            architecture: `The system combined ${project.skills
                .slice(0, 4)
                .join(
                    ", "
                )} into a controlled architecture with explicit ownership, observable failure paths and recoverable deployment stages.`,

            client: `${client}, acting as ${npc?.role || "the client"}, became the primary operational stakeholder. Their requirement was simple: make the system useful without creating another mystery.`,

            failure: `The first serious failure occurred when ${project.failure}. The event exposed a dependency that had not appeared in the original requirements.`,

            solution: `${capitalize(
                project.solution
            )}. The redesign added explicit boundaries, operational visibility and a recovery strategy.`,

            outcome: `${capitalize(
                project.outcome
            )}. The final system became part of the fictional world's infrastructure rather than another isolated experiment.`,
        };
    }


    function buildTechnicalNotes(
        project
    ) {
        const notes = [
            `Architecture complexity: ${project.complexity}/100.`,
            `Primary implementation surface: ${project.skills
                .slice(0, 3)
                .join(", ")}.`,
            `Designed for approximately ${formatNumber(
                project.users
            )} users or records.`,
            `Initial delivery window: ${project.duration} months.`,
            `Failure domains were separated before production release.`,
            `Operational events were designed to remain traceable.`,
        ];

        return sample(
            notes,
            integer(
                3,
                4
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
        const witness =
            pick(
                npcs,
                null
            );

        const project =
            pick(
                projects,
                null
            );

        const incident = {
            id: randomId(
                "incident"
            ),

            code:
                randomCode(
                    "INC"
                ),

            world:
                world.name,

            type:
                configPick(
                    "incident_types",
                    "Unexpected Production Event"
                ),

            opener:
                configPick(
                    "incident_openers",
                    "The first alert looked harmless."
                ),

            consequence:
                configPick(
                    "incident_consequences",
                    "The organization changed its recovery process."
                ),

            risk:
                configPick(
                    "risk_levels",
                    "Moderate"
                ),

            status:
                configPick(
                    "statuses",
                    "Recovered"
                ),

            witness:
                witness?.name ||
                "Unknown Witness",

            witnessId:
                witness?.id ||
                "",

            project:
                project?.name ||
                "Unassigned Project",

            projectId:
                project?.id ||
                "",

            date:
                randomDateLabel(
                    2020,
                    2026
                ),

            narrative: {},
        };

        incident.narrative =
            buildIncidentNarrative(
                incident,
                world,
                witness,
                project
            );

        return incident;
    }


    function buildIncidentNarrative(
        incident,
        world,
        witness,
        project
    ) {
        return {
            summary: `${incident.opener} The event was associated with ${project?.name || "an unknown project"} inside ${world.name}.`,

            observation: `Operators observed ${incident.type.toLowerCase()} conditions while the primary system continued reporting ${incident.status.toLowerCase()}. ${witness?.name || "A witness"} provided the first useful correlation.`,

            consequence: incident.consequence,

            response: `The response isolated the affected dependency, captured evidence and restored service using a controlled recovery path. The team avoided changing unrelated systems during the incident.`,

            recommendation: `Preserve incident evidence, document the dependency and require explicit verification before the next deployment.`,
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
        const assignedBy =
            pick(
                npcs,
                null
            );

        const client =
            pick(
                npcs,
                assignedBy
            );

        const quest = {
            id: randomId(
                "quest"
            ),

            world:
                world.name,

            objective:
                configPick(
                    "quest_objectives",
                    "Repair the infrastructure"
                ),

            reward:
                configPick(
                    "quest_rewards",
                    "one suspicious access token"
                ),

            risk:
                configPick(
                    "risk_levels",
                    "High"
                ),

            client:
                client?.name ||
                "Unknown Client",

            assignedBy:
                assignedBy?.name ||
                faction ||
                "Operations Council",

            status:
                configPick(
                    "statuses",
                    "Under Observation"
                ),

            description: "",
        };

        quest.description =
            `Assigned by ${quest.assignedBy} on behalf of ${quest.client}. The objective is located in ${world.name}, where the current conflict involves ${world.conflict.toLowerCase()}. The operation is considered ${quest.risk.toLowerCase()} risk.`;

        return quest;
    }


    /* ========================================================
       TIMELINE
       ======================================================== */

    function generateTimeline(
        years,
        industry,
        experiences
    ) {
        const now =
            new Date().getFullYear();

        const start =
            Math.max(
                2000,
                now -
                    Math.max(
                        years + 7,
                        10
                    )
            );

        const titles = [
            "Entered the field",
            "First production system",
            "Inherited a legacy platform",
            "First major incident",
            "Built an internal tool",
            "Entered cross-world operations",
            "Started documenting everything",
            "Designed a recovery system",
            "Met the wrong client",
            "Survived the impossible deployment",
            "Archive record created",
        ];

        const events =
            experiences.map(
                experience => ({
                    year:
                        integer(
                            start,
                            now
                        ),

                    title:
                        pick(
                            titles
                        ),

                    text: `Worked as ${experience.role} for ${experience.organization}, focusing on ${industry} systems and operational reliability.`,
                })
            );

        events.push(
            {
                year:
                    integer(
                        start,
                        now
                    ),
                title:
                    "The portfolio became complicated",
                text:
                    "A growing collection of systems, clients and incidents eventually became a career archive.",
            }
        );

        events.sort(
            (a, b) =>
                Number(a.year) -
                Number(b.year)
        );

        return events.slice(
            0,
            7
        );
    }


    /* ========================================================
       UI PALETTES
       ======================================================== */

    function choosePalette(
        family
    ) {
        const palettes = {
            executive: {
                accent: "#8b7cff",
                accent2: "#58e0bd",
                background: "#090a0c",
                surface: "#11141a",
            },

            terminal: {
                accent: "#59ff9a",
                accent2: "#2ce8d2",
                background: "#050806",
                surface: "#0b120e",
            },

            rpg: {
                accent: "#d9a441",
                accent2: "#8f72ff",
                background: "#100d0a",
                surface: "#19140f",
            },

            manhwa: {
                accent: "#ff4f91",
                accent2: "#6c8cff",
                background: "#0d0d14",
                surface: "#151622",
            },

            dossier: {
                accent: "#d5b46c",
                accent2: "#7e9db3",
                background: "#11100d",
                surface: "#1b1914",
            },

            research: {
                accent: "#6ea8ff",
                accent2: "#71e6d0",
                background: "#081018",
                surface: "#101b27",
            },

            luxury: {
                accent: "#d7b56d",
                accent2: "#f2e4b8",
                background: "#0c0a08",
                surface: "#17130e",
            },

            brutalist: {
                accent: "#f4efdf",
                accent2: "#ff5a3d",
                background: "#151515",
                surface: "#242424",
            },

            space: {
                accent: "#8ea7ff",
                accent2: "#73f0ff",
                background: "#050711",
                surface: "#0d1222",
            },

            detective: {
                accent: "#c4a36a",
                accent2: "#8db4a5",
                background: "#11120f",
                surface: "#1b1d18",
            },

            spellbook: {
                accent: "#b38cff",
                accent2: "#67e0c3",
                background: "#0e0a15",
                surface: "#191224",
            },

            underground: {
                accent: "#f25f5c",
                accent2: "#e8d44f",
                background: "#090909",
                surface: "#161616",
            },

            newspaper: {
                accent: "#1c1c1c",
                accent2: "#7b1e1e",
                background: "#eee8d8",
                surface: "#f8f4e9",
            },

            "operating-system": {
                accent: "#57b8ff",
                accent2: "#72f2c1",
                background: "#070b10",
                surface: "#101721",
            },

            chaotic: {
                accent: "#ff5de4",
                accent2: "#5dfcff",
                background: "#0a0710",
                surface: "#17101d",
            },
        };

        return (
            palettes[
                family
            ] ||
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
        specialties,
    }) {
        const families =
            safeArray(
                CONFIG?.ui_system
                    ?.families
            );

        const layouts =
            safeArray(
                CONFIG?.ui_system
                    ?.layouts
            );

        const navs =
            safeArray(
                CONFIG?.ui_system
                    ?.navs
            );

        const heroModes =
            safeArray(
                CONFIG?.ui_system
                    ?.hero_modes
            );

        const densities =
            safeArray(
                CONFIG?.ui_system
                    ?.densities
            );

        const decorations =
            safeArray(
                CONFIG?.ui_system
                    ?.decorations
            );

        const weights = [];

        const add =
            (
                family,
                weight
            ) => {
                if (
                    families.includes(
                        family
                    )
                ) {
                    weights.push({
                        value: family,
                        weight,
                    });
                }
            };

        const lower =
            `${title} ${genre} ${personality} ${world.name}`.toLowerCase();

        if (
            /backend|platform|system|devops|infrastructure|automation/.test(
                lower
            )
        ) {
            add(
                "terminal",
                6
            );

            add(
                "operating-system",
                5
            );

            add(
                "executive",
                3
            );
        }

        if (
            /research|science|data|experimental/.test(
                lower
            )
        ) {
            add(
                "research",
                6
            );

            add(
                "space",
                4
            );
        }

        if (
            /security|detective|investigator|incident/.test(
                lower
            )
        ) {
            add(
                "dossier",
                5
            );

            add(
                "detective",
                6
            );
        }

        if (
            /fantasy|manhwa|magic|royal|guild/.test(
                lower
            )
        ) {
            add(
                "rpg",
                5
            );

            add(
                "spellbook",
                5
            );

            add(
                "manhwa",
                4
            );
        }

        if (
            /space|orbital|station|planet/.test(
                lower
            )
        ) {
            add(
                "space",
                7
            );

            add(
                "research",
                3
            );
        }

        if (
            chaos >= 78
        ) {
            add(
                "chaotic",
                8
            );

            add(
                "brutalist",
                4
            );

            add(
                "underground",
                3
            );
        }

        if (
            personality.includes(
                "methodical"
            )
        ) {
            add(
                "executive",
                4
            );

            add(
                "research",
                3
            );
        }

        if (
            personality.includes(
                "chaotic"
            )
        ) {
            add(
                "chaotic",
                8
            );
        }

        const family =
            weightedChoice(
                weights
            ) ||
            pick(
                families,
                "executive"
            );

        const palette =
            choosePalette(
                family
            );

        let density =
            chaos > 72
                ? pick(
                      [
                          "compact",
                          "normal",
                      ]
                  )
                : chaos < 35
                ? pick(
                      [
                          "normal",
                          "spacious",
                      ]
                  )
                : pick(
                      densities,
                      "normal"
                  );

        const ui = {
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
                    heroModes,
                    "identity"
                ),

            density,

            decoration:
                pick(
                    decorations,
                    "grid"
                ),

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

            longForm: false,

            textHeavy: false,

            cardFirst: true,
        };

        return ui;
    }


    /* ========================================================
       PORTFOLIO
       ======================================================== */

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
                "Systems Engineering"
            );

        const faction =
            pick(
                world.factions,
                "Independent Systems Group"
            );

        const specialties =
            sample(
                pool("specialties"),
                integer(
                    5,
                    9
                )
            );

        const genre =
            world.genre;

        const chaos =
            integer(
                12,
                99
            );

        const npcCount =
            integer(
                7,
                12
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
                    pick(
                        world.factions,
                        faction
                    ),
                    usedNames
                )
            );
        }

        const experienceCount =
            integer(
                5,
                7
            );

        const experiences =
            [];

        for (
            let i = 0;
            i < experienceCount;
            i++
        ) {
            experiences.push(
                generateExperience(
                    world,
                    pick(
                        world.factions,
                        faction
                    ),
                    specialties,
                    npcs
                )
            );
        }

        const projectCount =
            integer(
                6,
                9
            );

        const projects =
            [];

        for (
            let i = 0;
            i < projectCount;
            i++
        ) {
            projects.push(
                generateProject(
                    world,
                    pick(
                        [
                            industry,
                            ...pool(
                                "industries"
                            ),
                        ]
                    ),
                    specialties,
                    npcs
                )
            );
        }

        const incidentCount =
            integer(
                5,
                8
            );

        const incidents =
            [];

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

        const questCount =
            integer(
                3,
                5
            );

        const quests =
            [];

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
                ).toFixed(2),

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
                ),
        };

        const timeline =
            generateTimeline(
                experiences.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        Number(
                            item.years
                        ),
                    0
                ),
                industry,
                experiences
            );

        const createdYear =
            Math.min(
                ...timeline.map(
                    item =>
                        Number(
                            item.year
                        )
                )
            );

        const updatedYear =
            Math.max(
                ...timeline.map(
                    item =>
                        Number(
                            item.year
                        )
                )
            );

        const archive = {
            archiveNumber:
                `ARC-${integer(
                    1000,
                    9999
                )}-${integer(
                    10,
                    99
                )}`,

            created:
                `${createdYear}-${String(
                    integer(1, 12)
                ).padStart(
                    2,
                    "0"
                )}-${String(
                    integer(1, 28)
                ).padStart(
                    2,
                    "0"
                )}`,

            lastUpdated:
                `${Math.max(
                    createdYear,
                    updatedYear
                )}-${String(
                    integer(1, 12)
                ).padStart(
                    2,
                    "0"
                )}-${String(
                    integer(1, 28)
                ).padStart(
                    2,
                    "0"
                )}`,

            classification:
                pick(
                    [
                        "PUBLIC",
                        "INTERNAL",
                        "RESTRICTED",
                        "CLASSIFIED",
                        "ANOMALOUS",
                    ]
                ),

            warning:
                pick(
                    [
                        "This portfolio may contain fictional infrastructure.",
                        "Some systems described here technically do not exist.",
                        "Archive integrity has been verified within the fictional universe.",
                        "Several project outcomes remain disputed.",
                        "Readers are advised not to deploy any artifact described here.",
                    ]
                ),
        };

        const ui =
            generateUIDNA({
                world,
                title,
                personality,
                genre,
                chaos,
                specialties,
            });

        const portfolio = {
            id: randomId(
                "portfolio"
            ),

            name,

            title,

            personality,

            industry,

            education,

            faction,

            genre,

            specialties,

            years:
                timeline.length,

            chaos,

            world,

            npcs,

            experiences,

            projects,

            incidents,

            quests,

            timeline,

            metrics,

            archive,

            ui,

            generatedAt:
                new Date().toISOString(),

            signature: "",
        };

        portfolio.signature =
            makeSignature(
                portfolio
            );

        return portfolio;
    }


    function makeSignature(
        portfolio
    ) {
        const content =
            [
                portfolio.name,
                portfolio.title,
                portfolio.world.name,
                portfolio.faction,
                portfolio.genre,
                portfolio.ui.family,
                portfolio.ui.layout,
                portfolio.ui.nav,
                portfolio.ui.hero,
                ...portfolio.projects.map(
                    item =>
                        item.id
                ),
                ...portfolio.npcs.map(
                    item =>
                        item.id
                ),
                ...portfolio.experiences.map(
                    item =>
                        item.id
                ),
            ].join(
                "|"
            );

        return hashString(
            content
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

        const light =
            [
                "manhwa",
                "newspaper",
            ].includes(
                portfolio.ui.family
            );

        root.style.setProperty(
            "--text-on-accent",
            light
                ? "#111111"
                : "#ffffff"
        );
    }


    /* ========================================================
       UI LANGUAGE
       ======================================================== */

    function uiLanguage(
        portfolio
    ) {
        const family =
            portfolio.ui.family;

        const languages = {
            executive: {
                eyebrow:
                    "EXECUTIVE PROFILE",
                archive:
                    "Portfolio Archive",
                project:
                    "Strategic Project",
                experience:
                    "Professional Record",
            },

            terminal: {
                eyebrow:
                    "SYSTEM SESSION",
                archive:
                    "Process Archive",
                project:
                    "Service Instance",
                experience:
                    "Runtime History",
            },

            rpg: {
                eyebrow:
                    "CHARACTER RECORD",
                archive:
                    "Adventure Archive",
                project:
                    "Quest Artifact",
                experience:
                    "Guild History",
            },

            manhwa: {
                eyebrow:
                    "CHARACTER FILE",
                archive:
                    "Story Archive",
                project:
                    "Major Arc",
                experience:
                    "Career Arc",
            },

            dossier: {
                eyebrow:
                    "PERSONNEL DOSSIER",
                archive:
                    "Case Archive",
                project:
                    "Operational Case",
                experience:
                    "Assignment Record",
            },

            research: {
                eyebrow:
                    "RESEARCH SUBJECT",
                archive:
                    "Research Archive",
                project:
                    "Experimental System",
                experience:
                    "Research Record",
            },

            luxury: {
                eyebrow:
                    "PRIVATE PROFILE",
                archive:
                    "Portfolio Collection",
                project:
                    "Selected Work",
                experience:
                    "Professional Collection",
            },

            brutalist: {
                eyebrow:
                    "SYSTEM / RECORD",
                archive:
                    "RAW ARCHIVE",
                project:
                    "BUILD",
                experience:
                    "FIELD RECORD",
            },

            space: {
                eyebrow:
                    "MISSION PROFILE",
                archive:
                    "Mission Archive",
                project:
                    "Mission System",
                experience:
                    "Mission Record",
            },

            detective: {
                eyebrow:
                    "INVESTIGATION FILE",
                archive:
                    "Case Archive",
                project:
                    "Evidence System",
                experience:
                    "Investigation Record",
            },

            spellbook: {
                eyebrow:
                    "ARCANE PROFILE",
                archive:
                    "Spell Archive",
                project:
                    "Artifact System",
                experience:
                    "Guild Record",
            },

            underground: {
                eyebrow:
                    "UNDERGROUND RECORD",
                archive:
                    "Hidden Archive",
                project:
                    "Underground Build",
                experience:
                    "Field Assignment",
            },

            newspaper: {
                eyebrow:
                    "SPECIAL REPORT",
                archive:
                    "Editorial Archive",
                project:
                    "Featured System",
                experience:
                    "Career Report",
            },

            "operating-system": {
                eyebrow:
                    "OPERATING PROFILE",
                archive:
                    "System Archive",
                project:
                    "Service",
                experience:
                    "Process History",
            },

            chaotic: {
                eyebrow:
                    "UNSTABLE PROFILE",
                archive:
                    "CHAOS ARCHIVE",
                project:
                    "QUESTIONABLE SYSTEM",
                experience:
                    "INCIDENT HISTORY",
            },
        };

        return (
            languages[
                family
            ] ||
            languages.executive
        );
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
        const labels =
            uiLanguage(
                portfolio
            );

        return `
            <nav
                class="navigation"
                aria-label="Portfolio navigation"
            >

                ${navLink(
                    "archive",
                    labels.archive
                )}

                ${navLink(
                    "experiences",
                    labels.experience
                )}

                ${navLink(
                    "work",
                    labels.project
                )}

                ${navLink(
                    "world",
                    "World"
                )}

                ${navLink(
                    "characters",
                    "NPCs"
                )}

                ${navLink(
                    "incidents",
                    "Incidents"
                )}

                ${navLink(
                    "quests",
                    "Quests"
                )}

                <button
                    type="button"
                    class="generate-button"
                    data-generate
                >
                    ${portfolio.ui.nav === "rail"
                        ? "NEW REALITY"
                        : "GENERATE"}
                </button>

            </nav>
        `;
    }


    function renderTopbar(
        portfolio
    ) {
        return `
            <header class="topbar">

                <a
                    class="brand"
                    href="#top"
                    aria-label="Back to top"
                >
                    <span class="brand-mark">
                        ${escapeHTML(
                            initials(
                                portfolio.name
                            )
                        )}
                    </span>

                    <span class="brand-copy">
                        <strong>
                            ${escapeHTML(
                                portfolio.name
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                portfolio.archive
                                    .archiveNumber
                            )}
                        </small>
                    </span>
                </a>

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
        const labels =
            uiLanguage(
                portfolio
            );

        const modes = {
            identity: {
                kicker:
                    labels.eyebrow,
                title:
                    portfolio.name,
                subtitle:
                    portfolio.title,
            },

            mission: {
                kicker:
                    "MISSION ACTIVE",
                title:
                    portfolio.projects[0]
                        ?.name ||
                    portfolio.name,
                subtitle:
                    portfolio.title,
            },

            profile: {
                kicker:
                    "PROFILE",
                title:
                    portfolio.title,
                subtitle:
                    portfolio.name,
            },

            case: {
                kicker:
                    "CASE FILE",
                title:
                    portfolio.archive
                        .archiveNumber,
                subtitle:
                    portfolio.name,
            },

            status: {
                kicker:
                    "CURRENT STATUS",
                title:
                    portfolio.archive
                        .classification,
                subtitle:
                    portfolio.name,
            },

            command: {
                kicker:
                    "COMMAND PROFILE",
                title:
                    portfolio.world.name,
                subtitle:
                    portfolio.title,
            },

            character: {
                kicker:
                    "CHARACTER",
                title:
                    portfolio.name,
                subtitle:
                    portfolio.personality,
            },

            manifesto: {
                kicker:
                    "MANIFESTO",
                title:
                    "Make failure visible.",
                subtitle:
                    portfolio.name,
            },

            classified: {
                kicker:
                    "CLASSIFIED",
                title:
                    portfolio.archive
                        .archiveNumber,
                subtitle:
                    "Access condition: fictional.",
            },

            "field-report": {
                kicker:
                    "FIELD REPORT",
                title:
                    portfolio.world.name,
                subtitle:
                    portfolio.conflict ||
                    portfolio.world
                        .conflict,
            },
        };

        const mode =
            modes[
                portfolio.ui.hero
            ] ||
            modes.identity;

        return `
            <section
                class="hero"
                id="top"
            >

                <div class="hero-grid">

                    <div class="hero-main">

                        <div class="eyebrow">
                            ${escapeHTML(
                                mode.kicker
                            )}
                        </div>

                        <h1>
                            ${escapeHTML(
                                mode.title
                            )}
                        </h1>

                        <p class="hero-title">
                            ${escapeHTML(
                                mode.subtitle
                            )}
                        </p>

                        <p class="hero-description">
                            ${escapeHTML(
                                `${portfolio.name} is ${articleFor(
                                    portfolio.title
                                )} ${portfolio.title.toLowerCase()} operating from ${portfolio.world.name}, where ${portfolio.world.conflict.toLowerCase()}`
                            )}
                        </p>

                        <div class="hero-actions">

                            <a
                                class="button"
                                href="#work"
                            >
                                View Projects
                            </a>

                            <button
                                type="button"
                                class="button button-secondary"
                                data-generate
                            >
                                Generate Another
                            </button>

                        </div>

                    </div>

                    <aside class="hero-meta">

                        ${infoCard(
                            "World",
                            portfolio.world.name
                        )}

                        ${infoCard(
                            "Faction",
                            portfolio.faction
                        )}

                        ${infoCard(
                            "Industry",
                            portfolio.industry
                        )}

                        ${infoCard(
                            "Chaos Index",
                            `${portfolio.chaos}/100`
                        )}

                    </aside>

                </div>

            </section>
        `;
    }


    /* ========================================================
       STATS
       ======================================================== */

    function renderStats(
        portfolio
    ) {
        return `
            <section
                class="stats section"
                aria-label="Portfolio statistics"
            >

                <div class="stat-grid">

                    ${statCard(
                        "Systems",
                        portfolio.metrics
                            .systems
                    )}

                    ${statCard(
                        "Deployments",
                        formatNumber(
                            portfolio.metrics
                                .deployments
                        )
                    )}

                    ${statCard(
                        "Uptime",
                        `${portfolio.metrics.uptime}%`
                    )}

                    ${statCard(
                        "Users / Records",
                        formatNumber(
                            portfolio.metrics
                                .users
                        )
                    )}

                </div>

            </section>
        `;
    }


    function statCard(
        label,
        value
    ) {
        return `
            <article class="stat card">

                <span class="meta-label">
                    ${escapeHTML(
                        label
                    )}
                </span>

                <strong>
                    ${escapeHTML(
                        value
                    )}
                </strong>

            </article>
        `;
    }


    /* ========================================================
       SECTION HELPERS
       ======================================================== */

    function sectionHeader(
        eyebrow,
        title,
        description
    ) {
        return `
            <div class="section-header">

                <div>
                    <div class="eyebrow">
                        ${escapeHTML(
                            eyebrow
                        )}
                    </div>

                    <h2>
                        ${escapeHTML(
                            title
                        )}
                    </h2>
                </div>

                <p>
                    ${escapeHTML(
                        description
                    )}
                </p>

            </div>
        `;
    }


    function infoCard(
        label,
        value,
        extraClass = ""
    ) {
        return `
            <article
                class="card info-card ${extraClass}"
            >

                <span class="meta-label">
                    ${escapeHTML(
                        label
                    )}
                </span>

                <strong>
                    ${escapeHTML(
                        safe(
                            value,
                            "Unknown"
                        )
                    )}
                </strong>

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
                        .slice(
                            0,
                            5
                        )
                        .join(
                            ", "
                        )}.`
                )}

                <div class="card-grid profile-card-grid">

                    ${textCard(
                        "Operating Profile",
                        `${portfolio.name} is ${articleFor(
                            portfolio.title
                        )} ${portfolio.personality} ${portfolio.title.toLowerCase()} working primarily in ${portfolio.industry}.`
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
                        portfolio.archive
                            .classification
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
        const labels =
            uiLanguage(
                portfolio
            );

        return `
            <section
                class="section"
                id="experiences"
            >

                ${sectionHeader(
                    labels.experience,
                    "The jobs were normal. The circumstances were not.",
                    "Card-based professional records connecting assignments, NPCs, technologies, incidents and outcomes."
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

                <div class="experience-connection">

                    <span class="meta-label">
                        NPC CONNECTION
                    </span>

                    <strong>
                        ${escapeHTML(
                            experience.npc
                        )}
                    </strong>

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
        const labels =
            uiLanguage(
                portfolio
            );

        return `
            <section
                class="section"
                id="work"
            >

                ${sectionHeader(
                    labels.project,
                    "Projects with unnecessarily complicated histories.",
                    "The main work archive: absurd systems, unusual clients, operational failures and technically defensible solutions."
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

                <div class="project-connection">

                    <span class="meta-label">
                        CLIENT NPC
                    </span>

                    <strong>
                        ${escapeHTML(
                            project.client
                        )}
                    </strong>

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

                        ${tagList(
                            [
                                world.genre,
                                world.danger,
                                world.classification,
                            ]
                        )}

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
                    "Every NPC is part of the fictional professional network: clients, employers, rivals, collaborators, witnesses and suspicious contacts."
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
                                    index,
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
        index,
        portfolio
    ) {
        const projectCount =
            portfolio.projects.filter(
                project =>
                    project.clientId ===
                    npc.id
            ).length;

        const experienceCount =
            portfolio.experiences.filter(
                experience =>
                    experience.npcId ===
                    npc.id
            ).length;

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
                            "Projects",
                            projectCount
                        )}

                        ${npcFact(
                            "Experience Links",
                            experienceCount
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

                    ${tagList(
                        [
                            npc.trait,
                            npc.type,
                            npc.danger,
                        ]
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
                    "Operational events connected to projects, NPC witnesses and the fictional world's infrastructure."
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
                            Project:
                            ${escapeHTML(
                                incident.project
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
                    "A compact historical record of increasingly questionable professional decisions."
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
       ARCHIVE
       ======================================================== */

    function renderArchiveNotice(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="archive"
            >

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
                            portfolio.archive
                                .archiveNumber
                        )}

                        ${infoCard(
                            "Created",
                            portfolio.archive
                                .created
                        )}

                        ${infoCard(
                            "Updated",
                            portfolio.archive
                                .lastUpdated
                        )}

                        ${infoCard(
                            "Classification",
                            portfolio.archive
                                .classification
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
        if (
            !portfolio ||
            !portfolio.ui
        ) {
            throw new Error(
                "Invalid portfolio generated."
            );
        }

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
            throw new Error(
                "Application mount element #app was not found."
            );
        }

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
            )}`,
        ].join(" ");

        app.dataset.decoration =
            safe(
                ui.decoration,
                "none"
            );

        app.dataset.navigation =
            safe(
                ui.nav,
                "top"
            );

        app.dataset.generation =
            String(
                runtime.generationCount
            );

        app.innerHTML = `
            ${renderTopbar(
                portfolio
            )}

            <main id="main-content">

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
                                "start",
                        });
                    }
                );
            }
        );
    }


    /* ========================================================
       ACCESSIBILITY
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

            Object.assign(
                live.style,
                {
                    position:
                        "fixed",
                    width:
                        "1px",
                    height:
                        "1px",
                    padding:
                        "0",
                    margin:
                        "-1px",
                    overflow:
                        "hidden",
                    clip:
                        "rect(0, 0, 0, 0)",
                    whiteSpace:
                        "nowrap",
                    border:
                        "0",
                }
            );

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
       GENERATION
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
       ERROR SCREEN
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
       GLOBAL ERRORS
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
       KEYBOARD
       ======================================================== */

    document.addEventListener(
        "keydown",
        event => {
            if (
                String(
                    event.key
                ).toLowerCase() ===
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
