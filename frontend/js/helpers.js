/**
 * DoubtConnect - Helpers Directory Controller
 */

let selectedHelperId = null;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('helpers-grid');
  if (container) {
    initHelpersDirectory();
  }
});

let helpersDebounceTimer = null;

function initHelpersDirectory() {
  loadHelpers();

  const searchInput = document.getElementById('search-helpers');
  const subjectFilter = document.getElementById('filter-helper-subject');
  const availFilter = document.getElementById('filter-helper-avail');

  const triggerSearch = () => {
    clearTimeout(helpersDebounceTimer);
    helpersDebounceTimer = setTimeout(loadHelpers, 300);
  };

  searchInput?.addEventListener('input', triggerSearch);
  subjectFilter?.addEventListener('change', loadHelpers);
  availFilter?.addEventListener('change', loadHelpers);

  // Check if directed with a doubtId query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const paramSubject = urlParams.get('subject');
  if (paramSubject && subjectFilter) {
    subjectFilter.value = paramSubject;
    loadHelpers();
  }
}

async function loadHelpers() {
  const container = document.getElementById('helpers-grid');
  const countSpan = document.getElementById('helpers-count');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
      <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
      <p style="margin-top: 0.5rem; color: var(--text-muted);">Finding peer mentors...</p>
    </div>
  `;

  const q = document.getElementById('search-helpers')?.value.trim() || '';
  const subject = document.getElementById('filter-helper-subject')?.value || '';
  const availability = document.getElementById('filter-helper-avail')?.value || '';

  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (subject && subject !== 'All') params.append('subject', subject);
  if (availability && availability !== 'All') params.append('availability', availability);

  try {
    const res = await API.get(`/helpers?${params.toString()}`);
    const helpers = res.helpers || [];

    if (countSpan) countSpan.textContent = `Found ${helpers.length} peer helpers`;

    if (helpers.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-user-slash"></i></div>
          <div class="empty-state-title">No Peer Helpers Found</div>
          <p class="empty-state-text">No peer helpers currently match your selected filters. Try choosing "All Subjects" or "All Availability".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = helpers
      .map(
        (helper) => `
      <div class="helper-card">
        <div class="helper-avatar-row">
          <div class="helper-avatar">${helper.name.charAt(0)}</div>
          <div class="helper-details">
            <div class="helper-name">${helper.name}</div>
            <div class="helper-meta">
              ${helper.course || 'B.Tech CSE'} &bull; Year ${helper.year || '3'}
            </div>
            <div style="margin-top: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
              <span class="status-dot status-${helper.availability.toLowerCase()}"></span>
              <span style="font-size: 0.775rem; font-weight: 600; color: var(--text-muted);">${helper.availability}</span>
              <span class="helper-rating-badge">
                <i class="fas fa-star text-warning"></i> ${helper.ratingAverage || '5.0'} (${helper.ratingCount || 0})
              </span>
            </div>
          </div>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem; flex: 1;">
          ${helper.bio || 'Available to assist fellow students with academic concepts and project queries.'}
        </p>

        <div style="font-size: 0.775rem; font-weight: 700; color: var(--text-subtle); margin-bottom: 0.25rem;">
          CAN EXPLAIN:
        </div>
        <div class="subject-pills">
          ${(helper.subjects || ['Design Thinking'])
            .map((s) => `<span class="subject-pill">${s}</span>`)
            .join('')}
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: auto;">
          <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="openRequestModal('${helper._id}', '${helper.name}')">
            <i class="fas fa-paper-plane"></i> Request Help
          </button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    container.innerHTML = `<div style="grid-column: 1 / -1;" class="empty-state"><p class="text-danger">Failed to load helpers: ${err.message}</p></div>`;
  }
}

// Request Help Modal Logic
window.openRequestModal = async (helperId, helperName) => {
  if (!Auth.requireAuth()) return;

  const currentUser = Auth.getUser();
  if (currentUser.role === 'helper' && currentUser._id === helperId) {
    API.showToast('You cannot request help from yourself!', 'error');
    return;
  }

  selectedHelperId = helperId;

  let modal = document.getElementById('request-help-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'request-help-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  // Fetch student's open doubts to populate dropdown
  let doubtsOptions = '<option value="">-- Select one of your doubts --</option>';
  try {
    const doubtsRes = await API.get('/doubts/user/my-doubts');
    const myDoubts = (doubtsRes.postedDoubts || []).filter((d) => d.status === 'Open');

    // Check URL for doubtId
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedId = urlParams.get('doubtId');

    if (myDoubts.length === 0) {
      doubtsOptions = '<option value="">No open doubts available. Please post a doubt first!</option>';
    } else {
      doubtsOptions = myDoubts
        .map(
          (d) =>
            `<option value="${d._id}" ${d._id === preselectedId ? 'selected' : ''}>[${d.courseCode}] ${d.title}</option>`
        )
        .join('');
    }
  } catch (e) {
    doubtsOptions = '<option value="">Error loading your doubts</option>';
  }

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Request Assistance from ${helperName}</h3>
        <button class="modal-close" onclick="closeRequestModal()">&times;</button>
      </div>
      <form id="send-request-form">
        <div class="form-group">
          <label class="form-label">Which doubt do you need help with?</label>
          <select id="request-doubt-select" class="form-select" required>
            ${doubtsOptions}
          </select>
          <div class="form-help">Only unresolved/open doubts are displayed.</div>
        </div>
        <div class="form-group">
          <label class="form-label">Message / Note to Helper</label>
          <textarea id="request-note" class="form-textarea" placeholder="Describe where you are stuck or ask if they are free to explain..."></textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
          <button type="button" class="btn btn-outline" onclick="closeRequestModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-paper-plane"></i> Send Help Request
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('active');

  const form = document.getElementById('send-request-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const doubtId = document.getElementById('request-doubt-select').value;
    const message = document.getElementById('request-note').value.trim();

    if (!doubtId) {
      API.showToast('Please select a doubt to request help for.', 'error');
      return;
    }

    try {
      await API.post('/requests', {
        doubtId,
        helperId: selectedHelperId,
        message: message || 'Hi, could you please guide me on this doubt?',
      });

      API.showToast('Help request sent successfully!', 'success');
      closeRequestModal();
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  });
};

window.closeRequestModal = () => {
  const modal = document.getElementById('request-help-modal');
  if (modal) modal.classList.remove('active');
};
