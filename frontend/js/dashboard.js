/**
 * DoubtConnect - Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  const user = Auth.getUser();
  const welcomeMsg = document.getElementById('welcome-message');
  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome back, ${user.name}! 👋`;
  }

  // Render role-specific dashboard views
  if (user.role === 'helper') {
    renderHelperDashboard();
  } else {
    renderStudentDashboard();
  }
});

// Helper for relative time formatting
function formatTime(dateString) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return 'Just now';
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// ==========================================================================
// Student Dashboard
// ==========================================================================
async function renderStudentDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  try {
    // 1. Fetch user's doubts
    const doubtsRes = await API.get('/doubts/user/my-doubts');
    const myDoubts = doubtsRes.postedDoubts || [];

    const totalPosted = myDoubts.length;
    const pendingDoubts = myDoubts.filter((d) => d.status === 'Open' || d.status === 'In-Progress');
    const resolvedDoubts = myDoubts.filter((d) => d.status === 'Resolved');

    // 2. Fetch available helpers
    const helpersRes = await API.get('/helpers?availability=Available');
    const helpers = (helpersRes.helpers || []).slice(0, 4);

    // 3. Render HTML
    container.innerHTML = `
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">${totalPosted}</div>
            <div class="stat-label">Total Doubts Posted</div>
          </div>
          <div class="stat-icon blue"><i class="fas fa-question"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">${pendingDoubts.length}</div>
            <div class="stat-label">Pending / In Progress</div>
          </div>
          <div class="stat-icon yellow"><i class="fas fa-clock"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">${resolvedDoubts.length}</div>
            <div class="stat-label">Resolved Doubts</div>
          </div>
          <div class="stat-icon green"><i class="fas fa-check-double"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">${helpersRes.count || 0}</div>
            <div class="stat-label">Online Peer Helpers</div>
          </div>
          <div class="stat-icon purple"><i class="fas fa-user-graduate"></i></div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-layout">
        <!-- Left: Recent Doubts -->
        <div>
          <div class="card">
            <div class="card-header">
              <h2 class="card-title"><i class="fas fa-history text-primary"></i> Your Recent Doubts</h2>
              <a href="/post-doubt.html" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Ask New Doubt</a>
            </div>
            <div id="student-doubts-list">
              ${
                myDoubts.length === 0
                  ? `
                  <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-folder-open"></i></div>
                    <div class="empty-state-title">No Doubts Posted Yet</div>
                    <p class="empty-state-text">Got stuck on an assignment, code problem, or design thinking concept? Post your doubt to get quick help.</p>
                    <a href="/post-doubt.html" class="btn btn-primary btn-sm">Post Your First Doubt</a>
                  </div>
                `
                  : myDoubts
                      .slice(0, 5)
                      .map(
                        (doubt) => `
                    <div class="doubt-card">
                      <div class="doubt-header">
                        <div class="doubt-title">${doubt.title}</div>
                        <span class="badge badge-${doubt.status.toLowerCase().replace(' ', '-')}">${doubt.status}</span>
                      </div>
                      <p class="doubt-description">${doubt.description}</p>
                      <div class="doubt-meta">
                        <span class="doubt-tag"><i class="fas fa-book"></i> ${doubt.courseCode}</span>
                        <span class="doubt-tag">${doubt.subject}</span>
                        <span class="badge badge-${doubt.priority.toLowerCase()}">${doubt.priority} Priority</span>
                        <span><i class="far fa-clock"></i> ${formatTime(doubt.createdAt)}</span>
                      </div>
                      <div class="doubt-actions">
                        <a href="/chat.html?doubtId=${doubt._id}" class="btn btn-primary btn-sm">
                          <i class="fas fa-comments"></i> Open Discussion
                        </a>
                        ${
                          doubt.status === 'In-Progress'
                            ? `<button class="btn btn-outline btn-sm resolve-btn" onclick="openResolveModal('${doubt._id}')">
                                <i class="fas fa-check"></i> Mark Resolved
                               </button>`
                            : ''
                        }
                      </div>
                    </div>
                  `
                      )
                      .join('')
              }
            </div>
          </div>
        </div>

        <!-- Right: Available Helpers -->
        <div>
          <div class="card">
            <div class="card-header">
              <h2 class="card-title"><i class="fas fa-star text-warning"></i> Available Peer Helpers</h2>
              <a href="/helpers.html" class="btn btn-outline btn-sm">View All</a>
            </div>
            <div class="helpers-compact-list">
              ${
                helpers.length === 0
                  ? `<p class="text-muted" style="font-size: 0.9rem; padding: 1rem 0;">No peer helpers online right now.</p>`
                  : helpers
                      .map(
                        (h) => `
                    <div class="helper-card" style="padding: 1rem; margin-bottom: 0.85rem;">
                      <div class="helper-avatar-row" style="margin-bottom: 0.5rem;">
                        <div class="helper-avatar" style="width: 40px; height: 40px; font-size: 0.95rem;">
                          ${h.name.charAt(0)}
                        </div>
                        <div class="helper-details">
                          <div class="helper-name">${h.name}</div>
                          <div class="helper-meta">
                            <span class="helper-rating-badge">
                              <i class="fas fa-star text-warning"></i> ${h.ratingAverage || '5.0'} (${h.ratingCount || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="subject-pills" style="margin: 0.4rem 0 0.8rem;">
                        ${(h.subjects || [])
                          .slice(0, 3)
                          .map((s) => `<span class="subject-pill">${s}</span>`)
                          .join('')}
                      </div>
                      <a href="/helpers.html" class="btn btn-secondary btn-sm" style="width: 100%;">
                        Request Help
                      </a>
                    </div>
                  `
                      )
                      .join('')
              }
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    API.showToast('Failed to load dashboard data: ' + err.message, 'error');
  }
}

// ==========================================================================
// Peer Helper Dashboard
// ==========================================================================
async function renderHelperDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  try {
    const user = Auth.getUser();

    // 1. Fetch doubts assigned to this helper
    const doubtsRes = await API.get('/doubts/user/my-doubts');
    const assignedDoubts = doubtsRes.assignedDoubts || [];

    const activeHelped = assignedDoubts.filter((d) => d.status === 'In-Progress');
    const resolvedDoubts = assignedDoubts.filter((d) => d.status === 'Resolved');

    // 2. Fetch incoming help requests
    const requestsRes = await API.get('/requests/my-requests');
    const incomingRequests = (requestsRes.incoming || []).filter((r) => r.requestStatus === 'Pending');

    // 3. Render HTML
    container.innerHTML = `
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">${incomingRequests.length}</div>
            <div class="stat-label">Pending Help Requests</div>
          </div>
          <div class="stat-icon yellow"><i class="fas fa-bell"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">${activeHelped.length}</div>
            <div class="stat-label">Active Helping Sessions</div>
          </div>
          <div class="stat-icon blue"><i class="fas fa-chalkboard-teacher"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">${resolvedDoubts.length}</div>
            <div class="stat-label">Total Doubts Solved</div>
          </div>
          <div class="stat-icon green"><i class="fas fa-trophy"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">${user.ratingAverage || '5.0'} ⭐</div>
            <div class="stat-label">Helper Rating (${user.ratingCount || 0} reviews)</div>
          </div>
          <div class="stat-icon purple"><i class="fas fa-star"></i></div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="dashboard-layout">
        <!-- Left: Incoming Requests and Active Doubts -->
        <div>
          <!-- Pending Requests Card -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <i class="fas fa-envelope-open-text text-warning"></i> Incoming Help Requests
                <span class="badge badge-in-progress">${incomingRequests.length}</span>
              </h2>
            </div>
            <div id="incoming-requests-list">
              ${
                incomingRequests.length === 0
                  ? `<div class="empty-state" style="padding: 1.5rem;">
                       <p class="text-muted">No pending help requests right now.</p>
                     </div>`
                  : incomingRequests
                      .map(
                        (req) => `
                    <div class="request-card">
                      <div class="request-card-header">
                        <strong>${req.studentId?.name || 'A Student'} (${req.studentId?.course || 'CSE'})</strong>
                        <span class="text-muted">${formatTime(req.createdAt)}</span>
                      </div>
                      <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.35rem;">
                        ${req.doubtId?.title || 'Academic Doubt'}
                      </div>
                      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
                        "${req.message}"
                      </p>
                      <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-success btn-sm" onclick="respondRequest('${req._id}', 'Accepted')">
                          <i class="fas fa-check"></i> Accept & Help
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="respondRequest('${req._id}', 'Rejected')">
                          <i class="fas fa-times"></i> Decline
                        </button>
                      </div>
                    </div>
                  `
                      )
                      .join('')
              }
            </div>
          </div>

          <!-- Active Assisting Doubts -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title"><i class="fas fa-comments text-primary"></i> Active Discussions</h2>
              <a href="/browse-doubts.html" class="btn btn-outline btn-sm">Explore Open Doubts</a>
            </div>
            <div id="active-doubts-list">
              ${
                activeHelped.length === 0
                  ? `<div class="empty-state" style="padding: 1.5rem;">
                       <p class="text-muted">No ongoing doubt sessions. Browse open doubts to assist your peers!</p>
                       <a href="/browse-doubts.html" class="btn btn-primary btn-sm">Find Doubts to Solve</a>
                     </div>`
                  : activeHelped
                      .map(
                        (doubt) => `
                    <div class="doubt-card">
                      <div class="doubt-header">
                        <div class="doubt-title">${doubt.title}</div>
                        <span class="badge badge-in-progress">In-Progress</span>
                      </div>
                      <p class="doubt-description">${doubt.description}</p>
                      <div class="doubt-meta">
                        <span class="doubt-tag">${doubt.courseCode}</span>
                        <span class="doubt-tag">${doubt.subject}</span>
                        <span>Student: <strong>${doubt.postedBy?.name || 'Student'}</strong></span>
                      </div>
                      <div class="doubt-actions">
                        <a href="/chat.html?doubtId=${doubt._id}" class="btn btn-primary btn-sm">
                          <i class="fas fa-comments"></i> Enter Discussion
                        </a>
                      </div>
                    </div>
                  `
                      )
                      .join('')
              }
            </div>
          </div>
        </div>

        <!-- Right: Helper Profile & Settings -->
        <div>
          <div class="card">
            <div class="card-header">
              <h2 class="card-title"><i class="fas fa-id-badge text-primary"></i> Your Helper Status</h2>
              <a href="/profile.html" class="btn btn-outline btn-sm">Edit</a>
            </div>
            <div style="margin-bottom: 1.25rem;">
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.35rem;">Current Availability:</div>
              <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
                <span class="status-dot status-${user.availability?.toLowerCase() || 'available'}"></span>
                <span>${user.availability || 'Available'}</span>
              </div>
            </div>
            <div style="margin-bottom: 1.25rem;">
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.35rem;">Subjects You Teach:</div>
              <div class="subject-pills">
                ${(user.subjects || ['Design Thinking', 'Computer Networks'])
                  .map((s) => `<span class="subject-pill">${s}</span>`)
                  .join('')}
              </div>
            </div>
            <a href="/profile.html" class="btn btn-secondary btn-sm" style="width: 100%;">
              <i class="fas fa-sliders-h"></i> Update Subjects & Status
            </a>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    API.showToast('Failed to load helper dashboard: ' + err.message, 'error');
  }
}

// Global action handler for responding to requests
window.respondRequest = async (requestId, status) => {
  try {
    const res = await API.patch(`/requests/${requestId}/respond`, { status });
    API.showToast(`Request ${status.toLowerCase()}!`, 'success');
    setTimeout(() => window.location.reload(), 1000);
  } catch (err) {
    API.showToast(err.message, 'error');
  }
};
