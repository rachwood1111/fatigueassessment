import { Question } from './types';

export const OPERATIONS_PHONE_NUMBER = "0499 626 059";

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How would you rate your current alertness level?",
    options: [
      { label: "Fully alert, wide awake", value: 0 },
      { label: "Functioning well, but not peak", value: 1 },
      { label: "A bit foggy, effort required", value: 2 },
      { label: "Fighting sleep, eyelids heavy", value: 3 },
    ]
  },
  {
    id: 2,
    text: "Have you experienced any 'micro-sleeps' or prolonged blinking in the last hour?",
    options: [
      { label: "No, not at all", value: 0 },
      { label: "Maybe once, just tired eyes", value: 1 },
      { label: "Yes, a few times", value: 3 }, // Immediate high risk indicator
    ]
  },
  {
    id: 3,
    text: "How long has it been since your last break?",
    options: [
      { label: "Less than 2 hours", value: 0 },
      { label: "2-3 hours", value: 1 },
      { label: "3-4 hours", value: 2 },
      { label: "Over 4 hours", value: 3 },
    ]
  },
  {
    id: 4,
    text: "Physical symptoms check: Do you have a headache, yawning, or muscle stiffness?",
    options: [
      { label: "None", value: 0 },
      { label: "Mild yawning", value: 1 },
      { label: "Frequent yawning or mild stiffness", value: 2 },
      { label: "Severe headache or body ache", value: 3 },
    ]
  },
  {
    id: 5,
    text: "Shift duration: How many hours have you been on duty?",
    options: [
      { label: "Under 10 hours", value: 0 },
      { label: "10-12 hours", value: 1 },
      { label: "12-13 hours", value: 2 },
      { label: "Over 13 hours", value: 3 },
    ]
  }
];

// Thresholds for interactive tests
// Relaxed thresholds to prevent false positives
export const REACTION_THRESHOLD_MS_WARNING = 450; 
export const REACTION_THRESHOLD_MS_CRITICAL = 800;

// Sequence length - Relaxed: Level 3 is now acceptable, Level 2 is warning
export const MEMORY_THRESHOLD_WARNING = 3; 
export const MEMORY_THRESHOLD_CRITICAL = 2;

// Percentage - Relaxed: 70% is now acceptable
export const STROOP_ACCURACY_WARNING = 70; 
export const STROOP_ACCURACY_CRITICAL = 50;