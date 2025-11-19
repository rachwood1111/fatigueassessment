export enum RiskLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Question {
  id: number;
  text: string;
  options: { label: string; value: number }[]; // Value 0-3 (0=good, 3=bad)
}

export interface AssessmentResult {
  questionScore: number;
  reactionTimeMs: number; // Average ms
  memoryLevel: number; // Max sequence reached
  stroopAccuracy: number; // Percentage correct
  riskLevel: RiskLevel;
  timestamp: string;
}

export type AssessmentStep = 
  | 'INTRO'
  | 'QUESTIONNAIRE'
  | 'REACTION_INSTRUCTION'
  | 'REACTION_TEST'
  | 'MEMORY_INSTRUCTION'
  | 'MEMORY_TEST'
  | 'STROOP_INSTRUCTION'
  | 'STROOP_TEST'
  | 'ANALYZING'
  | 'RESULTS';