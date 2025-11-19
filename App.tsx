import React, { useState, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Info, 
  Shield, 
  Truck,
  Phone,
  Focus
} from 'lucide-react';
import { 
  QUESTIONS, 
  REACTION_THRESHOLD_MS_WARNING, 
  REACTION_THRESHOLD_MS_CRITICAL,
  MEMORY_THRESHOLD_WARNING,
  MEMORY_THRESHOLD_CRITICAL,
  STROOP_ACCURACY_WARNING,
  STROOP_ACCURACY_CRITICAL,
  OPERATIONS_PHONE_NUMBER
} from './constants';
import { AssessmentResult, AssessmentStep, RiskLevel } from './types';
// UPDATED: Imports now point to the root folder
import { ReactionTest } from './ReactionTest';
import { MemoryTest } from './MemoryTest';
import { StroopTest } from './StroopTest';
import { getFatigueAdvice } from './geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AssessmentStep>('INTRO');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [memoryLevel, setMemoryLevel] = useState<number>(0);
  const [stroopAccuracy, setStroopAccuracy] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<AssessmentResult | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  // State for alert dismissal
  const [alertDismissed, setAlertDismissed] = useState(false);

  // --- Logic & Scoring ---

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateRisk = useCallback((finalStroopScore?: number): AssessmentResult => {
    // 1. Questionnaire Score (0-15)
    const qScore = (Object.values(answers) as number[]).reduce((a, b) => a + b, 0);
    
    // 2. Determine Base Risk from Questions - Increased thresholds slightly
    let risk = RiskLevel.LOW;
    if (qScore >= 5) risk = RiskLevel.MODERATE;
    if (qScore >= 9) risk = RiskLevel.HIGH;

    // 3. Adjust based on Reaction Time
    if (reactionTime > REACTION_THRESHOLD_MS_CRITICAL) {
        risk = RiskLevel.CRITICAL;
    } else if (reactionTime > REACTION_THRESHOLD_MS_WARNING && risk !== RiskLevel.HIGH) {
        risk = RiskLevel.MODERATE;
    }

    // 4. Adjust based on Memory
    if (memoryLevel <= MEMORY_THRESHOLD_CRITICAL) {
        // If memory is critically low, bump risk up one level
        if (risk === RiskLevel.LOW) risk = RiskLevel.MODERATE;
        else if (risk === RiskLevel.MODERATE) risk = RiskLevel.HIGH;
    }

    // Use passed score if provided (to handle async state update), otherwise use state
    const currentStroopAccuracy = finalStroopScore ?? stroopAccuracy;

    // 5. Adjust based on Stroop (Attention)
    if (currentStroopAccuracy < STROOP_ACCURACY_CRITICAL) {
        risk = RiskLevel.CRITICAL;
    } else if (currentStroopAccuracy < STROOP_ACCURACY_WARNING && risk === RiskLevel.LOW) {
        risk = RiskLevel.MODERATE;
    }

    // 6. Hard Override: If user selected "Severe" symptoms in Q4 or "Micro-sleeps" in Q2
    // We assume standard IDs 2 and 4 based on constants
    if (answers[2] === 3 || answers[4] === 3) {
        risk = RiskLevel.CRITICAL;
    }

    return {
        questionScore: qScore,
        reactionTimeMs: reactionTime,
        memoryLevel: memoryLevel,
        stroopAccuracy: currentStroopAccuracy,
        riskLevel: risk,
        timestamp: new Date().toISOString()
    };
  }, [answers, reactionTime, memoryLevel, stroopAccuracy]);

  const completeAssessment = async (finalStroopScore: number) => {
    setStep('ANALYZING');
    
    // Update state for consistency, but use the passed variable for calculation
    setStroopAccuracy(finalStroopScore);

    const result = calculateRisk(finalStroopScore);
    setFinalResult(result);
    
    // Fetch AI Advice
    const advice = await getFatigueAdvice(result);
    setAiAdvice(advice);
    
    setStep('RESULTS');
  };

  // --- View Renderers ---

  const renderHeader = () => (
    <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-10">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Shield className="text-orange-500 w-6 h-6" />
            <h1 className="font-bold text-lg tracking-tight">SafetyFirst <span className="text-orange-500">FatigueCheck</span></h1>
        </div>
        <div className="text-xs font-mono text-slate-400">v1.1</div>
      </div>
    </header>
  );

  const renderIntro = () => (
    <div className="p-6 flex flex-col gap-6">
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r">
        <h2 className="font-bold text-orange-900 flex items-center gap-2">
          <Info className="w-5 h-5" /> Mandatory Check
        </h2>
        <p className="text-sm text-orange-800 mt-1">
          Required for shifts &gt;12 hours, or if you feel fatigued.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full"><Activity className="w-5 h-5 text-blue-600" /></div>
          <div>
            <h3 className="font-semibold text-slate-800">Self Assessment</h3>
            <p className="text-sm text-slate-500">5 quick questions about how you feel.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-yellow-100 p-2 rounded-full"><Clock className="w-5 h-5 text-yellow-600" /></div>
          <div>
            <h3 className="font-semibold text-slate-800">Reflex Test</h3>
            <p className="text-sm text-slate-500">Measure your reaction speed.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 p-2 rounded-full"><Eye className="w-5 h-5 text-purple-600" /></div>
          <div>
            <h3 className="font-semibold text-slate-800">Memory Check</h3>
            <p className="text-sm text-slate-500">A quick pattern recall task.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-indigo-100 p-2 rounded-full"><Focus className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <h3 className="font-semibold text-slate-800">Attention Check</h3>
            <p className="text-sm text-slate-500">Test focus and inhibition.</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setStep('QUESTIONNAIRE')}
        className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2"
      >
        Start Assessment
      </button>
    </div>
  );

  const renderQuestionnaire = () => {
    const qKeys = Object.keys(answers);
    const isComplete = qKeys.length === QUESTIONS.length;

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Self Report</h2>
        <div className="space-y-8">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-3">{q.text}</h3>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(q.id, opt.value)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      answers[q.id] === opt.value 
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button 
            disabled={!isComplete}
            onClick={() => setStep('REACTION_INSTRUCTION')}
            className={`mt-8 w-full font-bold py-4 rounded-xl shadow-lg transition-all ${
                isComplete ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
        >
            Next: Reflex Test
        </button>
      </div>
    );
  };

  const renderTestInstruction = (
    title: string, 
    desc: string, 
    onStart: () => void, 
    icon: React.ReactNode
  ) => (
    <div className="p-8 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="mb-6 p-6 bg-white rounded-full shadow-lg ring-4 ring-slate-50">
            {icon}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 mb-8 max-w-xs">{desc}</p>
        <button 
            onClick={onStart}
            className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95"
        >
            Begin Task
        </button>
    </div>
  );

  const renderSevereAlert = () => (
    <div className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="bg-white p-4 rounded-full mb-6 shadow-xl">
            <AlertTriangle className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tight leading-tight">
            Severe Fatigue Detected
        </h1>
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 mb-8">
            <p className="text-xl text-white font-bold mb-2">You must not operate a vehicle.</p>
            <p className="text-white/90">Please contact Operations immediately to discuss your situation.</p>
        </div>
        
        <a 
            href={`tel:${OPERATIONS_PHONE_NUMBER}`}
            className="w-full max-w-sm bg-white text-red-700 font-black text-xl py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors active:scale-95"
        >
            <Phone className="w-6 h-6 fill-current" />
            CALL OPERATIONS
        </a>
        
        <button 
             onClick={() => setAlertDismissed(true)}
             className="mt-8 text-white/60 underline text-sm hover:text-white"
        >
            View detailed results
        </button>
    </div>
  );

  const renderResults = () => {
    if (!finalResult) return null;
    
    const isCritical = finalResult.riskLevel === RiskLevel.HIGH || finalResult.riskLevel === RiskLevel.CRITICAL;

    let colorClass = "";
    let bgClass = "";
    let icon = null;
    let title = "";
    
    switch (finalResult.riskLevel) {
        case RiskLevel.LOW:
            colorClass = "text-green-600";
            bgClass = "bg-green-50 border-green-200";
            icon = <CheckCircle className="w-16 h-16 text-green-500" />;
            title = "Fit for Duty";
            break;
        case RiskLevel.MODERATE:
            colorClass = "text-amber-600";
            bgClass = "bg-amber-50 border-amber-200";
            icon = <AlertTriangle className="w-16 h-16 text-amber-500" />;
            title = "Caution Required";
            break;
        case RiskLevel.HIGH:
        case RiskLevel.CRITICAL:
            colorClass = "text-red-600";
            bgClass = "bg-red-50 border-red-200";
            icon = <Shield className="w-16 h-16 text-red-500" />;
            title = "UNSAFE TO WORK";
            break;
    }

    return (
      <div className="p-6 pb-12">
        <div className={`flex flex-col items-center p-8 rounded-2xl border-2 ${bgClass} mb-6 text-center`}>
            {icon}
            <h2 className={`text-3xl font-bold mt-4 ${colorClass}`}>{title}</h2>
            <p className="text-slate-600 font-medium mt-2">Risk Level: {finalResult.riskLevel}</p>
        </div>

        <div className="space-y-4 mb-8">
            <h3 className="text-lg font-bold text-slate-800">Detailed Analysis</h3>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">Symptom Score</span>
                <span className={`font-bold ${finalResult.questionScore > 8 ? 'text-red-500' : 'text-slate-800'}`}>{finalResult.questionScore}/15</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">Reaction Speed</span>
                <span className={`font-bold ${finalResult.reactionTimeMs > REACTION_THRESHOLD_MS_WARNING ? 'text-amber-500' : 'text-slate-800'}`}>{Math.round(finalResult.reactionTimeMs)}ms</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">Memory Level</span>
                <span className={`font-bold ${finalResult.memoryLevel <= MEMORY_THRESHOLD_WARNING ? 'text-amber-500' : 'text-slate-800'}`}>{finalResult.memoryLevel}</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">Attention Accuracy</span>
                <span className={`font-bold ${finalResult.stroopAccuracy < STROOP_ACCURACY_WARNING ? 'text-amber-500' : 'text-slate-800'}`}>{finalResult.stroopAccuracy}%</span>
            </div>
        </div>

        {/* AI Advice Section */}
        <div className="mb-8">
             <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-blue-500" /> Safety Coach
             </h3>
             <div className="bg-slate-800 text-white p-5 rounded-xl shadow-md text-sm leading-relaxed">
                 {aiAdvice || "Loading advice..."}
             </div>
        </div>

        {isCritical ? (
            <div className="sticky bottom-4">
                <a 
                    href={`tel:${OPERATIONS_PHONE_NUMBER}`}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-xl shadow-xl animate-pulse flex items-center justify-center gap-2"
                >
                    <Truck className="w-6 h-6" /> CONTACT OPERATIONS
                </a>
                <p className="text-center text-xs text-red-600 font-bold mt-2">
                    STOP WORK IMMEDIATELY. DO NOT DRIVE.
                </p>
            </div>
        ) : (
            <button 
                onClick={() => window.location.reload()}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 rounded-xl"
            >
                Close & Return to Duty
            </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {renderHeader()}
      
      <main className="min-h-[calc(100vh-64px)]">
        {/* Severe Fatigue Alert Overlay */}
        {step === 'RESULTS' && finalResult && (finalResult.riskLevel === RiskLevel.HIGH || finalResult.riskLevel === RiskLevel.CRITICAL) && !alertDismissed && (
             renderSevereAlert()
        )}

        {step === 'INTRO' && renderIntro()}
        
        {step === 'QUESTIONNAIRE' && renderQuestionnaire()}
        
        {step === 'REACTION_INSTRUCTION' && renderTestInstruction(
            "Reflex Test",
            "When the box turns GREEN, tap it as fast as you can. We'll do this 3 times.",
            () => setStep('REACTION_TEST'),
            <Clock className="w-12 h-12 text-blue-500" />
        )}
        
        {step === 'REACTION_TEST' && (
            <div className="h-[calc(100vh-64px)] p-4">
                <ReactionTest onComplete={(avg) => {
                    setReactionTime(avg);
                    setStep('MEMORY_INSTRUCTION');
                }} />
            </div>
        )}

        {step === 'MEMORY_INSTRUCTION' && renderTestInstruction(
            "Pattern Memory",
            "Watch the colored tiles flash. Repeat the pattern exactly. It gets longer each round.",
            () => setStep('MEMORY_TEST'),
            <Eye className="w-12 h-12 text-purple-500" />
        )}

        {step === 'MEMORY_TEST' && (
            <div className="h-[calc(100vh-64px)] p-4 pt-10">
                <MemoryTest onComplete={(lvl) => {
                    setMemoryLevel(lvl);
                    setStep('STROOP_INSTRUCTION');
                }} />
            </div>
        )}

        {step === 'STROOP_INSTRUCTION' && renderTestInstruction(
             "Attention Check",
             "Tap the button that matches the COLOR of the text, not the word itself. Be quick!",
             () => setStep('STROOP_TEST'),
             <Focus className="w-12 h-12 text-indigo-500" />
        )}

        {step === 'STROOP_TEST' && (
            <div className="h-[calc(100vh-64px)] p-4">
                <StroopTest onComplete={(score) => {
                    completeAssessment(score);
                }} />
            </div>
        )}

        {step === 'ANALYZING' && (
            <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Analyzing Results...</p>
            </div>
        )}

        {step === 'RESULTS' && renderResults()}
      </main>
    </div>
  );
};

export default App;
