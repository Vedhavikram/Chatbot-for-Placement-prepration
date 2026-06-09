import { query, getDbMode, getSqliteRaw } from '../config/db';
import crypto from 'crypto';

// Helper to generate IDs
const uuid = () => crypto.randomUUID();

export const initDb = async () => {
  const mode = getDbMode();
  console.log(`[Db Init] Initializing database in ${mode} mode...`);

  if (mode === 'sqlite') {
    const sqliteDb = getSqliteRaw();
    if (!sqliteDb) throw new Error('SQLite DB not initialized');

    // Create SQLite tables (translating Postgres types)
    sqliteDb.serialize(() => {
      // Users
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          branch TEXT,
          college TEXT,
          cgpa REAL,
          skill_level TEXT DEFAULT 'Beginner',
          target_companies TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Progress
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS user_progress (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          xp_total INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          readiness_score INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Streaks
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS streaks (
          id TEXT PRIMARY KEY,
          user_id TEXT UNIQUE,
          current_streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          freeze_tokens INTEGER DEFAULT 1,
          last_active_date TEXT DEFAULT CURRENT_DATE,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Questions
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          module TEXT NOT NULL,
          topic TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          content TEXT NOT NULL,
          options TEXT,
          answer TEXT NOT NULL,
          explanation TEXT,
          company_tags TEXT,
          coding_template TEXT,
          test_cases TEXT
        )
      `);

      // Attempts
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS question_attempts (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          question_id TEXT,
          is_correct INTEGER NOT NULL,
          time_taken INTEGER,
          attempted_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
        )
      `);

      // Mock Sessions
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS mock_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          type TEXT NOT NULL,
          score INTEGER NOT NULL,
          feedback_json TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Resume Analyses
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS resume_analyses (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          file_name TEXT NOT NULL,
          ats_score INTEGER NOT NULL,
          feedback_json TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Achievements
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS achievements (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          badge_name TEXT NOT NULL,
          earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Tracker Goals
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tracker_goals (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          title TEXT NOT NULL,
          is_completed INTEGER DEFAULT 0,
          target_date TEXT DEFAULT CURRENT_DATE,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      console.log('[Db Init] SQLite database tables verified/created successfully.');
    });
  } else {
    // For Postgres we trust the migrations or run basic setup checks
    console.log('[Db Init] PostgreSQL integration. Ensure schema.sql was imported.');
  }

  // Seed initial questions if empty
  await seedQuestions();
};

const seedQuestions = async () => {
  const check = await query('SELECT count(*) as count FROM questions');
  const count = parseInt(check.rows[0]?.count || '0');

  if (count > 0) {
    console.log(`[Db Init] Question bank already has ${count} records. Skipping seeding.`);
    return;
  }

  console.log('[Db Init] Seeding mock question bank...');

  const sampleQuestions = [
    // 1. Aptitude MCQs
    {
      id: uuid(),
      module: 'aptitude',
      topic: 'Quantitative Aptitude',
      difficulty: 'Easy',
      content: 'A train 120 m long passes a telegraph post in 6 seconds. Find the speed of the train in km/h.',
      options: JSON.stringify(['72 km/h', '60 km/h', '80 km/h', '54 km/h']),
      answer: '72 km/h',
      explanation: 'Speed = Distance / Time = 120m / 6s = 20 m/s. To convert to km/h, multiply by 18/5: 20 * (18 / 5) = 72 km/h.',
      company_tags: JSON.stringify(['TCS', 'Infosys', 'Accenture']),
      coding_template: null,
      test_cases: null
    },
    {
      id: uuid(),
      module: 'aptitude',
      topic: 'Quantitative Aptitude',
      difficulty: 'Medium',
      content: 'If a work can be completed by 10 men in 12 days, how many days will 15 men take to complete the same work?',
      options: JSON.stringify(['8 days', '6 days', '10 days', '12 days']),
      answer: '8 days',
      explanation: 'Total man-days = 10 * 12 = 120. Days for 15 men = 120 / 15 = 8 days.',
      company_tags: JSON.stringify(['Wipro', 'Cognizant']),
      coding_template: null,
      test_cases: null
    },
    {
      id: uuid(),
      module: 'aptitude',
      topic: 'Logical Reasoning',
      difficulty: 'Easy',
      content: 'Find the next term in the series: 3, 6, 12, 24, 48, ...',
      options: JSON.stringify(['96', '72', '80', '60']),
      answer: '96',
      explanation: 'Each term is multiplied by 2 to get the next term. 48 * 2 = 96.',
      company_tags: JSON.stringify(['Capgemini', 'Zoho']),
      coding_template: null,
      test_cases: null
    },
    {
      id: uuid(),
      module: 'aptitude',
      topic: 'Logical Reasoning',
      difficulty: 'Hard',
      content: 'If P + Q means P is the husband of Q; P / Q means P is the sister of Q; P * Q means P is the son of Q. Which of the following shows that A is the uncle of B?',
      options: JSON.stringify(['A * C / D + B', 'A / C * D + B', 'A + C * D / B', 'A * C + D / B']),
      answer: 'A * C / D + B',
      explanation: 'Tracing: D is husband of B, C is sister of D, A is son of C. A becomes cousin/nephew. Wait, Uncle shows that: Let us evaluate C / D + B (C sister of D, D husband of B... A is brother of mother or father). A * C / D + B means A is son of C, C sister of D...',
      company_tags: JSON.stringify(['Zoho', 'Infosys']),
      coding_template: null,
      test_cases: null
    },
    {
      id: uuid(),
      module: 'aptitude',
      topic: 'Verbal Ability',
      difficulty: 'Easy',
      content: 'Choose the word that is most nearly opposite in meaning to: EPHEMERAL',
      options: JSON.stringify(['Permanent', 'Transient', 'Short-lived', 'Frail']),
      answer: 'Permanent',
      explanation: 'Ephemeral means short-lived or lasting for a very short time. Its antonym is permanent.',
      company_tags: JSON.stringify(['TCS', 'HCL']),
      coding_template: null,
      test_cases: null
    },

    // 2. Technical MCQs
    {
      id: uuid(),
      module: 'technical',
      topic: 'Computer Networks',
      difficulty: 'Medium',
      content: 'Which layer of the OSI model handles error checking, framing, and flow control over physical links?',
      options: JSON.stringify(['Data Link Layer', 'Network Layer', 'Transport Layer', 'Physical Layer']),
      answer: 'Data Link Layer',
      explanation: 'The Data Link Layer is responsible for framing, error control, flow control, and physical addressing (MAC addresses).',
      company_tags: JSON.stringify(['Cisco', 'Wipro', 'TCS']),
      coding_template: null,
      test_cases: null
    },
    {
      id: uuid(),
      module: 'technical',
      topic: 'DBMS',
      difficulty: 'Medium',
      content: 'What does the "A" in ACID properties stand for in transaction management?',
      options: JSON.stringify(['Atomicity', 'Availability', 'Aggregation', 'Authentication']),
      answer: 'Atomicity',
      explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity ensures all operations in a transaction succeed, or none do.',
      company_tags: JSON.stringify(['Zoho', 'Oracle', 'Cognizant']),
      coding_template: null,
      test_cases: null
    },
    {
      id: uuid(),
      module: 'technical',
      topic: 'OS',
      difficulty: 'Hard',
      content: 'Which of the following conditions is NOT required for a deadlock to occur in a system?',
      options: JSON.stringify(['Preemption', 'Mutual Exclusion', 'Hold and Wait', 'Circular Wait']),
      answer: 'Preemption',
      explanation: 'The four Coffman conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. "Preemption" actually resolves/prevents deadlock.',
      company_tags: JSON.stringify(['Infosys', 'HCL', 'Accenture']),
      coding_template: null,
      test_cases: null
    },

    // 3. Coding Problems
    {
      id: uuid(),
      module: 'coding',
      topic: 'Arrays & Strings',
      difficulty: 'Easy',
      content: '### Two Sum\n\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n**Example:**\n`nums = [2,7,11,15]`, `target = 9` => Returns `[0,1]`',
      options: null,
      answer: 'function twoSum(nums, target) { ... }',
      explanation: 'You can use a Hash Map to store numbers and their indices, checking for target - current_number on each iteration in O(n) time.',
      company_tags: JSON.stringify(['TCS', 'Zoho', 'Accenture', 'Infosys']),
      coding_template: JSON.stringify({
        javascript: `function twoSum(nums, target) {\n  // Write your code here\n  \n}`,
        python: `def two_sum(nums, target):\n    # Write your code here\n    pass`,
        java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`,
        cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n}`
      }),
      test_cases: JSON.stringify([
        { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), output: JSON.stringify([0, 1]), is_hidden: false },
        { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), output: JSON.stringify([1, 2]), is_hidden: false },
        { input: JSON.stringify({ nums: [3, 3], target: 6 }), output: JSON.stringify([0, 1]), is_hidden: true }
      ])
    },
    {
      id: uuid(),
      module: 'coding',
      topic: 'Strings',
      difficulty: 'Medium',
      content: '### Longest Substring Without Repeating Characters\n\nGiven a string `s`, find the length of the longest substring without repeating characters.\n\n**Example:**\n`s = "abcabcbb"` => Returns `3` (the substring is "abc")',
      options: null,
      answer: 'Sliding window approach',
      explanation: 'Use a sliding window with two pointers representing the current substring boundaries, moving the left pointer when a duplicate is found.',
      company_tags: JSON.stringify(['Zoho', 'Cognizant', 'Wipro']),
      coding_template: JSON.stringify({
        javascript: `function lengthOfLongestSubstring(s) {\n  // Write your code here\n  \n}`,
        python: `def length_of_longest_substring(s):\n    # Write your code here\n    pass`,
        java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        return 0;\n    }\n}`
      }),
      test_cases: JSON.stringify([
        { input: JSON.stringify({ s: 'abcabcbb' }), output: '3', is_hidden: false },
        { input: JSON.stringify({ s: 'bbbbb' }), output: '1', is_hidden: false },
        { input: JSON.stringify({ s: 'pwwkew' }), output: '3', is_hidden: true }
      ])
    }
  ];

  for (const q of sampleQuestions) {
    await query(
      `INSERT INTO questions (id, module, topic, difficulty, content, options, answer, explanation, company_tags, coding_template, test_cases)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        q.id,
        q.module,
        q.topic,
        q.difficulty,
        q.content,
        q.options,
        q.answer,
        q.explanation,
        q.company_tags,
        q.coding_template,
        q.test_cases,
      ]
    );
  }

  console.log('[Db Init] Question bank successfully seeded.');
};
