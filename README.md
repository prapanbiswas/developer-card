# 🃏 Dynamic Auto-Updating Developer Visiting Card

A self-hosted, fully automated developer card for **GitHub Pages** that rebuilds itself **every hour** with live weather data, a fresh programming joke, and a new template every day — all powered by **GitHub Actions** with zero external services.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🌤️ **Live Weather** | Current conditions for Khulna, BD via OpenWeatherMap API |
| 🃏 **Hourly Joke** | Fresh programming joke from JokeAPI (no key needed) |
| 🎨 **10 Unique Templates** | Rotates to a new design every day automatically |
| ⚡ **Zero Runtime** | Pure static HTML — no server, no database |
| 🤖 **Fully Automated** | GitHub Actions cron job, commits itself back |
| 🔐 **Secure API Key** | Stored as a GitHub Secret — never in code |
| 📱 **Responsive** | Every template works on mobile & desktop |

---

## 📁 File Structure

```
developer-card/
│
├── .github/
│   └── workflows/
│       └── update.yml          ← GitHub Actions workflow (runs every hour)
│
├── templates/                  ← All 10 card themes live here
│   ├── 01-retro-terminal.html
│   ├── 02-glassmorphism.html
│   ├── 03-cyberpunk.html
│   ├── 04-minimal.html
│   ├── 05-material-design.html
│   ├── 06-neon-dark.html
│   ├── 07-aurora-gradient.html
│   ├── 08-newspaper-classic.html
│   ├── 09-brutalist.html
│   ├── 10-synthwave.html
│   └── example-structure/
│       └── base-template.html  ← Starter template for contributors
│
├── images/
│   └── profile.jpg             ← ⚠️  YOU MUST ADD THIS FILE
│
├── index.html                  ← Auto-generated output (served by GitHub Pages)
├── state.json                  ← Tracks current template index + rotation date
├── config.json                 ← ✏️  YOUR PROFILE DATA — edit this once
├── package.json
├── update-card.js              ← Main Node.js generator script
└── README.md
```

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Fork / Clone the Repo

```bash
# Clone to your machine
git clone https://github.com/YOUR_USERNAME/developer-card.git
cd developer-card
```

Or click **"Use this template"** / **"Fork"** on GitHub.

---

### Step 2 — Edit Your Profile (`config.json`)

Open `config.json` and fill in your details:

```json
{
  "name": "Your Full Name",
  "title": "Your Job Title",
  "bio": "A short bio about yourself.",
  "location": "Your City, Country",
  "github": "https://github.com/yourusername",
  "linkedin": "https://linkedin.com/in/yourusername",
  "email": "you@example.com",
  "skills": ["JavaScript", "Node.js", "React", "Python"]
}
```

---

### Step 3 — Add Your Profile Photo

Place your photo at:
```
images/profile.jpg
```
- **Square crop recommended** (e.g. 400×400px)
- Supported formats: `.jpg`, `.png`, `.webp`
- The templates reference it as `./images/profile.jpg`

---

### Step 4 — Get a Free OpenWeatherMap API Key

1. Go to **[openweathermap.org/api](https://openweathermap.org/api)**
2. Click **"Sign Up"** (free account)
3. Go to **API Keys** tab in your dashboard
4. Copy your API key (it looks like: `a1b2c3d4e5f6...`)

> **Free tier** gives you 1,000 calls/day — more than enough for hourly updates.

---

### Step 5 — Store the API Key as a GitHub Secret (🔐 Secure)

This is the **correct, secure way** to use API keys with GitHub Actions. Your key is **never written into any file** — it stays encrypted in GitHub's vault.

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Set:
   - **Name:** `OPENWEATHERMAP_API_KEY`
   - **Value:** *(paste your API key)*
5. Click **"Add secret"**

That's it. The workflow reads it as `${{ secrets.OPENWEATHERMAP_API_KEY }}` — GitHub injects it at runtime. It never appears in logs or code.

```yaml
# This is how it's used in update.yml — the key is never hardcoded:
env:
  OPENWEATHERMAP_API_KEY: ${{ secrets.OPENWEATHERMAP_API_KEY }}
```

---

### Step 6 — Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select: `Deploy from a branch`
3. Branch: `main` · Folder: `/ (root)`
4. Click **Save**

Your card will be live at:
```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

---

### Step 7 — Push Your Changes & Trigger the First Run

```bash
git add .
git commit -m "Initial setup: add profile, photo, config"
git push origin main
```

Then go to **Actions tab** → click **"Auto-Update Developer Card"** → click **"Run workflow"** to trigger it immediately (don't wait an hour).

---

## 🎨 Template Gallery

| # | Name | Style |
|---|---|---|
| 01 | `retro-terminal` | CRT green monospace, scanlines, blinking cursor |
| 02 | `glassmorphism` | Frosted glass, animated gradient orbs |
| 03 | `cyberpunk` | Neon yellow/magenta, glitch effects, grid lines |
| 04 | `minimal` | Cormorant serif, editorial typography, hairline rules |
| 05 | `material-design` | Elevated cards, deep purple, Material 3 chips |
| 06 | `neon-dark` | Electric blue/violet glow, deep navy, scan animation |
| 07 | `aurora-gradient` | Animated aurora background, frosted glass, dreamy |
| 08 | `newspaper-classic` | Broadsheet editorial, Playfair Display, drop caps |
| 09 | `brutalist` | Raw black borders, yellow accent, stark contrast |
| 10 | `synthwave` | 3D grid floor, 80s sunset, Orbitron font |

Templates rotate in alphabetical/numerical order — one new template every day.

---

## 🔧 How the Update Logic Works

```
Every Hour (GitHub Actions cron):
│
├── Read state.json
│   ├── Is today a new day?  →  YES → rotate template index +1
│   └──                      →  NO  → keep same template
│
├── Fetch weather from OpenWeatherMap API
├── Fetch joke from JokeAPI
│
├── Load active template HTML file
├── Replace all {{PLACEHOLDERS}} with real data
├── Write output → index.html
│
└── git add index.html state.json
    git commit -m "🤖 Auto-update: [timestamp]"
    git push  →  GitHub Pages updates automatically
```

---

## 🛠️ Adding Your Own Template

1. Copy the base template:
   ```bash
   cp templates/example-structure/base-template.html templates/11-my-theme.html
   ```

2. Edit `11-my-theme.html` — write your own HTML/CSS
3. Use any of the `{{PLACEHOLDERS}}` listed below
4. Push to GitHub — it automatically enters the rotation!

### Full Placeholder Reference

| Placeholder | Example Output |
|---|---|
| `{{DEV_NAME}}` | `Jane Developer` |
| `{{DEV_TITLE}}` | `Full-Stack Engineer` |
| `{{DEV_BIO}}` | `Building cool things…` |
| `{{DEV_LOCATION}}` | `Khulna, Bangladesh` |
| `{{DEV_GITHUB}}` | `https://github.com/…` |
| `{{DEV_LINKEDIN}}` | `https://linkedin.com/…` |
| `{{DEV_EMAIL}}` | `jane@example.com` |
| `{{DEV_SKILLS}}` | `<span class="skill-tag">JS</span>…` |
| `{{PROFILE_PIC}}` | `./images/profile.jpg` |
| `{{WEATHER}}` | `☀️ 30°C · clear sky · 💧 70%` |
| `{{WEATHER_TEMP}}` | `30°C` |
| `{{WEATHER_EMOJI}}` | `☀️` |
| `{{WEATHER_DESC}}` | `clear sky` |
| `{{WEATHER_CITY}}` | `Khulna` |
| `{{JOKE}}` | `Why do programmers…` |
| `{{LAST_UPDATED}}` | `04 Jan 2025, 03:00 PM BDT` |
| `{{TEMPLATE_NAME}}` | `11-my-theme` |

---

## 💻 Running Locally

```bash
# Install dependencies (none required, but good practice)
npm install

# Set your API key for local testing
export OPENWEATHERMAP_API_KEY=your_key_here   # Linux/macOS
set OPENWEATHERMAP_API_KEY=your_key_here      # Windows CMD
$env:OPENWEATHERMAP_API_KEY="your_key_here"   # PowerShell

# Run the generator
node update-card.js

# Open the output
open index.html   # macOS
start index.html  # Windows
```

---

## 🌐 Changing the Weather Location

Open `update-card.js` and find this line (~line 91):

```js
const url = `https://api.openweathermap.org/data/2.5/weather` +
            `?q=Khulna,BD&appid=${apiKey}&units=metric`;
```

Change `Khulna,BD` to your city:
- `Dhaka,BD` — Dhaka, Bangladesh
- `London,GB` — London, UK
- `New York,US` — New York, USA
- `Tokyo,JP` — Tokyo, Japan

Full city list: [openweathermap.org/find](https://openweathermap.org/find)

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| Action fails with `401 Unauthorized` | Check your `OPENWEATHERMAP_API_KEY` secret is set correctly |
| Action fails with `city not found` | Check the `q=City,CC` format in `update-card.js` |
| Template not rotating | Check `state.json` is being committed — look at Action logs |
| Profile photo not showing | Ensure file is at `images/profile.jpg` (exact filename) |
| GitHub Pages shows old version | GitHub Pages can take 1–2 mins to update after a push |
| Want to force a template | Edit `state.json` → set `currentTemplateIndex` to 0–9 |

---

## 📄 License

MIT — free to use, fork, and customize.

---

*Auto-updated every hour via GitHub Actions. Weather: OpenWeatherMap API. Jokes: JokeAPI.*
