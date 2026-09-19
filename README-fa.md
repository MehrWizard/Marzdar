<p align="center">
  <a href="https://github.com/MehrWizard/Marzdar" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo-dark.svg">
      <img width="160" height="160" src="docs/assets/logo-light.svg" alt="Marzdar Logo">
    </picture>
  </a>
</p>

<h1 align="center">مرزدار (Marzdar)</h1>

<p align="center">
  یک فورک کاملاً سازگار و جایگزین مستقیم برای <a href="https://github.com/gozargah/marzban">مرزبان (Marzban)</a> با هدف تکمیل رابط کاربری بر اساس قابلیت‌های موجود در API.
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

## مرزدار چیست؟

**مرزدار** یک جایگزین مستقیم، یکپارچه و ۱۰۰٪ سازگار برای [مرزبان (Marzban)](https://github.com/gozargah/marzban) است.

پروژه اصلی مرزبان قابلیت‌ها و اندپوینت‌های REST API فراوانی در بک‌اند خود پیاده کرده بود که هرگز برای آن‌ها دکمه، پنجره یا کنترلی در پنل وب طراحی نشد. **مرزدار با هدف تکمیل این رابط کاربری ایجاد شده است** تا تمام امکانات موجود در بک‌اند را بدون ایجاد هرگونه ناسازگاری یا تغییر در هسته اصلی در اختیار کاربران قرار دهد.

---

## مقایسه مرزبان و مرزدار

| بخش | مرزبان (پروژه اصلی) | مرزدار |
| :--- | :--- | :--- |
| **سازگاری** | مرزبان استاندارد | ۱۰۰٪ سازگار و قابل جابجایی (همان دیتابیس، CLI و هسته) |
| **مدیریت ادمین‌ها** | فقط از طریق CLI و API | پنل کامل در وب (ایجاد، ویرایش، حذف، سودو، مشاهده و ریست مصرف) |
| **قالب‌های کاربر (Templates)** | فقط از طریق API | پنل کامل در وب (مدیریت قالب‌ها + تکمیل خودکار فرم کاربر با ۱ کلیک) |
| **طرح بعدی (رزرو تمدید)** | فقط از طریق API (`next_plan`) | پنل کامل در وب (تنظیم پلن رزرو + فعال‌سازی فوری با ۱ کلیک) |
| **پاکسازی کاربران منقضی** | دستی یا API | مودال اختصاصی و ایمن با فیلتر زمانی دقیق برای حذف گروهی |
| **انتقال مالکیت کاربر** | فقط از طریق API | امکان انتقال کاربر بین ادمین‌ها در پنل وب |
| **پوسته‌ها و رنگ‌های شاخص** | فقط تاریک و روشن ثابت | حالت روشن، تاریک و مشکی مطلق (OLED) + ۸ رنگ شاخص متنوع |
| **مهاجرت و جابجایی** | - | تغییر تنها یک خط در ایمیج داکر بدون هیچ قطعی یا از دست رفتن داده |

---

## اهداف و محدوده پروژه

### ✅ اهدافی که مرزدار دنبال می‌کند
- **تکمیل رابط کاربری**: افزودن کنترل‌ها و بخش‌های بصری شیک و ساده برای تمام قابلیت‌های موجود در API مرزبان.
- **حفظ سازگاری کامل ۱۰۰٪**: عدم ایجاد تغییرات ناسازگار در پایگاه‌داده، فایل‌های تنظیمات یا دستورات ترمینال. هر زمان که مایل باشید می‌توانید به مرزبان بازگردید.
- **بهبود تجربه کاربری (UI/UX)**: ارائه پوسته‌های جدید (از جمله مشکی OLED)، پالت‌های رنگی جذاب و ترجمه یکدست به زبان‌های فارسی، انگلیسی، روسی و چینی.

### ❌ مواردی که در محدوده پروژه نیست (برنامه‌ریزی نشده)
- **عدم تغییر در معماری بک‌اند**: ما موتور بک‌اند یا ساختار دیتابیس را بازنویسی نمی‌کنیم.
- **عدم افزودن پروتکل‌های غیراستاندارد**: کاملاً مطابق با استانداردهای Xray-core و مرزبان پیش می‌رویم.
- **عدم پیچیده‌سازی بیهوده**: امکاناتی که خارج از هدف اصلی بوده و باعث ناسازگاری شوند به پروژه افزوده نخواهند شد.

---

## نصب و راه‌اندازی

نصب مرزدار کمتر از یک دقیقه زمان می‌برد. پس از نصب نسخه اصلی مرزبان، کافیست ایمیج داکر مرزبان را به مرزدار تغییر دهید:

از:
```yaml
services:  
  marzban:  
    image: gozargah/marzban:latest
```

به:
```yaml
services:  
  marzban:  
    image: mehrwizard/marzdar:latest
```

در پایان دستور `marzban update` را اجرا نمایید تا راه‌اندازی `marzdar` تکمیل گردد:
```bash
marzban update
```

---

## حمایت مالی (Donation)

اگر مرزدار برای شما مفید واقع شده و مایل به حمایت از توسعه آن هستید:

- [حمایت مالی از طریق درگاه پرداخت مهرنت](https://gateway.mehrnet.com/product/1DE5C11019E2)

---

## لایسنس

مرزدار تحت لایسنس [GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE) منتشر شده است.
