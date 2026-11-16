const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Doubt = require('../models/Doubt');
const HelpRequest = require('../models/HelpRequest');
const Message = require('../models/Message');
const Feedback = require('../models/Feedback');

dotenv.config();

const seedData = async () => {
  console.log('[Seed] Clearing existing collections...');
  await User.deleteMany({});
  await Doubt.deleteMany({});
  await HelpRequest.deleteMany({});
  await Message.deleteMany({});
  await Feedback.deleteMany({});

  console.log('[Seed] Creating demo users...');
  const salt = await bcrypt.genSalt(10);
  const studentPasswordHash = await bcrypt.hash('Student@123', salt);
  const helperPasswordHash = await bcrypt.hash('Helper@123', salt);

  // 1. Demo Student
  const demoStudent = await User.create({
    name: 'Aarav Sharma',
    studentId: '12204561',
    email: 'student@lpu.in',
    passwordHash: studentPasswordHash,
    course: 'B.Tech CSE',
    year: 3,
    role: 'student',
    bio: 'Third-year CSE student exploring full-stack engineering, networks, and design thinking.',
    availability: 'Available',
  });

  // 2. Demo Helper
  const demoHelper = await User.create({
    name: 'Priya Patel',
    studentId: '12108922',
    email: 'helper@lpu.in',
    passwordHash: helperPasswordHash,
    course: 'B.Tech CSE',
    year: 4,
    role: 'helper',
    subjects: ['Design Thinking', 'Operating Systems', 'Computer Networks'],
    bio: 'Final year CSE student. Mentored 40+ juniors in OS, Networks, and INT335 Design Thinking CA projects.',
    availability: 'Available',
    ratingAverage: 4.9,
    ratingCount: 14,
  });

  // 3. Additional Peer Helpers
  const helper2 = await User.create({
    name: 'Rohan Verma',
    studentId: '12209931',
    email: 'rohan.helper@lpu.in',
    passwordHash: helperPasswordHash,
    course: 'B.Tech CSE (AI/ML)',
    year: 3,
    role: 'helper',
    subjects: ['Python Programming', 'Database Systems', 'Data Structures'],
    bio: 'Competitive programmer and Python enthusiast. Happy to help with syntax, logic, and queries.',
    availability: 'Available',
    ratingAverage: 4.8,
    ratingCount: 9,
  });

  const helper3 = await User.create({
    name: 'Sneha Reddy',
    studentId: '12114402',
    email: 'sneha.helper@lpu.in',
    passwordHash: helperPasswordHash,
    course: 'B.Tech CSE',
    year: 4,
    role: 'helper',
    subjects: ['Design Thinking', 'Web Development', 'Software Engineering'],
    bio: 'UI/UX enthusiast and frontend specialist. Can assist in wireframing, ideation, and user interviews.',
    availability: 'Busy',
    ratingAverage: 5.0,
    ratingCount: 18,
  });

  const helper4 = await User.create({
    name: 'Vikram Singh',
    studentId: '12201178',
    email: 'vikram.helper@lpu.in',
    passwordHash: helperPasswordHash,
    course: 'B.Tech CSE (Cyber Security)',
    year: 3,
    role: 'helper',
    subjects: ['Computer Networks', 'Operating Systems', 'Cyber Security'],
    bio: 'Focused on protocols, packet routing, and POSIX multithreading concepts.',
    availability: 'Available',
    ratingAverage: 4.7,
    ratingCount: 7,
  });

  // 4. Additional Student
  const student2 = await User.create({
    name: 'Ananya Iyer',
    studentId: '12301142',
    email: 'ananya.student@lpu.in',
    passwordHash: studentPasswordHash,
    course: 'B.Tech CSE',
    year: 2,
    role: 'student',
    bio: 'Second year student eager to master core subjects.',
    availability: 'Available',
  });

  console.log('[Seed] Creating realistic academic doubts...');

  // Doubt 1: In-Progress between demoStudent and demoHelper
  const doubt1 = await Doubt.create({
    title: 'How to structure Empathy Map & Define Stage for INT335 CA2 Project?',
    description:
      'We are working on our Design Thinking CA2 peer doubt platform. How do we clearly distinguish between "Says, Thinks, Does, Feels" in the empathy canvas for college students, and how does that formulate our Point of View (POV) statement?',
    subject: 'Design Thinking',
    courseCode: 'INT335',
    topic: 'Empathy Mapping & POV Definition',
    priority: 'High',
    postedBy: demoStudent._id,
    assignedHelper: demoHelper._id,
    status: 'In-Progress',
  });

  // Help request for Doubt 1
  await HelpRequest.create({
    doubtId: doubt1._id,
    studentId: demoStudent._id,
    helperId: demoHelper._id,
    message: 'Hi Priya, I saw your high rating in INT335. Could you review our empathy map structure?',
    requestStatus: 'Accepted',
  });

  // Chat messages for Doubt 1
  await Message.create({
    doubtId: doubt1._id,
    senderId: demoStudent._id,
    receiverId: demoHelper._id,
    message: 'Hi Priya! Could you help us understand how to derive the POV statement from the empathy map?',
  });

  await Message.create({
    doubtId: doubt1._id,
    senderId: demoHelper._id,
    receiverId: demoStudent._id,
    message:
      'Hey Aarav! Certainly! Start by identifying the user ("LPU B.Tech student"), their unmet need ("quick academic peer explanations without getting buried in WhatsApp"), and the key insight ("students hesitate to approach faculty for minor syntax doubts").',
  });

  await Message.create({
    doubtId: doubt1._id,
    senderId: demoStudent._id,
    receiverId: demoHelper._id,
    message: 'That makes total sense! Should we also create user personas before making the prototype?',
  });

  // Doubt 2: Resolved between demoStudent and demoHelper with Feedback
  const doubt2 = await Doubt.create({
    title: "Banker's Algorithm Safe State Calculation Doubt",
    description:
      'In CSE316 Operating Systems, given Allocation and Max matrix with 5 processes and 3 resource types, how do we correctly compute Need = Max - Allocation and verify if Available >= Need during each pass?',
    subject: 'Operating Systems',
    courseCode: 'CSE316',
    topic: "Deadlock Avoidance - Banker's Algorithm",
    priority: 'Urgent',
    postedBy: demoStudent._id,
    assignedHelper: demoHelper._id,
    status: 'Resolved',
    resolvedAt: new Date(Date.now() - 3600000 * 24),
  });

  await HelpRequest.create({
    doubtId: doubt2._id,
    studentId: demoStudent._id,
    helperId: demoHelper._id,
    message: 'Need urgent help verifying the safe sequence for my OS CA test.',
    requestStatus: 'Completed',
  });

  await Feedback.create({
    doubtId: doubt2._id,
    studentId: demoStudent._id,
    helperId: demoHelper._id,
    rating: 5,
    comment:
      'Priya gave an exceptional explanation with step-by-step matrix subtractions. Scored full marks on the CA test!',
  });

  // Doubt 3: Open Doubt
  await Doubt.create({
    title: 'Subnetting & VLSM calculation for Class C network with 4 departments',
    description:
      'I have network 192.168.10.0/24. Department A needs 60 hosts, Dept B needs 28 hosts, Dept C needs 14 hosts. What are the subnet masks and usable host ranges?',
    subject: 'Computer Networks',
    courseCode: 'CSE304',
    topic: 'VLSM & Variable Length Subnet Masks',
    priority: 'Medium',
    postedBy: student2._id,
    status: 'Open',
  });

  // Doubt 4: Open Doubt
  await Doubt.create({
    title: 'Difference between List Comprehensions and Generator Expressions in memory',
    description:
      'When processing 1 million records in Python, why does a generator expression consume negligible RAM compared to a list comprehension? How does lazy evaluation work internally with `sys.getsizeof`?',
    subject: 'Python Programming',
    courseCode: 'INT213',
    topic: 'Memory Profiling & Generators',
    priority: 'Low',
    postedBy: demoStudent._id,
    status: 'Open',
  });

  // Doubt 5: Open Doubt
  await Doubt.create({
    title: 'How to conduct effective User Testing interviews in Design Thinking?',
    description:
      'During the test phase of INT335, what questions should we ask users while they interact with our DoubtConnect interactive wireframe without introducing interviewer bias?',
    subject: 'Design Thinking',
    courseCode: 'INT335',
    topic: 'User Testing & Feedback Grid',
    priority: 'High',
    postedBy: student2._id,
    status: 'Open',
  });

  // Doubt 6: Open Doubt
  await Doubt.create({
    title: 'TCP 3-Way Handshake SYN Flooding and SYN Cookies Defense',
    description:
      'In CSE304, why does the server allocate TCB buffer space upon receiving SYN, and how do SYN cookies defer resource allocation until ACK is received?',
    subject: 'Computer Networks',
    courseCode: 'CSE304',
    topic: 'TCP Protocol & Security',
    priority: 'Medium',
    postedBy: demoStudent._id,
    status: 'Open',
  });

  console.log('[Seed] Database seeded successfully with demo accounts and academic doubts!');
};

const autoSeedIfEmpty = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[Seed] Database is empty. Seeding initial academic data...');
    await seedData();
  }
};

// If run directly: node backend/seed/seedData.js
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  (async () => {
    try {
      await connectDB();
      await seedData();
      console.log('[Seed] Done. Press Ctrl+C or exiting.');
      await disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error('[Seed] Error during seeding:', e);
      process.exit(1);
    }
  })();
}

module.exports = { seedData, autoSeedIfEmpty };
