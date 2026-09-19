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
  Полностью совместимый форк <a href="https://github.com/gozargah/marzban">Marzban</a>, созданный для завершения веб-интерфейса на основе существующих возможностей API.
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

## Что такое Marzdar?

**Marzdar** — это прямая и 100% совместимая замена для [Marzban](https://github.com/gozargah/marzban).

В оригинальном проекте Marzban в бэкенде уже реализовано множество функций и конечных точек REST API, для которых не было кнопок и элементов управления в веб-панели. **Цель Marzdar — завершить этот пользовательский интерфейс**, предоставив доступ ко всем возможностям бэкенда без нарушения совместимости.

---

## Сравнение Marzban и Marzdar

| Раздел | Marzban (Оригинал) | Marzdar |
| :--- | :--- | :--- |
| **Совместимость** | Стандартный Marzban | 100% совместимость (та же БД, CLI и ядро) |
| **Управление администраторами** | Только через CLI / API | Полный веб-интерфейс (создание, редактирование, удаление, sudo, сброс трафика) |
| **Шаблоны пользователей** | Только через API | Полный веб-интерфейс (шаблоны + автозаполнение формы в 1 клик) |
| **Очередь продления (Next Plan)** | Только через API (`next_plan`) | Полный веб-интерфейс (настройка + мгновенная ручная активация) |
| **Очистка истёкших пользователей** | Ручной SQL / API | Безопасное модальное окно пакетного удаления с фильтром по дате |
| **Передача прав на пользователя** | Только через API | Веб-интерфейс передачи прав между администраторами |
| **Темы и акценты** | Только светлая / тёмная | Светлая, тёмная и OLED-чёрная + 8 цветов акцента |
| **Миграция** | - | Замена 1 строки в Docker образе |

---

## Границы проекта

### ✅ Что реализует Marzdar
- **Завершение веб-интерфейса**: Создание удобных и понятных визуальных элементов для всех конечных точек API Marzban.
- **100% взаимозаменяемость**: Никаких ломающих изменений в схеме базы данных, файлах конфигурации или командах CLI.
- **Улучшение UI/UX**: Поддержка тем (светлая, тёмная, OLED Black), палитры акцентов и полная локализация на английский, персидский, русский и китайский языки.

### ❌ Что выходит за рамки проекта (не планируется)
- **Никаких кардинальных изменений бэкенда**: Мы не переписываем архитектуру и структуру таблиц.
- **Никаких проприетарных протоколов**: Строгое следование стандартам Xray-core и Marzban.
- **Никаких лишних функций**: Функции, нарушающие совместимость с Marzban, добавляться не будут.

---

## Установка и миграция

После установки оригинальной версии Marzban замените образ docker в `docker-compose.yml`:

Из:
```yaml
services:  
  marzban:  
    image: gozargah/marzban:latest
```

В:
```yaml
services:  
  marzban:  
    image: mehrwizard/marzdar:latest
```

Затем выполните команду `marzban update` для завершения настройки `marzdar`:
```bash
marzban update
```

---

## Пожертвование (Donation)

Если вы находите Marzdar полезным и хотите поддержать развитие проекта:

- [Поддержать проект через платежный шлюз MehrNet](https://gateway.mehrnet.com/product/1DE5C11019E2)

---

## Лицензия

Marzdar распространяется под лицензией [GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE).
