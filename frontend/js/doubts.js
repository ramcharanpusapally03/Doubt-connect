/**
 * DoubtConnect - Doubts Controller (Posting, Browsing, Filtering)
 */

document.addEventListener('DOMContentLoaded', () => {
  // If on post-doubt page
  const postForm = document.getElementById('post-doubt-form');
  if (postForm) {
    initPostDoubt(postForm);
  }

  // If on browse-doubts page
  const doubtsContainer = document.getElementById('browse-doubts-list');
  if (doubtsContainer) {
    initBrowseDoubts();
  }

  // If on my-doubts page
  const myDoubtsContainer = document.getElementById('my-doubts-list');
  if (myDoubtsContainer) {
    initMyDoubts();
  }
});

// ==========================================================================
// 1. Post a Doubt Page Logic
// ==========================================================================
function initPostDoubt(form) {
  if (!Auth.requireAuth()) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('doubt-title').value.trim();
    const subject = document.getElementById('doubt-subject').value;
    const courseCode = document.getElementById('doubt-course').value.trim();
    const topic = document.getElementById('doubt-topic').value.trim();
    const priority = document.getElementById('doubt-priority').value;
    const description = document.getElementById('doubt-description').value.trim();

    if (!title || !subject || !courseCode || !topic || !description) {
      API.showToast('Please fill in all required fields.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

    try {
      const res = await API.post('/doubts', {
        title,
        subject,
        courseCode,
        topic,
        priority,
        description,
      });

      API.showToast('Your doubt has been published!', 'success');
      setTimeout(() => {
        window.location.href = `/chat.html?doubtId=${res.doubt._id}`;
      }, 1200);
    } catch (err) {
      API.showToast(err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Doubt';
    }
  });
}

// ==========================================================================
// 2. Browse Doubts Page Logic
// ==========================================================================
let browseDebounceTimer = null;

async function initBrowseDoubts() {
  loadDoubts();

  const searchInput = document.getElementById('search-doubts');
  const subjectFilter = document.getElementById('filter-subject');
  const statusFilter = document.getElementById('filter-status');
  const priorityFilter = document.getElementById('filter-priority');

  const triggerSearch = () => {
    clearTimeout(browseDebounceTimer);
    browseDebounceTimer = setTimeout(loadDoubts, 300);
  };

  searchInput?.addEventListener('input', triggerSearch);
  subjectFilter?.addEventListener('change', loadDoubts);
  statusFilter?.addEventListener('change', loadDoubts);
  priorityFilter?.addEventListener('change', loadDoubts);
}

async function loadDoubts() {
  const container = document.getElementById('browse-doubts-list');
  const countSpan = document.getElementById('doubts-count');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
      <p style="margin-top: 0.5rem; color: var(--text-muted);">Finding academic doubts...</p>
    </div>
  `;

  const q = document.getElementById('search-doubts')?.value.trim() || '';
  const subject = document.getElementById('filter-subject')?.value || '';
  const status = document.getElementById('filter-status')?.value || '';
  const priority = document.getElementById('filter-priority')?.value || '';

  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (subject && subject !== 'All') params.append('subject', subject);
  if (status && status !== 'All') params.append('status', status);
  if (priority && priority !== 'All') params.append('priority', priority);

  try {
    const res = await API.get(`/doubts?${params.toString()}`);
    const doubts = res.doubts || [];

    if (countSpan) countSpan.textContent = `Showing ${doubts.length} doubts`;

    if (doubts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-search"></i></div>
          <div class="empty-state-title">No Doubts Found</div>
          <p class="empty-state-text">No doubts match your current filters. Try adjusting your search query or subject filter.</p>
        </div>
      `;
      return;
    }

    const currentUser = Auth.getUser();

    container.innerHTML = doubts
      .map(
        (doubt) => `
      <div class="doubt-card">
        <div class="doubt-header">
          <div>
            <span class="doubt-tag" style="margin-bottom: 0.4rem; display: inline-block;">
              <strong>${doubt.courseCode}</strong> &bull; ${doubt.subject}
            </span>
            <div class="doubt-title">${doubt.title}</div>
          </div>
          <span class="badge badge-${doubt.status.toLowerCase().replace(' ', '-')}">
            ${doubt.status}
          </span>
        </div>
        <p class="doubt-description">${doubt.description}</p>
        <div class="doubt-meta">
          <span><i class="fas fa-bookmark text-primary"></i> Topic: <strong>${doubt.topic}</strong></span>
          <span class="badge badge-${doubt.priority.toLowerCase()}">${doubt.priority}</span>
          <span><i class="fas fa-user"></i> Posted by: ${doubt.postedBy?.name || 'Anonymous Student'}</span>
          <span><i class="far fa-clock"></i> ${new Date(doubt.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="doubt-actions">
          <a href="/chat.html?doubtId=${doubt._id}" class="btn btn-primary btn-sm">
            <i class="fas fa-comments"></i> Join Discussion
          </a>
          <button class="btn btn-outline btn-sm" onclick='showDoubtDetailsModal(${JSON.stringify(
            doubt
          ).replace(/'/g, "&#39;")})'>
            <i class="fas fa-info-circle"></i> View Details
          </button>
          ${
            currentUser && currentUser.role === 'student' && currentUser._id === doubt.postedBy?._id && doubt.status === 'Open'
              ? `<a href="/helpers.html?doubtId=${doubt._id}&subject=${encodeURIComponent(
                  doubt.subject
                )}" class="btn btn-secondary btn-sm">
                   <i class="fas fa-user-plus"></i> Request Helper
                 </a>`
              : ''
          }
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p class="text-danger">Failed to load doubts: ${err.message}</p></div>`;
  }
}

// Modal for viewing full doubt details
window.showDoubtDetailsModal = (doubt) => {
  let modal = document.getElementById('doubt-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'doubt-details-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">${doubt.title}</h3>
        <button class="modal-close" onclick="closeDoubtModal()">&times;</button>
      </div>
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <span class="badge badge-${doubt.status.toLowerCase().replace(' ', '-')}">${doubt.status}</span>
        <span class="badge badge-${doubt.priority.toLowerCase()}">${doubt.priority} Priority</span>
        <span class="doubt-tag"><i class="fas fa-book"></i> ${doubt.courseCode}</span>
        <span class="doubt-tag">${doubt.subject}</span>
      </div>
      <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.25rem;">
        ${doubt.description}
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
        <div><strong>Topic:</strong> ${doubt.topic}</div>
        <div><strong>Posted by:</strong> ${doubt.postedBy?.name || 'Student'} (${doubt.postedBy?.course || 'CSE'})</div>
        <div><strong>Date:</strong> ${new Date(doubt.createdAt).toLocaleString()}</div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button class="btn btn-outline" onclick="closeDoubtModal()">Close</button>
        <a href="/chat.html?doubtId=${doubt._id}" class="btn btn-primary">
          <i class="fas fa-comments"></i> Enter Chat Room
        </a>
      </div>
    </div>
  `;

  modal.classList.add('active');
};

window.closeDoubtModal = () => {
  const modal = document.getElementById('doubt-details-modal');
  if (modal) modal.classList.remove('active');
};

// ==========================================================================
// 3. My Doubts Page Logic
// ==========================================================================
async function initMyDoubts() {
  if (!Auth.requireAuth()) return;
  const container = document.getElementById('my-doubts-list');
  const user = Auth.getUser();

  try {
    const res = await API.get('/doubts/user/my-doubts');
    const myDoubts = user.role === 'helper' ? (res.assignedDoubts || []) : (res.postedDoubts || []);

    if (myDoubts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>
          <div class="empty-state-title">No Doubts Found</div>
          <p class="empty-state-text">${
            user.role === 'helper'
              ? 'You have not been assigned to any doubts yet. Check incoming requests on your dashboard!'
              : 'You have not posted any academic doubts yet.'
          }</p>
          ${
            user.role === 'student'
              ? `<a href="/post-doubt.html" class="btn btn-primary btn-sm">Post a Doubt</a>`
              : `<a href="/browse-doubts.html" class="btn btn-primary btn-sm">Browse Open Doubts</a>`
          }
        </div>
      `;
      return;
    }

    container.innerHTML = myDoubts
      .map(
        (doubt) => `
      <div class="doubt-card">
        <div class="doubt-header">
          <div class="doubt-title">${doubt.title}</div>
          <span class="badge badge-${doubt.status.toLowerCase().replace(' ', '-')}">${doubt.status}</span>
        </div>
        <p class="doubt-description">${doubt.description}</p>
        <div class="doubt-meta">
          <span class="doubt-tag">${doubt.courseCode}</span>
          <span class="doubt-tag">${doubt.subject}</span>
          <span class="badge badge-${doubt.priority.toLowerCase()}">${doubt.priority}</span>
          <span>Assigned Helper: <strong>${doubt.assignedHelper?.name || 'Unassigned'}</strong></span>
        </div>
        <div class="doubt-actions">
          <a href="/chat.html?doubtId=${doubt._id}" class="btn btn-primary btn-sm">
            <i class="fas fa-comments"></i> Chat Room
          </a>
          ${
            user.role === 'student' && doubt.status === 'In-Progress'
              ? `<button class="btn btn-success btn-sm" onclick="openFeedbackModal('${doubt._id}', '${doubt.assignedHelper?._id || ''}')">
                   <i class="fas fa-check-circle"></i> Mark Resolved & Rate
                 </button>`
              : ''
          }
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    API.showToast(err.message, 'error');
  }
}
