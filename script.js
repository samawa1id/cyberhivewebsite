/* ============================================================
   Mobile nav toggle
   ============================================================ */
const navToggle = document.getElementById('navToggle');
navToggle.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => document.body.classList.remove('nav-open'));
});

/* ============================================================
   Active nav link + reveal-on-scroll
   ============================================================ */
const sections = document.querySelectorAll('main .section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => navObserver.observe(s));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ============================================================
   Terminal scan animation
   ============================================================ */
const terminalBody = document.getElementById('terminalBody');

const scanLines = [
  { html: '<span class="prompt">$</span> cyberhive scan --target acme-startup.com', delay: 0 },
  { html: '<span class="path">→ crawling site structure...</span>', delay: 500 },
  { html: '<span class="ok">✓ 92 assets discovered</span>', delay: 900 },
  { html: '<span class="path">→ testing for known CVEs...</span>', delay: 500 },
  { html: '<span class="crit">✗ CRITICAL — exposed .env file on /config</span>', delay: 700 },
  { html: '<span class="high">✗ HIGH — outdated auth library (CVE-2024-31xx)</span>', delay: 700 },
  { html: '<span class="med">✗ MEDIUM — missing rate limiting on /api/login</span>', delay: 700 },
  { html: '<span class="ok">✓ TLS configuration passed</span>', delay: 600 },
  { html: '<span class="path">→ generating report...</span>', delay: 700 },
  { html: '<span class="ok">✓ scan complete — 3 findings ready for review</span>', delay: 700 },
];

let scanTimeouts = [];

function runScanAnimation() {
  terminalBody.innerHTML = '';
  scanTimeouts.forEach(t => clearTimeout(t));
  scanTimeouts = [];

  let cumulative = 0;
  scanLines.forEach((line, i) => {
    cumulative += line.delay;
    const t = setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'ln';
      div.style.animationDelay = '0s';
      div.innerHTML = line.html;
      terminalBody.appendChild(div);

      if (i === scanLines.length - 1) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        div.appendChild(document.createTextNode(' '));
        div.appendChild(cursor);
        const restart = setTimeout(runScanAnimation, 4000);
        scanTimeouts.push(restart);
      }
    }, cumulative);
    scanTimeouts.push(t);
  });
}

// start once the hero terminal is in view
const terminalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      runScanAnimation();
      terminalObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
terminalObserver.observe(document.querySelector('.terminal'));

/* ============================================================
   Contact form — sends an email automatically via FormSubmit
   No backend required. Replace RECIPIENT_EMAIL below with the
   real inbox that should receive submissions. The very first
   submission to a new address requires a one-time confirmation
   click sent by FormSubmit to that inbox — after that, every
   submission is emailed automatically.
   ============================================================ */
const RECIPIENT_EMAIL = 'hello@cyberhive.dev'; // ← replace with your real email

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // honeypot check — if filled, silently drop (likely a bot)
  if (contactForm._honey.value) return;

  const formData = new FormData(contactForm);
  formData.append('_subject', `New CyberHive inquiry from ${formData.get('company')}`);
  formData.append('_template', 'table');
  formData.append('_captcha', 'false');

  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-label').textContent = 'Sending…';
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });

    if (!response.ok) throw new Error('Request failed');

    formStatus.textContent = "Thanks — your message is on its way. We'll reply within one business day.";
    formStatus.classList.add('success');
    contactForm.reset();
  } catch (err) {
    formStatus.textContent = "Something went wrong sending that. Please email us directly at " + RECIPIENT_EMAIL + ".";
    formStatus.classList.add('error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-label').textContent = 'Send message';
  }
});
