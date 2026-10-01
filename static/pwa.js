(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $ = (selector, root = document) => [...root.querySelectorAll(selector)];

  let deferredInstallPrompt = null;
  let statusTimer = null;
  let installButton = null;

  function notify(message) {
    let status = $("#pwa-status");
    if (!status) {
      status = document.createElement("div");
      status.id = "pwa-status";
      status.className = "utility-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      document.body.appendChild(status);
    }
    status.textContent = message;
    status.classList.add("is-visible");
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => status.classList.remove("is-visible"), 2200);
  }

  function updateMetadata() {
    const title = document.title || "BLSSNVJ21 — Absurd Portfolio";
    const description =
      $(".hero-description")?.textContent?.trim() ||
      "A procedurally generated professional portfolio.";

    const ensureMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content.slice(0, 300);
    };

    ensureMeta("description", description);
    ensureMeta("twitter:title", title);
    ensureMeta("twitter:description", description);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = title;

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.content =
      window.__ABSURD_RUNTIME__?.getShareUrl?.() ||
      window.location.href;

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.content = description.slice(0, 300);

    const iconUrl = new URL("./assets/icon.svg", window.location.href).href;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.__ABSURD_RUNTIME__?.getShareUrl?.() || window.location.href;

    let jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.type = "application/ld+json";
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: title,
      description,
      url: canonical.href
    });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#090a0d";
    }
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.content = iconUrl;
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.content = iconUrl;
  }

  async function copyShareLink() {
    const url =
      window.__ABSURD_RUNTIME__?.getShareUrl?.() ||
      window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      notify("Shareable portfolio link copied.");
    } catch (_) {
      notify("Copy failed. Use your browser address bar to share.");
    }
  }
  async function copySnapshot() {
    const text = document.querySelector("#main-content")?.innerText?.trim();
    if (!text) {
      notify("Nothing to copy yet.");
      return;
    }

    const payload = [
      document.title,
      "",
      text
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      notify("Portfolio snapshot copied.");
    } catch (_) {
      const area = document.createElement("textarea");
      area.value = payload;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      notify("Portfolio snapshot copied.");
    }
  }

  function isStandalone() {
    return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  async function installApp() {
    if (isStandalone()) {
      notify("BLSSNVJ21 is already installed.");
      return;
    }
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      if (choice?.outcome === "accepted") notify("BLSSNVJ21 installed.");
      updateInstallButton();
      return;
    }
    if (isIOS()) {
      notify("On iPhone/iPad: Share → Add to Home Screen.");
      return;
    }
    notify("Use your browser menu → Install BLSSNVJ21 / Add to Home Screen.");
  }

  function updateInstallButton() {
    if (!installButton) return;
    installButton.hidden = isStandalone();
    installButton.textContent = deferredInstallPrompt ? "Install" : "Install App";
  }

  function upgradeBrandLogo() {
    const mark = $(".brand-mark");
    if (!mark || mark.dataset.logoReady === "true") return;

    mark.textContent = "";
    const logo = document.createElement("img");
    logo.src = "./assets/icon.svg";
    logo.alt = "";
    logo.width = 40;
    logo.height = 40;
    logo.decoding = "async";
    logo.setAttribute("aria-hidden", "true");
    mark.appendChild(logo);
    mark.dataset.logoReady = "true";
  }

  function setupMobileNavigation() {
    const inner = $(".topbar-inner");
    const nav = $(".topnav");
    if (!inner || !nav || $(".mobile-nav-toggle", inner)) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-nav-toggle utility-button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "mobile-navigation");
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.innerHTML = "<span aria-hidden=\"true\">☰</span><span class=\"mobile-nav-label\">Menu</span>";

    const panel = document.createElement("div");
    panel.className = "mobile-navigation";
    panel.id = "mobile-navigation";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Mobile navigation");

    const links = [...nav.querySelectorAll("a")].map((link) => link.cloneNode(true));
    links.forEach((link) => {
      link.addEventListener("click", () => {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
      });
      panel.appendChild(link);
    });

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
      panel.hidden = open;
    });

    inner.appendChild(toggle);
    inner.appendChild(panel);
  }

  function addUtilityActions() {
    const inner = $(".topbar-inner");
    if (!inner || $(".utility-actions", inner)) return;

    const actions = document.createElement("div");
    actions.className = "utility-actions";
    actions.setAttribute("role", "group");
    actions.setAttribute("aria-label", "Portfolio tools");
    actions.innerHTML = `
      <button class="utility-button" type="button" data-pwa-copy aria-label="Copy the current portfolio snapshot">Copy</button>
      <button class="utility-button" type="button" data-pwa-share aria-label="Copy a shareable link to the current portfolio">Share</button>
      <button class="utility-button" type="button" data-pwa-print aria-label="Print the current portfolio">Print</button>
      <button class="utility-button primary" type="button" data-pwa-install aria-label="Install BLSSNVJ21 as an app">Install App</button>
    `;

    inner.appendChild(actions);

    $("[data-pwa-copy]", actions).addEventListener("click", copySnapshot);
    $("[data-pwa-share]", actions).addEventListener("click", copyShareLink);
    $("[data-pwa-print]", actions).addEventListener("click", () => window.print());
    installButton = $("[data-pwa-install]", actions);
    installButton.addEventListener("click", installApp);
    updateInstallButton();
  }

  function addPremiumUI() {
    if (!document.body || document.querySelector(".blss-command")) return;

    const progress = document.createElement("div");
    progress.className = "blss-scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    const top = document.createElement("button");
    top.type = "button";
    top.className = "blss-back-top";
    top.textContent = "↑";
    top.setAttribute("aria-label", "Back to top");
    top.hidden = true;
    document.body.appendChild(top);
    top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const palette = document.createElement("div");
    palette.className = "blss-command";
    palette.hidden = true;
    palette.innerHTML = `
      <div class="blss-command-backdrop" data-command-close></div>
      <section class="blss-command-panel" role="dialog" aria-modal="true" aria-labelledby="blss-command-title">
        <div class="blss-command-head">
          <div>
            <p class="eyebrow">BLSSNVJ21</p>
            <h2 id="blss-command-title">Command Center</h2>
          </div>
          <button type="button" class="utility-button" data-command-close aria-label="Close command center">Esc</button>
        </div>
        <input class="blss-command-search" type="search" placeholder="Search commands…" aria-label="Search commands" autocomplete="off">
        <div class="blss-command-list" role="listbox">
          <button type="button" data-command="generate">✦ Generate another portfolio</button>
          <button type="button" data-command="profile">◎ Open profile</button>
          <button type="button" data-command="work">▣ Open selected work</button>
          <button type="button" data-command="world">◇ Open world</button>
          <button type="button" data-command="copy">⧉ Copy portfolio snapshot</button>
          <button type="button" data-command="share">↗ Copy share link</button>
          <button type="button" data-command="print">⎙ Print portfolio</button>
          <button type="button" data-command="install">⇩ Install BLSSNVJ21</button>
        </div>
        <div class="blss-command-footer">Press <kbd>Ctrl</kbd> + <kbd>K</kbd> anytime · <kbd>Esc</kbd> to close</div>
      </section>`;
    document.body.appendChild(palette);

    const search = $(".blss-command-search", palette);
    const close = () => { palette.hidden = true; };
    const open = () => {
      palette.hidden = false;
      search.value = "";
      $("[data-command]", palette).forEach((b) => b.hidden = false);
      requestAnimationFrame(() => search.focus());
    };
    $("[data-command-close]", palette).forEach((el) => el.addEventListener("click", close));
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      $("[data-command]", palette).forEach((button) => {
        button.hidden = q && !button.textContent.toLowerCase().includes(q);
      });
    });
    $("[data-command]", palette).forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.command;
        close();
        if (action === "generate") document.querySelector("[data-generate]")?.click();
        if (action === "profile" || action === "work" || action === "world") {
          document.querySelector("#" + action)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if (action === "copy") copySnapshot();
        if (action === "share") copyShareLink();
        if (action === "print") window.print();
        if (action === "install") installApp();
      });
    });

    window.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        palette.hidden ? open() : close();
      } else if (event.key === "Escape" && !palette.hidden) {
        close();
      }
    });

    const updateScrollUI = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / max));
      progress.style.transform = `scaleX(${ratio})`;
      top.hidden = window.scrollY < 500;
    };
    window.addEventListener("scroll", updateScrollUI, { passive: true });
    updateScrollUI();

    const network = document.createElement("div");
    network.className = "blss-network-status";
    network.setAttribute("role", "status");
    network.setAttribute("aria-live", "polite");
    document.body.appendChild(network);
    const updateNetwork = () => {
      network.textContent = navigator.onLine ? "● Online" : "○ Offline · PWA mode";
      network.dataset.offline = String(!navigator.onLine);
    };
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    updateNetwork();
  }

  function refreshEnhancements() {
    upgradeBrandLogo();
    setupMobileNavigation();
    addUtilityActions();
    addPremiumUI();
    updateMetadata();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    refreshEnhancements();
    updateInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallButton();
    notify("BLSSNVJ21 installed.");
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (
      target &&
      (target.tagName === "INPUT" ||
       target.tagName === "TEXTAREA" ||
       target.tagName === "SELECT" ||
       target.isContentEditable)
    ) return;

    if (event.key.toLowerCase() === "g") document.querySelector("[data-generate]")?.click();
    if (event.key.toLowerCase() === "p") window.print();
    if (event.key.toLowerCase() === "l") copyShareLink();
    if (event.key === "?") notify("Shortcuts: G = generate · P = print · L = share link · ? = shortcuts");
  });

  const app = $("#app");
  if (app) {
    const observer = new MutationObserver(refreshEnhancements);
    observer.observe(app, { childList: true });
  }

  if ("serviceWorker" in navigator && window.isSecureContext && window.location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refreshEnhancements, { once: true });
  } else {
    refreshEnhancements();
  }
})();
