/**
 * DoubtConnect - Authentication & Session Helper
 */

const Auth = {
  getToken() {
    return localStorage.getItem('doubtconnect_token');
  },

  getUser() {
    const raw = localStorage.getItem('doubtconnect_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('doubtconnect_token', token);
    localStorage.setItem('doubtconnect_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('doubtconnect_token');
    localStorage.removeItem('doubtconnect_user');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = `./login.html?redirect=${encodeURIComponent(
        window.location.pathname.split('/').pop()
      )}`;
      return false;
    }
    return true;
  },

  logout() {
    this.clearSession();
    window.location.href = './login.html?logged_out=true';
  },

  // Setup standard navigation state across all pages
  initNavbar() {
    const navMenu = document.getElementById('nav-menu');
    const navActions = document.getElementById('nav-actions');
    const user = this.getUser();

    // Responsive toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-open');
      });
    }

    if (!navMenu || !navActions) return;

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    if (user && this.isLoggedIn()) {
      // Dynamic navigation links based on user role
      navMenu.innerHTML = `
        <li><a href="./dashboard.html" class="nav-link ${
          currentFile.includes('dashboard') ? 'active' : ''
        }"><i class="fas fa-th-large"></i> Dashboard</a></li>
        <li><a href="./browse-doubts.html" class="nav-link ${
          currentFile.includes('browse-doubts') ? 'active' : ''
        }"><i class="fas fa-search"></i> Browse Doubts</a></li>
        <li><a href="./helpers.html" class="nav-link ${
          currentFile.includes('helpers') ? 'active' : ''
        }"><i class="fas fa-user-friends"></i> Find Helpers</a></li>
        <li><a href="./my-doubts.html" class="nav-link ${
          currentFile.includes('my-doubts') ? 'active' : ''
        }"><i class="fas fa-question-circle"></i> My Doubts</a></li>
      `;

      navActions.innerHTML = `
        ${
          user.role === 'student'
            ? `<a href="./post-doubt.html" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Post Doubt</a>`
            : ''
        }
        <a href="./profile.html" class="nav-user-chip" title="View Profile">
          <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
          <span>${user.name.split(' ')[0]}</span>
          <span class="badge ${user.role === 'helper' ? 'badge-in-progress' : 'badge-open'}" style="font-size: 0.65rem;">
            ${user.role === 'helper' ? 'Peer Helper' : 'Student'}
          </span>
        </a>
        <button id="logout-btn" class="btn btn-outline btn-sm" title="Log Out">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      `;

      document.getElementById('logout-btn')?.addEventListener('click', () => {
        Auth.logout();
      });
    } else {
      // Public / logged-out nav
      navMenu.innerHTML = `
        <li><a href="./index.html" class="nav-link ${
          currentFile === '' || currentFile.includes('index') ? 'active' : ''
        }">Home</a></li>
        <li><a href="./index.html#how-it-works" class="nav-link">How It Works</a></li>
        <li><a href="./index.html#features" class="nav-link">Features</a></li>
        <li><a href="./browse-doubts.html" class="nav-link">Public Doubts</a></li>
      `;

      navActions.innerHTML = `
        <a href="./login.html" class="btn btn-outline btn-sm">Log In</a>
        <a href="./register.html" class="btn btn-primary btn-sm">Sign Up</a>
      `;
    }
  },
};

// Auto-run navbar initializer on DOM load
document.addEventListener('DOMContentLoaded', () => {
  Auth.initNavbar();
});
