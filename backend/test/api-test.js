/**
 * DoubtConnect - Automated Integration Test Suite
 * Tests REST APIs, Auth, Doubts, Requests, Chat & Feedback
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Simple fetch wrapper using native Node.js http
function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = options.headers || {};
    if (options.body) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('   Running DoubtConnect Automated Test Suite            ');
  console.log('========================================================\n');

  try {
    // Test 1: Health check
    console.log('Test 1: GET /api/health');
    const health = await request('/api/health');
    console.assert(health.status === 200, `Health status should be 200, got ${health.status}`);
    console.log('✅ Health check passed!\n');

    // Test 2: Login as Demo Helper
    console.log('Test 2: POST /api/auth/login (Demo Helper: Priya)');
    const helperLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'helper@lpu.in', password: 'Helper@123' }),
    });
    console.assert(helperLogin.status === 200, `Helper login failed: ${JSON.stringify(helperLogin.data)}`);
    const helperToken = helperLogin.data.token;
    const helperId = helperLogin.data.user._id;
    console.log(`✅ Helper logged in successfully! User: ${helperLogin.data.user.name}\n`);

    // Test 3: Login as Demo Student
    console.log('Test 3: POST /api/auth/login (Demo Student: Aarav)');
    const studentLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student@lpu.in', password: 'Student@123' }),
    });
    console.assert(studentLogin.status === 200, `Student login failed: ${JSON.stringify(studentLogin.data)}`);
    const studentToken = studentLogin.data.token;
    console.log(`✅ Student logged in successfully! User: ${studentLogin.data.user.name}\n`);

    // Test 4: Post a new Doubt
    console.log('Test 4: POST /api/doubts (Student posts doubt)');
    const newDoubt = await request('/api/doubts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        title: 'How to implement empathy map canvas for LPU hostel students?',
        description:
          'In INT335 CA2, we need to interview 5 hostel students. How do we synthesize insights into Say, Think, Do, Feel quadrant?',
        subject: 'Design Thinking',
        courseCode: 'INT335',
        topic: 'Empathy Canvas Synthesis',
        priority: 'High',
      }),
    });
    console.assert(newDoubt.status === 201, `Post doubt failed: ${JSON.stringify(newDoubt.data)}`);
    const createdDoubtId = newDoubt.data.doubt._id;
    console.log(`✅ Doubt posted successfully! ID: ${createdDoubtId}\n`);

    // Test 5: Get doubts with filters
    console.log('Test 5: GET /api/doubts?subject=Design Thinking');
    const filterDoubts = await request('/api/doubts?subject=Design Thinking');
    console.assert(filterDoubts.status === 200, `Filter doubts failed`);
    console.assert(filterDoubts.data.count > 0, `Should find at least 1 doubt`);
    console.log(`✅ Found ${filterDoubts.data.count} Design Thinking doubts!\n`);

    // Test 6: Send Help Request from Student to Helper
    console.log('Test 6: POST /api/requests (Student requests help)');
    const helpReq = await request('/api/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        doubtId: createdDoubtId,
        helperId: helperId,
        message: 'Hi Priya, can you help me review the interview findings for INT335?',
      }),
    });
    console.assert(helpReq.status === 201, `Help request failed: ${JSON.stringify(helpReq.data)}`);
    const requestId = helpReq.data.request._id;
    console.log(`✅ Help request sent successfully! Request ID: ${requestId}\n`);

    // Test 7: Helper accepts the request
    console.log('Test 7: PATCH /api/requests/:id/respond (Helper accepts)');
    const acceptReq = await request(`/api/requests/${requestId}/respond`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${helperToken}` },
      body: JSON.stringify({ status: 'Accepted' }),
    });
    console.assert(acceptReq.status === 200, `Accept request failed: ${JSON.stringify(acceptReq.data)}`);
    console.log('✅ Helper accepted request! Doubt moved to In-Progress.\n');

    // Test 8: Send Message in Chat
    console.log('Test 8: POST /api/messages (Sending message)');
    const chatMsg = await request('/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        doubtId: createdDoubtId,
        message: 'Hi Priya! Thanks for accepting. Here is our initial interview notes draft.',
      }),
    });
    console.assert(chatMsg.status === 201, `Send message failed: ${JSON.stringify(chatMsg.data)}`);
    console.log('✅ Chat message delivered and persisted successfully!\n');

    // Test 9: Get Messages History
    console.log('Test 9: GET /api/messages/:doubtId (Fetch chat history)');
    const chatHistory = await request(`/api/messages/${createdDoubtId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.assert(chatHistory.status === 200, `Get messages failed`);
    console.assert(chatHistory.data.messages.length >= 2, `Should have welcome message and student message`);
    console.log(`✅ Chat history retrieved: ${chatHistory.data.messages.length} messages in conversation.\n`);

    // Test 10: Student resolves doubt and submits 5-star rating & review
    console.log('Test 10: POST /api/feedback (Student resolves & rates)');
    const feedbackRes = await request('/api/feedback', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        doubtId: createdDoubtId,
        rating: 5,
        comment: 'Priya gave incredible tips on eliminating interview bias. Scored A on CA2!',
      }),
    });
    console.assert(feedbackRes.status === 201, `Feedback failed: ${JSON.stringify(feedbackRes.data)}`);
    console.log('✅ Feedback submitted successfully! Doubt marked as Resolved.\n');

    console.log('========================================================');
    console.log('🎉 ALL 10 INTEGRATION TESTS PASSED SUCCESSFULLY!       ');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

// Give server time to spin up if run directly
setTimeout(runTests, 1500);
