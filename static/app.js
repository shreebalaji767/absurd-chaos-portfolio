/* ============================================================
   ABSURD CHAOS PORTFOLIO
   ------------------------------------------------------------
   TEXT-HEAVY FICTIONAL WORLD ENGINE

   Runtime:
   - No localStorage
   - No sessionStorage
   - No IndexedDB
   - No cookies
   - No backend requests
   - No database
   - No API calls
   - Browser RAM only

   Every generation creates:
   - New identity
   - New fictional world
   - New world lore
   - New professional experiences
   - New projects
   - New NPCs
   - New incidents
   - New quests
   - New relationships
   - New narrative structure
   - New UI composition
   ============================================================ */

(() => {
    "use strict";

    const CONFIG = window.__ABSURD_CONFIG__;

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
                <div>
                    <h1>Configuration Missing</h1>
                    <p>The fictional archive could not be initialized.</p>
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
       BASIC HELPERS
       ======================================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];

    const random = () => {
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
    };

    const integer = (min, max) => {
        return Math.floor(
            random() * (max - min + 1)
        ) + min;
    };

    const pick = (array) => {
        if (!Array.isArray(array) || !array.length) {
            return "";
        }

        return array[
            Math.floor(random() * array.length)
        ];
    };

    const sample = (array, count) => {
        if (!Array.isArray(array)) {
            return [];
        }

        const copy = [...array];
        const result = [];

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
    };

    const clamp = (value, min, max) =>
        Math.min(
            Math.max(value, min),
            max
        );

    const slug = (value) =>
        String(value ?? "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const capitalize = (value) => {
        const text = String(value ?? "");

        if (!text) {
            return "";
        }

        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );
    };

    const escapeHTML = (value) => {
        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;
    };

    const initials = (name) => {
        return String(name ?? "")
            .split(/\s+/)
            .filter(Boolean)
            .map(
                (part) => part.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat(
            "en-US",
            {
                notation:
                    Number(value) > 999999
                        ? "compact"
                        : "standard",

                maximumFractionDigits: 1
            }
        ).format(value);
    };

    const hashString = (value) => {
        let hash = 2166136261;

        const text =
            String(value ?? "");

        for (
            let i = 0;
            i < text.length;
            i++
        ) {
            hash ^= text.charCodeAt(i);

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
    };

    const randomId = () => {
        return (
            Date.now().toString(36) +
            "-" +
            integer(
                100000,
                999999
            ).toString(36) +
            "-" +
            integer(
                100000,
                999999
            ).toString(36)
        );
    };

    /* ========================================================
       NARRATIVE HELPERS
       ======================================================== */

    function sentence(parts) {
        return parts
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function paragraph(parts) {
        return sentence(parts);
    }

    function randomDateLabel() {
        const year =
            integer(
                2012,
                new Date().getFullYear() + 8
            );

        const month = String(
            integer(1, 12)
        ).padStart(2, "0");

        const day = String(
            integer(1, 28)
        ).padStart(2, "0");

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
       WORLD GENERATION
       ======================================================== */

    function generateWorld() {
        const seed =
            pick(
                CONFIG.generated_world_seeds
            );

        const extraRules =
            sample(
                CONFIG.world_rules,
                integer(2, 5)
            );

        const factions =
            sample(
                CONFIG.factions,
                integer(3, 6)
            );

        const conflict =
            pick(
                CONFIG.world_conflicts
            );

        const world = {
            id: randomId(),

            name: seed.name,

            genre: seed.genre,

            description:
                seed.description,

            sky:
                seed.sky,

            technology:
                seed.technology,

            socialRule:
                seed.social_rule,

            danger:
                seed.danger,

            rule:
                seed.rule,

            rules: [
                seed.social_rule,
                seed.rule,
                ...extraRules
            ].filter(
                (value, index, array) =>
                    array.indexOf(value) === index
            ),

            conflict,

            factions,

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

        runtime.worldIndex.set(
            world.name,
            world
        );

        return world;
    }

    /* ========================================================
       NPC GENERATION
       ======================================================== */

    function generateNPC(world, faction) {
        const seed =
            pick(
                CONFIG.generated_npc_seeds
            );

        const dialogue =
            seed.dialogue ||
            pick(
                CONFIG.npc_dialogue
            );

        const secret =
            seed.secret ||
            pick(
                CONFIG.npc_secrets
            );

        const relationship =
            seed.relationship ||
            pick(
                CONFIG.npc_relationships
            );

        const npc = {
            id: randomId(),

            name:
                seed.name ||
                `${seed.first} ${seed.last}`,

            first:
                seed.first,

            last:
                seed.last,

            role:
                seed.role,

            type:
                seed.type,

            trait:
                seed.trait ||
                pick(
                    CONFIG.npc_traits
                ),

            relationship,

            secret,

            dialogue,

            status:
                seed.status ||
                pick(
                    CONFIG.statuses
                ),

            faction:
                seed.faction ||
                faction,

            world:
                world.name,

            location:
                pick(
                    CONFIG.locations
                ),

            reputation:
                integer(
                    4,
                    99
                ),

            danger:
                seed.risk ||
                pick(
                    CONFIG.risk_levels
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

    function buildNPCBiography(seed, world) {
        const first =
            seed.first ||
            "Unknown";

        const role =
            seed.role ||
            "unregistered specialist";

        const type =
            seed.type ||
            "unknown entity";

        const trait =
            seed.trait ||
            pick(
                CONFIG.npc_traits
            );

        const secret =
            seed.secret ||
            pick(
                CONFIG.npc_secrets
            );

        return [
            `${first} is a ${type} known in ${world.name} as a ${role}.`,

            `Most records describe them as ${trait}.`,

            `Their involvement with the portfolio owner began after a routine professional interaction became considerably less routine.`,

            `${capitalize(secret)}.`,

            `No reliable source agrees on what they were doing before arriving in ${world.name}.`,

            `Several witnesses insist that this omission is deliberate.`
        ].join(" ");
    }

    function buildNPCRumors(seed, world) {
        const rumors = [
            `Claims to have worked inside ${world.name} before it had its current name.`,

            `Was allegedly present during an incident that officially never happened.`,

            `Keeps a private copy of an architecture diagram nobody else has seen.`,

            `Has reportedly met the portfolio owner in another timeline.`,

            `Refuses to explain why their access badge works in restricted locations.`,

            `Once solved an infrastructure problem by asking the server a question.`,

            `May have changed factions without informing anyone.`,

            `Appears in historical records several decades earlier than expected.`,

            `Insists that the most dangerous system in the world is a perfectly ordinary spreadsheet.`,

            `Has never been photographed clearly.`
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
        const seed =
            pick(
                CONFIG.generated_experience_seeds
            );

        const role =
            seed.role ||
            pick(
                CONFIG.experience_roles
            );

        const opening =
            seed.opening ||
            pick(
                CONFIG.experience_openings
            );

        const hook =
            seed.hook ||
            pick(
                CONFIG.story_hooks
            );

        const incident =
            seed.incident ||
            pick(
                CONFIG.experience_incidents
            );

        const turn =
            seed.turn ||
            pick(
                CONFIG.story_turns
            );

        const lesson =
            seed.lesson ||
            pick(
                CONFIG.experience_lessons
            );

        const closing =
            seed.closing ||
            pick(
                CONFIG.closing_lines
            );

        const technologies =
            sample(
                specialties,
                Math.min(
                    specialties.length,
                    integer(3, 7)
                )
            );

        const experience = {
            id: randomId(),

            organization:
                seed.organization ||
                faction,

            world:
                seed.world ||
                world.name,

            role,

            years:
                seed.years ||
                integer(1, 9),

            status:
                seed.status ||
                pick(
                    CONFIG.statuses
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
                    integer(2, 4)
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

        return [
            paragraph([
                opening,
                `The role was listed as ${role}.`,
                `The actual responsibility was to keep the infrastructure belonging to ${faction} operational inside ${world.name}.`
            ]),

            paragraph([
                hook,
                `At the beginning, the assignment appeared to be a fairly conventional exercise in ${technologyText}.`
            ]),

            paragraph([
                `The first week was spent reading documentation, tracing dependencies, interviewing people who remembered different versions of the same system, and discovering that several assumptions had quietly become laws of the local environment.`
            ]),

            paragraph([
                incident,
                `Nobody could initially agree whether it was an infrastructure failure, a data problem, or an administrative problem.`
            ]),

            paragraph([
                turn,
                `Logs were compared against deployment records.`,
                `Deployment records were compared against eyewitness accounts.`,
                `The eyewitness accounts were eventually compared against each other.`
            ]),

            paragraph([
                `The technical response involved`,
                `${technologyText},`,
                `explicit boundaries, improved observability, automated recovery, and a considerable amount of documentation.`
            ]),

            paragraph([
                `The unusual part was not fixing the system.`,
                `The unusual part was discovering why everyone had become accustomed to the system being broken.`
            ]),

            paragraph([
                lesson
            ]),

            paragraph([
                closing
            ])
        ].join("\n\n");
    }

    function buildExperienceAchievements(
        world,
        role
    ) {
        const achievements = [
            `Stabilized a ${world.name} production environment without shutting it down.`,

            `Documented an undocumented dependency that had become operationally critical.`,

            `Introduced measurable monitoring to a system previously maintained through intuition.`,

            `Reduced repeated incidents by replacing manual intervention with automation.`,

            `Created a recovery procedure that eventually became standard practice.`,

            `Translated contradictory requirements into a working technical boundary.`,

            `Recovered historical information necessary to understand the current architecture.`,

            `Established an incident trail that allowed future engineers to reconstruct what happened.`,

            `Removed three unnecessary dependencies and accidentally made the system more reliable.`,

            `Explained the same technical problem to engineers, administrators and a person wearing a crown.`
        ];

        return sample(
            achievements,
            integer(3, 6)
        ).map(
            (achievement) =>
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
            );

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
            `${seed.name} ${suffix}`;

        const skills =
            sample(
                specialties,
                Math.min(
                    specialties.length,
                    integer(3, 6)
                )
            );

        const problem =
            seed.problem ||
            pick(
                CONFIG.project_problems
            );

        const solution =
            seed.solution ||
            pick(
                CONFIG.project_solutions
            );

        const failure =
            seed.failure ||
            pick(
                CONFIG.project_failures
            );

        const outcome =
            seed.outcome ||
            pick(
                CONFIG.project_outcomes
            );

        const client =
            npcs.length
                ? pick(npcs)
                : null;

        const project = {
            id: randomId(),

            name,

            type:
                seed.type,

            industry:
                seed.industry ||
                industry,

            world:
                seed.world ||
                world.name,

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
                    type: seed.type,
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
                    seed.type
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
                ? client.name
                : "an unnamed client";

        return [
            paragraph([
                `PROJECT ${name} was commissioned as a ${type} for ${industry}.`,
                `The system eventually became one of the more useful pieces of infrastructure operating inside ${world.name}.`
            ]),

            paragraph([
                `The initial requirement sounded simple.`,
                `It was not.`,
                `The project existed because ${problem}.`
            ]),

            paragraph([
                `The first architectural decision was to avoid rebuilding everything from scratch.`,
                `Instead, the system was designed around clear interfaces, observable state, recoverable failures, and explicit ownership.`
            ]),

            paragraph([
                `The implementation eventually centered around ${skills.join(", ")}.`,
                `Those technologies were selected because they solved specific operational problems rather than because they looked impressive on a diagram.`
            ]),

            paragraph([
                `The person requesting the system was ${clientName}.`,
                `Their most important requirement was not actually written in the original specification.`
            ]),

            paragraph([
                `That requirement was discovered when`,
                `${failure}.`
            ]),

            paragraph([
                `The response was to ${solution}.`,
                `This reduced the number of unknown failure modes and made the system considerably easier to reason about.`
            ]),

            paragraph([
                `The project eventually reached a state where ${outcome}.`
            ]),

            paragraph([
                `The final lesson was straightforward:`,
                `good infrastructure does not prevent strange events.`,
                `It simply makes strange events easier to survive.`
            ])
        ].join("\n\n");
    }

    function buildTechnicalNotes(
        skills,
        type
    ) {
        const notes = [
            `Architecture: modular ${type}`,

            `Primary stack: ${skills.slice(0, 3).join(", ")}`,

            `Failure strategy: observable, recoverable, documented`,

            `Deployment model: automated where practical`,

            `Operational philosophy: boring infrastructure, interesting outcomes`,

            `Maintenance requirement: someone must understand why each component exists`
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
        const seed =
            pick(
                CONFIG.generated_incident_seeds
            );

        const witness =
            npcs.length
                ? pick(npcs)
                : null;

        const project =
            projects.length
                ? pick(projects)
                : null;

        const incident = {
            id: randomId(),

            code:
                randomCode(),

            world:
                seed.world ||
                world.name,

            type:
                seed.type ||
                pick(
                    CONFIG.incident_types
                ),

            opener:
                seed.opener ||
                pick(
                    CONFIG.incident_openers
                ),

            consequence:
                seed.consequence ||
                pick(
                    CONFIG.incident_consequences
                ),

            risk:
                seed.risk ||
                pick(
                    CONFIG.risk_levels
                ),

            status:
                seed.status ||
                pick(
                    CONFIG.statuses
                ),

            witness:
                witness
                    ? witness.name
                    : "unknown",

            project:
                project
                    ? project.name
                    : "unassigned",

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
        const witnessText =
            witness
                ? `${witness.name}, a ${witness.role},`
                : "One unidentified witness";

        const projectText =
            project
                ? `The event was connected to ${project.name}.`
                : "No project was officially associated with the event.";

        return [
            paragraph([
                seed.opener,
                `an incident classified as ${seed.type} occurred in ${world.name}.`
            ]),

            paragraph([
                projectText,
                `The first system response was to classify the event as unusual but non-critical.`
            ]),

            paragraph([
                witnessText,
                `reported that the environment behaved differently from every previous observation.`
            ]),

            paragraph([
                `The immediate consequence was that ${seed.consequence}.`
            ]),

            paragraph([
                `The incident remained open until the evidence was documented clearly enough for another engineer to reproduce the conditions.`
            ]),

            paragraph([
                `The final recommendation was simple:`,
                `do not assume that an impossible state is impossible merely because the dashboard has never displayed it before.`
            ])
        ].join("\n\n");
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
            );

        const client =
            npcs.length
                ? pick(npcs)
                : null;

        return {
            id: randomId(),

            world:
                seed.world ||
                world.name,

            objective:
                seed.objective ||
                pick(
                    CONFIG.quests
                ),

            reward:
                seed.reward ||
                pick(
                    CONFIG.quest_rewards
                ),

            risk:
                seed.risk ||
                pick(
                    CONFIG.risk_levels
                ),

            client:
                seed.client ||
                faction,

            status:
                seed.status ||
                pick(
                    CONFIG.statuses
                ),

            assignedBy:
                client
                    ? client.name
                    : faction,

            description:
                buildQuestDescription({
                    world,
                    objective:
                        seed.objective,
                    reward:
                        seed.reward,
                    risk:
                        seed.risk
                })
        };
    }

    function buildQuestDescription({
        world,
        objective,
        reward,
        risk
    }) {
        return [
            `The assignment originates in ${world.name}.`,

            `Objective: ${objective}.`,

            `Expected difficulty: ${risk}.`,

            `Compensation: ${reward}.`,

            `The task appears straightforward when written as a sentence.`,

            `The sentence does not contain enough information to explain why three previous teams refused it.`,

            `Completion requires technical competence, patience, and a willingness to read documentation that may not describe the same version of reality currently being observed.`
        ].join(" ");
    }

    /* ========================================================
       PORTFOLIO GENERATION
       ======================================================== */

    function generatePortfolio() {
        const world =
            generateWorld();

        const name =
            pick(CONFIG.names);

        const title =
            pick(CONFIG.titles);

        const personality =
            pick(CONFIG.personalities);

        const industry =
            pick(CONFIG.industries);

        const education =
            pick(CONFIG.education);

        const faction =
            pick(
                world.factions.length
                    ? world.factions
                    : CONFIG.factions
            );

        const genre =
            world.genre;

        const specialties =
            sample(
                CONFIG.specialties,
                integer(6, 11)
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

        const npcs = [];

        for (
            let i = 0;
            i < npcCount;
            i++
        ) {
            npcs.push(
                generateNPC(
                    world,
                    faction
                )
            );
        }

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

        const ui =
            generateUIDNA({
                world,
                title,
                personality,
                genre,
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
                years,
                industry,
                experiences
            );

        const portfolio = {
            id: randomId(),

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

                created:
                    randomDateLabel(),

                lastUpdated:
                    randomDateLabel(),

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
            new Date().getFullYear();

        const startYear =
            currentYear - years;

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
                "Built, maintained, documented, investigated and occasionally questioned the decision to deploy this on Friday.";

            if (
                i <
                experiences.length
            ) {
                const experience =
                    experiences[i];

                title =
                    experience.role;

                text =
                    experience.opening +
                    " " +
                    experience.lesson;
            }

            if (
                i ===
                count - 1
            ) {
                title =
                    "Current operation";

                text =
                    `Currently operating across ${industry}, while maintaining an unhealthy amount of curiosity about systems that nobody else wants to investigate.`;
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
            weights[family] = 1;
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
            layout,
            nav,
            hero,
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

            longForm:
                true,

            textHeavy:
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
                (sum, [, weight]) =>
                    sum + weight,
                0
            );

        let cursor =
            random() * total;

        for (
            const [
                key,
                weight
            ] of entries
        ) {
            cursor -= weight;

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
                        (item) =>
                            item.id
                    )
                    .join(","),

                portfolio.projects
                    .map(
                        (item) =>
                            item.name
                    )
                    .join(","),

                portfolio.npcs
                    .map(
                        (item) =>
                            item.id
                    )
                    .join(","),

                portfolio.incidents
                    .map(
                        (item) =>
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

    function renderNavigation(
        portfolio
    ) {
        const nav =
            portfolio.ui.nav;

        if (
            nav === "rail"
        ) {
            return `
                <nav
                    class="nav nav-rail"
                    aria-label="Archive navigation"
                >
                    ${navLink(
                        "archive",
                        "Archive"
                    )}
                    ${navLink(
                        "experiences",
                        "Experiences"
                    )}
                    ${navLink(
                        "work",
                        "Projects"
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

                    <button
                        class="action-button"
                        type="button"
                        data-generate
                    >
                        New Reality
                    </button>
                </nav>
            `;
        }

        return `
            <nav
                class="nav"
                aria-label="Archive navigation"
            >
                ${navLink(
                    "archive",
                    "Archive"
                )}

                ${navLink(
                    "experiences",
                    "Experiences"
                )}

                ${navLink(
                    "work",
                    "Projects"
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

                <button
                    class="action-button"
                    type="button"
                    data-generate
                >
                    Generate
                </button>
            </nav>
        `;
    }

    function navLink(
        target,
        label
    ) {
        return `
            <a
                class="nav-link"
                href="#${target}"
            >
                ${escapeHTML(label)}
            </a>
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
                    ${escapeHTML(label)}
                </span>

                <span class="meta-value">
                    ${escapeHTML(value)}
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
                        portfolio.metrics.uptime + "%",
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
            <div class="stat">

                <span class="stat-number">
                    ${escapeHTML(value)}
                </span>

                <span class="stat-label">
                    ${escapeHTML(label)}
                </span>

            </div>
        `;
    }

    /* ========================================================
       LONG PROFILE
       ======================================================== */

    function renderProfile(
        portfolio
    ) {
        return `
            <section
                class="section"
                id="profile"
            >

                <div class="section-header">

                    <div>

                        <div class="section-kicker">
                            Subject Profile
                        </div>

                        <h2>
                            The person behind the incidents.
                        </h2>

                        <p class="section-description">
                            ${escapeHTML(
                                portfolio.name
                            )}
                            operates as a
                            ${escapeHTML(
                                portfolio.title
                            )}
                            with a focus on
                            ${escapeHTML(
                                portfolio.specialties
                                    .slice(0, 5)
                                    .join(", ")
                            )}.
                        </p>

                    </div>

                </div>

                <article class="card narrative-card">

                    <p class="narrative">

                        ${escapeHTML(
                            `${portfolio.name} is a ${portfolio.personality} ${portfolio.title.toLowerCase()} working primarily in ${portfolio.industry}.`
                        )}

                    </p>

                    <p class="narrative">

                        ${escapeHTML(
                            `The formal record lists ${portfolio.education} as the primary educational background. The informal record is less certain. It contains references to ${portfolio.metrics.worldsVisited} worlds, ${portfolio.metrics.unresolvedMysteries} unresolved mysteries, and an unreasonable number of systems that were supposedly temporary.`
                        )}

                    </p>

                    <p class="narrative">

                        ${escapeHTML(
                            `The engineering philosophy is deliberately practical: use appropriate technology, make failure visible, automate repetitive work, document important decisions, and never assume that a system is simple merely because the interface has only one button.`
                        )}

                    </p>

                </article>

                <div class="card-grid">

                    ${renderProfileFact(
                        "Primary Specialty",
                        portfolio.specialties[0]
                    )}

                    ${renderProfileFact(
                        "Secondary Specialty",
                        portfolio.specialties[1]
                    )}

                    ${renderProfileFact(
                        "Current Location",
                        portfolio.locations
                            ? portfolio.locations
                            : portfolio.world.name
                    )}

                    ${renderProfileFact(
                        "Professional Status",
                        portfolio.world.classification ||
                        portfolio.archive.classification
                    )}

                </div>

            </section>
        `;
    }

    function renderProfileFact(
        label,
        value
    ) {
        return `
            <article class="card">

                <span class="meta-label">
                    ${escapeHTML(label)}
                </span>

                <h3 class="card-title">
                    ${escapeHTML(value)}
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

                <div class="section-header">

                    <div>

                        <div class="section-kicker">
                            Experience Archive
                        </div>

                        <h2>
                            The jobs were normal.
                            The circumstances were not.
                        </h2>

                        <p class="section-description">
                            Long-form records from organizations,
                            worlds and systems that somehow considered
                            these assignments reasonable.
                        </p>

                    </div>

                </div>

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
        const paragraphs =
            experience.narrative
                .split("\n\n");

        return `
            <article
                class="experience dossier-entry"
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
                            ${experience.years}
                            years
                        </span>

                        <span>
                            ${escapeHTML(
                                experience.status
                            )}
                        </span>

                    </div>

                </div>

                <div class="experience-body">

                    ${paragraphs
                        .map(
                            (text) => `
                                <p class="narrative">
                                    ${escapeHTML(
                                        text
                                    )}
                                </p>
                            `
                        )
                        .join("")}

                </div>

                <div class="tags">

                    ${experience.technologies
                        .map(
                            (technology) => `
                                <span class="tag">
                                    ${escapeHTML(
                                        technology
                                    )}
                                </span>
                            `
                        )
                        .join("")}

                </div>

                <div class="achievement-list">

                    ${experience.achievements
                        .map(
                            (
                                achievement
                            ) => `
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

                <div class="section-header">

                    <div>

                        <div class="section-kicker">
                            Project Archive
                        </div>

                        <h2>
                            Projects with unnecessarily
                            complicated histories.
                        </h2>

                        <p class="section-description">
                            These are not just project cards.
                            Each project has a problem,
                            architecture, failure, client,
                            consequence and outcome.
                        </p>

                    </div>

                </div>

                <div class="project-story-list">

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
        return `
            <article
                class="project-story"
                id="project-${index + 1}"
            >

                <div class="project-story-index">
                    ${String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    )}
                </div>

                <div class="project-story-content">

                    <div class="project-story-heading">

                        <div>

                            <div class="section-kicker">
                                ${escapeHTML(
                                    project.type
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

                    <div class="project-story-body">

                        ${project.narrative
                            .split("\n\n")
                            .map(
                                (paragraphText) => `
                                    <p class="narrative">
                                        ${escapeHTML(
                                            paragraphText
                                        )}
                                    </p>
                                `
                            )
                            .join("")}

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

                    <div class="tags">

                        ${project.skills
                            .map(
                                (skill) => `
                                    <span class="tag">
                                        ${escapeHTML(
                                            skill
                                        )}
                                    </span>
                                `
                            )
                            .join("")}

                    </div>

                    <div class="technical-notes">

                        ${project.technicalNotes
                            .map(
                                (note) => `
                                    <div class="technical-note">
                                        ${escapeHTML(
                                            note
                                        )}
                                    </div>
                                `
                            )
                            .join("")}

                    </div>

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

                <span>
                    ${escapeHTML(label)}
                </span>

                <strong>
                    ${escapeHTML(value)}
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

                <div class="section-header">

                    <div>

                        <div class="section-kicker">
                            World File
                        </div>

                        <h2>
                            ${escapeHTML(
                                world.name
                            )}
                        </h2>

                        <p class="section-description">
                            ${escapeHTML(
                                world.description
                            )}
                        </p>

                    </div>

                </div>

                <div class="world-panel">

                    <article class="world-main">

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

                        <p class="world-description">
                            ${escapeHTML(
                                world.description
                            )}
                        </p>

                        <p class="narrative">
                            The sky is described as
                            <strong>
                                ${escapeHTML(
                                    world.sky
                                )}
                            </strong>.
                            Local infrastructure relies on
                            ${escapeHTML(
                                world.technology
                            )}.
                        </p>

                        <p class="narrative">
                            The dominant social rule is:
                            <strong>
                                ${escapeHTML(
                                    world.socialRule
                                )}
                            </strong>
                        </p>

                        <div class="tags">

                            <span class="tag">
                                ${escapeHTML(
                                    world.genre
                                )}
                            </span>

                            <span class="tag">
                                ${escapeHTML(
                                    world.danger
                                )}
                            </span>

                            <span class="tag">
                                ${world.population.toLocaleString()}
                                inhabitants
                            </span>

                        </div>

                    </article>

                    <aside class="world-side">

                        <div class="card">

                            <span class="meta-label">
                                Current Conflict
                            </span>

                            <p class="card-text">
                                ${escapeHTML(
                                    world.conflict
                                )}
                            </p>

                        </div>

                        <div class="card">

                            <span class="meta-label">
                                Local Rule
                            </span>

                            <p class="card-text">
                                ${escapeHTML(
                                    world.rule
                                )}
                            </p>

                        </div>

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
                                <article class="card">

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

                <div class="tags faction-list">

                    ${world.factions
                        .map(
                            (
                                faction
                            ) => `
                                <span class="tag">
                                    ${escapeHTML(
                                        faction
                                    )}
                                </span>
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

                <div class="section-header">

                    <div>

                        <div class="section-kicker">
                            NPC Archive
                        </div>

                        <h2>
                            People who definitely have
                            their own stories.
                        </h2>

                        <p class="section-description">
                            The portfolio owner is not the only
                            character operating in this world.
                        </p>

                    </div>

                </div>

                <div class="npc-archive">

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
                class="npc dossier-entry"
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

                    <p class="narrative">
                        ${escapeHTML(
                            npc.biography
                        )}
                    </p>

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

                    <blockquote class="npc-dialogue">
                        “${escapeHTML(
                            npc.dialogue
                        )}”
                    </blockquote>

                    <div class="npc-secret">

                        <span class="meta-label">
                            Known Secret
                        </span>

                        <p>
                            ${escapeHTML(
                                npc.secret
                            )}
                        </p>

                    </div>

                    <div class="npc-rumors">

                        <div class="section-kicker">
                            Rumors
                        </div>

                        ${npc.rumors
                            .map(
                                (
                                    rumor
                                ) => `
                                    <p>
                                        ${escapeHTML(
                                            rumor
                                        )}
                                    </p>
                                `
                            )
                            .join("")}

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

                <span>
                    ${escapeHTML(label)}
                </span>

                <strong>
                    ${escapeHTML(
                        value
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

                <div class="section-header">

                    <div>

                        <div class="section-kicker">
                            Incident Archive
                        </div>

                        <h2>
                            Things that were not supposed
                            to happen.
                        </h2>

                        <p class="section-description">
                            Every serious system eventually produces
                            an event that becomes somebody else's story.
                        </p>

                    </div>

                </div>

                <div class="incident-list">

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
        return `
            <article
                class="incident"
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

                    ${incident.narrative
                        .split("\n\n")
                        .map(
                            (text) => `
                                <p class="narrative">
                                    ${escapeHTML(
                                        text
                                    )}
                                </p>
                            `
                        )
                        .join("")}

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

                <div class="section-header">

                    <div>

                        <div class="section-kicker">
                            Active Objectives
                        </div>

                        <h2>
                            There is always another problem.
                        </h2>

                    </div>

                </div>

                <div class="quest-list">

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
                class="quest"
            >

                <div>

                    <div class="quest-label">
                        QUEST
                        ${String(
                            index + 1
                        ).padStart(
                            2,
                            "0"
                        )}
                    </div>

                    <h3>
                        ${escapeHTML(
                            quest.objective
                        )}
                    </h3>

                    <p class="card-text">
                        ${escapeHTML(
                            quest.description
                        )}
                    </p>

                    <div class="tags">

                        <span class="tag">
                            ${escapeHTML(
                                quest.world
                            )}
                        </span>

                        <span class="tag">
                            ${escapeHTML(
                                quest.risk
                            )}
                        </span>

                        <span class="tag">
                            ${escapeHTML(
                                quest.status
                            )}
                        </span>

                    </div>

                </div>

                <div class="quest-reward">

                    <span class="meta-label">
                        Reward
                    </span>

                    <strong>
                        ${escapeHTML(
                            quest.reward
                        )}
                    </strong>

                    <span class="meta-label">
                        Assigned by
                    </span>

                    <strong>
                        ${escapeHTML(
                            quest.assignedBy
                        )}
                    </strong>

                </div>

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

                <div class="section-header">

                    <div>

                        <div class="section-kicker">
                            Chronology
                        </div>

                        <h2>
                            How the situation developed.
                        </h2>

                    </div>

                </div>

                <div class="timeline">

                    ${portfolio.timeline
                        .map(
                            (item) => `
                                <article
                                    class="timeline-item"
                                >

                                    <div class="timeline-year">
                                        ${item.year}
                                    </div>

                                    <div>

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
       ARCHIVE FOOTER
       ======================================================== */

    function renderArchiveNotice(
        portfolio
    ) {
        return `
            <section class="section">

                <article class="archive-notice">

                    <div class="section-kicker">
                        ARCHIVE NOTICE
                    </div>

                    <h2>
                        ${escapeHTML(
                            portfolio.archive.warning
                        )}
                    </h2>

                    <p>
                        Archive:
                        ${escapeHTML(
                            portfolio.archive
                                .archiveNumber
                        )}
                    </p>

                    <p>
                        Created:
                        ${escapeHTML(
                            portfolio.archive.created
                        )}
                        ·
                        Updated:
                        ${escapeHTML(
                            portfolio.archive.lastUpdated
                        )}
                    </p>

                </article>

            </section>
        `;
    }

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

        app.className = [
            "app",
            `ui-${slug(
                ui.family
            )}`,
            `layout-${slug(
                ui.layout
            )}`,
            `density-${ui.density}`
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
            `${portfolio.name} — ${portfolio.title}`;

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
       INTERACTION SYSTEM
       ======================================================== */

    function wireInteractions() {
        $$("[data-generate]")
            .forEach(
                (button) => {
                    button.addEventListener(
                        "click",
                        () => {
                            generateAndRender();
                        }
                    );
                }
            );

        $$("a[href^='#']")
            .forEach(
                (link) => {
                    link.addEventListener(
                        "click",
                        (event) => {
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

                            const element =
                                document.querySelector(
                                    target
                                );

                            if (!element) {
                                return;
                            }

                            event.preventDefault();

                            element.scrollIntoView(
                                {
                                    behavior:
                                        "smooth",
                                    block:
                                        "start"
                                }
                            );
                        }
                    );
                }
            );
    }

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
            `Generated new fictional portfolio for ${portfolio.name} in ${portfolio.world.name}.`;
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
        (event) => {
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
