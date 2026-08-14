const VERSION = 'neon-rift-v1';

export const GAME = {
  name: 'NEON RIFT',
  version: VERSION,
  modes: ['Solo Offline', 'LAN Multiplayer', 'Online Multiplayer'],
};

export function detectInputMode() {
  const touch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  const coarse = matchMedia?.('(pointer: coarse)')?.matches ?? false;
  const fine = matchMedia?.('(pointer: fine)')?.matches ?? true;
  return touch && coarse && !fine ? 'touch' : (touch ? 'hybrid' : 'desktop');
}

export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }

export class NeonRiftEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.running = false;
    this.last = 0;
    this.player = { x: 0.5, y: 0.72, r: 0.028, vx: 0, vy: 0, hp: 100 };
    this.projectiles = [];
    this.enemies = [];
    this.particles = [];
    this.score = 0;
    this.elapsed = 0;
    this.control = { x: 0, y: 0, fire: false };
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = this.canvas.getBoundingClientRect();
    this.w = Math.max(320, Math.floor(r.width || innerWidth));
    this.h = Math.max(480, Math.floor(r.height || innerHeight));
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  start() {
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(t => this.frame(t));
  }

  stop() { this.running = false; }

  frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.032, Math.max(0.001, (now - this.last) / 1000));
    this.last = now;
    this.elapsed += dt;
    this.update(dt);
    this.draw();
    requestAnimationFrame(t => this.frame(t));
  }

  update(dt) {
    const accel = 2.8;
    this.player.vx = lerp(this.player.vx, this.control.x * accel, 1 - Math.exp(-dt * 10));
    this.player.vy = lerp(this.player.vy, this.control.y * accel, 1 - Math.exp(-dt * 10));
    this.player.x = clamp(this.player.x + this.player.vx * dt, 0.06, 0.94);
    this.player.y = clamp(this.player.y + this.player.vy * dt, 0.10, 0.90);

    if (Math.random() < dt * (0.8 + this.elapsed * 0.015)) {
      this.enemies.push({ x: Math.random() * .9 + .05, y: -.05, r: .018 + Math.random() * .015, vy: .11 + Math.random() * .10, phase: Math.random() * 6.28 });
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.y += e.vy * dt;
      e.x += Math.sin(this.elapsed * 2 + e.phase) * dt * .025;
      const dx = e.x - this.player.x;
      const dy = e.y - this.player.y;
      if (dx * dx + dy * dy < (e.r + this.player.r) ** 2) {
        this.enemies.splice(i, 1);
        this.player.hp = Math.max(0, this.player.hp - 20);
        for (let n = 0; n < 10; n++) this.particles.push({ x: this.player.x, y: this.player.y, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, life: .45 });
        continue;
      }
      if (e.y > 1.08) { this.enemies.splice(i, 1); this.score += 10; }
    }

    if (this.control.fire && Math.random() < dt * 12) {
      this.projectiles.push({ x: this.player.x, y: this.player.y - .03, vy: -.62, life: 1.5 });
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const shot = this.projectiles[i];
      shot.y += shot.vy * dt; shot.life -= dt;
      if (shot.life <= 0 || shot.y < -.08) { this.projectiles.splice(i, 1); continue; }
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j]; const dx = e.x - shot.x, dy = e.y - shot.y;
        if (dx * dx + dy * dy < (e.r + .012) ** 2) { this.enemies.splice(j, 1); this.projectiles.splice(i, 1); this.score += 25; break; }
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw() {
    const c = this.ctx, w = this.w, h = this.h;
    c.fillStyle = '#05070d'; c.fillRect(0, 0, w, h);
    const g = c.createRadialGradient(w * .5, h * .45, 0, w * .5, h * .45, Math.max(w, h) * .7);
    g.addColorStop(0, 'rgba(0,229,255,.10)');
    g.addColorStop(.5, 'rgba(139,92,246,.07)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);

    c.globalAlpha = .12; c.strokeStyle = '#00e5ff'; c.lineWidth = 1;
    for (let x = 0; x < w; x += 42) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y < h; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.globalAlpha = 1;

    for (const pt of this.particles) {
      c.globalAlpha = Math.max(0, pt.life * 2);
      c.fillStyle = '#ff2bd6'; c.fillRect(pt.x * w, pt.y * h, 3, 3);
    }
    c.globalAlpha = 1;

    for (const shot of this.projectiles) {
      c.fillStyle = '#00e5ff'; c.fillRect(shot.x * w - 2, shot.y * h - 10, 4, 15);
    }

    for (const e of this.enemies) {
      const x = e.x * w, y = e.y * h, r = e.r * w;
      c.fillStyle = '#ff2b6d';
      c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); c.fill();
    }

    const px = this.player.x * w, py = this.player.y * h, pr = this.player.r * w;
    c.fillStyle = '#00e5ff'; c.beginPath(); c.arc(px, py, pr, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(px - pr * .25, py - pr * .25, pr * .28, 0, Math.PI * 2); c.fill();

    c.fillStyle = 'rgba(255,255,255,.8)'; c.font = '700 12px system-ui';
    c.fillText(`SCORE ${this.score}`, 16, 24);
    c.fillText(`HP ${this.player.hp}`, 16, 42);
  }
}
