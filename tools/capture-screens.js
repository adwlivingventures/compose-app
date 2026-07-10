// Capture every Compose screen from the running Expo web app as phone-sized
// PNGs. Uses the app's own resume/persistence mechanisms — no app code changes.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8081';
const OUT = path.join(__dirname, 'screens');
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

// Realistic answer set: triggers physician-note (morningArousal rarely +
// libido<=3) and escalation (contentFrequency !== rarely), fills goal echo.
const ANSWERS = {
  relationship: 'committed',
  reasons: ['performance-anxiety'],
  duration: 'one-two-years',
  attribution: 'mind',
  name: 'Daniel',
  age: 32,
  bandaidHistory: 'tried-none',
  morningArousal: 'rarely',
  libido: 3,
  adrenalineSpike: 'most',
  breathEdge: 'chest',
  pelvicCheck: 'trembled',
  contentFrequency: 'daily',
  escalation: 'somewhat',
  spectatoring: 4,
  partnerImpact: 'pulling-away',
  aftermath: 'replay',
  avoidance: 'sometimes',
  scripts: 'often',
  spillover: 5,
  symptoms: ['losing-erection'],
  goals: ['calm-present', 'trust-body'],
  goalFreeText: '',
};

const DAY_DATA = {};
for (let d = 1; d <= 40; d++) {
  DAY_DATA[d] = { completed: true, pelvicRating: Math.min(5, 2 + Math.floor(d / 12)), habits: { presence: true, focus: d % 3 !== 0, vitality: true } };
}
const ALL75 = {};
for (let d = 1; d <= 75; d++) {
  ALL75[d] = { completed: true, pelvicRating: Math.min(5, 2 + Math.floor(d / 18)), habits: { presence: true, focus: true, vitality: true } };
}
const DEFUSION = [
  { id: '1', date: '2026-06-20T20:00:00.000Z', somaticReality: 'Lost it about ten minutes in.', spectatorClaim: 'She thinks something is wrong with me.', fallacy: 'mind_reading', ventralAnchor: 'My body followed adrenaline. That is physiology, not a verdict.' },
  { id: '2', date: '2026-07-01T21:30:00.000Z', somaticReality: 'Finished faster than I wanted.', spectatorClaim: 'It will always be like this.', fallacy: 'catastrophizing', ventralAnchor: 'One night is one data point. Tonight is one night.' },
];

const PHASE_SEEN = { '@phase_transition_2': true, '@phase_transition_3': true };

const onboard = (screenId, extra = {}) => ({
  storage: {
    '@onboarding_flow_v1': { screenId, answers: ANSWERS },
    ...extra,
  },
  url: '/onboarding',
});

const protocolStorage = (activeDay, days, extra = {}) => ({
  '@user_protocol_state': { activeDay, streak: activeDay - 1, lastCompletedDate: null },
  '@completed_days_data': days,
  '@signature_data': { name: 'Daniel', signedAt: '2026-06-01T12:00:00.000Z' },
  '@defusion_log_entries': DEFUSION,
  '@user_first_name': 'Daniel',
  ...extra,
});

const SHOTS = [
  // ── Onboarding, variant B flow order ──
  { name: '01-welcome-opening', ...onboard('welcome-opening') },
  { name: '02-welcome-roadmap', ...onboard('welcome-roadmap') },
  { name: '03-section-transition', ...onboard('transition-part1'), delay: 700 },
  { name: '04-relationship', ...onboard('relationship') },
  { name: '05-reasons', ...onboard('reasons') },
  { name: '06-duration', ...onboard('duration') },
  { name: '07-attribution', ...onboard('attribution') },
  { name: '08-name', ...onboard('name') },
  { name: '09-age', ...onboard('age') },
  { name: '10-bandaid-history', ...onboard('bandaid-history') },
  { name: '11-morning-arousal', ...onboard('morning-arousal') },
  { name: '12-libido', ...onboard('libido') },
  { name: '13-physician-note', ...onboard('physician-note') },
  { name: '14-adrenaline-spike', ...onboard('adrenaline-spike') },
  { name: '15-breath-edge', ...onboard('breath-edge') },
  { name: '16-pelvic-check', ...onboard('pelvic-check') },
  { name: '17-content-frequency', ...onboard('content-frequency') },
  { name: '18-escalation', ...onboard('escalation') },
  { name: '19-spectatoring', ...onboard('spectatoring') },
  { name: '20-partner-impact', ...onboard('partner-impact') },
  { name: '21-aftermath', ...onboard('aftermath') },
  { name: '22-avoidance', ...onboard('avoidance') },
  { name: '23-scripts', ...onboard('scripts') },
  { name: '24-spillover', ...onboard('spillover') },
  { name: '25-generating', ...onboard('spillover'), clicks: ['Continue'], delay: 2500 },
  { name: '26-map', ...onboard('map'), delay: 3500 },
  { name: '27-symptoms', ...onboard('symptoms') },
  { name: '28-card-adrenaline-trap', ...onboard('card-adrenaline-trap') },
  { name: '29-card-dmn', ...onboard('card-dmn') },
  { name: '30-card-novelty-loop', ...onboard('card-novelty-loop') },
  { name: '31-card-bandaids', ...onboard('card-bandaids') },
  { name: '32-blueprint', ...onboard('blueprint') },
  { name: '33-hopeful-arc-1', ...onboard('hopeful-arc') },
  { name: '34-hopeful-arc-privacy', ...onboard('hopeful-arc'), clicks: ['Continue', 'Continue', 'Continue', 'Continue'] },
  { name: '35-foundations', ...onboard('foundations') },
  { name: '36-diverging-graph', ...onboard('diverging-graph'), delay: 2500 },
  { name: '37-goals', ...onboard('goals') },
  { name: '38-telemetry-consent', ...onboard('telemetry-consent') },
  { name: '39-commit', ...onboard('commit') },
  { name: '40-building-plan', ...onboard('building-plan'), delay: 600 },
  { name: '41-paywall-top', ...onboard('paywall') },
  { name: '42-paywall-scrolled', ...onboard('paywall'), scrollInner: true },
  { name: '43-paywall-dismiss', ...onboard('paywall', { '@paywall_dismissed': true }) },
  { name: '44-day-zero', ...onboard('day-zero') },
  { name: '45-discretion-setup', storage: {}, url: '/discretion?intro=1' },
  // ── Core app (mid-protocol, Day 41) ──
  { name: '46-dashboard-tabs', storage: protocolStorage(41, DAY_DATA, PHASE_SEEN), url: '/(tabs)' },
  { name: '46b-phase-transition', storage: protocolStorage(41, DAY_DATA), url: '/(tabs)' },
  { name: '47-sos-triage', storage: protocolStorage(41, DAY_DATA, PHASE_SEEN), url: '/(tabs)', clicks: ['Steady me'], delay: 1200 },
  { name: '48-session', storage: protocolStorage(41, DAY_DATA), url: '/session', delay: 3000 },
  { name: '49-cbst-restructurer', storage: protocolStorage(41, DAY_DATA), url: '/cbst' },
  { name: '50-progress', storage: protocolStorage(41, DAY_DATA), url: '/progress' },
  { name: '51-profile', storage: protocolStorage(41, DAY_DATA), url: '/profile' },
  { name: '52-vitality', storage: protocolStorage(41, DAY_DATA), url: '/vitality' },
  { name: '53-sandbox', storage: protocolStorage(41, DAY_DATA), url: '/sandbox' },
  { name: '54-technique', storage: protocolStorage(41, DAY_DATA), url: '/technique' },
  { name: '55-mastery-locked', storage: protocolStorage(41, DAY_DATA), url: '/mastery' },
  { name: '56-autonomic-sync', storage: protocolStorage(41, DAY_DATA), url: '/autonomic-sync' },
  { name: '57-copilot', storage: protocolStorage(41, DAY_DATA), url: '/copilot' },
  { name: '58-success-vault', storage: protocolStorage(41, DAY_DATA), url: '/success-vault' },
  { name: '59-oath', storage: protocolStorage(41, DAY_DATA), url: '/oath' },
  // ── Day 75+ states ──
  { name: '60-graduation', storage: protocolStorage(76, ALL75), url: '/(tabs)', delay: 2500 },
  { name: '61-post-program', storage: protocolStorage(76, ALL75, { '@graduation_choice': 'export' }), url: '/(tabs)', delay: 2500 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--hide-scrollbars', '--force-device-scale-factor=2'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  // Land on origin once so localStorage is writable.
  await page.goto(BASE + '/onboarding', { waitUntil: 'networkidle2', timeout: 120000 });

  const only = process.argv[2] ? process.argv[2].split(',') : null;
  const results = [];
  for (const shot of SHOTS) {
    if (only && !only.some((o) => shot.name.startsWith(o))) continue;
    try {
      // Seed storage (full reset each time), then fresh-load the target.
      await page.evaluate((storage) => {
        localStorage.clear();
        localStorage.setItem('@onboarding_variant', JSON.stringify('B'));
        for (const [k, v] of Object.entries(storage)) {
          localStorage.setItem(k, JSON.stringify(v));
        }
      }, shot.storage || {});
      await page.goto(BASE + shot.url, { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise((r) => setTimeout(r, shot.delay ?? 1800));
      // Kill the dev error overlay/toast if present.
      await page.evaluate(() => {
        document.querySelector('#error-overlay')?.remove();
        document.querySelector('#error-toast')?.remove();
      });
      for (const label of shot.clicks || []) {
        await page.evaluate((l) => {
          const el =
            document.querySelector(`[aria-label="${l}"]`) ||
            [...document.querySelectorAll('[role="button"],button,div')].find(
              (e) => e.textContent?.trim() === l,
            );
          el?.click();
        }, label);
        await new Promise((r) => setTimeout(r, 900));
      }
      if (shot.scrollInner) {
        await page.evaluate(() => {
          const scrollers = [...document.querySelectorAll('div')].filter(
            (d) => d.scrollHeight > d.clientHeight + 40,
          );
          scrollers.forEach((s) => (s.scrollTop = s.scrollHeight));
        });
        await new Promise((r) => setTimeout(r, 600));
      }
      await page.evaluate(() => {
        document.querySelector('#error-overlay')?.remove();
        document.querySelector('#error-toast')?.remove();
      });
      await page.screenshot({ path: path.join(OUT, `${shot.name}.png`) });
      results.push(`ok   ${shot.name}`);
    } catch (e) {
      results.push(`FAIL ${shot.name}: ${e.message.slice(0, 90)}`);
    }
  }
  await browser.close();
  console.log(results.join('\n'));
})();
