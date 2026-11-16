/**
 * DoubtConnect - User Profile & Settings Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  loadUserProfile();
});

async function loadUserProfile() {
  const container = document.getElementById('profile-content');
  if (!container) return;

  try {
    const res = await API.get('/auth/me');
    const user = res.user;

    // Save updated info in localStorage
    Auth.setSession(Auth.getToken(), user);

    let helperFeedbacksHtml = '';
    if (user.role === 'helper') {
      try {
        const feedbackRes = await API.get(`/feedback/helper/${user._id}`);
        const feedbacks = feedbackRes.feedbacks || [];

        helperFeedbacksHtml = `
          <div class="card" style="margin-top: 1.5rem;">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-star text-warning"></i> Reviews & Feedback Received (${feedbacks.length})</h3>
            </div>
            <div>
              ${
                feedbacks.length === 0
                  ? `<p class="text-muted" style="padding: 1rem 0;">No reviews received yet. As you help students resolve doubts, your ratings will appear here.</p>`
                  : feedbacks
                      .map(
                        (f) => `
                    <div style="padding: 1rem; border-bottom: 1px solid var(--border-light);">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                        <span style="font-weight: 700; color: #f59e0b;">
                          ${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)} (${f.rating}.0)
                        </span>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${new Date(f.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">
                        Doubt: ${f.doubtId?.title || 'Academic Concept'}
                      </div>
                      <p style="font-size: 0.875rem; color: var(--text-muted); font-style: italic;">
                        "${f.comment || 'Helpful session!'}"
                      </p>
                      <div style="font-size: 0.775rem; color: var(--text-subtle); margin-top: 0.25rem;">
                        From: ${f.studentId?.name || 'Student'} (${f.studentId?.course || 'CSE'})
                      </div>
                    </div>
                  `
                      )
                      .join('')
              }
            </div>
          </div>
        `;
      } catch (fErr) {
        console.error('Feedback loading error:', fErr);
      }
    }

    container.innerHTML = `
      <div class="dashboard-layout">
        <!-- Profile Edit Form -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-user-edit text-primary"></i> Edit Profile</h2>
            <span class="badge ${user.role === 'helper' ? 'badge-in-progress' : 'badge-open'}">
              ${user.role === 'helper' ? 'Peer Helper' : 'Student'}
            </span>
          </div>

          <form id="profile-edit-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="prof-name" class="form-input" value="${user.name}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Student Registration ID</label>
                <input type="text" class="form-input" value="${user.studentId}" disabled style="background: var(--bg-subtle);">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">University Email</label>
                <input type="email" class="form-input" value="${user.email}" disabled style="background: var(--bg-subtle);">
              </div>
              <div class="form-group">
                <label class="form-label">Course / Degree</label>
                <input type="text" id="prof-course" class="form-input" value="${user.course || 'B.Tech CSE'}">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Year of Study</label>
                <select id="prof-year" class="form-select">
                  <option value="1" ${user.year === 1 ? 'selected' : ''}>1st Year</option>
                  <option value="2" ${user.year === 2 ? 'selected' : ''}>2nd Year</option>
                  <option value="3" ${user.year === 3 ? 'selected' : ''}>3rd Year</option>
                  <option value="4" ${user.year === 4 ? 'selected' : ''}>4th Year</option>
                </select>
              </div>
              ${
                user.role === 'helper'
                  ? `
                <div class="form-group">
                  <label class="form-label">Availability Status</label>
                  <select id="prof-availability" class="form-select">
                    <option value="Available" ${user.availability === 'Available' ? 'selected' : ''}>🟢 Available to Help</option>
                    <option value="Busy" ${user.availability === 'Busy' ? 'selected' : ''}>🟡 Busy / In Class</option>
                    <option value="Offline" ${user.availability === 'Offline' ? 'selected' : ''}>⚪ Offline</option>
                  </select>
                </div>
              `
                  : ''
              }
            </div>

            ${
              user.role === 'helper'
                ? `
              <div class="form-group">
                <label class="form-label">Subjects You Can Explain (comma separated)</label>
                <input type="text" id="prof-subjects" class="form-input" value="${(user.subjects || []).join(', ')}">
                <div class="form-help">E.g., Design Thinking, Operating Systems, Computer Networks, Python</div>
              </div>
            `
                : ''
            }

            <div class="form-group">
              <label class="form-label">Bio / Academic Interests</label>
              <textarea id="prof-bio" class="form-textarea" placeholder="Share a few words about your academic focus or areas of expertise...">${user.bio || ''}</textarea>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button type="submit" class="btn btn-primary" id="save-profile-btn">
                <i class="fas fa-save"></i> Save Changes
              </button>
            </div>
          </form>
        </div>

        <!-- Right Side: Stats & Feedbacks -->
        <div>
          <div class="card">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-award text-primary"></i> Academic Identity</h3>
            </div>
            <div style="text-align: center; padding: 1rem 0;">
              <div class="user-avatar" style="width: 72px; height: 72px; font-size: 2rem; margin: 0 auto 0.75rem;">
                ${user.name.charAt(0)}
              </div>
              <h3 style="font-size: 1.25rem;">${user.name}</h3>
              <p style="color: var(--text-muted); font-size: 0.875rem;">${user.studentId} &bull; ${user.course}</p>
              ${
                user.role === 'helper'
                  ? `
                <div style="margin-top: 0.75rem;">
                  <span class="helper-rating-badge" style="font-size: 1rem; padding: 0.35rem 0.75rem;">
                    ⭐ ${user.ratingAverage || '5.0'} / 5.0 (${user.ratingCount || 0} reviews)
                  </span>
                </div>
              `
                  : ''
              }
            </div>
          </div>

          ${helperFeedbacksHtml}
        </div>
      </div>
    `;

    const form = document.getElementById('profile-edit-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('save-profile-btn');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

      const updateData = {
        name: document.getElementById('prof-name').value.trim(),
        course: document.getElementById('prof-course').value.trim(),
        year: document.getElementById('prof-year').value,
        bio: document.getElementById('prof-bio').value.trim(),
      };

      if (user.role === 'helper') {
        const avail = document.getElementById('prof-availability');
        const subs = document.getElementById('prof-subjects');
        if (avail) updateData.availability = avail.value;
        if (subs) updateData.subjects = subs.value;
      }

      try {
        const updateRes = await API.put('/auth/profile', updateData);
        Auth.setSession(Auth.getToken(), updateRes.user);
        API.showToast('Profile updated successfully!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        API.showToast(err.message, 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
      }
    });
  } catch (err) {
    API.showToast('Failed to load profile: ' + err.message, 'error');
  }
}
