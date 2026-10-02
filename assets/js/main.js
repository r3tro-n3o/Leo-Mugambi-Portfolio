/* ============================================================
   r3tro_n3o — shared behaviour (all 7 pages)
   Every init is guarded so pages only run what they contain.
   ============================================================ */

/* ── custom cursor ─────────────────────────────────────── */
(function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function anim() {
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(anim);
  })();

  const hot = () => document.body.classList.add('cursor-hot');
  const cool = () => document.body.classList.remove('cursor-hot');
  const bind = () => document.querySelectorAll('a,button,input,textarea,[data-hover]').forEach(el => {
    el.addEventListener('mouseenter', hot);
    el.addEventListener('mouseleave', cool);
  });
  bind();
  window.__rebindCursor = bind;
})();

/* ── animated background: soft drifting particles ──────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const COLORS_DARK = ['255,180,84', '90,214,200', '157,140,255'];
  const COLORS_LIGHT = ['216,120,20', '12,122,112', '89,64,201'];
  const particles = [];
  const isLight = () =>
    document.documentElement.getAttribute('data-theme') === 'light';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = window.innerWidth < 768 ? 26 : 46;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.35 + 0.08,
      ci: Math.floor(Math.random() * 3)
    });
  }

  function draw() {
    const light = isLight();
    const palette = light ? COLORS_LIGHT : COLORS_DARK;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + palette[p.ci] + ',' + p.a + ')';
      ctx.fill();
    });
    // faint links between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = light
          ? 'rgba(22,24,29,' + (0.05 * (1 - dist / 130)) + ')'
          : 'rgba(255,255,255,' + (0.035 * (1 - dist / 130)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
})();

/* ── nav: scrolled state + mobile menu ─────────────────── */
(function initNav() {
  const shell = document.getElementById('navbar');
  if (shell) {
    const onScroll = () => shell.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}

/* ── theme toggle: dark ⇄ light, persisted ─────────────── */
(function initTheme() {
  const buttons = document.querySelectorAll('.theme-toggle');
  const current = () =>
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    buttons.forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
      );
    });
  }

  apply(current());

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const next = current() === 'light' ? 'dark' : 'light';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    });
  });
})();

/* ── scroll reveal ─────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .timeline-item');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
})();

/* ── skill bars ────────────────────────────────────────── */
(function initSkillBars() {
  const cats = document.querySelectorAll('.skill-category');
  if (!cats.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.style.width = (bar.dataset.width || 0) + '%';
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  cats.forEach(c => obs.observe(c));
})();

/* ── stat counters ─────────────────────────────────────── */
(function initCounters() {
  const cards = document.querySelectorAll('.stat-cards');
  if (!cards.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.stat-num[data-target]').forEach(el => {
        const target = el.dataset.target;
        const suffix = el.dataset.suffix || '';
        if (target === 'inf') return;
        const end = parseInt(target, 10);
        if (isNaN(end)) return;
        const duration = 1400, step = 30;
        const inc = end / (duration / step);
        let cur = 0;
        el.textContent = '0' + suffix;
        const timer = setInterval(() => {
          cur += inc;
          if (cur >= end) { cur = end; clearInterval(timer); }
          el.textContent = Math.floor(cur) + suffix;
        }, step);
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  cards.forEach(c => obs.observe(c));
})();

/* ── hero typewriter (home) ────────────────────────────── */
(function initTypewriter() {
  const typedEl = document.getElementById('typed-text');
  const outputEl = document.getElementById('terminal-output');
  if (!typedEl || !outputEl) return;

  const sequences = [
    { cmd: 'whoami', out: '<span class="success">r3tro_n3o — Leo Mugambi</span>' },
    { cmd: 'cat mission.txt', out: '<span class="output">build. break. learn. repeat.</span>' },
    { cmd: 'nmap -sV target.local', out: '<span class="success">22/tcp open ssh · 80/tcp open http · 443/tcp open https</span>' },
    { cmd: 'status --current', out: '<span class="success">OPERATIONAL — CPTS prep active</span>' }
  ];
  let seqIdx = 0, charIdx = 0, phase = 'type';

  function loop() {
    const seq = sequences[seqIdx];
    if (phase === 'type') {
      if (charIdx <= seq.cmd.length) {
        typedEl.textContent = seq.cmd.slice(0, charIdx);
        charIdx++;
        setTimeout(loop, charIdx === seq.cmd.length ? 600 : 65);
      } else {
        outputEl.innerHTML = '<div class="terminal-line">' + seq.out + '</div>';
        phase = 'pause';
        setTimeout(loop, 2300);
      }
    } else {
      outputEl.innerHTML = '';
      typedEl.textContent = '';
      charIdx = 0;
      seqIdx = (seqIdx + 1) % sequences.length;
      phase = 'type';
      setTimeout(loop, 400);
    }
  }
  loop();
})();

/* ── role rotator (home) ───────────────────────────────── */
(function initRoles() {
  const items = document.querySelectorAll('.role-item');
  if (items.length < 2) return;
  let idx = 0;
  setInterval(() => {
    const cur = items[idx];
    cur.classList.remove('active');
    cur.classList.add('exit');
    setTimeout(() => cur.classList.remove('exit'), 500);
    idx = (idx + 1) % items.length;
    const next = items[idx];
    next.style.transform = 'translateY(100%)';
    next.style.opacity = '0';
    next.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      next.style.transform = '';
      next.style.opacity = '';
    }));
  }, 2400);
})();

/* ── live UTC clock (ops panel) ────────────────────────── */
(function initClock() {
  const el = document.getElementById('ops-time');
  if (!el) return;
  const tick = () => { el.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'; };
  tick();
  setInterval(tick, 1000);
})();

/* ── capability accordion ──────────────────────────────── */
function toggleCap(module) {
  if (!module) return;
  const body = module.querySelector('.cap-body');
  if (!body) return;
  const isOpen = module.classList.contains('cap-active');
  document.querySelectorAll('.cap-module.cap-active').forEach(m => {
    m.classList.remove('cap-active');
    const b = m.querySelector('.cap-body');
    if (b) b.classList.remove('cap-open');
  });
  if (!isOpen) {
    module.classList.add('cap-active');
    body.classList.add('cap-open');
  }
}

/* ── project filters (projects page) ───────────────────── */
(function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      document.querySelectorAll('.cat-block').forEach(block => {
        const show = cat === 'all' || block.dataset.cat === cat;
        block.hidden = !show;
        if (show) {
          block.querySelectorAll('.reveal').forEach(r => r.classList.add('visible'));
        }
      });
    });
  });
})();

/* ── case study modal ──────────────────────────────────── */
function toggleProof(btn) {
  const card = btn.closest('.cs-card');
  if (!card) return;
  const proof = card.querySelector('.cs-proof');
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.cs-expand-btn.open').forEach(b => b.classList.remove('open'));
  if (isOpen) { closeModal(); return; }
  btn.classList.add('open');

  const get = sel => { const el = card.querySelector(sel); return el ? el.innerHTML : ''; };
  document.getElementById('modal-meta').innerHTML = get('.cs-meta');
  document.getElementById('modal-title').innerHTML = get('.cs-title');
  document.getElementById('modal-desc').innerHTML = get('.cs-desc');
  document.getElementById('modal-tags').innerHTML = get('.cs-tags');
  document.getElementById('modal-proof').innerHTML =
    '<div class="cs-proof-inner">' + (proof ? proof.innerHTML : '') + '</div>';

  const modal = document.getElementById('cs-modal');
  if (modal) {
    modal.classList.add('open');
    modal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('cs-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  document.querySelectorAll('.cs-expand-btn.open').forEach(b => b.classList.remove('open'));
}

document.addEventListener('click', e => {
  const modal = document.getElementById('cs-modal');
  if (modal && e.target === modal) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── contact form (Web3Forms) ──────────────────────────── */
async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('cf-submit');
  const status = document.getElementById('cf-status');
  if (!btn || !status) return;

  const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const name = val('cf-name'), email = val('cf-email'),
        subject = val('cf-subject'), message = val('cf-message');

  if (!name || !email || !message) {
    status.style.display = 'block';
    status.style.color = 'var(--rose-ink)';
    status.textContent = '[!] Please fill in name, email, and message.';
    return;
  }

  btn.textContent = '[ Sending... ]';
  btn.disabled = true;
  status.style.display = 'none';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: '14711d5c-8f68-4ee9-af14-50a80a6c73fa',
        name: name,
        email: email,
        subject: subject || 'Portfolio Contact from ' + name,
        message: message,
        from_name: 'Leo Mugambi Portfolio'
      })
    });
    const result = await response.json();

    if (result.success) {
      btn.textContent = '[ Message Sent ✓ ]';
      status.style.display = 'block';
      status.style.color = 'var(--teal-ink)';
      status.textContent = '[+] Message received. I will get back to you soon.';
      ['cf-name', 'cf-email', 'cf-subject', 'cf-message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 4000);
    } else {
      throw new Error(result.message || 'Submission failed');
    }
  } catch (err) {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    status.style.display = 'block';
    status.style.color = 'var(--rose-ink)';
    status.textContent = '[!] Something went wrong. Email me directly: iamleomiguel@gmail.com';
  }
}

/* ── konami easter egg ─────────────────────────────────── */
(function initKonami() {
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let ki = 0;
  document.addEventListener('keydown', e => {
    if (e.key === konami[ki]) {
      ki++;
      if (ki === konami.length) {
        ki = 0;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9990;background:#07080a;font-family:"JetBrains Mono",monospace;font-size:13px;overflow:hidden;';
        const msg = document.createElement('div');
        msg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:9991;';
        msg.innerHTML = '<div style="color:#ffb454;font-size:2rem;font-weight:800;letter-spacing:0.1em;">ACCESS GRANTED</div><div style="color:#6d727c;font-size:0.8rem;margin-top:0.5rem;">You found it. r3tro_n3o approves.</div>';
        overlay.appendChild(msg);
        document.body.appendChild(overlay);

        const cols = Math.floor(window.innerWidth / 14);
        const drops = Array(cols).fill(1);
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01ABCDEF';
        const mc = document.createElement('canvas');
        mc.width = window.innerWidth;
        mc.height = window.innerHeight;
        mc.style.cssText = 'position:absolute;top:0;left:0;opacity:0.4;';
        overlay.insertBefore(mc, msg);
        const mctx = mc.getContext('2d');
        const rain = setInterval(() => {
          mctx.fillStyle = 'rgba(7,8,10,0.05)';
          mctx.fillRect(0, 0, mc.width, mc.height);
          mctx.fillStyle = '#ffb454';
          mctx.font = '13px "JetBrains Mono", monospace';
          drops.forEach((y, i) => {
            mctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
            if (y * 14 > mc.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
          });
        }, 40);
        setTimeout(() => { clearInterval(rain); overlay.remove(); }, 4000);
      }
    } else {
      ki = 0;
    }
  });
})();

/* ── rebind cursor hover states after dynamic content ──── */
document.addEventListener('DOMContentLoaded', () => {
  if (window.__rebindCursor) window.__rebindCursor();
});
