
"use strict";

const $ = (id) => document.getElementById(id);

let pyodide = null;
let isGenerating = false;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setText(id, value) {
  $(id).textContent = String(value);
}

function renderExperience(items) {
  const root = $("experience");
  root.replaceChildren();

  items.forEach((item, index) => {
    const article = element("article", "experience-item");
    const number = element("span", "experience-index",
      String(index + 1).padStart(2, "0"));
    const body = element("div", "experience-body");
    const period = element("div", "experience-period", item.period);
    const title = element("h3", "", item.title);
    const company = element("p", "experience-company", item.company);
    const description = element("p", "experience-description",
      item.description);

    body.append(period, title, company, description);
    article.append(number, body);
    root.append(article);
  });
}

function renderProjects(items) {
  const root = $("projects");
  root.replaceChildren();

  const symbols = ["◈", "✳", "⌘"];
  items.forEach((item, index) => {
    const card = element("article", "project");
    const icon = element("div", "project-icon", symbols[index % symbols.length]);
    const content = element("div", "project-content");
    const heading = element("div", "project-title-row");
    const title = element("h3", "", item.title);
    const status = element("span",
      "project-status " + item.status.toLowerCase(),
      item.status);
    const description = element("p", "", item.description);

    heading.append(title, status);
    content.append(heading, description);
    card.append(icon, content);
    root.append(card);
  });
}

function renderSkills(items) {
  const root = $("skills");
  root.replaceChildren();

  items.forEach((skill) => {
    root.append(element("span", "skill", skill));
  });
}

function renderAchievements(items) {
  const root = $("achievements");
  root.replaceChildren();

  items.forEach((achievement) => {
    const li = element("li", "achievement");
    const icon = element("span", "achievement-star", "✳");
    const text = element("span", "", achievement);
    li.append(icon, text);
    root.append(li);
  });
}

function renderProfile(profile) {
  setText("category", profile.category);
  setText("profile-id", profile.id);
  setText("name", profile.name);
  setText("job", profile.job);
  setText("location", "⌖ " + profile.location);
  setText("bio", profile.bio);
  setText("years", profile.years + "+");
  setText("project-count", profile.project_count);
  setText("countries", profile.countries);
  setText("coffee", profile.coffee);
  setText("about", profile.about);

  setText("degree", profile.degree);
  setText("university", profile.university);
  setText("education-year", profile.education_year);

  setText("salary",
    "$" + profile.salary.toLocaleString("en-US") + " / YEAR*");

  renderExperience(profile.experience);
  renderProjects(profile.projects);
  renderSkills(profile.skills);
  renderAchievements(profile.achievements);

  document.documentElement.style.setProperty(
    "--chaos-accent", profile.avatar_color
  );

  document.title = `${profile.name} — ${profile.job} | CHAOSFOLIO`;
  $("portfolio").hidden = false;
  $("loading").hidden = true;
  $("error").hidden = true;
}

async function generateProfile() {
  if (isGenerating) return;
  isGenerating = true;

  $("portfolio").hidden = true;
  $("error").hidden = true;
  $("loading").hidden = false;
  $("loading").querySelector("p").textContent =
    "Summoning an unqualified professional...";

  $("generate").disabled = true;
  $("generate-bottom").disabled = true;

  try {
    if (!pyodide) {
      $("loading").querySelector("small").textContent =
        "Starting the browser Python engine...";
      pyodide = await loadPyodide();
    }

    $("loading").querySelector("small").textContent =
      "Inventing a suspicious career history...";

    const response = await fetch("generator.py", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Could not load generator.py (HTTP ${response.status}).`
      );
    }

    const pythonSource = await response.text();
    const jsonString = await pyodide.runPythonAsync(pythonSource);
    const profile = JSON.parse(jsonString);

    renderProfile(profile);
  } catch (error) {
    console.error(error);
    $("loading").hidden = true;
    $("portfolio").hidden = true;
    $("error").hidden = false;
    $("error-message").textContent =
      error.message || "Something went wrong while generating the profile.";
  } finally {
    isGenerating = false;
    $("generate").disabled = false;
    $("generate-bottom").disabled = false;
  }
}

$("generate").addEventListener("click", generateProfile);
$("generate-bottom").addEventListener("click", generateProfile);

generateProfile();
