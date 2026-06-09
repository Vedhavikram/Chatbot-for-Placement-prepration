import { getAIClient, hasAI } from '../config/ai';

// ─── Mock responses for all AI tasks ───────────────────────────────────────

const mockRoadmap = (profile: any) => ({
  summary: `Personalized 90-day placement roadmap for ${profile.name || 'Student'} targeting ${profile.targets || 'top companies'}.`,
  phase30: {
    title: '30-Day Foundation Sprint',
    tasks: [
      'Master core DSA: Arrays, Strings, Linked Lists (LeetCode Easy)',
      'Complete Quantitative Aptitude module — 10 questions/day',
      'Set up GitHub portfolio and polish LinkedIn profile',
      'Practice verbal ability: 15 min reading comprehension daily',
    ],
  },
  phase60: {
    title: '60-Day Intermediate Mastery',
    tasks: [
      'Deep dive into Trees, Graphs, Dynamic Programming (LeetCode Medium)',
      'DBMS, OS, Computer Networks MCQ sprints (50 questions each)',
      'Complete 3 mock technical interviews in PlaceMentor',
      'Build one full-stack side project and document it well',
    ],
  },
  phase90: {
    title: '90-Day Placement-Ready Polish',
    tasks: [
      'LeetCode Hard & company-specific problem sets',
      'HR interview mastery: STAR method for 20+ behavioral questions',
      'Group Discussion practice: 2 sessions per week',
      'Apply to companies: target 5 applications per week with tailored resumes',
    ],
  },
  dailyGoals: [
    '2 aptitude questions (morning)',
    '1 coding problem (afternoon)',
    '20-min technical MCQ sprint (evening)',
    '10-min HR mock answer practice (night)',
  ],
  skillGaps: profile.branch === 'CSE'
    ? ['Advanced DSA', 'System Design basics', 'Communication skills']
    : ['Programming fundamentals', 'CS basics (OS, Networks)', 'Problem-solving speed'],
});

const mockTechAnswer = (question: string, answer: string, round: number) => ({
  followUp: round < 3
    ? `Great explanation! Let me dig deeper: ${[
      'Can you walk me through the time complexity of your approach?',
      'What would happen if the input size were 10x larger?',
      'Can you think of an edge case that might break your solution?',
      'How would you optimize this if memory was a constraint?',
      'Can you code this from scratch right now?',
    ][Math.floor(Math.random() * 5)]}`
    : 'Excellent! Thank you for your thorough answer. You have done really well in this session!',
  evaluation: {
    score: Math.floor(Math.random() * 30) + 65,
    clarity: Math.floor(Math.random() * 3) + 7,
    accuracy: Math.floor(Math.random() * 3) + 7,
    depth: Math.floor(Math.random() * 3) + 6,
    comment: answer.length > 50
      ? 'Good depth in your explanation. Try to structure your answer more clearly with examples.'
      : 'Your answer was brief. Elaborate more with real-world examples and code snippets when possible.',
  },
  finished: round >= 4,
});

const mockHRAnswer = (question: string, answer: string) => {
  const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'literally'];
  const foundFillers = fillerWords.filter(w => answer.toLowerCase().includes(w));
  return {
    nextQuestion: [
      'Tell me about a time you faced a major challenge and how you overcame it.',
      'Where do you see yourself in 5 years?',
      'Why do you want to join our company specifically?',
      'Describe a situation where you had to work with a difficult team member.',
      'What is your biggest weakness and how are you addressing it?',
    ][Math.floor(Math.random() * 5)],
    feedback: {
      score: Math.floor(Math.random() * 25) + 70,
      starMethod: answer.length > 100,
      fillerWords: foundFillers,
      sentimentScore: answer.includes('succeed') || answer.includes('achieve') ? 'Positive' : 'Neutral',
      suggestions: foundFillers.length > 0
        ? `Avoid filler words: "${foundFillers.join(', ')}". Pause and think before speaking.`
        : 'Great fluency! Try to add a concrete quantifiable outcome to your STAR story.',
    },
  };
};

const mockGDFeedback = (topic: string, points: string[]) => ({
  overallScore: Math.floor(Math.random() * 20) + 72,
  categories: {
    contentQuality: Math.floor(Math.random() * 3) + 7,
    communication: Math.floor(Math.random() * 3) + 7,
    leadership: Math.floor(Math.random() * 3) + 6,
    teamwork: Math.floor(Math.random() * 3) + 7,
    factUsage: Math.floor(Math.random() * 3) + 6,
  },
  summary: `You contributed ${points.length} meaningful points to the discussion on "${topic}". Your arguments showed logical structure. Work on interrupting less and building on others' points more.`,
  improvements: [
    'Use data and statistics to back your arguments',
    'Practice active listening — acknowledge others\' points before making yours',
    'Work on smoother transitions: "Building on what X said..."',
  ],
  strongPoints: [
    'Confident delivery and clear articulation',
    'Good time management — didn\'t monopolize the discussion',
  ],
});

const mockResumeAnalysis = (fileName: string) => {
  const score = Math.floor(Math.random() * 25) + 65;
  return {
    atsScore: score,
    grade: score >= 85 ? 'A' : score >= 70 ? 'B' : 'C',
    sections: {
      contactInfo: { present: true, score: 95, issues: [] },
      summary: { present: true, score: 72, issues: ['Too generic. Tailor to target role.'] },
      skills: { present: true, score: 80, issues: ['Add proficiency levels (Beginner/Intermediate/Expert)'] },
      experience: { present: true, score: 68, issues: ['Use action verbs', 'Add quantifiable metrics (e.g., "Reduced load time by 40%")'] },
      education: { present: true, score: 90, issues: [] },
      projects: { present: true, score: 75, issues: ['Include GitHub/live demo links', 'Describe tech stack used'] },
    },
    keywords: {
      found: ['React', 'JavaScript', 'Python', 'Git', 'REST API'],
      missing: ['TypeScript', 'Docker', 'CI/CD', 'Agile', 'System Design'],
    },
    improvements: [
      'Add LinkedIn URL and GitHub profile to contact section',
      'Quantify your achievements with numbers and percentages',
      'Use bullet points starting with strong action verbs (Built, Designed, Optimized)',
      'Tailor keywords to match the JD for each company you apply to',
      'Keep to 1 page for fresher resume — currently appears padded',
    ],
    rewrittenSummary: `Motivated Computer Science final-year student with hands-on experience in full-stack development using React and Node.js. Built ${Math.floor(Math.random() * 3) + 2} production-grade projects with real users. Seeking software engineering roles at innovative companies to contribute algorithmic and system-building skills.`,
  };
};

const mockCodeReview = (code: string, language: string) => ({
  quality: Math.floor(Math.random() * 20) + 70,
  complexity: {
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'][Math.floor(Math.random() * 4)],
    space: ['O(1)', 'O(n)', 'O(log n)'][Math.floor(Math.random() * 3)],
  },
  issues: [
    { severity: 'warning', message: 'Consider adding input validation for edge cases' },
    { severity: 'info', message: 'Extract repeated logic into a helper function for readability' },
    code.includes('for') && code.includes('for')
      ? { severity: 'error', message: 'Detected nested loops — check if this can be optimized with a Hash Map' }
      : { severity: 'info', message: 'Code structure looks clean' },
  ].filter(Boolean),
  suggestions: [
    'Add JSDoc/docstring comments for function parameters',
    'Handle null/undefined inputs gracefully',
    `Consider using ${language === 'javascript' ? 'Map' : 'dict'} for O(1) lookups instead of nested iteration`,
  ],
  bestPractices: code.length < 100
    ? 'Solution is concise. Ensure it handles all edge cases.'
    : 'Well-structured solution. Consider modularizing into smaller functions.',
});

// ─── Public AI Service Functions ────────────────────────────────────────────

export const generateRoadmap = async (profile: any): Promise<any> => {
  const client = getAIClient();
  if (!client) return mockRoadmap(profile);

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Generate a personalized 90-day placement preparation roadmap in JSON format for a student with this profile: ${JSON.stringify(profile)}. Include phase30, phase60, phase90 with tasks arrays, dailyGoals array, and skillGaps array.`,
      }],
    });
    return JSON.parse((message.content[0] as any).text);
  } catch {
    return mockRoadmap(profile);
  }
};

export const evaluateTechAnswer = async (question: string, answer: string, round: number): Promise<any> => {
  const client = getAIClient();
  if (!client) return mockTechAnswer(question, answer, round);

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Technical interview evaluation. Question: "${question}". Student answer: "${answer}". Round number: ${round}/5. Respond with JSON: { followUp, evaluation: { score, clarity, accuracy, depth, comment }, finished }`,
      }],
    });
    return JSON.parse((message.content[0] as any).text);
  } catch {
    return mockTechAnswer(question, answer, round);
  }
};

export const evaluateHRAnswer = async (question: string, answer: string): Promise<any> => {
  const client = getAIClient();
  if (!client) return mockHRAnswer(question, answer);

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `HR interview evaluation. Question: "${question}". Student answer: "${answer}". Respond with JSON: { nextQuestion, feedback: { score, starMethod, fillerWords, sentimentScore, suggestions } }`,
      }],
    });
    return JSON.parse((message.content[0] as any).text);
  } catch {
    return mockHRAnswer(question, answer);
  }
};

export const evaluateGDPerformance = async (topic: string, points: string[]): Promise<any> => {
  const client = getAIClient();
  if (!client) return mockGDFeedback(topic, points);

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Group Discussion evaluation. Topic: "${topic}". Student's points: ${JSON.stringify(points)}. Return JSON: { overallScore, categories: { contentQuality, communication, leadership, teamwork, factUsage }, summary, improvements, strongPoints }`,
      }],
    });
    return JSON.parse((message.content[0] as any).text);
  } catch {
    return mockGDFeedback(topic, points);
  }
};

export const analyzeResume = async (fileName: string, extractedText: string): Promise<any> => {
  const client = getAIClient();
  if (!client) return mockResumeAnalysis(fileName);

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `ATS Resume analysis. Filename: "${fileName}". Resume text: "${extractedText.slice(0, 2000)}". Return JSON with atsScore (0-100), grade, sections analysis, keywords found/missing, improvements list, and rewrittenSummary.`,
      }],
    });
    return JSON.parse((message.content[0] as any).text);
  } catch {
    return mockResumeAnalysis(fileName);
  }
};

export const reviewCode = async (code: string, language: string, problem: string): Promise<any> => {
  const client = getAIClient();
  if (!client) return mockCodeReview(code, language);

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Code review for problem "${problem}" in ${language}. Code: ${code}. Return JSON: { quality (0-100), complexity: { time, space }, issues (array with severity+message), suggestions, bestPractices }`,
      }],
    });
    return JSON.parse((message.content[0] as any).text);
  } catch {
    return mockCodeReview(code, language);
  }
};
