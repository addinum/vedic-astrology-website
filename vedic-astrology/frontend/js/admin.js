// ---------- Auth guard ----------
const token = localStorage.getItem('adminToken');
if (!token) window.location.href = 'login.html';
document.getElementById('adminNameLabel').textContent = `Welcome, ${localStorage.getItem('adminName') || 'Admin'}`;

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminName');
  window.location.href = 'login.html';
});

function esc(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}
function authError(err) {
  if (err.message && /token|auth/i.test(err.message)) {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
  }
}

// ---------- Tab navigation ----------
const panelTitles = {
  overview: 'Overview', services: 'Manage Services', testimonials: 'Manage Testimonials',
  reviews: 'Manage Reviews', articles: 'Manage Articles', gallery: 'Manage Gallery',
  panchang: 'Manage Panchang PDFs', kundali: 'Kundali Requests', contacts: 'Contact Messages'
};
document.querySelectorAll('.admin-nav button[data-panel]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav button[data-panel]').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = btn.dataset.panel;
    document.getElementById(`panel-${panel}`).classList.add('active');
    document.getElementById('panelTitle').textContent = panelTitles[panel];
    loadPanel(panel);
  });
});

function loadPanel(panel) {
  const loaders = {
    overview: loadStats, services: loadServices, testimonials: loadTestimonials,
    reviews: loadReviews, articles: loadArticles, gallery: loadGallery,
    panchang: loadPanchang, kundali: loadKundali, contacts: loadContacts
  };
  loaders[panel] && loaders[panel]();
}

// ---------- Overview stats ----------
async function loadStats() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await res.json();
    const cards = [
      ['Total Services', data.services], ['Total Articles', data.articles],
      ['Testimonials Pending', data.testimonialsPending], ['Reviews Pending', data.reviewsPending],
      ['Gallery Images', data.galleryImages], ['Panchang Files', data.panchangFiles],
      ['New Contact Msgs', data.newContacts], ['New Kundali Requests', data.newKundaliRequests]
    ];
    document.getElementById('statGrid').innerHTML = cards.map(([label, val]) =>
      `<div class="stat-card"><strong>${val}</strong><span>${label}</span></div>`).join('');
  } catch (err) { authError(err); }
}

// ================= SERVICES =================
async function loadServices() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/services/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await res.json();
    document.querySelector('#servicesTable tbody').innerHTML = data.map((s) => `
      <tr>
        <td>${esc(s.title)}</td>
        <td>${esc(s.category)}</td>
        <td><span class="badge ${s.featured ? 'yes' : 'no'}">${s.featured ? 'Yes' : 'No'}</span></td>
        <td><span class="badge ${s.isActive ? 'yes' : 'no'}">${s.isActive ? 'Active' : 'Hidden'}</span></td>
        <td class="row-actions">
          <button class="btn btn-outline btn-sm" onclick='openServiceModal(${JSON.stringify(s).replace(/'/g, "&apos;")})'>Edit</button>
          <button class="btn btn-sm" style="background:#fdecea;color:#c0392b;" onclick="deleteItem('services','${s._id}',loadServices)">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) { authError(err); }
}

function openServiceModal(s = {}) {
  document.getElementById('modalTitle').textContent = s._id ? 'Edit Service' : 'Add Service';
  document.getElementById('modalMsg').style.display = 'none';
  document.getElementById('modalForm').innerHTML = `
    <div class="form-group"><label>Title *</label><input name="title" required value="${esc(s.title || '')}"></div>
    <div class="form-group"><label>Category</label>
      <select name="category">
        ${['kundali','graha-shanti','anushthan-jaap','griha-pravesh','vastu','puja','other'].map((c) =>
          `<option value="${c}" ${s.category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Short Description *</label><textarea name="shortDescription" required>${esc(s.shortDescription || '')}</textarea></div>
    <div class="form-group"><label>Full Description *</label><textarea name="fullDescription" required>${esc(s.fullDescription || '')}</textarea></div>
    <div class="form-group"><label>Highlights (comma separated)</label><input name="highlightsRaw" value="${esc((s.highlights || []).join(', '))}"></div>
    <div class="form-group"><label>Price Label</label><input name="priceLabel" value="${esc(s.priceLabel || 'Contact for pricing')}"></div>
    <div class="form-group"><label><input type="checkbox" name="featured" ${s.featured ? 'checked' : ''}> Featured</label></div>
    <div class="form-group"><label><input type="checkbox" name="isActive" ${s.isActive !== false ? 'checked' : ''}> Active (visible on site)</label></div>
    <button type="submit" class="btn btn-primary btn-block">${s._id ? 'Update' : 'Create'} Service</button>
  `;
  document.getElementById('modalOverlay').classList.add('open');

  document.getElementById('modalForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      title: fd.get('title'), category: fd.get('category'),
      shortDescription: fd.get('shortDescription'), fullDescription: fd.get('fullDescription'),
      highlights: fd.get('highlightsRaw').split(',').map((h) => h.trim()).filter(Boolean),
      priceLabel: fd.get('priceLabel'), featured: fd.has('featured'), isActive: fd.has('isActive')
    };
    try {
      if (s._id) await api.put(`/services/${s._id}`, body, token);
      else await api.postAuth('/services', body, token);
      closeModal(); loadServices();
    } catch (err) {
      const m = document.getElementById('modalMsg'); m.textContent = err.message; m.className = 'form-msg error';
    }
  };
}

// ================= TESTIMONIALS =================
async function loadTestimonials() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/testimonials/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await res.json();
    document.querySelector('#testimonialsTable tbody').innerHTML = data.map((t) => `
      <tr>
        <td>${esc(t.name)}</td><td>${'★'.repeat(t.rating)}</td>
        <td style="max-width:260px;">${esc(t.message).slice(0, 80)}...</td>
        <td><span class="badge ${t.isApproved ? 'yes' : 'no'}">${t.isApproved ? 'Yes' : 'No'}</span></td>
        <td><span class="badge ${t.isFeatured ? 'yes' : 'no'}">${t.isFeatured ? 'Yes' : 'No'}</span></td>
        <td class="row-actions">
          ${!t.isApproved ? `<button class="btn btn-sm" style="background:#e6f7ee;color:#1e7e4c;" onclick="toggleField('testimonials','${t._id}','isApproved',true,loadTestimonials)">Approve</button>` : ''}
          <button class="btn btn-outline btn-sm" onclick="toggleField('testimonials','${t._id}','isFeatured',${!t.isFeatured},loadTestimonials)">${t.isFeatured ? 'Unfeature' : 'Feature'}</button>
          <button class="btn btn-sm" style="background:#fdecea;color:#c0392b;" onclick="deleteItem('testimonials','${t._id}',loadTestimonials)">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) { authError(err); }
}

function openTestimonialModal() {
  document.getElementById('modalTitle').textContent = 'Add Testimonial';
  document.getElementById('modalMsg').style.display = 'none';
  document.getElementById('modalForm').innerHTML = `
    <div class="form-group"><label>Name *</label><input name="name" required></div>
    <div class="form-group"><label>Location</label><input name="location"></div>
    <div class="form-group"><label>Rating (1-5) *</label><input name="rating" type="number" min="1" max="5" value="5" required></div>
    <div class="form-group"><label>Message *</label><textarea name="message" required></textarea></div>
    <div class="form-group"><label>Related Service</label><input name="service"></div>
    <button type="submit" class="btn btn-primary btn-block">Create Testimonial</button>
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modalForm').onsubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    try {
      await api.postAuth('/testimonials/admin', body, token);
      closeModal(); loadTestimonials();
    } catch (err) {
      const m = document.getElementById('modalMsg'); m.textContent = err.message; m.className = 'form-msg error';
    }
  };
}

// ================= REVIEWS =================
async function loadReviews() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/reviews/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await res.json();
    document.querySelector('#reviewsTable tbody').innerHTML = data.map((r) => `
      <tr>
        <td>${esc(r.name)}</td><td>${'★'.repeat(r.rating)}</td>
        <td style="max-width:260px;">${esc(r.message).slice(0, 80)}...</td>
        <td><span class="badge ${r.isApproved ? 'yes' : 'no'}">${r.isApproved ? 'Yes' : 'No'}</span></td>
        <td class="row-actions">
          ${!r.isApproved ? `<button class="btn btn-sm" style="background:#e6f7ee;color:#1e7e4c;" onclick="toggleField('reviews','${r._id}','isApproved',true,loadReviews)">Approve</button>` : ''}
          <button class="btn btn-sm" style="background:#fdecea;color:#c0392b;" onclick="deleteItem('reviews','${r._id}',loadReviews)">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) { authError(err); }
}

// ================= ARTICLES =================
async function loadArticles() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/articles/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await res.json();
    document.querySelector('#articlesTable tbody').innerHTML = data.map((a) => `
      <tr>
        <td>${esc(a.title)}</td><td>${esc(a.category)}</td>
        <td><span class="badge ${a.isPublished ? 'yes' : 'no'}">${a.isPublished ? 'Published' : 'Draft'}</span></td>
        <td>${new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
        <td class="row-actions">
          <button class="btn btn-outline btn-sm" onclick='openArticleModal(${JSON.stringify(a).replace(/'/g, "&apos;")})'>Edit</button>
          <button class="btn btn-sm" style="background:#fdecea;color:#c0392b;" onclick="deleteItem('articles','${a._id}',loadArticles)">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) { authError(err); }
}

function openArticleModal(a = {}) {
  document.getElementById('modalTitle').textContent = a._id ? 'Edit Article' : 'Add Article';
  document.getElementById('modalMsg').style.display = 'none';
  document.getElementById('modalForm').innerHTML = `
    <div class="form-group"><label>Title *</label><input name="title" required value="${esc(a.title || '')}"></div>
    <div class="form-group"><label>Category</label>
      <select name="category">
        ${['kundali','vastu','pujas','festivals','astrology-tips','sanatan-dharma'].map((c) =>
          `<option value="${c}" ${a.category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Excerpt *</label><textarea name="excerpt" required maxlength="300">${esc(a.excerpt || '')}</textarea></div>
    <div class="form-group"><label>Content (HTML allowed) *</label><textarea name="content" required style="min-height:200px;">${esc(a.content || '')}</textarea></div>
    <div class="form-group"><label>Cover Image URL</label><input name="coverImage" value="${esc(a.coverImage || '')}" placeholder="/uploads/gallery/xyz.jpg"></div>
    <div class="form-group"><label>Read Time (minutes)</label><input name="readTimeMinutes" type="number" value="${a.readTimeMinutes || 5}"></div>
    <div class="form-group"><label><input type="checkbox" name="isPublished" ${a.isPublished !== false ? 'checked' : ''}> Published</label></div>
    <button type="submit" class="btn btn-primary btn-block">${a._id ? 'Update' : 'Create'} Article</button>
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modalForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      title: fd.get('title'), category: fd.get('category'), excerpt: fd.get('excerpt'),
      content: fd.get('content'), coverImage: fd.get('coverImage'),
      readTimeMinutes: Number(fd.get('readTimeMinutes')) || 5, isPublished: fd.has('isPublished')
    };
    try {
      if (a._id) await api.put(`/articles/${a._id}`, body, token);
      else await api.postAuth('/articles', body, token);
      closeModal(); loadArticles();
    } catch (err) {
      const m = document.getElementById('modalMsg'); m.textContent = err.message; m.className = 'form-msg error';
    }
  };
}

// ================= GALLERY =================
async function loadGallery() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/gallery/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await res.json();
    document.querySelector('#galleryTable tbody').innerHTML = data.map((g) => `
      <tr>
        <td><img src="${CONFIG.API_BASE}${g.imageUrl}" style="width:60px;height:44px;object-fit:cover;border-radius:6px;"></td>
        <td>${esc(g.title)}</td><td>${esc(g.category)}</td>
        <td><span class="badge ${g.isActive ? 'yes' : 'no'}">${g.isActive ? 'Active' : 'Hidden'}</span></td>
        <td class="row-actions">
          <button class="btn btn-sm" style="background:#fdecea;color:#c0392b;" onclick="deleteItem('gallery','${g._id}',loadGallery)">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) { authError(err); }
}

function openGalleryModal() {
  document.getElementById('modalTitle').textContent = 'Upload Gallery Image';
  document.getElementById('modalMsg').style.display = 'none';
  document.getElementById('modalForm').innerHTML = `
    <div class="form-group"><label>Title *</label><input name="title" required></div>
    <div class="form-group"><label>Category</label>
      <select name="category">
        ${['puja','griha-pravesh','kundali-sample','events','ashram','other'].map((c) => `<option value="${c}">${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Caption</label><input name="caption"></div>
    <div class="form-group"><label>Image File * (jpg/png/webp, max 5MB)</label><input type="file" name="image" accept="image/*" required></div>
    <button type="submit" class="btn btn-primary btn-block">Upload Image</button>
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modalForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.postAuth('/gallery', fd, token);
      closeModal(); loadGallery();
    } catch (err) {
      const m = document.getElementById('modalMsg'); m.textContent = err.message; m.className = 'form-msg error';
    }
  };
}

// ================= PANCHANG =================
async function loadPanchang() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/panchang/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await res.json();
    document.querySelector('#panchangTable tbody').innerHTML = data.map((p) => `
      <tr>
        <td>${esc(p.title)}</td><td>${esc(p.month)} ${p.year}</td>
        <td><a href="${CONFIG.API_BASE}${p.fileUrl}" target="_blank">View PDF</a></td>
        <td class="row-actions">
          <button class="btn btn-sm" style="background:#fdecea;color:#c0392b;" onclick="deleteItem('panchang','${p._id}',loadPanchang)">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) { authError(err); }
}

function openPanchangModal() {
  document.getElementById('modalTitle').textContent = 'Upload Panchang PDF';
  document.getElementById('modalMsg').style.display = 'none';
  document.getElementById('modalForm').innerHTML = `
    <div class="form-group"><label>Title *</label><input name="title" required placeholder="e.g. August 2026 Panchang"></div>
    <div class="form-group"><label>Month *</label><input name="month" required placeholder="August"></div>
    <div class="form-group"><label>Year *</label><input name="year" type="number" required value="${new Date().getFullYear()}"></div>
    <div class="form-group"><label>Description</label><textarea name="description"></textarea></div>
    <div class="form-group"><label>PDF File * (max 15MB)</label><input type="file" name="pdf" accept="application/pdf" required></div>
    <button type="submit" class="btn btn-primary btn-block">Upload PDF</button>
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modalForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.postAuth('/panchang', fd, token);
      closeModal(); loadPanchang();
    } catch (err) {
      const m = document.getElementById('modalMsg'); m.textContent = err.message; m.className = 'form-msg error';
    }
  };
}

// ================= KUNDALI REQUESTS =================
async function loadKundali() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/kundali/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await res.json();
    document.querySelector('#kundaliTable tbody').innerHTML = data.map((k) => `
      <tr>
        <td>${esc(k.fullName)}</td><td><a href="https://wa.me/${k.phone.replace(/\D/g,'')}" target="_blank">${esc(k.phone)}</a></td>
        <td>${esc(k.dateOfBirth)}</td><td>${esc(k.placeOfBirth)}</td><td>${esc(k.serviceRequested)}</td>
        <td><span class="badge status-new">${esc(k.status)}</span></td>
        <td class="row-actions">
          <select onchange="updateStatus('kundali','${k._id}',this.value,loadKundali)" style="padding:5px;border-radius:6px;font-size:12px;">
            ${['new','contacted','in-progress','completed','cancelled'].map((s) => `<option value="${s}" ${k.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <button class="btn btn-sm" style="background:#fdecea;color:#c0392b;" onclick="deleteItem('kundali','${k._id}',loadKundali)">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) { authError(err); }
}

// ================= CONTACTS =================
async function loadContacts() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/api/contact/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await res.json();
    document.querySelector('#contactsTable tbody').innerHTML = data.map((c) => `
      <tr>
        <td>${esc(c.name)}</td><td><a href="https://wa.me/${c.phone.replace(/\D/g,'')}" target="_blank">${esc(c.phone)}</a></td>
        <td>${esc(c.subject || '-')}</td><td style="max-width:220px;">${esc(c.message).slice(0,70)}...</td>
        <td><span class="badge status-new">${esc(c.status)}</span></td>
        <td class="row-actions">
          <select onchange="updateStatus('contact','${c._id}',this.value,loadContacts)" style="padding:5px;border-radius:6px;font-size:12px;">
            ${['new','read','replied'].map((s) => `<option value="${s}" ${c.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <button class="btn btn-sm" style="background:#fdecea;color:#c0392b;" onclick="deleteItem('contact','${c._id}',loadContacts)">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) { authError(err); }
}

// ---------- Shared helpers ----------
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
document.getElementById('modalOverlay').addEventListener('click', (e) => { if (e.target.id === 'modalOverlay') closeModal(); });

async function deleteItem(resource, id, reload) {
  if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;
  try {
    await api.del(`/${resource}/${id}`, token);
    reload();
  } catch (err) { alert(err.message); }
}
async function toggleField(resource, id, field, value, reload) {
  try {
    await api.put(`/${resource}/${id}`, { [field]: value }, token);
    reload();
  } catch (err) { alert(err.message); }
}
async function updateStatus(resource, id, status, reload) {
  try {
    await api.put(`/${resource}/${id}`, { status }, token);
    reload();
  } catch (err) { alert(err.message); }
}

// ---------- Init ----------
loadStats();
