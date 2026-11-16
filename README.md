# 🎓 DoubtConnect – Peer Doubt Resolution Platform
**INT335: Design Thinking CA2 Project**  
*Department of Computer Science & Engineering, Lovely Professional University*

---

## 📌 1. Project Problem & Design Thinking Context

### The Real-World Problem
Students studying late at night or preparing for Continuous Assessment (CA) tests frequently get stuck on theoretical concepts, code errors, or design frameworks. Typically, they post their doubts in batch WhatsApp groups with 100+ students. 

As a result:
- Questions get instantly buried under general chatter, memes, and unrelated announcements.
- Willing peer explainers miss the questions or find it tedious to scroll back.
- Students feel awkward or hesitant to repeatedly ping faculty for minor doubts.
- There is zero tracking of whether a question was ever understood and resolved.

### The Design Thinking Solution: DoubtConnect
**DoubtConnect** is a responsive full-stack web platform built to connect students who have academic doubts with willing peer explainers within minutes. It introduces:
1. **Course & Subject Tagging**: Categorized by actual LPU courses (e.g., `INT335`, `CSE316`, `CSE304`, `INT213`).
2. **Peer Helper Matching**: Discover students who have mastered the subject and are currently online.
3. **Dedicated Real-Time 1-on-1 Discussion**: Focused rooms powered by Socket.IO with typing indicators and persistent message logs.
4. **Resolution & Feedback Loop**: Students mark doubts as resolved and award 5-star reviews to helpers, creating a positive peer-learning reputation.

---

## 🛠️ 2. Technology Stack

- **Frontend**: HTML5, Modern CSS3 (Custom CSS Variables, Flexbox/Grid, Responsive Mobile Drawer), Vanilla JavaScript (Modular ES6+).
- **Backend**: Node.js & Express.js REST API with MVC structure.
- **Database**: MongoDB via Mongoose ODM (with automatic in-memory fallback for zero-config evaluation!).
- **Real-Time Communication**: Socket.IO for live bidirectional messaging and typing indicators.
- **Security**: Password hashing using `bcryptjs`, stateless token-based authorization using `jsonwebtoken` (JWT).
- **Icons**: Font Awesome 6.4.

---

## 📂 3. Project Folder Structure

```text
DoubtConnect/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection with auto in-memory fallback
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Profile updates
│   │   ├── doubtController.js    # Create, Filter, Search, Resolve doubts
│   │   ├── helperController.js   # Peer mentor discovery & subject matching
│   │   ├── requestController.js  # Help request sending, accepting & rejecting
│   │   ├── chatController.js     # Message persistence and history
│   │   └── feedbackController.js # 5-star ratings & reviews calculation
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token verification & role check
│   │   └── errorMiddleware.js    # Global error handling & 404 handler
│   ├── models/
│   │   ├── User.js               # User schema (Student & Peer Helper)
│   │   ├── Doubt.js              # Academic doubt schema with course codes
│   │   ├── HelpRequest.js        # Formal assistance request schema
│   │   ├── Message.js            # Chat message persistence schema
│   │   └── Feedback.js           # Star rating & review schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── doubtRoutes.js        # /api/doubts
│   │   ├── helperRoutes.js       # /api/helpers
│   │   ├── requestRoutes.js      # /api/requests
│   │   ├── chatRoutes.js         # /api/messages
│   │   └── feedbackRoutes.js     # /api/feedback
│   ├── seed/
│   │   └── seedData.js           # LPU demo accounts & sample academic doubts
│   ├── socket/
│   │   └── chatSocket.js         # Socket.IO room handling & real-time broadcast
│   ├── test/
│   │   └── api-test.js           # Automated end-to-end integration test suite
│   └── server.js                 # Express & Socket.IO server entrypoint
│
├── frontend/
│   ├── index.html                # Project introduction, Problem statement & Hero
│   ├── login.html                # Login page with 1-Click Demo Switcher
│   ├── register.html             # Student & Peer Helper registration
│   ├── dashboard.html            # Dynamic Student / Helper live dashboard
│   ├── post-doubt.html           # Post doubt with priority & course codes
│   ├── browse-doubts.html        # Search, filter & explore questions
│   ├── helpers.html              # Find peer mentors by subject & availability
│   ├── my-doubts.html            # Track personal posted & assigned doubts
│   ├── chat.html                 # Real-time discussion room with doubt context
│   ├── profile.html              # Profile settings, availability toggle & ratings
│   ├── css/
│   │   ├── style.css             # Design tokens, typography, navbar, buttons, modals
│   │   ├── dashboard.css         # Stats cards, filters, doubt cards, empty states
│   │   └── chat.css              # Message bubbles, composer, participants sidebar
│   └── js/
│       ├── api.js                # Centralized fetch wrapper & toast notifications
│       ├── auth.js               # JWT storage, navbar controller, session guard
│       ├── dashboard.js          # Role-based dashboard stats aggregator
│       ├── doubts.js             # Post, search, filter, and detail modals
│       ├── helpers.js            # Helper catalog & Request Help modal
│       ├── chat.js               # Socket.IO client, typing events & feedback modal
│       └── profile.js            # Profile updates, availability & review viewer
│
├── .env.example                  # Environment configuration example
├── .env                          # Local environment variables
├── package.json                  # Dependencies & npm scripts
└── README.md                     # Comprehensive documentation & viva guide
```

---

## ⚡ 4. Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- Optional: Local MongoDB or MongoDB Atlas URI (If not running, the application **automatically initializes an in-memory MongoDB server** with demo data so you can present without any database setup!)

### Steps to Run

1. **Navigate to the project directory:**
   ```bash
   cd DoubtConnect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Seed the database:**
   ```bash
   npm run seed
   ```
   *Note: If running in in-memory mode, seeding happens automatically on startup!*

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open in your browser:**
   ```text
   http://localhost:5000
   ```

---

## 🔑 5. Demo Credentials (For Evaluation & Viva)

On the **Login Page (`http://localhost:5000/login.html`)**, you will find **1-Click Demo Buttons** for instant evaluation! You can also use the credentials below:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Aarav Sharma | `student@lpu.in` | `Student@123` | 3rd Year B.Tech CSE (Has posted doubts in INT335 and CSE316) |
| **Peer Helper** | Priya Patel | `helper@lpu.in` | `Helper@123` | 4th Year B.Tech CSE (Teaching Design Thinking, OS, Networks; 4.9⭐) |
| **Peer Helper 2** | Rohan Verma | `rohan.helper@lpu.in` | `Helper@123` | 3rd Year B.Tech CSE (AI/ML) (Python, Data Structures; 4.8⭐) |
| **Student 2** | Ananya Iyer | `ananya.student@lpu.in` | `Student@123` | 2nd Year B.Tech CSE |

---

## 🔄 6. Complete End-to-End User Workflow

Follow these steps to demonstrate the full application during project viva:

1. **Landing & Overview**: Visit `http://localhost:5000` to show the design thinking problem statement and system workflow.
2. **Student Login**: Click "Log In" -> Click **"1-Click: Demo Student (Aarav)"**.
3. **Student Dashboard**: Point out the live stats (Total Doubts Posted, Pending, Resolved) and available online helpers.
4. **Post a Doubt**:
   - Navigate to **"Post Doubt"**.
   - Enter Title: *"How to formulate Point of View (POV) in INT335 CA2?"*
   - Subject: *Design Thinking*, Course Code: *INT335*, Topic: *Define Phase*.
   - Priority: *High*. Click **Publish Doubt**.
5. **Browse & Filter**: Visit **"Browse Doubts"**, type *"INT335"* or filter by *"Design Thinking"* to show instant client-side debounced search.
6. **Helper Matching**: Go to **"Find Helpers"**, view peer profiles with rating badges and availability dots. Click **"Request Help"** to send a direct request to Priya.
7. **Helper Experience (Incognito Window)**:
   - Open an incognito browser window and log in as **"Demo Helper (Priya)"**.
   - Check the **Incoming Help Requests** card on the Helper Dashboard.
   - Click **"Accept & Help"**.
8. **Real-Time Chat**:
   - Open the discussion in both windows side-by-side (`/chat.html?doubtId=...`).
   - Type messages in real-time. Notice the live message arrival, sender vs receiver bubbles, timestamps, and typing indicator powered by Socket.IO.
9. **Mark Resolved & 5-Star Feedback**:
   - In the student window, click **"Resolve & Rate Helper"**.
   - Pick 5 stars and enter a positive comment: *"Clear explanation of the POV formula!"*.
   - Submit the review.
10. **Updated Analytics**:
    - Notice the doubt status changes to **Resolved**.
    - Check the Helper Profile (`/profile.html`): Priya's total resolved count and ratings have automatically updated!

---

## 📡 7. API Reference

### Authentication (`/api/auth`)
- `POST /register`: Create new student or helper account with hashed password.
- `POST /login`: Verify credentials and issue signed JWT.
- `GET /me`: Fetch authenticated user profile.
- `PUT /profile`: Update name, year, availability, or subjects taught.

### Doubts (`/api/doubts`)
- `POST /`: Post a new academic doubt.
- `GET /`: Search and filter doubts by `q`, `subject`, `courseCode`, `status`, `priority`.
- `GET /:id`: Retrieve single doubt details with author and helper info.
- `GET /user/my-doubts`: Get all doubts posted by or assigned to current user.
- `PATCH /:id/status`: Update status (`Open`, `In-Progress`, `Resolved`).
- `DELETE /:id`: Remove a doubt (author only).

### Peer Helpers (`/api/helpers`)
- `GET /`: List all registered peer helpers with ratings and subjects.
- `GET /recommended/:doubtId`: Match helpers proficient in the doubt's subject.
- `GET /:id`: View helper profile and past student reviews.

### Help Requests (`/api/requests`)
- `POST /`: Student sends assistance request for a specific doubt.
- `GET /my-requests`: Fetch incoming (helper) or outgoing (student) requests.
- `PATCH /:id/respond`: Helper accepts or rejects the request.

### Real-Time Chat & Messages (`/api/messages`)
- `GET /:doubtId`: Fetch message history for a doubt discussion.
- `POST /`: Send message via REST endpoint (with Socket.IO room broadcast).

### Feedback & Ratings (`/api/feedback`)
- `POST /`: Submit 1-5 star rating and review for a resolved doubt.
- `GET /helper/:helperId`: Retrieve reviews received by a helper.

---

## 💡 8. Viva Q&A Guide for INT335

**Q1: How does this project reflect Design Thinking principles?**
> *Answer:* We applied the 5 stages of Design Thinking:
> 1. **Empathize**: Interviewed CSE peers who reported getting lost in class WhatsApp groups.
> 2. **Define**: Formulated the POV statement: "CSE students need a focused, peer-to-peer explanation channel because broadcast chat groups bury academic questions."
> 3. **Ideate**: Brainstormed direct peer matching, course-code tagging, and rating incentives.
> 4. **Prototype**: Developed this responsive full-stack platform with real-time Socket.IO chat.
> 5. **Test**: Tested with students using simulated CA questions; validated that 1-on-1 rooms provide higher focus and faster resolution.

**Q2: How does the real-time communication work?**
> *Answer:* When a student or helper enters a discussion, the client connects to Socket.IO and joins a dedicated room named `doubt_<doubtId>`. When any participant sends a message, it is broadcast only to participants of that room and simultaneously persisted in MongoDB for permanent message history.

**Q3: How are passwords and authentication secured?**
> *Answer:* Passwords are encrypted using `bcryptjs` with 10 salt rounds before saving to MongoDB. Authentication uses stateless JSON Web Tokens (JWT) signed with an HMAC-SHA256 secret key. Private API routes are protected by Express middleware verifying the `Bearer` token in the `Authorization` header.

---

## 👨‍🎓 Project Credits
- **Project**: DoubtConnect – Peer Doubt Resolution Platform
- **Course**: INT335 Design Thinking CA2
- **Institution**: Lovely Professional University (LPU), Punjab, India
- **Batch**: B.Tech Computer Science & Engineering
