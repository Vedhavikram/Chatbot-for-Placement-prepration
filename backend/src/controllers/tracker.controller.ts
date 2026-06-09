import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../config/db';
import { generateRoadmap } from '../services/ai.service';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

export const analyzeCareer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { targets, interests, currentSkills, weakAreas } = req.body;

    const userRes = await query(
      'SELECT name, branch, college, cgpa, skill_level, target_companies FROM users WHERE id = $1',
      [userId]
    );
    const user = userRes.rows[0];

    const profile = {
      name: user?.name,
      branch: user?.branch,
      college: user?.college,
      cgpa: user?.cgpa,
      skillLevel: user?.skill_level,
      targets: targets || (user?.target_companies ? JSON.parse(user.target_companies) : []).join(', '),
      interests: interests || [],
      currentSkills: currentSkills || [],
      weakAreas: weakAreas || [],
    };

    const roadmap = await generateRoadmap(profile);
    return res.json({ roadmap, profile });
  } catch (err: any) {
    console.error('[Advisor] error:', err);
    return res.status(500).json({ error: 'Failed to generate roadmap' });
  }
};

// Company-specific intelligence
const COMPANY_DATA: Record<string, any> = {
  TCS: {
    name: 'TCS',
    fullName: 'Tata Consultancy Services',
    ctc: '3.5 - 7 LPA',
    rounds: ['Online Aptitude Test (TCS NQT)', 'Technical Interview', 'HR Interview'],
    keyTopics: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal', 'Coding (Easy-Medium)'],
    tips: ['Focus heavily on TCS NQT pattern', 'Practice time management for aptitude', 'Strong fundamentals in OOP and DBMS'],
    cutoff: 'Above 60% throughout academics, no active backlogs',
  },
  Infosys: {
    name: 'Infosys',
    fullName: 'Infosys Limited',
    ctc: '3.6 - 8 LPA',
    rounds: ['InfyTQ Certification / HackWithInfy', 'Online Assessment', 'HR Interview'],
    keyTopics: ['Aptitude', 'Verbal', 'Pseudocode', 'Puzzles'],
    tips: ['Get InfyTQ certified for direct shortlisting', 'Practice English communication', 'Prepare puzzle-based reasoning'],
    cutoff: '65% throughout academics',
  },
  Wipro: {
    name: 'Wipro',
    fullName: 'Wipro Technologies',
    ctc: '3.5 - 6.5 LPA',
    rounds: ['NLTH Online Test', 'Technical Interview', 'HR Interview'],
    keyTopics: ['Aptitude', 'Written Communication', 'Coding (Basic)'],
    tips: ['Prepare for essay writing section', 'Focus on C/Java basics', 'Practice LeetCode Easy problems'],
    cutoff: '60% or above',
  },
  Zoho: {
    name: 'Zoho',
    fullName: 'Zoho Corporation',
    ctc: '5 - 12 LPA',
    rounds: ['Written Aptitude', 'Advanced Programming Round', 'Technical Interview', 'HR Round'],
    keyTopics: ['Data Structures', 'Algorithms', 'C/C++ Programming', 'Problem Solving'],
    tips: ['Zoho is extremely coding-focused', 'Master DSA — Trees, Graphs, DP', 'Practice output-based questions'],
    cutoff: 'No specific cutoff — performance-based',
  },
  Accenture: {
    name: 'Accenture',
    fullName: 'Accenture',
    ctc: '4.5 - 8 LPA',
    rounds: ['Cognitive & Technical Assessment', 'Communication Assessment', 'HR Interview'],
    keyTopics: ['Logical Reasoning', 'Attention to Detail', 'Pseudo-coding', 'Communication'],
    tips: ['Very strong English communication needed', 'Practice attention-to-detail questions', 'Prepare resume well for HR round'],
    cutoff: '60% throughout, no standing backlogs',
  },
};

export const getCompanyInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { company } = req.params;
    const data = COMPANY_DATA[company];
    if (!data) {
      return res.status(404).json({ error: 'Company not found in database' });
    }
    return res.json({ company: data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch company data' });
  }
};

export const getAllCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const companies = Object.values(COMPANY_DATA).map(c => ({
      name: c.name,
      fullName: c.fullName,
      ctc: c.ctc,
      roundCount: c.rounds.length,
    }));
    return res.json({ companies });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch companies' });
  }
};
