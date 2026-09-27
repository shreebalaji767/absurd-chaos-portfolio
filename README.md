# Absurd Portfolio

A procedural portfolio generator that creates a new professional portfolio,
fictional universe, characters, projects, lore, and visual interface every
time the page is refreshed.

The project is intentionally designed as a static website.

## Core idea

Python is the build-time generator.

The browser-side JavaScript is the runtime procedural engine required to
generate a new portfolio after every page load.

Architecture:

Python
  ↓
generate.py
  ↓
generated/index.html
  ↓
Static hosting
  ↓
Browser
  ↓
Procedural generation in RAM
  ↓
New portfolio / world / UI

## No backend

This project does not use:

- Flask
- FastAPI
- Django
- Node server
- PHP
- API server
- database
- authentication
- server sessions

## No persistent browser storage

This project deliberately does not use:

- localStorage
- sessionStorage
- IndexedDB
- cookies

Everything generated after the page loads exists only in JavaScript memory.

Refreshing the page destroys the previous runtime state.

## No fixed portfolio pool

The project does not contain:

```text
portfolio-001
portfolio-002
portfolio-003
...
