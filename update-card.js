/**
 * update-card.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Auto-Updating Developer Visiting Card — Card Generator Script
 *
 * What this script does:
 *  1. Reads config.json for your developer profile data (edit once, forget it).
 *  2. Reads state.json to know which template is active and when it last rotated.
 *  3. If it's a new day → rotates to the next template (cycles through templates/).
 *  4. Fetches current weather for Khulna, BD from OpenWeatherMap API.
 *  5. Fetches a random programming joke from JokeAPI (no key required).
 *  6. Injects all data into the active template by replacing placeholders.
 *  7. Writes the final HTML to index.html (served by GitHub Pages).
 *  8. Writes updated state.json back.
 *
 * Environment Variables Required:
 *   OPENWEATHERMAP_API_KEY — set this as a GitHub Secret (see README.md)
 *
 * Template Placeholders (use these in any custom template):
 *   {{DEV_NAME}}       — Developer full name
 *   {{DEV_TITLE}}      — Job title / headline
 *   {{DEV_BIO}}        — Short bio paragraph
 *   {{DEV_LOCATION}}   — City, Country
 *   {{DEV_GITHUB}}     — GitHub profile URL
 *   {{DEV_LINKEDIN}}   — LinkedIn profile URL
 *   {{DEV_EMAIL}}      — Contact email
 *   {{DEV_SKILLS}}     — Pre-rendered <span class="skill-tag"> elements
 *   {{PROFILE_PIC}}    — Path to profile image (./images/profile.jpg)
 *   {{WEATHER}}        — Full weather string (emoji + temp + desc + humidity + wind)
 *   {{WEATHER_TEMP}}   — Temperature only, e.g. "28°C"
 *   {{WEATHER_EMOJI}}  — Weather emoji, e.g. "☀️"
 *   {{WEATHER_DESC}}   — Description, e.g. "scattered clouds"
 *   {{WEATHER_CITY}}   — City name
 *   {{JOKE}}           — Full joke text
 *   {{LAST_UPDATED}}   — Human-readable timestamp (Asia/Dhaka timezone)
 *   {{TEMPLATE_NAME}}  — Name of the current template file (without .html)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs    = require('fs');
const https = require('https');
const path  = require('path');

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT     = __dirname;
const TMPL_DIR = path.join(ROOT, 'templates');
const STATE_F  = path.join(ROOT, 'state.json');
const CONFIG_F = path.join(ROOT, 'config.json');
const OUTPUT_F = path.join(ROOT, 'index.html');

// ── Weather Emoji Map ─────────────────────────────────────────────────────────
const WX_ICON = {
  Thunderstorm : '⛈️',
  Drizzle      : '🌦️',
  Rain         : '🌧️',
  Snow         : '❄️',
  Clear        : '☀️',
  Clouds       : '☁️',
  Mist         : '🌫️',
  Smoke        : '🌫️',
  Haze         : '🌫️',
  Dust         : '🌪️',
  Fog          : '🌫️',
  Sand         : '🌪️',
  Ash          : '🌋',
  Squall       : '🌬️',
  Tornado      : '🌪️',
};

// ── HTTP GET Helper (returns parsed JSON, no external deps) ───────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'dev-card-updater/1.0' } }, res => {
      let raw = '';
      res.on('data', chunk => (raw += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error(`JSON parse error from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// ── Fetch Weather ─────────────────────────────────────────────────────────────
async function fetchWeather(apiKey) {
  if (!apiKey) {
    throw new Error(
      'OPENWEATHERMAP_API_KEY environment variable is not set!\n' +
      'Add it as a GitHub Secret → Settings → Secrets → Actions.\n' +
      'Get a free key at: https://openweathermap.org/api'
    );
  }

  const url = `https://api.openweathermap.org/data/2.5/weather` +
              `?q=Khulna,BD&appid=${apiKey}&units=metric`;

  const d       = await httpGet(url);
  const temp    = Math.round(d.main.temp);
  const feels   = Math.round(d.main.feels_like);
  const desc    = d.weather[0].description;
  const main    = d.weather[0].main;
  const emoji   = WX_ICON[main] ?? '🌡️';
  const hum     = d.main.humidity;
  const wind    = Number(d.wind.speed).toFixed(1);

  return {
    full    : `${emoji} ${temp}°C · ${desc} · Feels ${feels}°C · 💧 ${hum}% · 💨 ${wind} m/s`,
    temp    : `${temp}°C`,
    emoji,
    desc,
    feels   : `${feels}°C`,
    humidity: `${hum}%`,
    wind    : `${wind} m/s`,
    city    : 'Khulna',
  };
}

// ── Fetch Joke ────────────────────────────────────────────────────────────────
async function fetchJoke() {
  const FALLBACK = 'Why do programmers prefer dark mode? Because light attracts bugs!';
  const url = 'https://v2.jokeapi.dev/joke/Programming?type=single' +
              '&blacklistFlags=nsfw,racist,sexist,explicit';
  try {
    const d = await httpGet(url);
    return (d.error === false && d.joke) ? d.joke : FALLBACK;
  } catch {
    console.warn('  ⚠️  JokeAPI unreachable, using fallback joke.');
    return FALLBACK;
  }
}

// ── Load / Save Helpers ───────────────────────────────────────────────────────
function loadJSON(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    console.warn(`  ⚠️  Could not read ${path.basename(filePath)}, using defaults.`);
    return fallback;
  }
}

function getTemplateFiles() {
  return fs
    .readdirSync(TMPL_DIR)
    .filter(f => {
      if (!f.endsWith('.html')) return false;
      return fs.statSync(path.join(TMPL_DIR, f)).isFile(); // skip subdirectories
    })
    .sort(); // alphabetical → predictable rotation order
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Developer Card Updater — starting…          ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const cfg   = loadJSON(CONFIG_F, {
    name     : 'Your Name',
    title    : 'Full-Stack Developer',
    bio      : 'Building cool things for the web and beyond.',
    location : 'Khulna, Bangladesh',
    github   : 'https://github.com/yourusername',
    linkedin : '#',
    email    : 'you@example.com',
    skills   : ['JavaScript', 'Node.js'],
  });

  const state     = loadJSON(STATE_F, { currentTemplateIndex: 9, lastRotationDate: '' });
  const today     = new Date().toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
  const templates = getTemplateFiles();

  if (templates.length === 0) {
    throw new Error('No .html template files found in the templates/ folder!');
  }

  // ── Daily Template Rotation ──────────────────────────────────────────────
  if (state.lastRotationDate !== today) {
    // Advance to next template (wraps around)
    state.currentTemplateIndex = (state.currentTemplateIndex + 1) % templates.length;
    state.lastRotationDate = today;
    console.log(`🔄  New day! Rotating template → [${templates[state.currentTemplateIndex]}]`);
  } else {
    // Same day: keep template, but guard against out-of-range index
    state.currentTemplateIndex = state.currentTemplateIndex % templates.length;
    console.log(`📌  Same day. Keeping template → [${templates[state.currentTemplateIndex]}]`);
  }

  const tmplFile = templates[state.currentTemplateIndex];
  let html       = fs.readFileSync(path.join(TMPL_DIR, tmplFile), 'utf8');

  // ── Fetch Live Data ──────────────────────────────────────────────────────
  console.log('\n🌤️   Fetching weather for Khulna, BD…');
  const wx = await fetchWeather(process.env.OPENWEATHERMAP_API_KEY);
  console.log(`     → ${wx.full}`);

  console.log('🃏   Fetching programming joke…');
  const joke = await fetchJoke();
  console.log(`     → ${joke.substring(0, 70)}${joke.length > 70 ? '…' : ''}`);

  // ── Build Replacements Map ───────────────────────────────────────────────
  const lastUpdated = new Date().toLocaleString('en-GB', {
    timeZone  : 'Asia/Dhaka',
    day       : '2-digit',
    month     : 'short',
    year      : 'numeric',
    hour      : '2-digit',
    minute    : '2-digit',
    hour12    : true,
  }) + ' BDT';

  const skillsHTML = (cfg.skills || [])
    .map(s => `<span class="skill-tag">${escapeHTML(s)}</span>`)
    .join('');

  const replacements = {
    '{{DEV_NAME}}'      : escapeHTML(cfg.name),
    '{{DEV_TITLE}}'     : escapeHTML(cfg.title),
    '{{DEV_BIO}}'       : escapeHTML(cfg.bio),
    '{{DEV_LOCATION}}'  : escapeHTML(cfg.location),
    '{{DEV_GITHUB}}'    : cfg.github,
    '{{DEV_LINKEDIN}}'  : cfg.linkedin || '#',
    '{{DEV_EMAIL}}'     : escapeHTML(cfg.email),
    '{{DEV_SKILLS}}'    : skillsHTML,
    '{{PROFILE_PIC}}'   : './images/profile.jpg',
    '{{WEATHER}}'       : escapeHTML(wx.full),
    '{{WEATHER_TEMP}}'  : wx.temp,
    '{{WEATHER_EMOJI}}' : wx.emoji,
    '{{WEATHER_DESC}}'  : escapeHTML(wx.desc),
    '{{WEATHER_CITY}}'  : wx.city,
    '{{JOKE}}'          : escapeHTML(joke),
    '{{LAST_UPDATED}}'  : lastUpdated,
    '{{TEMPLATE_NAME}}' : tmplFile.replace('.html', ''),
  };

  // ── Replace Placeholders ─────────────────────────────────────────────────
  for (const [placeholder, value] of Object.entries(replacements)) {
    html = html.split(placeholder).join(value); // global replace, no regex needed
  }

  // ── Write Outputs ────────────────────────────────────────────────────────
  fs.writeFileSync(OUTPUT_F, html, 'utf8');
  fs.writeFileSync(STATE_F, JSON.stringify(state, null, 2) + '\n', 'utf8');

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  ✅  Done!                                    ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  index.html  ← generated from [${tmplFile}]`);
  console.log(`  state.json  ← template index: ${state.currentTemplateIndex}`);
  console.log(`  Updated at: ${lastUpdated}\n`);
}

// ── XSS-safe HTML Escape ──────────────────────────────────────────────────────
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Entry Point ───────────────────────────────────────────────────────────────
main().catch(err => {
  console.error('\n❌  Fatal error:', err.message);
  process.exit(1);
});
