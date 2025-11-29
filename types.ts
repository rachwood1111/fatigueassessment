
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
  vigilanceScore: number; // Percentage correct (Go/No-Go)
  riskLevel: RiskLevel;
  timestamp: string;
  selectedTime: string; // HH:mm format
}

export type AssessmentStep = 
  | 'INTRO'
  | 'QUESTIONNAIRE'
  | 'REACTION_INSTRUCTION'
  | 'REACTION_TEST'
  | 'MEMORY_INSTRUCTION'
  | 'MEMORY_TEST'
  | 'VIGILANCE_INSTRUCTION'
  | 'VIGILANCE_TEST'
  | 'ANALYZING'
  | 'RESULTS';
