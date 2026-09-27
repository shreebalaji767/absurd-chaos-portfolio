/* ============================================================
   ABSURD CHAOS PORTFOLIO
   ------------------------------------------------------------
   PROCEDURAL FICTIONAL PORTFOLIO RENDERER
   ------------------------------------------------------------
   Browser memory only.
   No database.
   No API.
   No cookies.
   No localStorage.
   No sessionStorage.
   No IndexedDB.
   No fetch.
   No network dependency.
   ============================================================ */

(() => {
    "use strict";

    const CONFIG =
        window.__ABSURD_CONFIG__;

    /* ========================================================
       RUNTIME
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
    ) => [
        ...root.querySelectorAll(selector)
    ];


    /* ========================================================
       CONFIG SAFETY
       ======================================================== */

    if (
        !CONFIG ||
        typeof CONFIG !== "object"
    ) {
        document.body.innerHTML = `
            <main class="noscript">
                <h1>Configuration Missing</h1>
                <p>
                    The procedural portfolio configuration could not be loaded.
                </p>
            </main>
        `;

        return;
    }


    /* ========================================================
       RANDOM
       ======================================================== */

    function random() {
        try {
            if (
                window.crypto &&
                typeof window.crypto.getRandomValues === "function"
            ) {
                const buffer =
                    new Uint32Array(2);

                window.crypto.getRandomValues(
                    buffer
                );

                const high =
                    buffer[0] / 4294967296;

                const low =
                    buffer[1] / 4294967296;

                return (
                    (high + low / 4294967296) %
                    1
                );
            }
        } catch {
            /* Fall through. */
        }

        return Math.random();
    }


    function integer(
        min,
        max
    ) {
        min = Math.ceil(
            Number(min) || 0
        );

        max = Math.floor(
            Number(max) || 0
        );

        if (max < min) {
            [
                min,
                max
            ] = [
                max,
                min
            ];
        }

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
    }


    function pick(
        values,
        fallback = ""
    ) {
        if (
            !Array.isArray(values) ||
            values.length === 0
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
        const source =
            Array.isArray(values)
                ? [
                    ...values
                ]
                : [];

        const target =
            Math.max(
                0,
                Math.min(
                    Number(count) || 0,
                    source.length
                )
            );

        const output = [];

        while (
            source.length &&
            output.length < target
        ) {
            const index =
                integer(
                    0,
                    source.length - 1
                );

            output.push(
                source.splice(
                    index,
                    1
                )[0]
            );
        }

        return output;
    }


    function weightedChoice(
        values
    ) {
        if (
            !Array.isArray(values) ||
            !values.length
        ) {
            return "";
        }

        const total =
            values.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Math.max(
                        0,
                        Number(
                            item.weight
                        ) || 0
                    ),
                0
            );

        if (
            total <= 0
        ) {
            return pick(
                values.map(
                    item => item.value
                )
            );
        }

        let cursor =
            random() *
            total;

        for (
            const item of values
        ) {
            cursor -=
                Math.max(
                    0,
                    Number(
                        item.weight
                    ) || 0
                );

            if (
                cursor <= 0
            ) {
                return item.value;
            }
        }

        return values[
            values.length - 1
        ].value;
    }


    /* ========================================================
       TEXT HELPERS
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

        return text ||
            fallback;
    }


    function safeArray(
        value
    ) {
        if (
            !Array.isArray(value)
        ) {
            return [];
        }

        return value
            .filter(
                item =>
                    item !== null &&
                    item !== undefined
            )
            .map(
                item =>
                    String(item)
            );
    }


    function uniqueStrings(
        values
    ) {
        return [
            ...new Set(
                safeArray(values)
                    .map(
                        value =>
                            value.trim()
                    )
                    .filter(Boolean)
            )
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
            text.charAt(0)
                .toUpperCase() +
            text.slice(1)
        );
    }


    function initials(
        value
    ) {
        const words =
            safe(
                value,
                "Unknown"
            )
                .split(/\s+/)
                .filter(Boolean);

        if (
            words.length === 1
        ) {
            return words[0]
                .slice(0, 2)
                .toUpperCase();
        }

        return words
            .slice(0, 2)
            .map(
                word =>
                    word.charAt(0)
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
            !Number.isFinite(number)
        ) {
            return "0";
        }

        return new Intl.NumberFormat(
            undefined,
            {
                notation:
                    Math.abs(number) >= 10000
                        ? "compact"
                        : "standard",
                maximumFractionDigits: 1
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

        return (
            text.charAt(0)
                .toUpperCase() +
            text.slice(1)
        ).replace(
            /([.!?])?$/,
            match =>
                match
                    ? match
                    : "."
        );
    }


    function articleFor(
        value
    ) {
        const text =
            safe(value);

        if (!text) {
            return "a";
        }

        const lower =
            text.toLowerCase();

        if (
            /^(hour|honest|honor|heir)/.test(
                lower
            )
        ) {
            return "an";
        }

        if (
            /^(user|university|unicorn|unique|useful|usual)/.test(
                lower
            )
        ) {
            return "a";
        }

        return /^[aeiou]/.test(
            lower
        )
            ? "an"
            : "a";
    }


    function hashString(
        value
    ) {
        let hash =
            2166136261;

        const text =
            String(value);

        for (
            let index = 0;
            index < text.length;
            index++
        ) {
            hash ^=
                text.charCodeAt(
                    index
                );

            hash =
                Math.imul(
                    hash,
                    16777619
                );
        }

        return (
            hash >>> 0
        )
            .toString(16)
            .padStart(
                8,
                "0"
            );
    }


    function randomId(
        prefix = "ID"
    ) {
        return (
            prefix +
            "-" +
            integer(
                100000,
                999999
            ) +
            "-" +
            integer(
                1000,
                9999
            )
        );
    }


    function randomCode(
        prefix = "INC"
    ) {
        return (
            prefix +
            "-" +
            integer(
                10,
                99
            ) +
            "-" +
            integer(
                100,
                999
            )
        );
    }


    function randomDateLabel(
        yearMin = 2019,
        yearMax = 2026
    ) {
        const year =
            integer(
                yearMin,
                yearMax
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


    /* ========================================================
       CONFIG ACCESS
       ======================================================== */

    function pool(
        key
    ) {
        return Array.isArray(
            CONFIG?.vocabulary?.[key]
        )
            ? CONFIG.vocabulary[key]
            : [];
    }


    function configPick(
        key,
        fallback = ""
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


    function contentLimit(
        key,
        fallback
    ) {
        const value =
            CONFIG?.content_limits?.[key];

        return Number.isFinite(
            Number(value)
        )
            ? Number(value)
            : fallback;
    }


    /* ========================================================
       WORLD GENERATION
       ======================================================== */

    function generateWorld() {
        const seeds =
            seedPool(
                "generated_world_seeds"
            );

        const source =
            seeds.length
                ? pick(seeds)
                : {
                    name:
                        "Unknown World",
                    genre:
                        "Experimental",
                    classification:
                        "Unclassified",
                    description:
                        "A world generated after the world generator became confused.",
                    sky:
                        "uncertain",
                    technology:
                        "unknown infrastructure",
                    socialRule:
                        "Document everything.",
                    rule:
                        "Do not trust unexplained systems.",
                    danger:
                        "Unexpected complexity.",
                    conflict:
                        "The system is investigating itself.",
                    population:
                        100000,
                    age:
                        1,
                    stability:
                        50,
                    rules:
                        [],
                    factions:
                        []
                };

        const world = {
            id:
                randomId("WORLD"),

            name:
                safe(
                    source.name,
                    "Unknown World"
                ),

            genre:
                safe(
                    source.genre,
                    "Experimental"
                ),

            classification:
                safe(
                    source.classification,
                    "Unclassified"
                ),

            description:
                safe(
                    source.description,
                    "A fictional world."
                ),

            sky:
                safe(
                    source.sky,
                    "unknown"
                ),

            technology:
                safe(
                    source.technology,
                    "unknown technology"
                ),

            socialRule:
                safe(
                    source.socialRule,
                    "Document everything."
                ),

            rule:
                safe(
                    source.rule,
                    "Do not trust unexplained systems."
                ),

            danger:
                safe(
                    source.danger,
                    "Unexpected complexity."
                ),

            conflict:
                safe(
                    source.conflict,
                    "The world is currently under investigation."
                ),

            population:
                Number(
                    source.population
                ) || 100000,

            age:
                Number(
                    source.age
                ) || 1,

            stability:
                Number(
                    source.stability
                ) || 50,

            rules:
                sample(
                    safeArray(
                        source.rules
                    ),
                    contentLimit(
                        "world_rule_cards",
                        5
                    )
                ),

            factions:
                sample(
                    safeArray(
                        source.factions
                    ),
                    contentLimit(
                        "world_faction_cards",
                        5
                    )
        };

        if (
            !world.rules.length
        ) {
            world.rules = [
                "Document every production change.",
                "Do not deploy unexplained infrastructure."
            ];
        }

        if (
            !world.factions.length
        ) {
            world.factions = [
                "Independent Systems Guild",
                "Archive Operations"
            ];
        }

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
            seeds.length
                ? pick(seeds)
                : null;

        let name = "";

        for (
            let attempt = 0;
            attempt < 50;
            attempt++
        ) {
            const first =
                safe(
                    source?.first,
                    configPick(
                        "npc_first_names",
                        "Unknown"
                    )
                );

            const last =
                safe(
                    source?.last,
                    configPick(
                        "npc_last_names",
                        "Person"
                    )
                );

            name =
                `${first} ${last}`;

            if (
                !usedNames.has(name)
            ) {
                break;
            }

            source =
                seeds.length
                    ? pick(seeds)
                    : null;
        }

        if (
            usedNames.has(name)
        ) {
            name =
                `${configPick(
                    "npc_first_names",
                    "Unknown"
                )} ${configPick(
                    "npc_last_names",
                    "Person"
                )} ${integer(
                    10,
                    99
                )}`;
        }

        usedNames.add(
            name
        );

        const role =
            safe(
                source?.role,
                configPick(
                    "npc_roles",
                    "Systems Officer"
                )
            );

        const type =
            safe(
                source?.type,
                configPick(
                    "npc_types",
                    "systems investigator"
                )
            );

        const trait =
            safe(
                source?.trait,
                configPick(
                    "npc_traits",
                    "calm under pressure"
                )
            );

        const relationship =
            safe(
                source?.relationship,
                configPick(
                    "npc_relationships",
                    "trusted contact"
                )
            );

        const secret =
            safe(
                source?.secret,
                configPick(
                    "npc_secrets",
                    "They know something important."
                )
            );

        const dialogue =
            safe(
                source?.dialogue,
                configPick(
                    "npc_dialogue",
                    "The system is behaving strangely."
                )
            );

        const npc = {
            id:
                randomId("NPC"),

            name,

            first:
                name.split(" ")[0],

            last:
                name.split(" ").slice(1).join(" "),

            role,

            type,

            trait,

            relationship,

            secret,

            dialogue,

            status:
                configPick(
                    "statuses",
                    "Operational"
                ),

            faction:
                safe(
                    faction,
                    "Independent Systems Guild"
                ),

            world:
                world.name,

            location:
                pick([
                    world.name,
                    "Central Operations",
                    "Archive District",
                    "Outer Ring",
                    "Night Sector",
                    "Administrative Quarter"
                ]),

            reputation:
                integer(
                    22,
                    99
                ),

            danger:
                pick([
                    "Low",
                    "Moderate",
                    "High",
                    "Unknown"
                ]),

            age:
                integer(
                    21,
                    74
                ),

            encounters:
                integer(
                    1,
                    37
                ),

            biography:
                "",

            rumors:
                [],

            connections:
                {
                    projects: [],
                    experiences: [],
                    incidents: [],
                    quests: []
                }
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
        return compactText(
            `${npc.name} is ${articleFor(
                npc.type
            )} ${npc.type} serving as ${articleFor(
                npc.role
            )} ${npc.role} in ${world.name}.`,
            `Their working style is ${npc.trait}, which makes them unusually useful during operational incidents.`,
            `Their current relationship with the portfolio owner is described as ${npc.relationship}.`
        );
    }


    function buildNPCRumors(
        npc,
        world
    ) {
        const first =
            pick([
                `${npc.name} knows more about ${world.conflict} than they admit.`,
                `${npc.name} keeps an undocumented backup somewhere in ${world.name}.`,
                `${npc.name} once prevented a larger incident without filing a ticket.`,
                `${npc.name} has been seen talking to infrastructure after midnight.`,
                `${npc.name} may have access to an older version of reality.`
            ]);

        const second =
            pick([
                "The official archive denies this.",
                "No faction has accepted responsibility.",
                "The incident was later classified.",
                "Several witnesses disagree.",
                "The logs are suspiciously incomplete."
            ]);

        return [
            first,
            second
        ];
    }


    /* ========================================================
       EXPERIENCE GENERATION
       ======================================================== */

    function generateExperience(
        world,
        faction,
        specialties,
        npc
    ) {
        const role =
            configPick(
                "experience_roles",
                "Systems Engineer"
            );

        const technologies =
            configSample(
                "specialties",
                integer(
                    contentLimit(
                        "experience_technologies_min",
                        4
                    ),
                    contentLimit(
                        "experience_technologies_max",
                        7
                    )
                )
            );

        const years =
            integer(
                1,
                9
            );

        const experience = {
            id:
                randomId("EXP"),

            organization:
                faction,

            world:
                world.name,

            role,

            years,

            status:
                configPick(
                    "statuses",
                    "Operational"
                ),

            technologies:
                technologies.length
                    ? technologies
                    : specialties.slice(
                        0,
                        4
                    ),

            opening:
                configPick(
                    "experience_openings",
                    "Joined during a difficult transition."
                ),

            hook:
                pick(
                    CONFIG?.narrative_settings?.hooks,
                    "A strange assignment."
                ),

            incident:
                configPick(
                    "experience_incidents",
                    "A production incident occurred."
                ),

            turn:
                pick(
                    CONFIG?.narrative_settings?.turns,
                    "The original requirements changed."
                ),

            lesson:
                configPick(
                    "experience_lessons",
                    "Documentation matters."
                ),

            closing:
                pick(
                    CONFIG?.narrative_settings?.closings,
                    "The system survived."
                ),

            npc:
                npc,

            narrative:
                {},

            achievements:
                [],

            incidents:
                []
        };

        experience.narrative =
            buildExperienceNarrative(
                experience
            );

        experience.achievements =
            buildExperienceAchievements(
                experience,
                npc
            );

        experience.incidents = [
            experience.incident,
            experience.turn
        ];

        return experience;
    }


    function buildExperienceNarrative(
        experience
    ) {
        const npc =
            experience.npc;

        return {
            summary:
                compactText(
                    experience.opening,
                    `The assignment involved ${experience.role.toLowerCase()} work across ${experience.world}.`
                ),

            context:
                compactText(
                    `The main contact was ${npc.name}, ${npc.role.toLowerCase()}.`,
                    `${capitalize(
                        npc.name
                    )} was listed as the ${npc.relationship}.`
                ),

            incident:
                sentence(
                    experience.incident
                ),

            response:
                compactText(
                    `The response combined ${experience.technologies
                        .slice(0, 3)
                        .join(", ")}.`,
                    experience.turn
                ),

            lesson:
                sentence(
                    experience.lesson
                )
        };
    }


    function buildExperienceAchievements(
        experience,
        npc
    ) {
        return [
            `Stabilized the ${experience.world} operational workflow.`,
            `Built a repeatable process around ${experience.technologies[0] || "automation"}.`,
            `Created a direct technical working relationship with ${npc.name}.`,
            `Converted an incident into documented operational knowledge.`
        ];
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
        const projectType =
            configPick(
                "project_types",
                "Platform"
            );

        const baseName =
            configPick(
                "project_names",
                "Atlas"
            );

        const suffix =
            pick([
                "Core",
                "Prime",
                "Grid",
                "X",
                "Protocol",
                "Network",
                "Engine",
                "Works",
                "OS",
                "Node",
                "Vault",
                "Layer"
            ]);

        const project = {
            id:
                randomId("PROJECT"),

            name:
                `${baseName} ${suffix}`,

            type:
                projectType,

            industry:
                industry,

            world:
                world.name,

            skills:
                configSample(
                    "specialties",
                    integer(
                        contentLimit(
                            "project_technologies_min",
                            3
                        ),
                        contentLimit(
                            "project_technologies_max",
                            7
                        )
                    )
                ),

            client:
                npcs.length
                    ? pick(npcs)
                    : null,

            problem:
                configPick(
                    "project_problems",
                    "The system was difficult to operate."
                ),

            solution:
                configPick(
                    "project_solutions",
                    "The system was redesigned."
                ),

            failure:
                configPick(
                    "project_failures",
                    "The first version failed."
                ),

            outcome:
                configPick(
                    "project_outcomes",
                    "The final system became stable."
                ),

            status:
                configPick(
                    "statuses",
                    "Operational"
                ),

            complexity:
                integer(
                    42,
                    99
                ),

            users:
                integer(
                    800,
                    9000000
                ),

            duration:
                integer(
                    1,
                    18
                ),

            narrative:
                {},

            technicalNotes:
                []
        };

        if (
            !project.skills.length
        ) {
            project.skills =
                specialties.slice(
                    0,
                    4
                );
        }

        project.narrative =
            buildProjectNarrative(
                project
            );

        project.technicalNotes =
            sample(
                pool(
                    "project_notes"
                ),
                contentLimit(
                    "project_notes",
                    4
                )
            );

        if (
            project.client
        ) {
            project.client.connections.projects.push(
                project.id
            );
        }

        return project;
    }


    function buildProjectNarrative(
        project
    ) {
        const client =
            project.client;

        return {
            summary:
                compactText(
                    `${project.name} is ${articleFor(
                        project.type
                    )} ${project.type.toLowerCase()} built for ${project.industry}.`,
                    `It operates in ${project.world}.`
                ),

            problem:
                sentence(
                    project.problem
                ),

            architecture:
                compactText(
                    `The architecture combines ${project.skills
                        .slice(0, 4)
                        .join(", ")}.`,
                    `The design prioritizes visible failure and recoverable operations.`
                ),

            client:
                client
                    ? compactText(
                        `${client.name} served as the primary stakeholder.`,
                        `${capitalize(
                            client.name
                        )} is a ${client.type}.`
                    )
                    : "Primary stakeholder information unavailable.",

            failure:
                sentence(
                    project.failure
                ),

            solution:
                sentence(
                    project.solution
                ),

            outcome:
                sentence(
                    project.outcome
                )
        };
    }


    function compactText(
        ...parts
    ) {
        return parts
            .map(
                part =>
                    safe(part)
            )
            .filter(Boolean)
            .join(" ");
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
            npcs.length
                ? pick(npcs)
                : null;

        const project =
            projects.length
                ? pick(projects)
                : null;

        const incident = {
            id:
                randomId("INCIDENT"),

            code:
                randomCode("INC"),

            world:
                world.name,

            type:
                configPick(
                    "incident_types",
                    "Production Outage"
                ),

            opener:
                configPick(
                    "incident_openers",
                    "The incident began unexpectedly."
                ),

            consequence:
                configPick(
                    "incident_consequences",
                    "Several systems disagreed."
                ),

            risk:
                configPick(
                    "risk_levels",
                    "Moderate"
                ),

            status:
                configPick(
                    "statuses",
                    "Under Investigation"
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
                randomDateLabel(
                    2021,
                    2026
                ),

            narrative:
                {}
        };

        incident.narrative =
            buildIncidentNarrative(
                incident
            );

        if (
            witness
        ) {
            witness.connections.incidents.push(
                incident.id
            );
        }

        return incident;
    }


    function buildIncidentNarrative(
        incident
    ) {
        return {
            summary:
                compactText(
                    incident.opener,
                    incident.type.toLowerCase()
                ),

            observation:
                `The incident occurred in ${incident.world} and was classified as ${incident.risk.toLowerCase()} risk.`,

            consequence:
                sentence(
                    incident.consequence
                ),

            response:
                `Operations isolated the affected workflow, preserved evidence and restored the most stable known configuration.`,

            recommendation:
                `Document the failure mode and keep ${incident.code} attached to future deployment reviews.`
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
            npcs.length
                ? pick(npcs)
                : null;

        const client =
            npcs.length
                ? pick(
                    npcs.filter(
                        npc =>
                            npc.id !==
                            assignedBy?.id
                    )
                ) ||
                  assignedBy
                : null;

        const quest = {
            id:
                randomId("QUEST"),

            world:
                world.name,

            objective:
                configPick(
                    "quest_objectives",
                    "Repair the infrastructure."
                ),

            reward:
                configPick(
                    "quest_rewards",
                    "Operational clearance"
                ),

            risk:
                configPick(
                    "risk_levels",
                    "Moderate"
                ),

            client:
                client
                    ? client.name
                    : "Unknown",

            status:
                configPick(
                    "statuses",
                    "In Progress"
                ),

            assignedBy:
                assignedBy
                    ? assignedBy.name
                    : faction,

            description:
                "",

            faction
        };

        quest.description =
            compactText(
                `The ${faction} has assigned this objective in ${world.name}.`,
                `Primary contact: ${quest.assignedBy}.`,
                `Expected reward: ${quest.reward}.`
            );

        if (
            assignedBy
        ) {
            assignedBy.connections.quests.push(
                quest.id
            );
        }

        if (
            client &&
            client.id !== assignedBy?.id
        ) {
            client.connections.quests.push(
                quest.id
            );
        }

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
        const currentYear =
            new Date().getFullYear();

        const startYear =
            currentYear -
            Math.max(
                4,
                years
            );

        const events = [
            {
                title:
                    "Entered the field",

                text:
                    `Began working around ${industry} systems and discovered that documentation was usually optional until something broke.`
            },

            {
                title:
                    "First production system",

                text:
                    "Moved from isolated experiments into systems where other people depended on the result."
            },

            {
                title:
                    "Automation phase",

                text:
                    "Started replacing repetitive operational work with repeatable automation."
            },

            {
                title:
                    "Incident archive opened",

                text:
                    "Major failures began being documented as reusable engineering knowledge."
            },

            {
                title:
                    "Cross-world assignment",

                text:
                    `Accepted an assignment involving ${experiences[0]?.world || "an unknown world"}.`
            },

            {
                title:
                    "Infrastructure specialization",

                text:
                    "Focused increasingly on systems that remain useful when everything around them becomes complicated."
            },

            {
                title:
                    "Current operational state",

                text:
                    "Continues building systems, investigating incidents and refusing to call production architecture temporary."
            }
        ];

        return events.map(
            (
                event,
                index
            ) => ({
                year:
                    startYear +
                    index,

                title:
                    event.title,

                text:
                    event.text
            })
        );
    }


    /* ========================================================
       UI DNA
       ======================================================== */

    function choosePalette(
        family
    ) {
        const palettes = {
            executive: {
                accent:
                    "#8b7cff",
                accent2:
                    "#58e0bd",
                background:
                    "#090a0c",
                surface:
                    "#101216"
            },

            terminal: {
                accent:
                    "#5cff91",
                accent2:
                    "#00d9ff",
                background:
                    "#050806",
                surface:
                    "#0b110d"
            },

            rpg: {
                accent:
                    "#d69bff",
                accent2:
                    "#ffcf70",
                background:
                    "#0c0911",
                surface:
                    "#15101d"
            },

            manhwa: {
                accent:
                    "#ff4d91",
                accent2:
                    "#7b7cff",
                background:
                    "#fff8fc",
                surface:
                    "#ffffff"
            },

            dossier: {
                accent:
                    "#d8b45a",
                accent2:
                    "#83c7a1",
                background:
                    "#0d0d0b",
                surface:
                    "#151512"
            },

            research: {
                accent:
                    "#54b7ff",
                accent2:
                    "#75e0c0",
                background:
                    "#081018",
                surface:
                    "#101a23"
            },

            luxury: {
                accent:
                    "#e7bd72",
                accent2:
                    "#f5e3bd",
                background:
                    "#0b0907",
                surface:
                    "#15110d"
            },

            brutalist: {
                accent:
                    "#ff5d3a",
                accent2:
                    "#111111",
                background:
                    "#f2eee7",
                surface:
                    "#ffffff"
            },

            space: {
                accent:
                    "#9c8cff",
                accent2:
                    "#43d9ff",
                background:
                    "#050612",
                surface:
                    "#0c0e1d"
            },

            detective: {
                accent:
                    "#d7a85d",
                accent2:
                    "#8b9cae",
                background:
                    "#0c0c0d",
                surface:
                    "#151516"
            },

            spellbook: {
                accent:
                    "#c78cff",
                accent2:
                    "#6fe3bf",
                background:
                    "#0d0813",
                surface:
                    "#171021"
            },

            underground: {
                accent:
                    "#ff765f",
                accent2:
                    "#f5cf65",
                background:
                    "#090807",
                surface:
                    "#15110f"
            },

            newspaper: {
                accent:
                    "#171717",
                accent2:
                    "#8c0000",
                background:
                    "#eee9dd",
                surface:
                    "#fffdf7"
            },

            "operating-system": {
                accent:
                    "#00d4ff",
                accent2:
                    "#7dff8d",
                background:
                    "#06090c",
                surface:
                    "#0d1318"
            },

            chaotic: {
                accent:
                    "#ff4fd8",
                accent2:
                    "#55f6ff",
                background:
                    "#09060b",
                surface:
                    "#15101a"
            }
        };

        return (
            palettes[
                family
            ] ||
            palettes.executive
        );
    }


    function generateUIDNA(
        context
    ) {
        const families =
            uniqueStrings(
                CONFIG?.ui_system?.families
            );

        const layouts =
            uniqueStrings(
                CONFIG?.ui_system?.layouts
            );

        const navs =
            uniqueStrings(
                CONFIG?.ui_system?.navs
            );

        const heroModes =
            uniqueStrings(
                CONFIG?.ui_system?.hero_modes
            );

        const densities =
            uniqueStrings(
                CONFIG?.ui_system?.densities
            );

        const decorations =
            uniqueStrings(
                CONFIG?.ui_system?.decorations
            );

        const title =
            safe(
                context.title
            ).toLowerCase();

        const genre =
            safe(
                context.genre
            ).toLowerCase();

        const personality =
            safe(
                context.personality
            ).toLowerCase();

        const chaos =
            Number(
                context.chaos
            ) || 50;

        const specialtyText =
            safeArray(
                context.specialties
            )
                .join(" ")
                .toLowerCase();

        const weights =
            families.map(
                family => ({
                    value:
                        family,
                    weight:
                        1
                })
            );

        function boost(
            names,
            amount
        ) {
            weights.forEach(
                item => {
                    if (
                        names.includes(
                            item.value
                        )
                    ) {
                        item.weight +=
                            amount;
                    }
                }
            );
        }

        if (
            /backend|platform|systems|devops|infrastructure|automation/
                .test(
                    title +
                    " " +
                    specialtyText
                )
        ) {
            boost(
                [
                    "terminal",
                    "operating-system",
                    "executive"
                ],
                8
            );
        }

        if (
            /research|science|data|experimental/
                .test(
                    genre +
                    " " +
                    specialtyText
                )
        ) {
            boost(
                [
                    "research",
                    "space"
                ],
                7
            );
        }

        if (
            /security|detective|mystery/
                .test(
                    genre +
                    " " +
                    specialtyText
                )
        ) {
            boost(
                [
                    "dossier",
                    "detective",
                    "underground"
                ],
                7
            );
        }

        if (
            /fantasy|manhwa|dungeon|magic/
                .test(
                    genre
                )
        ) {
            boost(
                [
                    "rpg",
                    "spellbook",
                    "manhwa"
                ],
                9
            );
        }

        if (
            /space|cosmic|science fiction|orbital/
                .test(
                    genre
                )
        ) {
            boost(
                [
                    "space",
                    "research"
                ],
                8
            );
        }

        if (
            chaos > 78
        ) {
            boost(
                [
                    "chaotic",
                    "brutalist",
                    "underground"
                ],
                10
            );
        }

        if (
            /methodical|professional|practical/
                .test(
                    personality
                )
        ) {
            boost(
                [
                    "executive",
                    "research",
                    "dossier"
                ],
                5
            );
        }

        if (
            /chaotic|experimental/
                .test(
                    personality
                )
        ) {
            boost(
                [
                    "chaotic",
                    "brutalist",
                    "manhwa"
                ],
                6
            );
        }

        let family =
            weightedChoice(
                weights
            );

        /*
         * Internal Generate button should not repeatedly
         * produce exactly the same visual identity.
         */
        if (
            runtime.current?.ui?.family &&
            families.length > 1 &&
            family ===
                runtime.current.ui.family
        ) {
            const alternatives =
                families.filter(
                    item =>
                        item !==
                        runtime.current.ui.family
                );

            family =
                pick(
                    alternatives,
                    family
                );
        }

        const palette =
            choosePalette(
                family
            );

        const density =
            chaos > 82
                ? pick(
                    densities,
                    "compact"
                )
                : chaos < 30
                    ? pick(
                        densities,
                        "spacious"
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
                chaos > 85
                    ? pick(
                        decorations,
                        "scanlines"
                    )
                    : pick(
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

            personality:
                context.personality,

            chaos,

            specialtyCount:
                safeArray(
                    context.specialties
                ).length,

            longForm:
                false,

            textHeavy:
                false,

            cardFirst:
                true
        };

        return ui;
    }


    /* ========================================================
       PORTFOLIO GENERATION
       ======================================================== */

    function generatePortfolio() {
        const world =
            generateWorld();

        const name =
            configPick(
                "names",
                "Unknown Engineer"
            );

        const title =
            configPick(
                "titles",
                "Systems Engineer"
            );

        const personality =
            configPick(
                "personalities",
                "methodical"
            );

        const industry =
            configPick(
                "industries",
                "software infrastructure"
            );

        const education =
            configPick(
                "education",
                "Independent Systems Research"
            );

        const faction =
            pick(
                world.factions,
                configPick(
                    "factions",
                    "Independent Systems Guild"
                )
            );

        const specialties =
            uniqueStrings(
                configSample(
                    "specialties",
                    integer(
                        5,
                        9
                    )
                )
            );

        if (
            !specialties.length
        ) {
            specialties.push(
                "Systems Engineering",
                "Automation",
                "JavaScript",
                "Python"
            );
        }

        const chaos =
            integer(
                18,
                99
            );

        const npcCount =
            integer(
                8,
                12
            );

        const usedNames =
            new Set();

        const npcs = [];

        for (
            let index = 0;
            index < npcCount;
            index++
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

        /*
         * Experience is generated after NPC generation,
         * so every career record has actual people attached.
         */
        const experienceCount =
            integer(
                5,
                8
            );

        const experiences = [];

        for (
            let index = 0;
            index < experienceCount;
            index++
        ) {
            const npc =
                pick(
                    npcs
                );

            const experience =
                generateExperience(
                    world,
                    npc.faction,
                    specialties,
                    npc
                );

            experiences.push(
                experience
            );

            npc.connections.experiences.push(
                experience.id
            );
        }

        const projectCount =
            integer(
                6,
                9
            );

        const projects = [];

        for (
            let index = 0;
            index < projectCount;
            index++
        ) {
            const project =
                generateProject(
                    world,
                    industry,
                    specialties,
                    npcs
                );

            projects.push(
                project
            );
        }

        const incidentCount =
            integer(
                5,
                8
            );

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

        const questCount =
            integer(
                3,
                5
            );

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
                )
        };

        const timeline =
            generateTimeline(
                integer(
                    4,
                    12
                ),
                industry,
                experiences
            );

        const ui =
            generateUIDNA({
                world,
                title,
                personality,
                genre:
                    world.genre,
                chaos,
                specialties
            });

        const createdYear =
            integer(
                2020,
                2025
            );

        const updatedYear =
            integer(
                createdYear,
                2026
            );

        const created =
            randomDateLabel(
                createdYear,
                createdYear
            );

        const lastUpdated =
            randomDateLabel(
                updatedYear,
                updatedYear
            );

        const archive = {
            archiveNumber:
                `ARC-${integer(
                    10000,
                    99999
                )}`,

            created,

            lastUpdated,

            classification:
                pick([
                    "PUBLIC",
                    "FIELD RECORD",
                    "PROFESSIONAL",
                    "CLASSIFIED",
                    "RESEARCH",
                    "ARCHIVED"
                ]),

            warning:
                pick([
                    "This portfolio was generated from fictional operational records.",
                    "This archive describes a professional history from a fictional reality.",
                    "All projects, people and incidents in this archive are fictional.",
                    "The following record may contain infrastructure that should not exist.",
                    "Archive authenticity: intentionally impossible."
                ])
        };

        const portfolio = {
            id:
                randomId("PORTFOLIO"),

            name,

            title,

            personality,

            industry,

            education,

            faction,

            genre:
                world.genre,

            specialties,

            years:
                integer(
                    3,
                    16
                ),

            chaos,

            world,

            npcs,

            experiences,

            projects,

            incidents,

            quests,

            metrics,

            timeline,

            archive,

            ui,

            generatedAt:
                Date.now(),

            signature:
                ""
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
        const data =
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
                    project =>
                        project.id
                ),
                ...portfolio.experiences.map(
                    experience =>
                        experience.id
                ),
                ...portfolio.npcs.map(
                    npc =>
                        npc.id
                )
            ].join("|");

        return hashString(
            data
        );
    }


    function generateUniquePortfolio() {
        for (
            let attempt = 0;
            attempt < 100;
            attempt++
        ) {
            const portfolio =
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

        throw new Error(
            "Unable to generate a unique portfolio."
        );
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

        /*
         * Keep accent text readable for light palettes.
         */
        root.style.setProperty(
            "--text-on-accent",
            isLightColor(
                ui.accent
            )
                ? "#111111"
                : "#ffffff"
        );

        root.dataset.uiFamily =
            slug(
                ui.family
            );
    }


    function isLightColor(
        hex
    ) {
        const value =
            String(hex)
                .replace(
                    "#",
                    ""
                );

        if (
            value.length !== 6
        ) {
            return false;
        }

        const r =
            parseInt(
                value.slice(
                    0,
                    2
                ),
                16
            );

        const g =
            parseInt(
                value.slice(
                    2,
                    4
                ),
                16
            );

        const b =
            parseInt(
                value.slice(
                    4,
                    6
                ),
                16
            );

        const luminance =
            (
                0.299 * r +
                0.587 * g +
                0.114 * b
            );

        return luminance > 175;
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
                href="#${escapeHTML(target)}"
                class="nav-link"
            >
                ${escapeHTML(label)}
            </a>
        `;
    }


    function renderNavigation(
        portfolio
    ) {
        const ui =
            portfolio.ui;

        const links = [
            navLink(
                "profile",
                "Profile"
            ),
            navLink(
                "experiences",
                "Experience"
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
            ),
            navLink(
                "timeline",
                "Timeline"
            )
        ].join("");

        return `
            <nav
                class="navigation"
                aria-label="Portfolio navigation"
            >

                <div class="nav-links">
                    ${links}
                </div>

                <button
                    type="button"
                    class="generate-button"
                    data-generate
                >
                    <span>
                        ${ui.nav === "rail"
                            ? "New Reality"
                            : "Generate"}
                    </span>

                    <kbd>G</kbd>
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
                    href="#main-content"
                    aria-label="Back to top"
                >

                    <span class="brand-mark">
                        ${escapeHTML(
                            initials(
                                portfolio.name
                            )
                        )}
                    </span>

                    <span class="brand-text">
                        <strong>
                            ABSURD ARCHIVE
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
        const ui =
            portfolio.ui;

        const modes = {
            identity: {
                eyebrow:
                    "IDENTITY FILE",

                title:
                    portfolio.name,

                subtitle:
                    portfolio.title
            },

            mission: {
                eyebrow:
                    "ACTIVE MISSION",

                title:
                    portfolio.world.name,

                subtitle:
                    portfolio.title
            },

            profile: {
                eyebrow:
                    "PROFESSIONAL PROFILE",

                title:
                    portfolio.name,

                subtitle:
                    portfolio.industry
            },

            case: {
                eyebrow:
                    "CASE FILE",

                title:
                    portfolio.archive.archiveNumber,

                subtitle:
                    portfolio.name
            },

            status: {
                eyebrow:
                    "SYSTEM STATUS",

                title:
                    portfolio.archive.classification,

                subtitle:
                    portfolio.name
            },

            command: {
                eyebrow:
                    "COMMAND PROFILE",

                title:
                    portfolio.faction,

                subtitle:
                    portfolio.name
            },

            character: {
                eyebrow:
                    "CHARACTER RECORD",

                title:
                    portfolio.name,

                subtitle:
                    `${portfolio.personality} ${portfolio.title}`
            },

            manifesto: {
                eyebrow:
                    "ENGINEERING MANIFESTO",

                title:
                    "Make failure visible.",

                subtitle:
                    portfolio.name
            },

            classified: {
                eyebrow:
                    "CLASSIFIED RECORD",

                title:
                    "ACCESS GRANTED",

                subtitle:
                    portfolio.name
            },

            "field-report": {
                eyebrow:
                    "FIELD REPORT",

                title:
                    portfolio.world.name,

                subtitle:
                    portfolio.name
            }
        };

        const mode =
            modes[
                ui.hero
            ] ||
            modes.identity;

        return `
            <section
                class="hero section"
                data-hero-mode="${escapeHTML(
                    ui.hero
                )}"
            >

                <div class="hero-grid">

                    <div class="hero-copy">

                        <div class="eyebrow">
                            ${escapeHTML(
                                mode.eyebrow
                            )}
                        </div>

                        <h1>
                            ${escapeHTML(
                                mode.title
                            )}
                        </h1>

                        <div class="hero-title">
                            ${escapeHTML(
                                mode.subtitle
                            )}
                        </div>

                        <p class="hero-description">
                            ${escapeHTML(
                                pick([
                                    `A ${portfolio.personality} ${portfolio.title.toLowerCase()} operating across ${portfolio.world.name}.`,
                                    `A fictional professional archive assembled from projects, incidents, people and systems.`,
                                    `${portfolio.world.description}`,
                                    `Engineering, infrastructure and questionable decisions recorded as a compact operational portfolio.`
                                ])
                            )}
                        </p>

                        <div class="hero-actions">

                            <a
                                href="#work"
                                class="button primary"
                            >
                                View Projects
                            </a>

                            <a
                                href="#experiences"
                                class="button secondary"
                            >
                                Experience
                            </a>

                            <button
                                type="button"
                                class="button ghost"
                                data-generate
                            >
                                New Portfolio
                            </button>

                        </div>

                        <div class="hero-meta">

                            ${heroMeta(
                                "World",
                                portfolio.world.name
                            )}

                            ${heroMeta(
                                "Faction",
                                portfolio.faction
                            )}

                            ${heroMeta(
                                "Chaos",
                                `${portfolio.chaos}/100`
                            )}

                            ${heroMeta(
                                "Specialties",
                                portfolio.specialties.length
                            )}

                        </div>

                    </div>

                    <aside class="hero-panel card">

                        <div class="section-kicker">
                            CURRENT REALITY
                        </div>

                        <div class="hero-panel-title">
                            ${escapeHTML(
                                portfolio.world.name
                            )}
                        </div>

                        <p>
                            ${escapeHTML(
                                portfolio.world.conflict
                            )}
                        </p>

                        <div class="hero-panel-grid">

                            ${infoCard(
                                "Stability",
                                `${portfolio.world.stability}%`
                            )}

                            ${infoCard(
                                "Population",
                                formatNumber(
                                    portfolio.world.population
                                )
                            )}

                            ${infoCard(
                                "Risk",
                                portfolio.world.danger
                            )}

                            ${infoCard(
                                "Archive",
                                portfolio.archive.archiveNumber
                            )}

                        </div>

                    </aside>

                </div>

            </section>
        `;
    }


    function heroMeta(
        label,
        value
    ) {
        return `
            <div class="hero-meta-box">

                <span>
                    ${escapeHTML(
                        label
                    )}
                </span>

                <strong>
                    ${escapeHTML(
                        String(value)
                    )}
                </strong>

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
            <section class="section stats-section">

                <div class="stat-grid">

                    ${statCard(
                        "Systems",
                        formatNumber(
                            portfolio.metrics.systems
                        )
                    )}

                    ${statCard(
                        "Deployments",
                        formatNumber(
                            portfolio.metrics.deployments
                        )
                    )}

                    ${statCard(
                        "Uptime",
                        `${portfolio.metrics.uptime}%`
                    )}

                    ${statCard(
                        "Users / Records",
                        formatNumber(
                            portfolio.metrics.users
                        )
                    )}

                    ${statCard(
                        "Worlds Visited",
                        portfolio.metrics.worldsVisited
                    )}

                    ${statCard(
                        "Open Mysteries",
                        portfolio.metrics.unresolvedMysteries
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

                <span class="stat-label">
                    ${escapeHTML(
                        label
                    )}
                </span>

                <strong class="stat-value">
                    ${escapeHTML(
                        String(value)
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

                    <div class="section-kicker">
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
        value
    ) {
        return `
            <article class="card info-card">

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
                class="card content-card ${escapeHTML(
                    extraClass
                )}"
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
            uniqueStrings(
                values
            );

        if (
            !list.length
        ) {
            return "";
        }

        return `
            <div
                class="tags ${escapeHTML(
                    className
                )}"
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
        const primary =
            portfolio.specialties[0] ||
            "Systems Engineering";

        const secondary =
            portfolio.specialties[1] ||
            primary;

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
                        `The formal record lists ${portfolio.education}. The operational record contains references to ${portfolio.metrics.worldsVisited} worlds and ${portfolio.metrics.unresolvedMysteries} unresolved mysteries.`
                    )}

                    ${textCard(
                        "Engineering Philosophy",
                        "Use appropriate technology, make failure visible, automate repetitive work, document important decisions, and never assume a system is simple merely because the interface has one button."
                    )}

                </div>

                <div class="card-grid profile-facts">

                    ${renderProfileFact(
                        "Primary Specialty",
                        primary
                    )}

                    ${renderProfileFact(
                        "Secondary Specialty",
                        secondary
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
                            value,
                            "Unknown"
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
                    "Career records presented as compact operational case files. People, incidents and systems are connected."
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

        const npc =
            experience.npc;

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
                                String(
                                    experience.years
                                )
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

                <div class="connection-strip">

                    <span>
                        PRIMARY NPC
                    </span>

                    <strong>
                        ${escapeHTML(
                            npc?.name ||
                            "Unknown"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            npc?.role ||
                            "Unknown role"
                        )}
                    </span>

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
                    "Each project is a compact case file. Architecture, failure, clients and outcomes remain visible without turning the page into a wall of text."
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

        const client =
            project.client;

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

                <div class="connection-strip project-client">

                    <span>
                        CLIENT / NPC
                    </span>

                    <strong>
                        ${escapeHTML(
                            client?.name ||
                            "Unknown"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            client?.type ||
                            "Unknown stakeholder"
                        )}
                    </span>

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
                        client?.name ||
                        "Unknown"
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
                            value,
                            "Unknown"
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
                    "These are active participants in the generated world. They become clients, employers, witnesses, contacts and quest-givers."
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
                            value,
                            "Unknown"
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
                    "Assignments circulating through the fictional operational network."
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
            throw new Error(
                "Application root #app was not found."
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
                        "0"
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
       RUNTIME ERROR
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
                background:var(--bg,#090a0c);
                color:var(--text,#f5f7fa);
            ">

                <article style="
                    width:min(760px,100%);
                    padding:28px;
                    border:1px solid rgba(255,255,255,.15);
                    border-radius:16px;
                    background:rgba(255,255,255,.04);
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

                    <h1>
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
            console.error(
                "ABSURD CHAOS GLOBAL ERROR:",
                event?.error ||
                event?.message
            );
        }
    );


    window.addEventListener(
        "unhandledrejection",
        event => {
            console.error(
                "ABSURD CHAOS UNHANDLED PROMISE:",
                event?.reason
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
