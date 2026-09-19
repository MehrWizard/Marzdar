<p align="center">
  <a href="https://github.com/MehrWizard/Marzdar" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo-dark.svg">
      <img width="160" height="160" src="docs/assets/logo-light.svg" alt="Marzdar Logo">
    </picture>
  </a>
</p>

<h1 align="center">Marzdar</h1>

<p align="center">
  A 100% compatible drop-in fork of <a href="https://github.com/gozargah/marzban">Marzban</a> dedicated to completing the user interface based on existing backend capabilities.
</p>

<p align="center">
  <a href="https://github.com/MehrWizard/Marzdar/actions/workflows/build.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/MehrWizard/Marzdar/build.yml?style=flat-square&logo=github" alt="Build Status" />
  </a>
  <a href="https://hub.docker.com/r/mehrwizard/marzdar" target="_blank">
    <img src="https://img.shields.io/docker/pulls/mehrwizard/marzdar?style=flat-square&logo=docker" alt="Docker Pulls" />
  </a>
  <a href="https://github.com/MehrWizard/Marzdar/stargazers">
    <img src="https://img.shields.io/github/stars/MehrWizard/Marzdar?style=flat-square&logo=github" alt="Stars" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/MehrWizard/Marzdar?style=flat-square" alt="License" />
  </a>
  <a href="https://t.me/MehrRoom" target="_blank">
    <img src="https://img.shields.io/badge/Telegram-Group-blue?style=flat-square&logo=telegram" alt="Telegram Group" />
  </a>
  <a href="https://x.com/MehrWizard" target="_blank">
    <img src="https://img.shields.io/badge/X-@MehrWizard-black?style=flat-square&logo=x" alt="X / Twitter" />
  </a>
</p>

<p align="center">
  <a href="./README.md">English</a>
  /
  <a href="./README-fa.md">فارسی</a>
  /
  <a href="./README-zh-cn.md">简体中文</a>
  /
  <a href="./README-ru.md">Русский</a>
</p>

---

## What is Marzdar?

**Marzdar** is a seamless, drop-in replacement for [Marzban](https://github.com/gozargah/marzban).

Upstream Marzban already implemented many essential REST API endpoints and database features that never received corresponding buttons or controls in its web panel. **Marzdar completes this user interface**, unlocking all existing backend functionality without modifying core architecture or breaking compatibility.

---

## Marzban vs. Marzdar

| Area | Marzban (Upstream) | Marzdar |
| :--- | :--- | :--- |
| **Compatibility** | Standard Marzban | 100% drop-in compatible (same DB, CLI, and core) |
| **Admin Management** | CLI / API only | Full web UI (Create, Edit, Delete, Sudo, Usage tracking/reset) |
| **User Templates** | API only | Full web UI (Manage templates + 1-click prefill when creating users) |
| **Queued Renewal Plans** | API only (`next_plan`) | Full web UI (Configure next plan + instant manual activation) |
| **Expired Users Cleanup** | Manual SQL / API only | Safe on-demand bulk deletion modal with date-range filters |
| **User Ownership** | API only | Web UI transfer ownership between admins |
| **Theme & Accents** | Fixed Dark / Light | Light, Dark, and true OLED Black + 8 accent color palettes |
| **Migration** | - | Simple 1-line Docker image swap |

---

## Project Scope

### ✅ What Marzdar Aims to Do
- **Complete the User Interface**: Build clean, intuitive web controls for features already supported by the backend API.
- **Maintain 100% Interchangeability**: Zero breaking changes to the database, configuration files, or CLI commands. You can switch between Marzban and Marzdar at any time.
- **Enhance UI/UX**: Provide modern themes (Light, Dark, OLED Black), accent palettes, and full localization parity across English, Persian, Russian, and Chinese.

### ❌ What is Not Planned (Out of Scope)
- **No breaking architectural changes**: We do not rewrite the backend engine or alter core database tables.
- **No incompatible protocols**: We follow standard Xray-core conventions.
- **No unnecessary bloat**: Features outside Marzban's original scope that compromise compatibility will not be introduced.

---

## Setup & Migration

After installing the original version of Marzban, swap the marzban docker image to marzdar:

From:
```yaml
services:  
  marzban:  
    image: gozargah/marzban:latest
```

To:
```yaml
services:  
  marzban:  
    image: mehrwizard/marzdar:latest
```

Finally run `marzban update` in order to complete the `marzdar` setup.

---

## License

Marzdar is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE).
