export type Subject =
  | 'Polity'
  | 'History'
  | 'Geography'
  | 'Economy'
  | 'Environment'
  | 'Science & Technology'
  | 'International Relations'
  | 'Society'
  | 'Governance'
  | 'Ethics'
  | 'Current Affairs'
  | 'CSAT'
  | 'General';

export type StudyMode =
  | 'normal'
  | 'zero_level'
  | 'prelims'
  | 'mains'
  | 'revision'
  | 'socratic'
  | 'no_hallucination';

export type DoubtType =
  | 'Conceptual'
  | 'Factual'
  | 'Conflicting Information'
  | 'PYQ'
  | 'Revision'
  | 'Current Affairs'
  | 'Prelims Trap'
  | 'Mains Answer Writing';

export interface SourceCitation {
  title: string;
  organization: string;
  date?: string;
  url?: string;
  verified: boolean;
  excerpt?: string;
}

export interface StructuredDoubtResponse {
  doubtType: DoubtType;
  directAnswer: string;
  hinglishExplanation?: string;
  technicalExplanation: string;
  whyAndHow: string;
  example?: string;
  upscConnection: {
    syllabusPaper?: string; // e.g. "GS Paper II: Indian Constitution"
    relevance: string;
  };
  relevantAngle: {
    prelimsAngle?: string;
    mainsAngle?: string;
  };
  commonTraps: string[];
  verification: {
    isExternallyVerified: boolean;
    verificationNote?: string;
    sources: SourceCitation[];
  };
  upscTakeaway: string[];
  socraticFollowUp?: string; // When in socratic mode
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  doubtType?: DoubtType;
  structuredData?: StructuredDoubtResponse;
  sources?: SourceCitation[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  subject: Subject;
  mode: StudyMode;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface SavedDoubt {
  id: string;
  userId?: string;
  conversationId?: string;
  question: string;
  subject: Subject;
  mode: StudyMode;
  directAnswer: string;
  hinglishExplanation?: string;
  technicalExplanation?: string;
  whyAndHow?: string;
  example?: string;
  upscConnection?: {
    syllabusPaper?: string;
    relevance: string;
  };
  commonTraps?: string[];
  upscTakeaway: string[];
  sources?: SourceCitation[];
  isMastered?: boolean;
  reviewCount: number;
  lastReviewedAt?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface PYQAnalysisRequest {
  pyq: string;
  year: string;
  subject: Subject;
  examType: 'Prelims' | 'Mains';
  selectedOption?: string;
  studentReasoning: string;
}

export interface PYQAnalysisResponse {
  questionDemand: string;
  statementMeaning: string[];
  studentReasoningEvaluation: string;
  statementWiseAnalysis: {
    statement: string;
    isCorrect: boolean;
    reasoning: string;
  }[];
  optionEliminationStrategy: string;
  correctAnswer: string;
  exactReasoningMistake: string;
  futureTrapToAvoid: string;
  upscTakeaway: string[];
  sources: SourceCitation[];
}

export interface MainsEvaluationRequest {
  question: string;
  gsPaper: 'GS 1' | 'GS 2' | 'GS 3' | 'GS 4' | 'Essay';
  year: string;
  wordLimit: number;
  studentAnswer: string;
}

export interface MainsEvaluationResponse {
  directiveWord: {
    word: string;
    explanation: string;
  };
  questionDemand: string;
  keywordsIdentified: string[];
  introductionAssessment: {
    score: string;
    feedback: string;
  };
  structureAndFlow: string;
  dimensionsAddressed: {
    dimension: string; // e.g. "Constitutional/Legal", "Economic", "Social", "Environmental"
    status: 'Well Addressed' | 'Partial' | 'Missing';
    notes: string;
  }[];
  argumentsAndData: {
    strengths: string[];
    weaknesses: string[];
  };
  constitutionalAndCaseReferences: string[];
  missingDimensions: string[];
  wayForward: string;
  conclusionAssessment: string;
  indicativeScore: {
    awardedMarks: number;
    totalMarks: number;
    scoreBand: 'High' | 'Above Average' | 'Average' | 'Needs Significant Improvement';
    disclaimer: string;
  };
}
