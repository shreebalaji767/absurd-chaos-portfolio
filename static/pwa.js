(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);

  let deferredInstallPrompt = null;
  let statusTimer = null;

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
    const title = document.title || "Absurd Portfolio";
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
      <button class="utility-button" type="button" data-pwa-install hidden aria-label="Install this portfolio as an app">Install</button>
    `;

    inner.appendChild(actions);

    $("[data-pwa-copy]", actions).addEventListener("click", copySnapshot);
    $("[data-pwa-share]", actions).addEventListener("click", copyShareLink);
    $("[data-pwa-print]", actions).addEventListener("click", () => window.print());
    $("[data-pwa-install]", actions).addEventListener("click", async () => {
      if (!deferredInstallPrompt) {
        notify("Install is available from your browser menu.");
        return;
      }
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      actions.querySelector("[data-pwa-install]").hidden = true;
    });
  }

  function refreshEnhancements() {
    addUtilityActions();
    updateMetadata();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    refreshEnhancements();
    const button = $("[data-pwa-install]");
    if (button) button.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    const button = $("[data-pwa-install]");
    if (button) button.hidden = true;
    notify("Absurd Portfolio installed.");
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

    if (event.key.toLowerCase() === "p") window.print();
    if (event.key.toLowerCase() === "l") copyShareLink();
    if (event.key === "?") notify("Shortcuts: G = generate · P = print · L = share link · ? = shortcuts");
  });

  const app = $("#app");
  if (app) {
    const observer = new MutationObserver(refreshEnhancements);
    observer.observe(app, { childList: true });
  }

  if ("serviceWorker" in navigator && window.isSecureContext) {
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
