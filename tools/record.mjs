import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = '/home/claude/shots/video';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PW_EXE, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: OUT, size: { width: 1440, height: 900 } }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

const smoothScroll = async (to, ms) => {
  const from = await page.evaluate(() => window.scrollY);
  const steps = Math.max(1, Math.round(ms / 33));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps; const e = t < .5 ? 2*t*t : -1+(4-2*t)*t;
    await page.evaluate(y => window.scrollTo(0, y), from + (to - from) * e);
    await page.waitForTimeout(33);
  }
};
const settle = (ms) => page.waitForTimeout(ms);

await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
await settle(2500);
await page.mouse.move(400, 300); await settle(300);
for (let i = 0; i < 40; i++) { await page.mouse.move(400 + i * 15, 300 + Math.sin(i / 6) * 60); await settle(40); }
const h = await page.evaluate(() => document.body.scrollHeight);
await smoothScroll(h * 0.28, 5000); await settle(800);
await smoothScroll(h * 0.55, 4500); await settle(800);
await smoothScroll(h * 0.85, 4500); await settle(800);
await smoothScroll(h, 2500); await settle(1200);

await page.goto('http://localhost:8080/compound/bpc-157', { waitUntil: 'networkidle' });
await settle(2500);
await page.mouse.move(1000, 450); await page.mouse.down();
for (let i = 0; i < 50; i++) { await page.mouse.move(1000 + i * 6, 450 + Math.sin(i/8)*30); await settle(40); }
await page.mouse.up(); await settle(600);
const h2 = await page.evaluate(() => document.body.scrollHeight);
await smoothScroll(h2 * 0.35, 4500); await settle(800);
await smoothScroll(h2 * 0.7, 4500); await settle(800);

await page.goto('http://localhost:8080/claim/CLAIM-BPC157-TENDON-REPAIR', { waitUntil: 'networkidle' });
await settle(2000);
const h3 = await page.evaluate(() => document.body.scrollHeight);
await smoothScroll(h3 * 0.4, 5000); await settle(800);
await smoothScroll(h3 * 0.75, 4000); await settle(1200);

await ctx.close(); await browser.close();
console.log(fs.readdirSync(OUT));
