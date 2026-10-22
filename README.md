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

<p align="center">
  <a href="https://github.com/MehrWizard/Marzdar" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/MehrWizard/Marzdar/raw/master/docs/assets/preview.png" alt="Marzdar Preview" width="800" height="auto">
  </a>
</p>

---

## What is Marzdar?

**Marzdar** is a seamless, 100% compatible drop-in fork of [Marzban](https://github.com/gozargah/marzban) dedicated to completing the web user interface based on existing backend capabilities.

While upstream Marzban implemented many backend APIs without corresponding frontend controls, **Marzdar unlocks this functionality directly in the web panel** while guaranteeing zero breaking changes and full interchangeability:

- 🎨 **Complete Web Interface**: Build clean, intuitive web controls for features already supported by the backend API: User Templates (1-click prefill), Queued Renewal Plans (`next_plan` configuration & manual activation), Safe Expired Users Bulk Cleanup with date-range filters, and Admin User Ownership Transfer.
- ⚡ **High Concurrency Performance**: Adopt a high-throughput Rust ASGI engine ([Granian](https://github.com/emmett-framework/granian)) with the Tokio runtime, compiled C-native database driver (`mysqlclient`), in-memory thread-safe subscription caching (30s TTL with auto-invalidation), and strategic composite database indexes for ultra-low latency response times.
- 🌓 **Modern UI/UX & Themes**: Modern Light, Dark, and true OLED Black themes with 8 accent palettes, plus full localization parity across English, Persian, Russian, and Chinese.
- 🔄 **100% Drop-In Interchangeability**: Zero breaking changes to the database, configuration files, or CLI commands. You can switch between Marzban and Marzdar at any time with a simple 1-line Docker image swap.

---

## Setup & Migration

Simply update the image in `docker-compose.yml`:

```yaml
services:  
  marzban:  
    image: mehrwizard/marzdar:latest
```

Then restart:
```bash
marzban update
```

---

## Performance & Real-World Telemetry Benchmarks

Both **Marzdar** and **Marzyar** incorporate high-performance architectural optimizations engineered for large-scale production panels handling hundreds of concurrent VPN clients:

1. **Rust-Powered ASGI Engine ([Granian](https://github.com/emmett-framework/granian))**: Replaced standard Python Uvicorn with Granian, an ultra-fast HTTP server utilizing the Tokio runtime and PyO3 bindings for high-throughput asynchronous networking with significantly lower CPU overhead.
2. **Subscription In-Memory Response Caching**: Subscriptions are served from a bounded thread-safe memory cache (30s TTL) with instant automated invalidation whenever a user's configuration, status, or quota changes. Bypasses repetitive template rendering, cryptographic JWT operations, and redundant MySQL queries on continuous client polling.
3. **Strategic Composite Database Indexing**: Added critical compound indexes on high-frequency tables (`users(online_at)`, `users(created_at)`, `node_user_usages(node_id, created_at)`, and `node_usages(node_id, created_at)`), eliminating sequential table scans and lock waits during node statistics aggregation.
4. **C-Native Database Driver & Fast Wire Protocol Deserialization ([mysqlclient](https://github.com/PyMySQL/mysqlclient))**: Replaced interpreted pure-Python `PyMySQL` with compiled C-native `mysqlclient` (`MySQLdb`). Automatically and transparently upgrades `mysql+pymysql://` connection strings to C-extension speed without requiring `.env` changes. Delivers **2.4x faster raw wire protocol deserialization (-58.3% DBAPI latency)**, **1.64x faster bulk ORM hydration**, and **suppresses single-query tail latency spikes by 83%** (from 70 ms down to 11 ms).
5. **Node Session Lifecycle & Stats Collection Resiliency**: Isolated node synchronization cycles, bounded gRPC timeouts, and transactional error handling ensure node stats collection never hangs or impairs API responsiveness.
6. **C/Rust Accelerated Subscriptions & Modernized Stack ([orjson](https://github.com/ijl/orjson) & LibYAML [CSafeLoader/CSafeDumper](https://pyyaml.org/))**: Subscription generation across all client formats is accelerated via compiled C/Rust engines. Clash YAML generation runs via `libyaml` C extensions (**8.5x faster parse**, **4.6x faster dump**, -78% to -88% CPU latency). Sing-Box, V2Ray, and Outline JSON generation leverage `orjson` (**3.9x faster serialization**, -74.3% latency) with direct zero-copy byte encoding for `vmess://` base64 links. Dependencies modernized across the board (`urllib3>=2.0.0`, `python-multipart>=0.0.9`).

<p align="center">
  <img src="docs/assets/architecture.png" alt="Marzdar and Marzyar Architecture Flowchart" width="850" height="auto">
</p>

### Key Performance Highlights:
- ⚡ **8.6x Faster Median Response**: Live telemetry median (p50) subscription latency reduced from 46.27 ms down to 5.37 ms (-88.4% lower latency).
- ⚡ **8.5x Faster Clash YAML & 3.9x Faster JSON**: LibYAML `CSafeLoader`/`CSafeDumper` and `orjson` eliminate raw CPU serialization overhead while maintaining 100% template compatibility.
- 🚀 **23.3x Cache Saturation Throughput**: Serviced **775.2 req/s** (7,764 requests in 10s) vs **33.2 req/s** (341 requests) under sustained 15-worker concurrency (+2,235% capacity via in-memory caching).
- ⚡ **96.1% Lower Latency Under Load**: Average latency under sustained heavy concurrency dropped from 447.66 ms down to 17.53 ms (25.5x faster response).
- 🗄️ **2.4x Faster SQL Wire Deserialization**: Database row unpacking dropped from 21.29 ms to 8.87 ms (-58.3% DBAPI latency) with +40.9% higher query throughput via compiled C-native `mysqlclient`.
- 🗄️ **31.7% Lower Database Load**: MySQL peak CPU spikes reduced from 53.62% down to 36.64% under active query traffic thanks to in-memory caching and compound indexes.
- 🛡️ **25.6% Tail Spike Suppression**: Maximum latency spike suppressed from 604.36 ms down to 449.63 ms under continuous saturation.

<p align="center">
  <img src="docs/assets/benchmark.png" alt="Comprehensive Benchmark Dashboard" width="900" height="auto">
</p>

<details>
<summary><b>Detailed Metrics & Percentile Tables</b></summary>

#### 1. Subscription Response Latency (Live Production Telemetry)

| Latency Percentile | Marzban (Original / Baseline) | Marzdar & Marzyar (Optimized) | Improvement |
| :--- | :--- | :--- | :--- |
| **p50 (Median)** | **46.27 ms** | **5.37 ms** | **-88.4% (8.6x faster)** |
| **p75** | **60.89 ms** | **8.39 ms** | **-86.2% (7.3x faster)** |
| **p90** | **76.21 ms** | **13.81 ms** | **-81.9% (5.5x faster)** |
| **p95** | **93.08 ms** | **23.35 ms** | **-74.9% (4.0x faster)** |
| **Mean (Average)** | **53.38 ms** | **12.25 ms** | **-77.1% (4.4x faster)** |

#### 2. Production Stability & Resource Efficiency

| Telemetry Metric | Marzban (Original / Baseline) | Marzdar & Marzyar (Optimized) | Impact |
| :--- | :--- | :--- | :--- |
| **Peak MySQL CPU Spike** | 53.62% | **36.64%** | **31.7% lower DB query burden** |
| **Max Tail Latency Spike** | 604.36 ms | **449.63 ms** | **25.6% lower tail spike** |
| **Panel Memory Footprint** | ~125 MB | ~175 MB | Highly efficient bounded memory cache |

#### 3. High-Concurrency Stress & Cache Saturation (15 Workers, 10s Burst)

| Benchmark Metric | Marzban (Baseline: Uvicorn / No Cache) | Marzdar & Marzyar (Granian + Cache + Indexes) | Impact |
| :--- | :--- | :--- | :--- |
| **Throughput (Requests/sec)** | **33.2 req/s** | **775.2 req/s** | **+2,235% (23.3x Throughput)** 🚀 |
| **Mean Latency under Load** | **447.66 ms** | **17.53 ms** | **-96.1% Latency (25.5x faster)** |
| **p50 Latency under Load** | **431.47 ms** | **14.34 ms** | **-96.7% Latency (30.1x faster)** |
| **p95 Latency under Load** | **695.22 ms** | **38.62 ms** | **-94.4% Latency (18.0x faster)** |
| **p99 Latency under Load** | **767.31 ms** | **55.85 ms** | **-92.7% Latency (13.7x faster)** |
| **Total Completed Requests (10s)**| 341 requests | **7,764 requests** | **22.8x Total Serviced Reqs** |

#### 4. Database Driver Performance (Live Telemetry: 494 Users, 19 Columns)

| Benchmark Metric | Pure-Python `PyMySQL` | Compiled C `mysqlclient` | Improvement |
| :--- | :--- | :--- | :--- |
| **Raw Wire Protocol Deserialization (p50)** | **21.29 ms** | **8.87 ms** | **-58.3% (2.4x faster)** ⚡ |
| **Bulk ORM Hydration (All 494 Users, p50)** | **31.78 ms** | **19.37 ms** | **-39.1% (1.64x faster)** |
| **Single User Query (p50)** | **3.07 ms** | **2.31 ms** | **-24.6% (1.33x faster)** |
| **Max Tail Latency Spike (Single Query)** | 70.06 ms | **11.89 ms** | **-83.0% Tail Suppression** 🛡️ |
| **Sustained Query Throughput** | 792.7 req/s | **1,117.1 req/s** | **+40.9% Higher Capacity** 🚀 |
</details>

---

## Donation

If you find Marzdar useful, you can support its ongoing development:

- [Donate via MehrNet Gateway](https://gateway.mehrnet.com/product/1DE5C11019E2)

---

## License

Marzdar is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE).
