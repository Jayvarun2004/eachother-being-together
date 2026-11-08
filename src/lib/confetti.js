/**
 * src/lib/confetti.js
 * Lightweight canvas-based confetti animation.
 * Fires on milestone events (score, matched answer, etc.)
 */

const COLORS = ['#c4556a', '#e07a5f', '#6b4fa0', '#f4c86f', '#9b7fcb', '#fff'];
let _particles = [];
let _animId = null;

function rand(min, max) { return Math.random() * (max - min) + min; }

function createParticle(x, y) {
  return {
    x, y,
    vx: rand(-4, 4),
    vy: rand(-8, -3),
    alpha: 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: rand(6, 12),
    rotation: rand(0, 360),
    rotSpeed: rand(-8, 8),
  };
}

function draw() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    _particles = [];
    return;
  }

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  _particles = _particles.filter(p => p.alpha > 0.01);

  for (const p of _particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.3; // gravity
    p.alpha -= 0.015;
    p.rotation += p.rotSpeed;

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
    ctx.restore();
  }

  if (_particles.length > 0) {
    _animId = requestAnimationFrame(draw);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _animId = null;
  }
}

/**
 * Fire a burst of confetti from (x, y) or screen center.
 * @param {number} [count] - number of particles
 * @param {number} [x] - origin x (defaults to center)
 * @param {number} [y] - origin y (defaults to 1/3 screen height)
 */
export function fireConfetti(count = 60, x, y) {
  const cx = x ?? window.innerWidth / 2;
  const cy = y ?? window.innerHeight / 3;
  for (let i = 0; i < count; i++) {
    _particles.push(createParticle(cx, cy));
  }
  if (!_animId) {
    _animId = requestAnimationFrame(draw);
  }
}
