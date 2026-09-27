/* ============================================================
   ABSURD PORTFOLIO
   Browser-side procedural generation engine.

   Important:
   - No localStorage.
   - No sessionStorage.
   - No IndexedDB.
   - No cookies.
   - No backend requests.
   - No database.
   - Runtime state exists only in browser RAM.
   ============================================================ */

(() => {
    "use strict";

    const CONFIG = window.__ABSURD_CONFIG__;

    const runtime = {
        generatedSignatures: new Set(),
        current: null,
        generationCount: 0
    };

    const $ = (selector, root = document) => root.querySelector(selector);

    const random = () => {
        if (window.crypto && crypto.getRandomValues) {
            const buffer = new Uint32Array(2);
            crypto.getRandomValues(buffer);
            return (
                (buffer[0] * 4294967296 + buffer[1]) /
                18446744073709551616
            );
        }

        return Math.random();
    };

    const integer = (min, max) => {
        return Math.floor(random() * (max - min + 1)) + min;
    };

    const pick = (array) => {
        return array[Math.floor(random() * array.length)];
    };

    const sample = (array, count) => {
        const copy = [...array];
        const result = [];

        while (copy.length && result.length < count) {
            const index = Math.floor(random() * copy.length);
            result.push(copy.splice(index, 1)[0]);
        }

        return result;
    };

    const slug = (value) =>
        String(value)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const escapeHTML = (value) => {
        const div = document.createElement("div");
        div.textContent = String(value ?? "");
        return div.innerHTML;
    };

    const initials = (name) => {
        return name
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const clamp = (value, min, max) =>
        Math.min(Math.max(value, min), max);

    const hashString = (value) => {
        let hash = 2166136261;

        for (let i = 0; i < value.length; i++) {
            hash ^= value.charCodeAt(i);
            hash +=
                (hash << 1) +
                (hash << 4) +
                (hash << 7) +
                (hash << 8) +
                (hash << 24);
        }

        return Math.abs(hash >>> 0).toString(16);
    };

    /* ========================================================
       PROCEDURAL DATA
       ======================================================== */

    function generatePortfolio() {
        const world = pick(CONFIG.worlds);
        const name = pick(CONFIG.names);
        const title = pick(CONFIG.titles);
        const personality = pick(CONFIG.personalities);

        const specialties = sample(
            CONFIG.specialties,
            integer(5, 9)
        );

        const industry = pick(CONFIG.industries);
        const education = pick(CONFIG.education);

        const years = integer(3, 17);
        const projectsCount = integer(4, 7);
        const npcCount = integer(4, 7);

        const faction = pick(CONFIG.factions);
        const genre = pick(CONFIG.genres);

        const chaos = integer(25, 98);

        const projects = generateProjects(
            projectsCount,
            specialties,
            industry,
            world
        );

        const npcs = generateNPCs(
            npcCount,
            world,
            faction
        );

        const ui = generateUIDNA({
            world,
            title,
            personality,
            genre,
            chaos,
            specialties
        });

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
            projects,
            npcs,
            ui,

            metrics: {
                deployments: integer(140, 980),
                systems: integer(4, 31),
                incidents: integer(2, 41),
                users: integer(1200, 980000),
                uptime: (
                    99 +
                    random() * 0.99
                ).toFixed(2),
                coffee: integer(731, 9821)
            },

            timeline: generateTimeline(years, industry),

            quest: {
                text: pick(CONFIG.quests),
                reward: `${integer(20, 950)} XP`,
                status: pick(CONFIG.statuses)
            }
        };

        portfolio.signature = makeSignature(portfolio);

        return portfolio;
    }

    function generateProjects(count, specialties, industry, world) {
        const used = new Set();
        const projects = [];

        while (projects.length < count) {
            const seed = pick(CONFIG.generated_project_seeds);
            const name = `${seed.name} ${pick([
                "Core",
                "Engine",
                "Platform",
                "Control",
                "Protocol",
                "Grid",
                "Stack",
                "Forge",
                "Gateway",
                "Ops"
            ])}`;

            const signature = `${name}|${seed.type}|${industry}`;

            if (used.has(signature)) {
                continue;
            }

            used.add(signature);

            const projectSkills = sample(
                specialties,
                Math.min(
                    specialties.length,
                    integer(3, 5)
                )
            );

            const impact = integer(14, 91);

            projects.push({
                name,
                type: seed.type,
                industry,
                skills: projectSkills,
                description:
                    `${capitalize(seed.type)} built for ${industry}, ` +
                    `with a deliberately boring production architecture ` +
                    `despite being developed inside ${world.name}.`,
                metric: `${impact}%`,
                metricLabel: "efficiency improvement",
                users: integer(100, 85000),
                status: pick([
                    "Production",
                    "Maintained",
                    "Scaling",
                    "Internal",
                    "Research"
                ])
            });
        }

        return projects;
    }

    function generateNPCs(count, world, faction) {
        const used = new Set();
        const npcs = [];

        while (npcs.length < count) {
            const seed = pick(CONFIG.generated_npc_seeds);

            let name = `${seed.first} ${seed.last}`;

            if (used.has(name)) {
                continue;
            }

            used.add(name);

            npcs.push({
                name,
                role: seed.role,
                type: seed.type,
                trait: pick(CONFIG.npc_traits),
                status: pick(CONFIG.statuses),
                secret: pick(CONFIG.secrets),
                relationship: pick([
                    "trusted ally",
                    "professional contact",
                    "rival",
                    "reluctant collaborator",
                    "former teammate",
                    "mysterious client",
                    "unknown observer",
                    "guild representative"
                ]),
                faction:
                    random() > 0.6
                        ? faction
                        : pick(CONFIG.factions),
                location: world.name,
                reputation: integer(12, 99)
            });
        }

        return npcs;
    }

    function generateTimeline(years, industry) {
        const timeline = [];

        const start = new Date().getFullYear() - years;

        const milestones = [
            "Entered software engineering",
            "Built first production system",
            "Joined a high-pressure engineering team",
            "Started designing distributed systems",
            "Automated a repetitive workflow",
            "Introduced observability practices",
            "Led a major platform migration",
            "Started independent engineering work",
            "Began consulting on architecture",
            `Focused on ${industry}`,
            "Started documenting impossible incidents"
        ];

        const count = integer(4, 7);

        for (let i = 0; i < count; i++) {
            const year =
                start +
                Math.floor(
                    ((new Date().getFullYear() - start) /
                        count) *
                        i
                );

            timeline.push({
                year,
                title: milestones[
                    Math.floor(
                        (i / count) *
                            milestones.length
                    )
                ],
                text:
                    i === count - 1
                        ? "Currently operating somewhere between conventional engineering and fictional infrastructure."
                        : "Designed, shipped, maintained, documented, and occasionally explained why this should not be deployed on Friday."
            });
        }

        return timeline;
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
        const familyWeights = {
            executive: 1,
            terminal: 1,
            rpg: 1,
            manhwa: 1,
            dossier: 1,
            research: 1,
            luxury: 1,
            brutalist: 1,
            space: 1,
            detective: 1,
            spellbook: 1,
            underground: 1,
            newspaper: 1,
            "operating-system": 1,
            chaotic: 1
        };

        if (
            /backend|platform|systems|devops/i.test(title)
        ) {
            familyWeights.terminal += 4;
            familyWeights["operating-system"] += 3;
            familyWeights.executive += 2;
        }

        if (/research|AI|data/i.test(title)) {
            familyWeights.research += 4;
        }

        if (/security/i.test(title)) {
            familyWeights.dossier += 4;
            familyWeights.detective += 3;
        }

        if (/creative|designer/i.test(title)) {
            familyWeights.manhwa += 3;
            familyWeights.luxury += 3;
        }

        if (/fantasy|manhwa/i.test(genre)) {
            familyWeights.rpg += 4;
            familyWeights.spellbook += 4;
            familyWeights.manhwa += 3;
        }

        if (/space|science/i.test(world.genre)) {
            familyWeights.space += 5;
            familyWeights.research += 2;
        }

        if (chaos > 75) {
            familyWeights.chaotic += 5;
            familyWeights.brutalist += 2;
            familyWeights.underground += 2;
        }

        if (personality.includes("methodical")) {
            familyWeights.executive += 3;
            familyWeights.research += 2;
        }

        const family = weightedChoice(familyWeights);

        const layout = pick(CONFIG.layouts);
        const nav = pick(CONFIG.navs);
        const hero = pick(CONFIG.hero_modes);

        const palette = choosePalette(family);

        const density =
            chaos > 78
                ? "compact"
                : chaos < 40
                    ? "spacious"
                    : pick(["compact", "normal", "normal"]);

        const decoration =
            chaos > 82
                ? pick(["grid", "scanlines", "dots"])
                : pick(["none", "grid", "dots"]);

        const radius = integer(0, 24);

        return {
            family,
            layout,
            nav,
            hero,
            density,
            decoration,
            radius,
            accent: palette.accent,
            accent2: palette.accent2,
            background: palette.background,
            surface: palette.surface,
            personality,
            chaos,
            specialtyCount: specialties.length
        };
    }

    function weightedChoice(weights) {
        const entries = Object.entries(weights);
        const total = entries.reduce(
            (sum, [, value]) => sum + value,
            0
        );

        let cursor = random() * total;

        for (const [key, weight] of entries) {
            cursor -= weight;

            if (cursor <= 0) {
                return key;
            }
        }

        return entries[entries.length - 1][0];
    }

    function choosePalette(family) {
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

        return palettes[family] || palettes.executive;
    }

    function makeSignature(portfolio) {
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
                portfolio.specialties.join(","),
                portfolio.projects
                    .map((p) => p.name)
                    .join(","),
                portfolio.npcs
                    .map((n) => n.name)
                    .join(",")
            ].join("|")
        );
    }

    function randomId() {
        return (
            Date.now().toString(36) +
            "-" +
            Math.floor(random() * 0xffffff)
                .toString(36)
        );
    }

    function capitalize(value) {
        return String(value)
            .charAt(0)
            .toUpperCase() +
            String(value).slice(1);
    }

    /* ========================================================
       GENERATION SAFETY
       ======================================================== */

    function generateUniquePortfolio() {
        let portfolio;

        for (let attempt = 0; attempt < 100; attempt++) {
            portfolio = generatePortfolio();

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

    function applyTheme(portfolio) {
        const root = document.documentElement;
        const ui = portfolio.ui;

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

        root.dataset.uiFamily = ui.family;
    }

    /* ========================================================
       HTML RENDERING
       ======================================================== */

    function render(portfolio) {
        runtime.current = portfolio;
        runtime.generationCount++;

        applyTheme(portfolio);

        const ui = portfolio.ui;

        const classes = [
            "app",
            `ui-${slug(ui.family)}`,
            `layout-${slug(ui.layout)}`,
            `density-${ui.density}`
        ].join(" ");

        const app = document.getElementById("app");

        app.className = classes;
        app.dataset.decoration = ui.decoration;

        app.innerHTML = `
            ${renderTopbar(portfolio)}
            <main id="main-content">

                ${renderHero(portfolio)}

                ${renderStats(portfolio)}

                ${renderAbout(portfolio)}

                ${renderProjects(portfolio)}

                ${renderWorld(portfolio)}

                ${renderTimeline(portfolio)}

                ${renderQuest(portfolio)}

            </main>

            ${renderFooter(portfolio)}
        `;

        document.title =
            `${portfolio.name} — ${portfolio.title}`;

        wireInteractions();

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }

    function renderTopbar(portfolio) {
        return `
            <header class="topbar">
                <div class="brand">
                    <div class="brand-mark">
                        ${escapeHTML(
                            initials(portfolio.name)
                        )}
                    </div>

                    <div class="brand-text">
                        ${escapeHTML(
                            portfolio.name
                        )}
                        / ${escapeHTML(
                            portfolio.ui.family
                        )}
                    </div>
                </div>

                <nav class="nav" aria-label="Primary">
                    <a class="nav-link" href="#work">
                        Work
                    </a>

                    <a class="nav-link" href="#world">
                        World
                    </a>

                    <a class="nav-link" href="#characters">
                        NPCs
                    </a>

                    <button
                        class="action-button"
                        type="button"
                        data-generate
                    >
                        Generate
                    </button>
                </nav>
            </header>
        `;
    }

    function renderHero(portfolio) {
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
                `STATUS: ${pick(["OPERATIONAL", "ACTIVE", "UNREASONABLY PRODUCTIVE", "UNVERIFIED"])}`,

            command:
                `Command interface for a ${portfolio.title.toLowerCase()} with ${portfolio.years} years of accumulated engineering damage.`,

            character:
                `Character profile unlocked: ${portfolio.name}.`,

            manifesto:
                `Make the system understandable. Then make it impossible for the system to surprise you.`
        };

        return `
            <section class="hero">
                <div class="hero-grid">

                    <div>
                        <div class="eyebrow">
                            ${escapeHTML(
                                portfolio.world.genre
                            )}
                            /
                            ${escapeHTML(
                                portfolio.faction
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
                                ]
                            )}
                        </p>

                        <div class="hero-actions">
                            <a
                                class="primary-button"
                                href="#work"
                            >
                                Inspect Work
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
                        <div class="meta-box">
                            <span class="meta-label">
                                Current World
                            </span>

                            <span class="meta-value">
                                ${escapeHTML(
                                    portfolio.world.name
                                )}
                            </span>
                        </div>

                        <div class="meta-box">
                            <span class="meta-label">
                                Experience
                            </span>

                            <span class="meta-value">
                                ${portfolio.years} years
                            </span>
                        </div>

                        <div class="meta-box">
                            <span class="meta-label">
                                Chaos Index
                            </span>

                            <span class="meta-value">
                                ${portfolio.chaos}/100
                            </span>
                        </div>

                        <div class="meta-box">
                            <span class="meta-label">
                                Generation
                            </span>

                            <span class="meta-value">
                                #${runtime.generationCount}
                            </span>
                        </div>
                    </div>

                </div>
            </section>
        `;
    }

    function renderStats(portfolio) {
        return `
            <section class="section">
                <div class="stat-grid">

                    <div class="stat">
                        <span class="stat-number">
                            ${portfolio.metrics.systems}
                        </span>

                        <span class="stat-label">
                            Production systems
                        </span>
                    </div>

                    <div class="stat">
                        <span class="stat-number">
                            ${portfolio.metrics.deployments}
                        </span>

                        <span class="stat-label">
                            Deployments
                        </span>
                    </div>

                    <div class="stat">
                        <span class="stat-number">
                            ${portfolio.metrics.uptime}%
                        </span>

                        <span class="stat-label">
                            Reported uptime
                        </span>
                    </div>

                    <div class="stat">
                        <span class="stat-number">
                            ${formatNumber(
                                portfolio.metrics.users
                            )}
                        </span>

                        <span class="stat-label">
                            Approx. users served
                        </span>
                    </div>
                </div>
            </section>
        `;
    }

    function renderAbout(portfolio) {
        return `
            <section class="section" id="about">

                <div class="section-header">
                    <div>
                        <div class="section-kicker">
                            Profile
                        </div>

                        <h2>
                            Engineering without the unnecessary drama.
                        </h2>

                        <p class="section-description">
                            ${escapeHTML(
                                portfolio.personality
                            )} software engineering focused on
                            reliable systems, maintainable architecture,
                            automation, and practical delivery.
                        </p>
                    </div>
                </div>

                <div class="card-grid">

                    <article class="card">
                        <h3 class="card-title">
                            Core Stack
                        </h3>

                        <div class="tags">
                            ${portfolio.specialties
                                .map(
                                    (item) => `
                                        <span class="tag">
                                            ${escapeHTML(item)}
                                        </span>
                                    `
                                )
                                .join("")}
                        </div>
                    </article>

                    <article class="card">
                        <h3 class="card-title">
                            Education
                        </h3>

                        <p class="card-text">
                            ${escapeHTML(
                                portfolio.education
                            )}
                        </p>
                    </article>

                    <article class="card">
                        <h3 class="card-title">
                            Industry
                        </h3>

                        <p class="card-text">
                            ${escapeHTML(
                                portfolio.industry
                            )}
                        </p>
                    </article>

                    <article class="card">
                        <h3 class="card-title">
                            Professional Philosophy
                        </h3>

                        <p class="card-text">
                            Prefer boring infrastructure,
                            measurable outcomes, clear interfaces,
                            documented decisions, and systems that
                            still make sense six months later.
                        </p>
                    </article>

                </div>
            </section>
        `;
    }

    function renderProjects(portfolio) {
        return `
            <section
                class="section"
                id="work"
            >
                <div class="section-header">
                    <div>
                        <div class="section-kicker">
                            Selected Work
                        </div>

                        <h2>
                            Projects from the professional timeline.
                        </h2>

                        <p class="section-description">
                            Realistic engineering work generated from
                            procedural project rules.
                        </p>
                    </div>
                </div>

                <div class="projects">

                    ${portfolio.projects
                        .map(
                            (project, index) => `
                                <article class="project">

                                    <div class="project-number">
                                        ${String(
                                            index + 1
                                        ).padStart(2, "0")}
                                    </div>

                                    <div>
                                        <h3>
                                            ${escapeHTML(
                                                project.name
                                            )}
                                        </h3>

                                        <p>
                                            ${escapeHTML(
                                                project.description
                                            )}
                                        </p>

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
                                    </div>

                                    <div class="project-side">

                                        <div class="project-metric">
                                            <strong>
                                                ${escapeHTML(
                                                    project.metric
                                                )}
                                            </strong>

                                            <span>
                                                ${escapeHTML(
                                                    project.metricLabel
                                                )}
                                            </span>
                                        </div>

                                        <div class="project-metric">
                                            <strong>
                                                ${formatNumber(
                                                    project.users
                                                )}
                                            </strong>

                                            <span>
                                                users / records
                                            </span>
                                        </div>

                                        <div class="project-metric">
                                            <strong>
                                                ${escapeHTML(
                                                    project.status
                                                )}
                                            </strong>

                                            <span>
                                                status
                                            </span>
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

    function renderWorld(portfolio) {
        return `
            <section
                class="section"
                id="world"
            >
                <div class="section-header">
                    <div>
                        <div class="section-kicker">
                            Fictional World
                        </div>

                        <h2>
                            The portfolio exists somewhere.
                        </h2>
                    </div>
                </div>

                <div class="world-panel">

                    <article class="world-main">
                        <div class="eyebrow">
                            ${escapeHTML(
                                portfolio.world.sky
                            )}
                        </div>

                        <h3>
                            ${escapeHTML(
                                portfolio.world.name
                            )}
                        </h3>

                        <p class="world-description">
                            ${escapeHTML(
                                portfolio.world.description
                            )}
                        </p>

                        <div class="tags">
                            <span class="tag">
                                ${escapeHTML(
                                    portfolio.world.genre
                                )}
                            </span>

                            <span class="tag">
                                ${escapeHTML(
                                    portfolio.faction
                                )}
                            </span>

                            <span class="tag">
                                Chaos ${portfolio.chaos}
                            </span>
                        </div>
                    </article>

                    <div
                        class="npc-list"
                        id="characters"
                    >
                        ${portfolio.npcs
                            .slice(0, 4)
                            .map(
                                (npc) => `
                                    <article class="npc">
                                        <div class="npc-avatar">
                                            ${escapeHTML(
                                                initials(
                                                    npc.name
                                                )
                                            )}
                                        </div>

                                        <div>
                                            <div class="npc-name">
                                                ${escapeHTML(
                                                    npc.name
                                                )}
                                            </div>

                                            <div class="npc-role">
                                                ${escapeHTML(
                                                    npc.type
                                                )}
                                                ·
                                                ${escapeHTML(
                                                    npc.role
                                                )}
                                            </div>

                                            <div class="npc-status">
                                                ${escapeHTML(
                                                    npc.status
                                                )}
                                                /
                                                ${npc.reputation}
                                                REP
                                            </div>
                                        </div>
                                    </article>
                                `
                            )
                            .join("")}
                    </div>

                </div>
            </section>
        `;
    }

    function renderTimeline(portfolio) {
        return `
            <section class="section">

                <div class="section-header">
                    <div>
                        <div class="section-kicker">
                            Timeline
                        </div>

                        <h2>
                            Professional history.
                        </h2>
                    </div>
                </div>

                <div class="timeline">

                    ${portfolio.timeline
                        .map(
                            (item) => `
                                <article class="timeline-item">

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

    function renderQuest(portfolio) {
        return `
            <section class="section">

                <div class="quest">

                    <div>
                        <div class="quest-label">
                            Active Quest
                        </div>

                        <div class="quest-text">
                            ${escapeHTML(
                                portfolio.quest.text
                            )}
                        </div>
                    </div>

                    <div class="quest-reward">
                        <strong>
                            ${escapeHTML(
                                portfolio.quest.reward
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                portfolio.quest.status
                            )}
                        </span>
                    </div>

                </div>
            </section>
        `;
    }

    function renderFooter(portfolio) {
        return `
            <footer class="footer">

                <div>
                    <strong>
                        ${escapeHTML(
                            portfolio.name
                        )}
                    </strong>

                    <div>
                        Procedurally generated portfolio
                        / runtime memory only.
                    </div>
                </div>

                <div>
                    World:
                    ${escapeHTML(
                        portfolio.world.name
                    )}
                    <br>
                    Signature:
                    ${escapeHTML(
                        portfolio.signature
                    )}
                </div>

            </footer>
        `;
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("en-US", {
            notation:
                value > 999999
                    ? "compact"
                    : "standard",
            maximumFractionDigits: 1
        }).format(value);
    }

    /* ========================================================
       INTERACTIONS
       ======================================================== */

    function wireInteractions() {
        document
            .querySelectorAll("[data-generate]")
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        render(
                            generateUniquePortfolio()
                        );
                    }
                );
            });
    }

    /* ========================================================
       START
       ======================================================== */

    function boot() {
        const first = generateUniquePortfolio();

        render(first);
    }

    boot();
})();
