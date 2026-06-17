/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  DIJDAHAL — script.js                                           ║
 * ║  CET138 Full Stack Development — Assignment 1                   ║
 * ║                                                                  ║
 * ║  Modules:                                                        ║
 * ║  1.  Theme Toggle                                                ║
 * ║  2.  CSS Animation Controller                                    ║
 * ║  3.  Terminal Simulator                                          ║
 * ║  4.  Counter State Tracker                                       ║
 * ║  5.  Breakpoint Indicator                                        ║
 * ║  6.  Active Nav Highlighting                                     ║
 * ║  7.  Init                                                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

'use strict';

/* ══════════════════════════════════════════════════════════════════
   1. THEME TOGGLE STATE ENGINE
   ──────────────────────────────────────────────────────────────────
   isDark is the single source of truth for the current theme.
   applyTheme() writes it to the DOM by switching data-theme on
   <html>, swapping the icon class, and updating the button label.
   localStorage persists the choice across page loads.
   ══════════════════════════════════════════════════════════════════ */

let isDark = true;

function initTheme() {
  const saved = localStorage.getItem('dj-theme');
  if (saved === 'light') { isDark = false; }
  applyTheme();
}

function toggleTheme() {
  isDark = !isDark;
  applyTheme();
  localStorage.setItem('dj-theme', isDark ? 'dark' : 'light');
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const icon  = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon)  icon.className    = isDark ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
  if (label) label.textContent = isDark ? 'Light' : 'Dark';
}

/* ══════════════════════════════════════════════════════════════════
   2. CSS ANIMATION CONTROLLER
   ──────────────────────────────────────────────────────────────────
   triggerAnimation() adds one of three CSS classes to #animTarget.
   The classes (.anim-pulse / .anim-spin / .anim-bounce) map to
   @keyframes blocks in style.css.
   Clicking the same button again acts as a toggle (removes it).
   ══════════════════════════════════════════════════════════════════ */

/** Maps animation name → CSS class, label text, button ID */
const ANIM_MAP = {
  pulse:  { cls: 'anim-pulse',  label: 'pulse',  btn: 'btnPulse'  },
  spin:   { cls: 'anim-spin',   label: 'spin',   btn: 'btnSpin'   },
  bounce: { cls: 'anim-bounce', label: 'bounce', btn: 'btnBounce' },
};

/** Tracks which animation is currently running */
let activeAnim = null;

function triggerAnimation(name) {
  const target = document.getElementById('animTarget');
  const label  = document.getElementById('animLabel');
  if (!target || !ANIM_MAP[name]) return;

  // Remove all animation classes and button active states
  clearAnimClasses(target);
  clearAnimButtons();

  // Toggle off if the same animation is clicked again
  if (activeAnim === name) {
    activeAnim = null;
    if (label) { label.textContent = 'idle'; label.style.color = ''; }
    return;
  }

  const { cls, label: lbl, btn } = ANIM_MAP[name];

  // Apply the new animation class to the target element
  target.classList.add(cls);

  // Update state label colour
  const colours = { pulse: 'var(--amber)', spin: 'var(--rose)', bounce: 'var(--teal)' };
  if (label) { label.textContent = lbl; label.style.color = colours[name]; }

  // Mark button as active
  const btnEl = document.getElementById(btn);
  if (btnEl) btnEl.classList.add('mc-active');

  activeAnim = name;
}

function resetAnimation() {
  const target = document.getElementById('animTarget');
  const label  = document.getElementById('animLabel');
  if (target) clearAnimClasses(target);
  clearAnimButtons();
  if (label) { label.textContent = 'idle'; label.style.color = ''; }
  activeAnim = null;
}

function clearAnimClasses(el) {
  el.classList.remove('anim-pulse', 'anim-spin', 'anim-bounce');
}

function clearAnimButtons() {
  document.querySelectorAll('.mc-btn').forEach(b => b.classList.remove('mc-active'));
}

/* ══════════════════════════════════════════════════════════════════
   3. TERMINAL SIMULATOR
   ──────────────────────────────────────────────────────────────────
   executeCommand() reads the input, finds a handler in COMMANDS,
   and injects result lines into the DOM as new <div> elements —
   no page refresh, no frameworks.

   Commands: help, status, about, skills, date, ls, version,
             echo [text], whoami, clear
   ══════════════════════════════════════════════════════════════════ */

/**
 * Returns the current time as HH:MM:SS.
 * @returns {string}
 */
function timestamp() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

/**
 * Command registry. Each key is a command string.
 * Each value is a function returning an array of
 * { type: string, text: string } output objects.
 *
 * Special return type '__clear__' wipes the terminal.
 */
const COMMANDS = {

  help: () => [
    { type: 'out', text: '─────────────────────────────────' },
    { type: 'ok',  text: ' Commands' },
    { type: 'out', text: '─────────────────────────────────' },
    { type: 'out', text: ' help      → list commands' },
    { type: 'out', text: ' about     → portfolio info' },
    { type: 'out', text: ' whoami    → who is Dijdahal' },
    { type: 'out', text: ' status    → system diagnostics' },
    { type: 'out', text: ' skills    → tech skill list' },
    { type: 'out', text: ' date      → current date & time' },
    { type: 'out', text: ' ls        → list project files' },
    { type: 'out', text: ' version   → environment info' },
    { type: 'out', text: ' echo [x]  → repeat input' },
    { type: 'out', text: ' clear     → clear terminal' },
    { type: 'out', text: '─────────────────────────────────' },
  ],

  about: () => [
    { type: 'out', text: '─────────────────────────────────' },
    { type: 'ok',  text: ' Dijdahal — CET138 ePortfolio' },
    { type: 'out', text: '─────────────────────────────────' },
    { type: 'out', text: ' Module     : CET138 Full Stack Dev' },
    { type: 'out', text: ' Assignment : 1 — Interactive Portfolio' },
    { type: 'out', text: ' Stack      : HTML5 · Bootstrap 5.3 · JS' },
    { type: 'out', text: ' Year       : First Year IT Student' },
    { type: 'out', text: '─────────────────────────────────' },
  ],

  whoami: () => [
    { type: 'ok',  text: ' dijdahal' },
    { type: 'out', text: ' First-year IT student. Building things.' },
    { type: 'out', text: ' Currently learning: HTML · CSS · JS · Bootstrap' },
    { type: 'out', text: ' Next up: Node.js · Databases · React' },
  ],

  status: () => [
    { type: 'out', text: '─────────────────────────────────' },
    { type: 'ok',  text: ` ● Status: ONLINE` },
    { type: 'out', text: `   Theme   : ${isDark ? 'Dark' : 'Light'} Mode` },
    { type: 'out', text: `   Counter : ${counterState}` },
    { type: 'out', text: `   Time    : ${timestamp()}` },
    { type: 'out', text: `   Changes : ${totalInc + totalDec} state mutations` },
    { type: 'out', text: '─────────────────────────────────' },
  ],

  skills: () => [
    { type: 'out', text: '─────────────────────────────────' },
    { type: 'ok',  text: ' Technical Skills' },
    { type: 'out', text: '─────────────────────────────────' },
    { type: 'out', text: ' [■■■■■] HTML5           Proficient' },
    { type: 'out', text: ' [■■■■□] CSS3 / Bootstrap Proficient' },
    { type: 'out', text: ' [■■■□□] JavaScript ES6+ Learning' },
    { type: 'out', text: ' [■□□□□] Node.js         Beginner' },
    { type: 'out', text: ' [■□□□□] Databases       Beginner' },
    { type: 'out', text: '─────────────────────────────────' },
  ],

  date: () => [
    { type: 'ok',  text: ` ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` },
    { type: 'out', text: ` ${new Date().toLocaleTimeString('en-GB')}` },
  ],

  ls: () => [
    { type: 'out', text: ' dijdahal-portfolio/' },
    { type: 'out', text: ' ├── index.html   semantic structure + CDN links' },
    { type: 'out', text: ' ├── style.css    warm obsidian theme + keyframes' },
    { type: 'out', text: ' └── script.js    state engine + terminal + counter' },
  ],

  version: () => [
    { type: 'out', text: ' Bootstrap     5.3.3' },
    { type: 'out', text: ' Bootstrap Icons  1.11.3' },
    { type: 'out', text: ' Syne / DM Sans   Google Fonts' },
    { type: 'out', text: ' JS Engine     Vanilla ES6+' },
  ],

  echo: (args) => {
    const msg = args.slice(1).join(' ');
    return msg
      ? [{ type: 'out', text: ` ${msg}` }]
      : [{ type: 'err', text: ' echo: provide some text' }];
  },

  clear: () => [{ type: '__clear__', text: '' }],
};

/**
 * Appends a line to the terminal output.
 * Directly mutates the DOM — no page reload.
 *
 * @param {string} type  - tl modifier class (out|ok|err|sys|state|user)
 * @param {string} text  - content
 * @param {string} [prompt] - override the left prompt text
 */
function appendLine(type, text, prompt) {
  const output = document.getElementById('termOutput');
  if (!output) return;

  const PROMPTS = { sys: 'sys', out: '→', ok: '✓', err: '!', state: 'state', user: 'dijdahal:~$' };

  const line = document.createElement('div');
  line.className = `tl tl--${type}`;

  const tp = document.createElement('span');
  tp.className = 'tp';
  tp.textContent = prompt ?? PROMPTS[type] ?? '→';

  const tt = document.createElement('span');
  tt.className = 'tt';
  tt.textContent = text;

  line.appendChild(tp);
  line.appendChild(tt);
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

/**
 * Reads the terminal input, runs the command, renders output.
 * Called by Enter key press and the send button click.
 */
function executeCommand() {
  const input = document.getElementById('termInput');
  if (!input) return;

  const raw   = input.value.trim();
  const parts = raw.split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  input.value = '';

  if (!raw) return;

  // Echo the user's input
  appendLine('user', raw);

  const handler = COMMANDS[cmd];
  if (!handler) {
    appendLine('err', ` '${cmd}': command not found — try 'help'`);
    return;
  }

  const results = handler(parts);
  results.forEach(({ type, text }) => {
    if (type === '__clear__') {
      const out = document.getElementById('termOutput');
      if (out) out.innerHTML = '';
      appendLine('sys', ' Terminal cleared.');
      return;
    }
    appendLine(type, text);
  });
}

/* ══════════════════════════════════════════════════════════════════
   4. COUNTER STATE TRACKER
   ──────────────────────────────────────────────────────────────────
   counterState is the primitive integer state variable.
   updateCounter(delta) mutates it, updates the DOM display,
   and injects a timestamped log line into the terminal.
   ══════════════════════════════════════════════════════════════════ */

let counterState = 0;
let totalInc = 0;
let totalDec = 0;

function updateCounter(delta) {
  counterState += delta;
  if (delta > 0) totalInc += delta;
  else           totalDec += Math.abs(delta);

  // Update numeric display
  const el = document.getElementById('counterValue');
  if (el) {
    el.textContent = counterState;
    el.style.color =
      counterState > 0 ? 'var(--green)' :
      counterState < 0 ? 'var(--rose)'  :
      'var(--txt-1)';

    // Trigger pop animation (remove → force reflow → re-add)
    el.classList.remove('counter-pop');
    void el.offsetWidth;
    el.classList.add('counter-pop');
  }

  // Update meta stats
  const inc = document.getElementById('totalInc');
  const dec = document.getElementById('totalDec');
  const tot = document.getElementById('totalChanges');
  if (inc) inc.textContent = totalInc;
  if (dec) dec.textContent = totalDec;
  if (tot) tot.textContent = totalInc + totalDec;

  // Inject timestamped state log into terminal
  const action = delta > 0 ? 'INCREMENT' : 'DECREMENT';
  appendLine('state', ` [${timestamp()}] counterState ${action} → ${counterState}`);
}

function resetCounter() {
  counterState = 0;
  const el = document.getElementById('counterValue');
  if (el) {
    el.textContent = 0;
    el.style.color = 'var(--txt-1)';
    el.classList.remove('counter-pop');
    void el.offsetWidth;
    el.classList.add('counter-pop');
  }
  appendLine('sys', ` [${timestamp()}] counterState RESET → 0`);
}

/* ══════════════════════════════════════════════════════════════════
   5. BREAKPOINT INDICATOR
   ──────────────────────────────────────────────────────────────────
   Reads window.innerWidth and highlights the correct Bootstrap
   breakpoint pill in the Section 2 & 3 indicator bar.
   ══════════════════════════════════════════════════════════════════ */

const BREAKPOINTS = [
  { id: 'bp-xs', min: 0,    max: 575  },
  { id: 'bp-sm', min: 576,  max: 767  },
  { id: 'bp-md', min: 768,  max: 991  },
  { id: 'bp-lg', min: 992,  max: 1199 },
  { id: 'bp-xl', min: 1200, max: Infinity },
];

function updateBreakpoint() {
  const w = window.innerWidth;
  BREAKPOINTS.forEach(({ id, min, max }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('bp-active', w >= min && w <= max);
  });
}

/* ══════════════════════════════════════════════════════════════════
   6. ACTIVE NAV LINK HIGHLIGHTING
   Uses IntersectionObserver to track which section is in view
   and reflects it in the navbar links.
   ══════════════════════════════════════════════════════════════════ */

function initNavHighlight() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.dj-navlink');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          link.style.color = href === `#${entry.target.id}` ? 'var(--amber)' : '';
        });
      });
    },
    { rootMargin: '-65px 0px -60% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ══════════════════════════════════════════════════════════════════
   7. INITIALISATION
   DOMContentLoaded guarantees all target elements exist.
   ══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Theme ──
  initTheme();
  document.getElementById('themeToggle')
    ?.addEventListener('click', toggleTheme);

  // ── Session timestamp in terminal ──
  const st = document.getElementById('sessionTime');
  if (st) st.textContent = new Date().toLocaleTimeString('en-GB');

  // ── Terminal Enter key ──
  document.getElementById('termInput')
    ?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); executeCommand(); }
    });

  // ── Breakpoint ──
  updateBreakpoint();
  window.addEventListener('resize', updateBreakpoint);

  // ── Nav highlight ──
  initNavHighlight();

  // ── Close mobile nav on link click ──
  document.querySelectorAll('.dj-navlink').forEach((link) => {
    link.addEventListener('click', () => {
      const collapse = document.getElementById('navContent');
      if (collapse?.classList.contains('show')) {
        bootstrap.Collapse.getInstance(collapse)?.hide();
      }
    });
  });

  // ── Welcome message ──
  setTimeout(() => {
    appendLine('sys', " Type 'help' to see available commands.");
  }, 600);

});

/* ── Expose to global scope for inline onclick handlers ── */
window.toggleTheme      = toggleTheme;
window.triggerAnimation = triggerAnimation;
window.resetAnimation   = resetAnimation;
window.executeCommand   = executeCommand;
window.updateCounter    = updateCounter;
window.resetCounter     = resetCounter;
