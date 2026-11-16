/**
 * DoubtConnect - Real-Time Chat Controller with Socket.IO
 */

let socket = null;
let currentDoubtId = null;
let currentDoubt = null;
let typingTimeout = null;
let selectedStarRating = 5;

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  const urlParams = new URLSearchParams(window.location.search);
  currentDoubtId = urlParams.get('doubtId');

  if (!currentDoubtId) {
    API.showToast('No doubt selected for discussion.', 'error');
    setTimeout(() => (window.location.href = '/browse-doubts.html'), 1500);
    return;
  }

  await initChat();
});

async function initChat() {
  const currentUser = Auth.getUser();

  // 1. Fetch Doubt details & messages from REST API
  try {
    const res = await API.get(`/messages/${currentDoubtId}`);
    currentDoubt = res.doubt;
    renderDoubtContext(currentDoubt);
    renderMessages(res.messages || []);
  } catch (err) {
    API.showToast('Could not load discussion: ' + err.message, 'error');
    return;
  }

  // 2. Initialize Socket.IO connection
  try {
    if (typeof io !== 'undefined') {
      socket = io();

      socket.on('connect', () => {
        console.log('[Socket] Connected to server with ID:', socket.id);
        socket.emit('joinRoom', {
          doubtId: currentDoubtId,
          userName: currentUser.name,
        });
      });

      socket.on('receiveMessage', (message) => {
        appendMessage(message);
      });

      socket.on('userTyping', ({ userName }) => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
          indicator.textContent = `${userName} is typing...`;
        }
      });

      socket.on('userStoppedTyping', () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
          indicator.textContent = '';
        }
      });
    } else {
      console.warn('Socket.IO library not loaded, fallback to REST API mode');
    }
  } catch (sockErr) {
    console.error('Socket connection error:', sockErr);
  }

  // 3. Message sending listener
  const form = document.getElementById('chat-send-form');
  const input = document.getElementById('chat-input');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    // Stop typing event
    if (socket) {
      socket.emit('stopTyping', { doubtId: currentDoubtId });
    }

    // Send via Socket.IO if connected, else fallback to REST
    const receiverId =
      currentDoubt.postedBy?._id === currentUser._id
        ? currentDoubt.assignedHelper?._id
        : currentDoubt.postedBy?._id;

    if (socket && socket.connected) {
      socket.emit('sendMessage', {
        doubtId: currentDoubtId,
        senderId: currentUser._id,
        receiverId,
        message: text,
      });
    } else {
      try {
        const postRes = await API.post('/messages', {
          doubtId: currentDoubtId,
          receiverId,
          message: text,
        });
        appendMessage(postRes.message);
      } catch (err) {
        API.showToast('Failed to send message: ' + err.message, 'error');
      }
    }
  });

  // Typing indicator trigger
  input?.addEventListener('input', () => {
    if (!socket) return;
    socket.emit('typing', { doubtId: currentDoubtId, userName: currentUser.name });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stopTyping', { doubtId: currentDoubtId });
    }, 1500);
  });
}

function renderDoubtContext(doubt) {
  const sidebar = document.getElementById('chat-sidebar-content');
  const headerInfo = document.getElementById('chat-header-info');
  const headerActions = document.getElementById('chat-header-actions');
  const currentUser = Auth.getUser();

  if (headerInfo) {
    headerInfo.innerHTML = `
      <div>
        <div class="chat-header-title">${doubt.title}</div>
        <div class="chat-header-subtitle">
          <span class="badge badge-${doubt.status.toLowerCase().replace(' ', '-')}">${doubt.status}</span>
          &bull; <strong>${doubt.courseCode}</strong> &bull; ${doubt.subject}
        </div>
      </div>
    `;
  }

  if (headerActions) {
    const isStudent = currentUser.role === 'student' && doubt.postedBy?._id === currentUser._id;
    headerActions.innerHTML = `
      ${
        doubt.status !== 'Resolved' && isStudent
          ? `<button class="btn btn-success btn-sm" onclick="openFeedbackModal('${doubt._id}', '${doubt.assignedHelper?._id || ''}')">
               <i class="fas fa-check-circle"></i> Resolve & Rate Helper
             </button>`
          : ''
      }
    `;
  }

  if (sidebar) {
    sidebar.innerHTML = `
      <div class="chat-sidebar-header">Doubt Details</div>
      <div class="doubt-context-card">
        <div class="doubt-context-title">${doubt.title}</div>
        <div class="doubt-context-desc">${doubt.description}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          <div><strong>Subject:</strong> ${doubt.subject}</div>
          <div><strong>Topic:</strong> ${doubt.topic}</div>
          <div><strong>Priority:</strong> <span class="badge badge-${doubt.priority.toLowerCase()}">${doubt.priority}</span></div>
        </div>
      </div>

      <div class="chat-sidebar-header">Participants</div>
      <div class="participant-card">
        <div class="participant-avatar">${doubt.postedBy?.name ? doubt.postedBy.name.charAt(0) : 'S'}</div>
        <div class="participant-info">
          <div class="name">${doubt.postedBy?.name || 'Student'}</div>
          <div class="role-tag">Question Author (Student)</div>
        </div>
      </div>

      ${
        doubt.assignedHelper
          ? `
        <div class="participant-card">
          <div class="participant-avatar" style="background: var(--accent-purple);">${doubt.assignedHelper.name.charAt(0)}</div>
          <div class="participant-info">
            <div class="name">${doubt.assignedHelper.name}</div>
            <div class="role-tag">Assigned Peer Helper ⭐ ${doubt.assignedHelper.ratingAverage || '5.0'}</div>
          </div>
        </div>
      `
          : `
        <div style="background: #fffbeb; border: 1px dashed #f59e0b; padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.825rem; color: #92400e;">
          No peer helper has accepted or been assigned yet.
          ${
            currentUser.role === 'helper'
              ? `<button class="btn btn-primary btn-sm" style="width: 100%; margin-top: 0.5rem;" onclick="assignSelfHelper('${doubt._id}')">
                   <i class="fas fa-hand-holding-heart"></i> Accept To Help
                 </button>`
              : ''
          }
        </div>
      `
      }
    `;
  }
}

function renderMessages(messages) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  container.innerHTML = '';
  if (messages.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="margin: auto;">
        <div class="empty-state-icon"><i class="far fa-comments"></i></div>
        <div class="empty-state-title">Discussion Started</div>
        <p class="empty-state-text">Ask clarifying questions, share diagrams or code snippets to resolve this academic doubt!</p>
      </div>
    `;
    return;
  }

  messages.forEach((msg) => appendMessage(msg, false));
  scrollToBottom();
}

function appendMessage(msg, scroll = true) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  // Clear empty state placeholder if present
  const empty = container.querySelector('.empty-state');
  if (empty) empty.remove();

  const currentUser = Auth.getUser();
  const isSent = (msg.senderId?._id || msg.senderId) === currentUser._id;
  const senderName = msg.senderId?.name || (isSent ? 'You' : 'Peer');

  const timeStr = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const msgDiv = document.createElement('div');
  msgDiv.className = `message-item ${isSent ? 'sent' : 'received'}`;
  msgDiv.innerHTML = `
    <div class="message-meta">
      <span>${isSent ? 'You' : senderName}</span> &bull; <span>${timeStr}</span>
    </div>
    <div class="message-bubble">${escapeHtml(msg.message)}</div>
  `;

  container.appendChild(msgDiv);
  if (scroll) scrollToBottom();
}

function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Peer Helper direct self-assignment
window.assignSelfHelper = async (doubtId) => {
  try {
    const user = Auth.getUser();
    await API.patch(`/doubts/${doubtId}/status`, {
      status: 'In-Progress',
      assignedHelper: user._id,
    });
    API.showToast('You have accepted this doubt session!', 'success');
    setTimeout(() => window.location.reload(), 1000);
  } catch (err) {
    API.showToast(err.message, 'error');
  }
};

// ==========================================================================
// Feedback & Rating Modal
// ==========================================================================
window.openFeedbackModal = (doubtId, helperId) => {
  selectedStarRating = 5;

  let modal = document.getElementById('feedback-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Resolve Doubt & Rate Helper</h3>
        <button class="modal-close" onclick="closeFeedbackModal()">&times;</button>
      </div>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
        Did the peer helper help resolve your doubt? Leave a rating and brief feedback to acknowledge their effort and help other students find great mentors.
      </p>
      <form id="feedback-form">
        <div class="form-group" style="text-align: center;">
          <label class="form-label">Rate Your Experience</label>
          <div class="star-rating" id="star-picker">
            <i class="fas fa-star active" data-rating="1"></i>
            <i class="fas fa-star active" data-rating="2"></i>
            <i class="fas fa-star active" data-rating="3"></i>
            <i class="fas fa-star active" data-rating="4"></i>
            <i class="fas fa-star active" data-rating="5"></i>
          </div>
          <div id="rating-label" style="font-weight: 700; color: #f59e0b; margin-top: 0.25rem;">5.0 - Excellent Guidance!</div>
        </div>

        <div class="form-group">
          <label class="form-label">Review / Feedback Comment</label>
          <textarea id="feedback-comment" class="form-textarea" placeholder="E.g., Great explanation of the algorithm, very patient!"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
          <button type="button" class="btn btn-outline" onclick="closeFeedbackModal()">Cancel</button>
          <button type="submit" class="btn btn-success">
            <i class="fas fa-check-circle"></i> Submit & Mark Resolved
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('active');

  // Star Rating Interaction
  const stars = modal.querySelectorAll('#star-picker i');
  const label = modal.querySelector('#rating-label');
  const ratingTexts = {
    1: '1.0 - Needs Improvement',
    2: '2.0 - Fair',
    3: '3.0 - Good',
    4: '4.0 - Very Helpful',
    5: '5.0 - Excellent Guidance!',
  };

  stars.forEach((star) => {
    star.addEventListener('click', () => {
      selectedStarRating = parseInt(star.getAttribute('data-rating'), 10);
      stars.forEach((s) => {
        const r = parseInt(s.getAttribute('data-rating'), 10);
        if (r <= selectedStarRating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
      label.textContent = ratingTexts[selectedStarRating];
    });
  });

  const form = modal.querySelector('#feedback-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const comment = modal.querySelector('#feedback-comment').value.trim();

    try {
      await API.post('/feedback', {
        doubtId,
        rating: selectedStarRating,
        comment,
      });

      API.showToast('Doubt marked as resolved! Feedback recorded.', 'success');
      closeFeedbackModal();
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  });
};

window.closeFeedbackModal = () => {
  const modal = document.getElementById('feedback-modal');
  if (modal) modal.classList.remove('active');
};
