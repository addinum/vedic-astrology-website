// ---------- Utility ----------
function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}
function starString(rating) {
  const r = Math.round(rating || 5);
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}
function showFormMsg(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = `form-msg ${type}`;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---------- Service icons map ----------
const SERVICE_ICONS = {
  kundali: '📜', 'graha-shanti': '🔥', 'anushthan-jaap': '📿',
  'griha-pravesh': '🏠', vastu: '🧭', puja: '🪔', other: '🕉️'
};

// ---------- Home page: featured services ----------
async function loadFeaturedServices() {
  const el = document.getElementById('servicesGrid');
  if (!el) return;
  try {
    const { data } = await api.get('/services');
    const featured = data.filter((s) => s.featured).length ? data.filter((s) => s.featured) : data;
    el.innerHTML = featured.slice(0, 6).map(serviceCardHtml).join('');
  } catch (err) {
    el.innerHTML = `<p style="color:var(--text-muted)">Unable to load services right now.</p>`;
  }
}

function serviceCardHtml(s) {
  return `
    <div class="service-card reveal">
      ${s.featured ? '<span class="service-badge">Popular</span>' : ''}
      <div class="service-icon">${SERVICE_ICONS[s.category] || '🕉️'}</div>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.shortDescription)}</p>
      <a class="service-link" href="services.html#${s.slug}">Learn More &rarr;</a>
    </div>
  `;
}

// ---------- Services page: full grid ----------
async function loadAllServices() {
  const el = document.getElementById('allServicesGrid');
  if (!el) return;
  try {
    const { data } = await api.get('/services');
    el.innerHTML = data.map(fullServiceCardHtml).join('');
    initScrollReveal();
  } catch (err) {
    el.innerHTML = `<p style="color:var(--text-muted)">Unable to load services right now.</p>`;
  }
}

function fullServiceCardHtml(s) {
  const highlights = (s.highlights || []).map((h) => `<li>✔ ${escapeHtml(h)}</li>`).join('');
  return `
    <div class="service-card reveal" id="${s.slug}">
      ${s.featured ? '<span class="service-badge">Popular</span>' : ''}
      <div class="service-icon">${SERVICE_ICONS[s.category] || '🕉️'}</div>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.fullDescription)}</p>
      <ul style="font-size:13.5px;color:var(--text-muted);margin-bottom:16px;line-height:1.9;">${highlights}</ul>
      <a class="btn btn-primary btn-sm" href="${waLink('Namaste Pandit Ji, I am interested in: ' + s.title)}" target="_blank" rel="noopener">Request via WhatsApp</a>
    </div>
  `;
}

// ---------- Testimonials ----------
async function loadTestimonials() {
  const el = document.getElementById('testimonialsTrack');
  if (!el) return;
  try {
    const { data } = await api.get('/testimonials?featured=true');
    const items = data.length ? data : (await api.get('/testimonials')).data;
    el.innerHTML = items.slice(0, 6).map(testimonialCardHtml).join('') ||
      `<p style="color:var(--text-muted)">Reviews coming soon.</p>`;
    initScrollReveal();
  } catch (err) {
    el.innerHTML = '';
  }
}

function testimonialCardHtml(t) {
  return `
    <div class="testimonial-card reveal">
      <div class="stars">${starString(t.rating)}</div>
      <p class="quote">"${escapeHtml(t.message)}"</p>
      <div class="testimonial-author">
        <div class="avatar">${escapeHtml((t.name || '?')[0])}</div>
        <div>
          <strong>${escapeHtml(t.name)}</strong>
          <span>${escapeHtml(t.location || '')}</span>
        </div>
      </div>
    </div>
  `;
}

// ---------- Gallery ----------
async function loadGallery() {
  const el = document.getElementById('galleryGrid');
  if (!el) return;
  try {
    const { data } = await api.get('/gallery');
    window.__galleryData = data;
    renderGallery(data);
  } catch (err) {
    el.innerHTML = `<p style="color:var(--text-muted)">Unable to load gallery right now.</p>`;
  }
}
function renderGallery(items) {
  const el = document.getElementById('galleryGrid');
  el.innerHTML = items.map((g) => `
    <div class="gallery-item reveal">
      <img src="${CONFIG.API_BASE}${g.imageUrl}" alt="${escapeHtml(g.title)}" loading="lazy">
      <div class="cap">${escapeHtml(g.caption || g.title)}</div>
    </div>
  `).join('') || `<p style="color:var(--text-muted)">No images yet. Please check back soon.</p>`;
  initScrollReveal();
}
function initGalleryFilters() {
  const buttons = document.querySelectorAll('.gallery-filters button');
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      const items = window.__galleryData || [];
      renderGallery(cat === 'all' ? items : items.filter((i) => i.category === cat));
    });
  });
}

// ---------- Blog / Articles ----------
async function loadArticles(page = 1) {
  const el = document.getElementById('blogGrid');
  if (!el) return;
  try {
    const params = new URLSearchParams({ page });
    const cat = new URLSearchParams(window.location.search).get('category');
    if (cat) params.set('category', cat);
    const { data, pages, page: currentPage } = await api.get(`/articles?${params.toString()}`);
    el.innerHTML = data.map(articleCardHtml).join('') || `<p style="color:var(--text-muted)">No articles published yet.</p>`;
    renderPagination(pages, currentPage);
    initScrollReveal();
  } catch (err) {
    el.innerHTML = `<p style="color:var(--text-muted)">Unable to load articles right now.</p>`;
  }
}
function articleCardHtml(a) {
  const date = new Date(a.publishedAt || a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `
    <a href="blog-single.html?slug=${a.slug}" class="blog-card reveal">
      <img src="${a.coverImage ? CONFIG.API_BASE + a.coverImage : 'images/blog-placeholder.jpg'}" alt="${escapeHtml(a.title)}" loading="lazy">
      <div class="body">
        <span class="tag">${escapeHtml(a.category)}</span>
        <h3>${escapeHtml(a.title)}</h3>
        <p>${escapeHtml(a.excerpt)}</p>
        <div class="meta"><span>${date}</span><span>${a.readTimeMinutes} min read</span></div>
      </div>
    </a>
  `;
}
function renderPagination(pages, current) {
  const el = document.getElementById('blogPagination');
  if (!el || pages <= 1) return;
  let html = '';
  for (let i = 1; i <= pages; i++) {
    html += `<button class="btn btn-sm ${i === current ? 'btn-primary' : 'btn-outline'}" onclick="loadArticles(${i})">${i}</button>`;
  }
  el.innerHTML = html;
}

async function loadSingleArticle() {
  const el = document.getElementById('articleBody');
  if (!el) return;
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) { el.innerHTML = '<p>Article not found.</p>'; return; }
  try {
    const { data: a } = await api.get(`/articles/${slug}`);
    document.title = `${a.metaTitle || a.title} | ${CONFIG.BUSINESS_NAME}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', a.metaDescription || a.excerpt);
    document.getElementById('articleTitle').textContent = a.title;
    document.getElementById('articleMeta').textContent = `${a.author} • ${new Date(a.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • ${a.readTimeMinutes} min read`;
    if (a.coverImage) document.getElementById('articleCover').src = `${CONFIG.API_BASE}${a.coverImage}`;
    el.innerHTML = a.content;
  } catch (err) {
    el.innerHTML = '<p>This article could not be found.</p>';
  }
}

// ---------- Panchang ----------
async function loadPanchang() {
  const el = document.getElementById('panchangGrid');
  if (!el) return;
  try {
    const { data } = await api.get('/panchang');
    el.innerHTML = data.map((p) => `
      <div class="panchang-card reveal">
        <div class="pdf-icon">📄</div>
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.description || `${p.month} ${p.year}`)}</p>
        <a href="${CONFIG.API_BASE}${p.fileUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Download PDF</a>
      </div>
    `).join('') || `<p style="color:var(--text-muted)">Panchang PDFs coming soon.</p>`;
    initScrollReveal();
  } catch (err) {
    el.innerHTML = '';
  }
}

// ---------- FAQ accordion ----------
function initFaq() {
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

// ---------- Forms ----------
function initKundaliForm() {
  const form = document.getElementById('kundaliForm');
  if (!form) return;
  const msgEl = document.getElementById('kundaliFormMsg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    try {
      const formData = Object.fromEntries(new FormData(form).entries());
      await api.post('/kundali', formData);
      showFormMsg(msgEl, 'Thank you! Your Kundali request has been received. We will reach out on WhatsApp/phone shortly.', 'success');
      form.reset();
    } catch (err) {
      showFormMsg(msgEl, err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Kundali Request';
    }
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const msgEl = document.getElementById('contactFormMsg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    try {
      const formData = Object.fromEntries(new FormData(form).entries());
      await api.post('/contact', formData);
      showFormMsg(msgEl, 'Thank you for reaching out! We will contact you shortly.', 'success');
      form.reset();
    } catch (err) {
      showFormMsg(msgEl, err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

function initReviewForm() {
  const form = document.getElementById('reviewForm');
  if (!form) return;
  const msgEl = document.getElementById('reviewFormMsg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    try {
      const formData = Object.fromEntries(new FormData(form).entries());
      await api.post('/reviews', formData);
      showFormMsg(msgEl, 'Thank you for your review! It will appear after approval.', 'success');
      form.reset();
    } catch (err) {
      showFormMsg(msgEl, err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Review';
    }
  });
}

// ---------- Init on page load ----------
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedServices();
  loadAllServices();
  loadTestimonials();
  loadGallery();
  loadArticles();
  loadSingleArticle();
  loadPanchang();
  initGalleryFilters();
  initFaq();
  initKundaliForm();
  initContactForm();
  initReviewForm();
});
