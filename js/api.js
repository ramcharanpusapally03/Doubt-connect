/**
 * DoubtConnect - Universal API Client with Automatic GitHub Pages Offline Demo Support
 * Supports both live Node.js/Express/MongoDB backend and standalone GitHub Pages static deployment.
 */

const isGitHubPages =
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:';

const API_BASE_URL = isGitHubPages ? '' : '/api';

// Toast Notification Manager
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconClass =
    type === 'success'
      ? 'fa-check-circle'
      : type === 'error'
      ? 'fa-exclamation-circle'
      : 'fa-info-circle';

  toast.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// ==========================================================================
// Client-Side Mock Database (For GitHub Pages Standalone Operation)
// ==========================================================================
const MOCK_STORAGE_KEY = 'doubtconnect_mock_db_v1';

function getMockDB() {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }

  // Initial realistic LPU seed dataset for static GitHub Pages demonstration
  const initialDB = {
    users: [
      {
        _id: 'usr_student_1',
        name: 'Aarav Sharma',
        studentId: '12204561',
        email: 'student@lpu.in',
        password: 'Student@123',
        course: 'B.Tech CSE',
        year: 3,
        role: 'student',
        bio: 'Third-year CSE student exploring full-stack engineering, networks, and design thinking.',
        availability: 'Available',
        ratingAverage: 5.0,
        ratingCount: 0,
      },
      {
        _id: 'usr_helper_1',
        name: 'Priya Patel',
        studentId: '12108922',
        email: 'helper@lpu.in',
        password: 'Helper@123',
        course: 'B.Tech CSE',
        year: 4,
        role: 'helper',
        subjects: ['Design Thinking', 'Operating Systems', 'Computer Networks'],
        bio: 'Final year CSE student. Mentored 40+ juniors in OS, Networks, and INT335 Design Thinking CA projects.',
        availability: 'Available',
        ratingAverage: 4.9,
        ratingCount: 14,
      },
      {
        _id: 'usr_helper_2',
        name: 'Rohan Verma',
        studentId: '12209931',
        email: 'rohan.helper@lpu.in',
        password: 'Helper@123',
        course: 'B.Tech CSE (AI/ML)',
        year: 3,
        role: 'helper',
        subjects: ['Python Programming', 'Database Systems', 'Data Structures'],
        bio: 'Competitive programmer and Python enthusiast. Happy to help with syntax, logic, and queries.',
        availability: 'Available',
        ratingAverage: 4.8,
        ratingCount: 9,
      },
      {
        _id: 'usr_helper_3',
        name: 'Sneha Reddy',
        studentId: '12114402',
        email: 'sneha.helper@lpu.in',
        password: 'Helper@123',
        course: 'B.Tech CSE',
        year: 4,
        role: 'helper',
        subjects: ['Design Thinking', 'Web Development', 'Software Engineering'],
        bio: 'UI/UX enthusiast and frontend specialist. Can assist in wireframing, ideation, and user interviews.',
        availability: 'Busy',
        ratingAverage: 5.0,
        ratingCount: 18,
      },
      {
        _id: 'usr_helper_4',
        name: 'Vikram Singh',
        studentId: '12201178',
        email: 'vikram.helper@lpu.in',
        password: 'Helper@123',
        course: 'B.Tech CSE (Cyber Security)',
        year: 3,
        role: 'helper',
        subjects: ['Computer Networks', 'Operating Systems', 'Cyber Security'],
        bio: 'Focused on protocols, packet routing, and POSIX multithreading concepts.',
        availability: 'Available',
        ratingAverage: 4.7,
        ratingCount: 7,
      },
    ],
    doubts: [
      {
        _id: 'dbt_1',
        title: 'How to structure Empathy Map & Define Stage for INT335 CA2 Project?',
        description:
          'We are working on our Design Thinking CA2 peer doubt platform. How do we clearly distinguish between "Says, Thinks, Does, Feels" in the empathy canvas for college students, and how does that formulate our Point of View (POV) statement?',
        subject: 'Design Thinking',
        courseCode: 'INT335',
        topic: 'Empathy Mapping & POV Definition',
        priority: 'High',
        postedBy: {
          _id: 'usr_student_1',
          name: 'Aarav Sharma',
          studentId: '12204561',
          course: 'B.Tech CSE',
          year: 3,
          role: 'student',
        },
        assignedHelper: {
          _id: 'usr_helper_1',
          name: 'Priya Patel',
          studentId: '12108922',
          ratingAverage: 4.9,
          ratingCount: 14,
          availability: 'Available',
        },
        status: 'In-Progress',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        _id: 'dbt_2',
        title: "Banker's Algorithm Safe State Calculation Doubt",
        description:
          'In CSE316 Operating Systems, given Allocation and Max matrix with 5 processes and 3 resource types, how do we correctly compute Need = Max - Allocation and verify if Available >= Need during each pass?',
        subject: 'Operating Systems',
        courseCode: 'CSE316',
        topic: "Deadlock Avoidance - Banker's Algorithm",
        priority: 'Urgent',
        postedBy: {
          _id: 'usr_student_1',
          name: 'Aarav Sharma',
          studentId: '12204561',
          course: 'B.Tech CSE',
          year: 3,
          role: 'student',
        },
        assignedHelper: {
          _id: 'usr_helper_1',
          name: 'Priya Patel',
          studentId: '12108922',
          ratingAverage: 4.9,
          ratingCount: 14,
          availability: 'Available',
        },
        status: 'Resolved',
        resolvedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      },
      {
        _id: 'dbt_3',
        title: 'Subnetting & VLSM calculation for Class C network with 4 departments',
        description:
          'I have network 192.168.10.0/24. Department A needs 60 hosts, Dept B needs 28 hosts, Dept C needs 14 hosts. What are the subnet masks and usable host ranges?',
        subject: 'Computer Networks',
        courseCode: 'CSE304',
        topic: 'VLSM & Variable Length Subnet Masks',
        priority: 'Medium',
        postedBy: {
          _id: 'usr_student_1',
          name: 'Aarav Sharma',
          studentId: '12204561',
          course: 'B.Tech CSE',
          year: 3,
          role: 'student',
        },
        assignedHelper: null,
        status: 'Open',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        _id: 'dbt_4',
        title: 'Difference between List Comprehensions and Generator Expressions in memory',
        description:
          'When processing 1 million records in Python, why does a generator expression consume negligible RAM compared to a list comprehension? How does lazy evaluation work internally with sys.getsizeof?',
        subject: 'Python Programming',
        courseCode: 'INT213',
        topic: 'Memory Profiling & Generators',
        priority: 'Low',
        postedBy: {
          _id: 'usr_student_1',
          name: 'Aarav Sharma',
          studentId: '12204561',
          course: 'B.Tech CSE',
          year: 3,
          role: 'student',
        },
        assignedHelper: null,
        status: 'Open',
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      },
    ],
    requests: [
      {
        _id: 'req_1',
        doubtId: 'dbt_1',
        studentId: { _id: 'usr_student_1', name: 'Aarav Sharma', course: 'B.Tech CSE' },
        helperId: 'usr_helper_1',
        message: 'Hi Priya, could you please review our empathy map and POV statement?',
        requestStatus: 'Accepted',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
    messages: [
      {
        _id: 'msg_1',
        doubtId: 'dbt_1',
        senderId: { _id: 'usr_student_1', name: 'Aarav Sharma', role: 'student' },
        receiverId: { _id: 'usr_helper_1', name: 'Priya Patel', role: 'helper' },
        message: 'Hi Priya! Could you help us understand how to derive the POV statement from the empathy map?',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        _id: 'msg_2',
        doubtId: 'dbt_1',
        senderId: { _id: 'usr_helper_1', name: 'Priya Patel', role: 'helper' },
        receiverId: { _id: 'usr_student_1', name: 'Aarav Sharma', role: 'student' },
        message:
          'Hey Aarav! Certainly! Start by identifying the user ("LPU B.Tech student"), their unmet need ("quick academic peer explanations without getting buried in WhatsApp"), and the key insight ("students hesitate to approach faculty for minor syntax doubts").',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        _id: 'msg_3',
        doubtId: 'dbt_1',
        senderId: { _id: 'usr_student_1', name: 'Aarav Sharma', role: 'student' },
        receiverId: { _id: 'usr_helper_1', name: 'Priya Patel', role: 'helper' },
        message: 'That makes total sense! Should we also create user personas before making the prototype?',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
    feedback: [
      {
        _id: 'fbk_1',
        doubtId: 'dbt_2',
        studentId: 'usr_student_1',
        helperId: 'usr_helper_1',
        rating: 5,
        comment:
          'Priya gave an exceptional explanation with step-by-step matrix subtractions. Scored full marks on the CA test!',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
  };

  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialDB));
  return initialDB;
}

function saveMockDB(db) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
}

// Mock API request router
async function handleMockRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const db = getMockDB();
  const currentUserRaw = localStorage.getItem('doubtconnect_user');
  const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

  // Simulate network latency (80ms)
  await new Promise((r) => setTimeout(r, 80));

  // 1. Auth: Login
  if (endpoint.startsWith('/auth/login') && method === 'POST') {
    const user = db.users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (!user || user.password !== body.password) {
      throw new Error('Invalid credentials. Check email and password.');
    }
    const token = 'mock_jwt_token_' + user._id;
    return { success: true, token, user };
  }

  // 2. Auth: Register
  if (endpoint.startsWith('/auth/register') && method === 'POST') {
    const existing = db.users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (existing) throw new Error('An account with this email already exists.');

    const newUser = {
      _id: 'usr_' + Date.now(),
      name: body.name,
      studentId: body.studentId.toUpperCase(),
      email: body.email.toLowerCase(),
      password: body.password,
      course: body.course || 'B.Tech CSE',
      year: parseInt(body.year, 10) || 3,
      role: body.role || 'student',
      subjects: body.subjects
        ? (Array.isArray(body.subjects) ? body.subjects : body.subjects.split(',').map((s) => s.trim()))
        : [],
      bio: body.bio || '',
      availability: 'Available',
      ratingAverage: 5.0,
      ratingCount: 0,
    };
    db.users.push(newUser);
    saveMockDB(db);
    return { success: true, token: 'mock_jwt_' + newUser._id, user: newUser };
  }

  // 3. Auth: Me
  if (endpoint.startsWith('/auth/me') && method === 'GET') {
    if (!currentUser) throw new Error('Unauthorized');
    const user = db.users.find((u) => u._id === currentUser._id) || currentUser;
    return { success: true, user };
  }

  // 4. Auth: Profile Update
  if (endpoint.startsWith('/auth/profile') && method === 'PUT') {
    if (!currentUser) throw new Error('Unauthorized');
    const idx = db.users.findIndex((u) => u._id === currentUser._id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...body };
      if (body.subjects && typeof body.subjects === 'string') {
        db.users[idx].subjects = body.subjects.split(',').map((s) => s.trim());
      }
      saveMockDB(db);
      return { success: true, user: db.users[idx] };
    }
    return { success: true, user: currentUser };
  }

  // 5. Doubts: My Doubts
  if (endpoint.startsWith('/doubts/user/my-doubts') && method === 'GET') {
    const uid = currentUser ? currentUser._id : 'usr_student_1';
    const postedDoubts = db.doubts.filter((d) => (d.postedBy?._id || d.postedBy) === uid);
    const assignedDoubts = db.doubts.filter((d) => (d.assignedHelper?._id || d.assignedHelper) === uid);
    return { success: true, postedDoubts, assignedDoubts };
  }

  // 6. Doubts: List / Search / Filter
  if (endpoint.startsWith('/doubts') && method === 'GET' && !endpoint.includes('/user/')) {
    const url = new URL('http://localhost' + endpoint);
    const q = url.searchParams.get('q')?.toLowerCase();
    const subject = url.searchParams.get('subject');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');

    let filtered = [...db.doubts];
    if (q) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.topic.toLowerCase().includes(q) ||
          d.courseCode.toLowerCase().includes(q)
      );
    }
    if (subject && subject !== 'All') {
      filtered = filtered.filter((d) => d.subject.toLowerCase() === subject.toLowerCase());
    }
    if (status && status !== 'All') {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (priority && priority !== 'All') {
      filtered = filtered.filter((d) => d.priority === priority);
    }
    return { success: true, count: filtered.length, doubts: filtered };
  }

  // 7. Doubts: Create
  if (endpoint === '/doubts' && method === 'POST') {
    const newDoubt = {
      _id: 'dbt_' + Date.now(),
      title: body.title,
      description: body.description,
      subject: body.subject,
      courseCode: body.courseCode.toUpperCase(),
      topic: body.topic,
      priority: body.priority || 'Medium',
      postedBy: currentUser || db.users[0],
      assignedHelper: null,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    db.doubts.unshift(newDoubt);
    saveMockDB(db);
    return { success: true, message: 'Doubt posted successfully!', doubt: newDoubt };
  }

  // 8. Doubts: Update Status
  if (endpoint.match(/\/doubts\/[^\/]+\/status/) && method === 'PATCH') {
    const doubtId = endpoint.split('/')[2];
    const doubt = db.doubts.find((d) => d._id === doubtId);
    if (doubt) {
      if (body.status) doubt.status = body.status;
      if (body.assignedHelper !== undefined) {
        const h = db.users.find((u) => u._id === body.assignedHelper);
        doubt.assignedHelper = h || null;
      }
      saveMockDB(db);
      return { success: true, doubt };
    }
  }

  // 9. Helpers: List
  if (endpoint.startsWith('/helpers') && method === 'GET' && !endpoint.includes('/recommended/')) {
    const url = new URL('http://localhost' + endpoint);
    const subject = url.searchParams.get('subject');
    const avail = url.searchParams.get('availability');
    const q = url.searchParams.get('q')?.toLowerCase();

    let helpers = db.users.filter((u) => u.role === 'helper');
    if (avail && avail !== 'All') {
      helpers = helpers.filter((h) => h.availability === avail);
    }
    if (subject && subject !== 'All') {
      helpers = helpers.filter((h) => (h.subjects || []).some((s) => s.toLowerCase() === subject.toLowerCase()));
    }
    if (q) {
      helpers = helpers.filter(
        (h) => h.name.toLowerCase().includes(q) || (h.subjects || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    return { success: true, count: helpers.length, helpers };
  }

  // 10. Help Requests: Send
  if (endpoint.startsWith('/requests') && method === 'POST') {
    const newReq = {
      _id: 'req_' + Date.now(),
      doubtId: db.doubts.find((d) => d._id === body.doubtId) || { _id: body.doubtId, title: 'Doubt' },
      studentId: currentUser || db.users[0],
      helperId: body.helperId,
      message: body.message,
      requestStatus: 'Pending',
      createdAt: new Date().toISOString(),
    };
    db.requests.unshift(newReq);
    saveMockDB(db);
    return { success: true, message: 'Help request sent!', request: newReq };
  }

  // 11. Help Requests: My Requests
  if (endpoint.startsWith('/requests/my-requests') && method === 'GET') {
    const uid = currentUser ? currentUser._id : 'usr_helper_1';
    const incoming = db.requests.filter((r) => r.helperId === uid || r.helperId?._id === uid);
    const outgoing = db.requests.filter((r) => r.studentId?._id === uid || r.studentId === uid);
    return { success: true, incoming, outgoing };
  }

  // 12. Help Requests: Respond
  if (endpoint.match(/\/requests\/[^\/]+\/respond/) && method === 'PATCH') {
    const reqId = endpoint.split('/')[2];
    const req = db.requests.find((r) => r._id === reqId);
    if (req) {
      req.requestStatus = body.status;
      if (body.status === 'Accepted') {
        const dbt = db.doubts.find((d) => d._id === (req.doubtId?._id || req.doubtId));
        if (dbt) {
          dbt.status = 'In-Progress';
          dbt.assignedHelper = currentUser || db.users[1];
        }
        db.messages.push({
          _id: 'msg_' + Date.now(),
          doubtId: req.doubtId?._id || req.doubtId,
          senderId: currentUser || db.users[1],
          receiverId: req.studentId,
          message: 'Hello! I have accepted your request. Happy to help you with this doubt!',
          createdAt: new Date().toISOString(),
        });
      }
      saveMockDB(db);
      return { success: true, request: req };
    }
  }

  // 13. Messages: Get History
  if (endpoint.startsWith('/messages/') && method === 'GET') {
    const doubtId = endpoint.split('/')[2];
    const doubt = db.doubts.find((d) => d._id === doubtId) || db.doubts[0];
    const messages = db.messages.filter((m) => m.doubtId === doubtId);
    return { success: true, doubt, messages };
  }

  // 14. Messages: Send Message
  if (endpoint.startsWith('/messages') && method === 'POST') {
    const newMsg = {
      _id: 'msg_' + Date.now(),
      doubtId: body.doubtId,
      senderId: currentUser || { _id: 'usr_student_1', name: 'Aarav Sharma' },
      receiverId: body.receiverId,
      message: body.message,
      createdAt: new Date().toISOString(),
    };
    db.messages.push(newMsg);
    saveMockDB(db);
    return { success: true, message: newMsg };
  }

  // 15. Feedback: Submit Rating
  if (endpoint.startsWith('/feedback') && method === 'POST') {
    const newFbk = {
      _id: 'fbk_' + Date.now(),
      doubtId: body.doubtId,
      studentId: currentUser ? currentUser._id : 'usr_student_1',
      rating: body.rating,
      comment: body.comment || '',
      createdAt: new Date().toISOString(),
    };
    db.feedback.push(newFbk);
    // Mark doubt resolved
    const doubt = db.doubts.find((d) => d._id === body.doubtId);
    if (doubt) doubt.status = 'Resolved';
    saveMockDB(db);
    return { success: true, feedback: newFbk };
  }

  // 16. Feedback: For Helper
  if (endpoint.startsWith('/feedback/helper/') && method === 'GET') {
    const hid = endpoint.split('/')[3];
    const list = db.feedback.filter((f) => f.helperId === hid || f.helperId?._id === hid);
    return { success: true, count: list.length, feedbacks: list };
  }

  return { success: true };
}

// Universal API Fetcher
async function apiRequest(endpoint, options = {}) {
  // If in standalone GitHub Pages or file: environment, route directly to Mock DB
  if (isGitHubPages) {
    return handleMockRequest(endpoint, options);
  }

  const token = localStorage.getItem('doubtconnect_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If endpoint not found or error, fall back to mock database
    if (response.status === 404 && endpoint.startsWith('/')) {
      return handleMockRequest(endpoint, options);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
        localStorage.removeItem('doubtconnect_token');
        localStorage.removeItem('doubtconnect_user');
        window.location.href = './login.html?expired=true';
      }
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    // If backend is unreachable (e.g. offline or static deployment), transparently fallback to Mock DB
    console.warn(`[API] Fallback to client mock database for ${endpoint} (${error.message})`);
    return handleMockRequest(endpoint, options);
  }
}

// Export global API object
window.API = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) =>
    apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
  showToast,
};
