// Injects shared header, footer, WhatsApp float button, and loader across all pages.
// Each page includes: <div id="site-header"></div> ... <div id="site-footer"></div>

function renderHeader(activePage) {
  const links = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'about.html', label: 'About', key: 'about' },
    { href: 'services.html', label: 'Services', key: 'services' },
    { href: 'gallery.html', label: 'Gallery', key: 'gallery' },
    { href: 'blog.html', label: 'Knowledge Center', key: 'blog' },
    { href: 'contact.html', label: 'Contact', key: 'contact' }
  ];

  const navLinksHtml = links
    .map(
      (l) =>
        `<a href="${l.href}" class="${activePage === l.key ? 'active' : ''}">${l.label}</a>`
    )
    .join('');

  const headerHtml = `
    <div class="topbar">
      <div class="container">
        <div class="topbar-links">
          <a href="tel:${CONFIG.PHONE_NUMBER}">📞 ${CONFIG.PHONE_NUMBER}</a>
          <a href="mailto:${CONFIG.BUSINESS_EMAIL}">✉️ ${CONFIG.BUSINESS_EMAIL}</a>
        </div>
        <div>🕉️ ${CONFIG.ADDRESS}</div>
      </div>
    </div>
    <nav class="navbar">
      <div class="container">
        <a href="index.html" class="brand">
          <div class="brand-mark">🕉</div>
          <div class="brand-text">
            <h1>${CONFIG.BUSINESS_NAME}</h1>
            <span>Authentic Vedic Guidance</span>
          </div>
        </a>
        <div class="nav-links" id="navLinks">${navLinksHtml}</div>
        <div class="nav-actions">
          <a href="${waLink()}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm btn-sm-desktop">WhatsApp Us</a>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">&#9776;</button>
        </div>
      </div>
    </nav>
  `;

  const el = document.getElementById('site-header');
  if (el) el.innerHTML = headerHtml;

  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }
}

function renderFooter() {
  const footerHtml = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <div class="brand-mark">🕉</div>
            <h3>${CONFIG.BUSINESS_NAME}</h3>
          </div>
          <p>Bringing authentic, time-tested Vedic wisdom to your doorstep — handwritten Kundalis, sacred rituals, and Vastu guidance rooted in Sanatan Dharma.</p>
          <div class="footer-social">
            <a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp">📱</a>
            <a href="tel:${CONFIG.PHONE_NUMBER}" aria-label="Call">📞</a>
            <a href="mailto:${CONFIG.BUSINESS_EMAIL}" aria-label="Email">✉️</a>
          </div>
        </div>
        <div>
          <h5>Explore</h5>
          <ul>
            <li><a href="about.html">About Pandit Ji</a></li>
            <li><a href="services.html">Our Services</a></li>
            <li><a href="gallery.html">Gallery</a></li>
            <li><a href="blog.html">Knowledge Center</a></li>
          </ul>
        </div>
        <div>
          <h5>Services</h5>
          <ul>
            <li><a href="services.html#kundali">Vedic Kundali</a></li>
            <li><a href="services.html#graha-shanti">Graha Shanti</a></li>
            <li><a href="services.html#vastu">Vastu Consultation</a></li>
            <li><a href="services.html#puja">Vedic Pujas</a></li>
          </ul>
        </div>
        <div>
          <h5>Get in Touch</h5>
          <ul>
            <li>📍 ${CONFIG.ADDRESS}</li>
            <li>📞 ${CONFIG.PHONE_NUMBER}</li>
            <li>✉️ ${CONFIG.BUSINESS_EMAIL}</li>
          </ul>
          <a href="contact.html" class="btn btn-gold btn-sm" style="margin-top:10px;">Book Consultation</a>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; <span id="year"></span> ${CONFIG.BUSINESS_NAME}. All rights reserved. | Crafted with devotion 🙏
      </div>
    </div>
  `;
  const el = document.getElementById('site-footer');
  if (el) el.innerHTML = footerHtml;
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function renderFloatButtons() {
  const el = document.getElementById('float-buttons');
  if (!el) return;
  el.innerHTML = `
    <a href="${waLink()}" target="_blank" rel="noopener" class="whatsapp-float" aria-label="Chat on WhatsApp">💬</a>
    <a href="tel:${CONFIG.PHONE_NUMBER}" class="call-float" aria-label="Call now">📞</a>
  `;
}

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((i) => observer.observe(i));
}

function hideLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 250);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const activePage = document.body.getAttribute('data-page') || '';
  renderHeader(activePage);
  renderFooter();
  renderFloatButtons();
  initScrollReveal();
  hideLoader();
});
