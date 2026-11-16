# INT335 · Design Thinking — Checkpoint 5 (CP-5)
## Prototype Readiness & Test Plan (Week 10)

**Project ID**: P23 · Stuck at Question Three (Peer Doubt Resolution Outside the Classroom)  
**Session**: 2026–27  
**Department**: Full Stack Application Development, School of Computer Science & Engineering, LPU  

---

## 1. Prototype Evolution: From Paper Wireframes to Functional MVP

```
+---------------------------------------------------------------------------------------------------------+
|                                    PROTOTYPE FIDELITY PROGRESSION                                       |
+---------------------------------------------------------------------------------------------------------+
| STAGE 1: PAPER LO-FI SKETCHES           STAGE 2: WIREFRAME LAYOUTS         STAGE 3: FUNCTIONAL FULL-STACK|
| - 5 Index cards sketched in 45 mins.    - Responsive CSS grid & cards.     - Node.js + Express REST APIs |
| - Card 1: Course-tagged post form.      - Modern academic blue/white theme.- Socket.IO real-time engine  |
| - Card 2: Filterable doubt list.        - Debounced client-side search.    - MongoDB persistence & auth  |
| - Card 3: Helper profile card.          - Split chat with live indicators. - Star rating feedback modal  |
| - Card 4: 1-on-1 chat dialog.           - Modal popups for direct requests.- 1-Click demo logins for viva|
| - Card 5: 5-star rating popup.                                                                          |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Complete End-to-End User Flow (7 Consecutive Steps)

```
[ Step 1: Authentication ]
  Student logs in (via form or 1-Click Demo) -> JWT issued -> Personalized dashboard loaded
       │
       ▼
[ Step 2: Post Doubt ]
  Student specifies Title, Course Code (INT335), Subject, Topic, and Priority (High/Urgent)
       │
       ▼
[ Step 3: Catalog & Matching ]
  Doubt published to MongoDB -> Visible in Browse Doubts with course filters
       │
       ▼
[ Step 4: Helper Request & Acceptance ]
  Student discovers available helper -> Sends direct request -> Helper clicks "Accept & Help"
       │
       ▼
[ Step 5: Real-Time 1-on-1 Chat ]
  Both join `doubt_<id>` room via Socket.IO -> Exchange explanations with live typing indicators
       │
       ▼
[ Step 6: Mark as Resolved ]
  Student confirms concept is understood -> Clicks "Resolve & Rate Helper"
       │
       ▼
[ Step 7: Feedback & Reputation Loop ]
  Student submits 5-star score & review -> Helper's ratingAverage and solvedCount auto-recalculate
```

---

## 3. What the MVP is Specifically Testing (The Risky Assumptions)

This Minimum Viable Product (MVP) was engineered to test three core behavioral hypotheses:

1. **Information Structuring Hypothesis**:
   - *Question*: Will students take 60 seconds to enter Course Code, Subject, and Topic rather than dumping a blurry WhatsApp camera snapshot?
   - *Tested via*: Mandatory metadata dropdowns on `post-doubt.html`.
2. **Helper Motivation Hypothesis**:
   - *Question*: Will high-achieving seniors volunteer to explain complex concepts without financial payment if rewarded with public star ratings, feedback reviews, and resolved counters?
   - *Tested via*: `Feedback.js` aggregation hooks updating helper profiles in real time.
3. **1-on-1 Psychological Safety Hypothesis**:
   - *Question*: Does moving learners out of 100-person public groups into private Socket.IO rooms reduce hesitation and accelerate time-to-understanding?
   - *Tested via*: Dedicated chat room interface (`chat.html`) with doubt details pinned on the sidebar.

---

## 4. Test Plan & Protocol

### Rules for the Testing Team
- **Stay Silent**: Hand over the device and say nothing.
- **Do Not Assist**: Never tell the user where to click or how it works. If they hesitate, note the hesitation as a design finding.
- **Think-Aloud Protocol**: Encourage users to voice what they expect to happen before clicking any element.

### Neutral Test Tasks Given to Participants

| Task # | Task Description Given to Participant | Success Criteria |
| :---: | :--- | :--- |
| **Task 1** | *"You are preparing for your INT335 CA test and got stuck on deriving a POV statement. Post this doubt so others can find it."* | User completes form on `post-doubt.html` within 90 seconds without asking for guidance. |
| **Task 2** | *"Find a peer helper on campus who can explain Operating Systems (CSE316) and is currently available."* | User navigates to `helpers.html`, filters by Operating Systems, and identifies an available helper. |
| **Task 3** | *"Send a direct help request to that helper for your open doubt."* | User clicks "Request Help", selects their open doubt from the dropdown, and submits note. |
| **Task 4** | *"As the helper, accept the request and send a message explaining the concept."* | Helper accepts request from dashboard, enters discussion room, and sends message. |
| **Task 5** | *"Mark the doubt as resolved and rate the helper 5 stars with a brief review."* | Student clicks "Resolve & Rate Helper", interacts with the star picker, and submits review. |

---

## 5. Roster of 5 Real Test Users Lined Up for Testing

| Participant ID | Cohort | Hostel / Residence | Testing Schedule | Target Test Role |
| :---: | :--- | :--- | :--- | :--- |
| **User T1** | 2nd Year B.Tech CSE | BH-1 | Week 11 · Tuesday 4:00 PM | Learner / Stuck Student |
| **User T2** | 3rd Year B.Tech CSE | BH-4 | Week 11 · Tuesday 5:30 PM | Learner / Stuck Student |
| **User T3** | 4th Year B.Tech CSE | GH-2 | Week 11 · Wednesday 6:00 PM | Peer Helper / Mentor |
| **User T4** | 3rd Year B.Tech CSE (AI/ML) | BH-1 | Week 11 · Thursday 7:00 PM | Peer Helper / Mentor |
| **User T5** | 2nd Year B.Tech CSE | Day Scholar (Phagwara) | Week 11 · Friday 3:30 PM | Learner / Remote Student |
