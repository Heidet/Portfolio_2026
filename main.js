/* ============================
   CANVAS — PARTICLES
   ============================ */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [], mouse = { x: -9999, y: -9999 };

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

const GOLD = 'rgba(201,168,76,';
const N = Math.min(80, Math.floor(window.innerWidth / 18));

for (let i = 0; i < N; i++) {
  particles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.5 + 0.4,
    a: Math.random() * 0.5 + 0.1,
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  for (let p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

    // mouse repulsion
    const dx = p.x - mouse.x, dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      p.x += dx / dist * 1.2;
      p.y += dy / dist * 1.2;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = GOLD + p.a + ')';
    ctx.fill();
  }

  // draw lines between nearby particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = GOLD + (0.08 * (1 - d/120)) + ')';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ============================
   LOADER
   ============================ */
const loader = document.getElementById('loader');
const fill   = document.querySelector('.loader-fill');
let prog = 0;
const iv = setInterval(() => {
  prog += Math.random() * 18 + 4;
  if (prog >= 100) { prog = 100; clearInterval(iv); }
  fill.style.width = prog + '%';
  if (prog === 100) setTimeout(() => loader.classList.add('hidden'), 400);
}, 80);

/* ============================
   NAV — SCROLL + ACTIVE
   ============================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
}, { passive: true });

function updateActiveLink() {
  const links = document.querySelectorAll('.nav-link');
  const sections = [...document.querySelectorAll('section[id], #hero')];
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  links.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}

/* ============================
   TERMINAL TYPEWRITER
   ============================ */
const termEl = document.getElementById('terminal-body');
const lines = [
  { type: 'prompt', text: '$ whoami' },
  { type: 'output', text: 'antoine.heidet' },
  { type: 'prompt', text: '$ cat stack.txt' },
  { type: 'output', text: 'React · ExtJS · Python · Django · Docker' },
  { type: 'prompt', text: '$ nmap --interests' },
  { type: 'output', text: 'Pentest · Infra · Dev · Réseau · CTF' },
  { type: 'prompt', text: '$ uptime' },
  { type: 'output', text: '6 years dev | 9 years infosec' },
  { type: 'prompt', text: '$ █', cursor: true },
];

function typeLines(lines, el, delay = 800) {
  let li = 0;
  function nextLine() {
    if (li >= lines.length) return;
    const line = lines[li++];
    const div = document.createElement('div');
    div.className = line.type;
    if (line.cursor) {
      div.innerHTML = line.text.replace('█', '<span class="cursor"></span>');
      el.appendChild(div); el.scrollTop = el.scrollHeight;
      return;
    }
    el.appendChild(div); el.scrollTop = el.scrollHeight;
    let ci = 0;
    const iv = setInterval(() => {
      div.textContent = line.text.slice(0, ++ci);
      el.scrollTop = el.scrollHeight;
      if (ci >= line.text.length) { clearInterval(iv); setTimeout(nextLine, line.type === 'prompt' ? 120 : 260); }
    }, 28);
  }
  setTimeout(nextLine, delay);
}
typeLines(lines, termEl);

/* ============================
   COUNTER ANIMATION
   ============================ */
function animateCounter(el, target, duration = 1400) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + '+';
  };
  requestAnimationFrame(step);
}

/* ============================
   SCROLL REVEAL (IntersectionObserver)
   ============================ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('visible');

    // counter
    if (el.classList.contains('stat-card')) {
      const numEl = el.querySelector('.stat-num');
      const target = parseInt(numEl.dataset.count);
      const delay  = parseInt(el.dataset.delay || 0);
      setTimeout(() => animateCounter(numEl, target), delay);
    }

    // skill bars
    el.querySelectorAll && el.querySelectorAll('.sk-card').forEach(c => c.classList.add('in-view'));
    if (el.classList.contains('sk-card')) el.classList.add('in-view');

    // timeline items
    if (el.classList.contains('tl-item')) el.classList.add('visible');

    io.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: '-40px 0px' });

document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up, .stat-card, .tl-item, .sk-card').forEach(el => io.observe(el));

/* ============================
   SKILLS TABS
   ============================ */
document.querySelectorAll('.stab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.skills-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + btn.dataset.tab);
    panel.classList.add('active');
    // animate skill bars in the new panel
    panel.querySelectorAll('.sk-card').forEach(c => {
      c.classList.remove('in-view');
      void c.offsetWidth; // reflow
      setTimeout(() => c.classList.add('in-view'), 50);
    });
  });
});

/* ============================
   GITHUB API
   ============================ */
const LANG_COLORS = {
  JavaScript:'#F7DF1E', Python:'#3776AB', HTML:'#E34F26', CSS:'#264DE4',
  Shell:'#89E051', TypeScript:'#3178C6', Vue:'#42b883', PHP:'#777BB4',
  Java:'#ED8B00', Go:'#00ADD8', Rust:'#DEA584', Dockerfile:'#2496ED',
  Batchfile:'#C1F12E', PowerShell:'#5391FE', Ruby:'#CC342D', Kotlin:'#7F52FF',
};

async function loadGitHub() {
  const grid = document.getElementById('github-grid');
  try {
    const res = await fetch('https://api.github.com/users/Heidet/repos?sort=updated&per_page=30&type=public');
    if (!res.ok) throw new Error();
    const repos = (await res.json()).filter(r => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at));

    if (!repos.length) { grid.innerHTML = '<div class="gh-loading">Aucun repo public.</div>'; return; }

    grid.innerHTML = repos.map((repo, i) => {
      const lang  = repo.language || '';
      const color = LANG_COLORS[lang] || '#c9a84c';
      const date  = new Date(repo.updated_at).toLocaleDateString('fr-FR', { year:'numeric', month:'short' });
      const desc  = repo.description || 'Pas de description.';
      return `
        <a class="gh-card" href="${repo.html_url}" target="_blank" rel="noopener" style="--delay:${i * 40}ms">
          <div class="gh-top">
            <span class="gh-name">${repo.name}</span>
            <span class="gh-arrow">↗</span>
          </div>
          <p class="gh-desc">${desc}</p>
          <div class="gh-foot">
            ${lang ? `<span class="gh-lang"><span class="gh-lang-dot" style="background:${color}"></span>${lang}</span>` : ''}
            ${repo.stargazers_count > 0 ? `<span class="gh-stars">★ ${repo.stargazers_count}</span>` : ''}
            <span class="gh-date">${date}</span>
          </div>
        </a>`;
    }).join('');

    // observe new cards
    grid.querySelectorAll('.gh-card').forEach(c => io.observe(c));

  } catch(e) {
    grid.innerHTML = `<div class="gh-loading">Impossible de charger les repos. <a href="https://github.com/Heidet" target="_blank" style="color:var(--gold);margin-left:8px">Voir sur GitHub →</a></div>`;
  }
}
loadGitHub();

/* ============================
   SMOOTH ANCHOR SCROLL
   ============================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
