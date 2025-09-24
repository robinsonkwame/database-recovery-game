import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const initialScenarios = [
  {
    id: 1,
    title: "University Library System",
    description: "You're managing the university's library database during the busy start of semester. A small error occurred while updating the status of several popular textbooks, and students are already lining up to check them out.",
    question: "What recovery method would you use?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You successfully undo the error, but it delays the system update.", 
        score: 1,
        feedback: "Exactly right. When book status updates go wrong, it's better to roll back and fix the data properly than leave incorrect records."
      },
      { 
        text: "Commit", 
        outcome: "The error persists, affecting the accuracy of the book status.", 
        score: 0,
        feedback: "Not ideal. Students and staff rely on accurate book availability - committing flawed data means wrong information in the catalog."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { delay: true, errorPersistence: false },
      Commit: { delay: false, errorPersistence: true }
    }
  },
  {
    id: 2,
    title: "Student Registration System",
    description: "It's 8 AM on course registration day and thousands of students are frantically trying to get into their required classes. The system is experiencing heavy load with some minor data inconsistencies appearing.",
    question: "Which recovery method is more suitable?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You maintain data accuracy but cause registration delays.", 
        score: 0,
        feedback: "Think about timing - rolling back during peak registration creates massive delays when students are all trying to enroll at once."
      },
      { 
        text: "Commit", 
        outcome: "Registration proceeds quickly but with some data inconsistencies.", 
        score: 1,
        feedback: "Smart move. Registration deadlines wait for no one - keep the system running and clean up the data inconsistencies afterwards."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { userFrustration: true, dataAccuracy: true },
      Commit: { userFrustration: false, dataAccuracy: false }
    }
  },
  {
    id: 3,
    title: "Research Data Repository",
    description: "A renowned professor has just uploaded years of groundbreaking climate research to the university's repository. However, there's a small metadata error that could affect how other researchers discover this important work.",
    question: "What's the best recovery approach for a small error in the metadata?",
    options: [
      { 
        text: "Rollback", 
        outcome: "The metadata is corrected, but it delays other uploads.", 
        score: 1,
        feedback: "Absolutely. Research metadata errors can make important work unfindable for years - a few minutes of delay beats that outcome."
      },
      { 
        text: "Commit", 
        outcome: "The erroneous metadata remains, potentially affecting research discoverability.", 
        score: 0,
        feedback: "Risky choice. Imagine a groundbreaking paper becoming invisible in search results because of bad metadata - that's worse than a brief delay."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { systemPerformance: false, dataIntegrity: true },
      Commit: { systemPerformance: true, dataIntegrity: false }
    }
  },
  {
    id: 4,
    title: "Campus Security Logs",
    description: "It's 2 AM and the campus security system has suddenly logged an unusual surge of access card entries across multiple buildings. The night security team is unsure if this indicates a real security event or a system malfunction.",
    question: "How would you handle potential errors in the security logs?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You remove potentially erroneous entries, risking the loss of valid security data.", 
        score: 0,
        feedback: "Too aggressive. What if those 'unusual entries' were actually recording a real security incident? You'd be deleting evidence."
      },
      { 
        text: "Commit", 
        outcome: "All entries are kept, requiring manual verification later.", 
        score: 1,
        feedback: "Wise approach. Security logs are like a crime scene - preserve everything first, analyze later. Better safe than sorry."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { securityRisk: true, manualWorkload: false },
      Commit: { securityRisk: false, manualWorkload: true }
    }
  },
  {
    id: 5,
    title: "Financial Aid Disbursement",
    description: "It's the week before tuition deadlines and thousands of students are depending on their financial aid disbursements. The system needs to process millions of dollars, but your previous decisions have created some performance and accuracy concerns.",
    question: "Given the current system state, what recovery strategy would you employ?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You ensure accurate disbursements but may delay some payments.", 
        score: 1,
        feedback: "Perfect. Financial aid mistakes can devastate students' lives - taking time to ensure accuracy protects their futures."
      },
      { 
        text: "Commit", 
        outcome: "All disbursements are processed quickly, but some may be incorrect.", 
        score: 0,
        feedback: "Dangerous territory. Sending wrong amounts could mean some students can't pay tuition while others get money they shouldn't have."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { studentSatisfaction: false, financialAccuracy: true },
      Commit: { studentSatisfaction: true, financialAccuracy: false }
    }
  },
  {
    id: 6,
    title: "Online Exam Platform",
    description: "It's finals week and 5,000 students are simultaneously taking their comprehensive online exams. Suddenly, the system experiences a brief but critical 3-minute outage, leaving many students mid-answer.",
    question: "How do you handle the partial exam submissions?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You reset all exams to their pre-outage state, requiring students to retake parts of the exam.", 
        score: 0,
        feedback: "Ouch. Imagine telling hundreds of stressed students they have to restart their exam because of a technical glitch - not great for morale."
      },
      { 
        text: "Commit", 
        outcome: "You save all partial submissions and allow students to continue from where they left off.", 
        score: 1,
        feedback: "Compassionate choice. Students' work deserves protection, and you can always verify suspicious submissions manually later."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { studentStress: true, administrativeBurden: true },
      Commit: { studentStress: false, dataInconsistency: true }
    }
  },
  {
    id: 7,
    title: "Alumni Donation System",
    description: "The university's annual fundraising gala was a huge success, with the alumni donation system processing several six-figure gifts throughout the evening. However, the development office suspects there may have been a processing error with some of the transactions.",
    question: "How do you approach this situation?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You reverse all recent transactions to ensure no errors, but this may upset some donors.", 
        score: 0,
        feedback: "Heavy-handed approach. Donors who just made generous gifts might feel insulted if you immediately reverse their contributions."
      },
      { 
        text: "Commit", 
        outcome: "You keep all transactions and initiate a review process, potentially allowing erroneous transactions to stand temporarily.", 
        score: 1,
        feedback: "Diplomatic move. Keep donors happy while you investigate quietly - you can always make corrections once you know what's wrong."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { donorRelations: false, financialAccuracy: true },
      Commit: { donorRelations: true, financialAccuracy: false }
    }
  },
  {
    id: 8,
    title: "Student Health Records",
    description: "The campus health center just deployed a critical software update to handle the flu season rush. However, the update has flagged numerous student health records as potentially corrupted, right when students need access for medical appointments.",
    question: "What's your recovery strategy?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You revert to the previous version of the system, losing some recent but uncorrupted updates.", 
        score: 0,
        feedback: "Too drastic. You'd be throwing away valid patient updates along with the problematic ones - like burning down the house to kill a spider."
      },
      { 
        text: "Commit", 
        outcome: "You keep the current state and initiate a manual review of flagged records.", 
        score: 1,
        feedback: "Smart approach. Health records are too important to lose - better to preserve everything and carefully sort out what's wrong."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { dataLoss: true, systemStability: true },
      Commit: { manualWorkload: true, dataAccuracy: false }
    }
  },
  {
    id: 9,
    title: "Campus Wi-Fi Usage Logs",
    description: "Campus IT has noticed that the Wi-Fi usage logs are showing data consumption levels that seem impossibly high - some dormitories appear to be using more bandwidth than entire academic buildings. This could be a recording error, or it might reveal interesting usage patterns.",
    question: "How do you handle this data anomaly?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You reset the logs to the last known good state, potentially losing some valid usage data.", 
        score: 0,
        feedback: "Hasty decision. Those 'unusual' patterns might reveal important network issues or usage trends - you'd be deleting valuable insights."
      },
      { 
        text: "Commit", 
        outcome: "You retain all logs and flag them for further investigation.", 
        score: 1,
        feedback: "Data detective approach! Keep everything and analyze patterns - the 'errors' might actually tell an interesting story about campus usage."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { dataCompleteness: false, immediateClarity: true },
      Commit: { dataCompleteness: true, analysisWorkload: true }
    }
  },
  {
    id: 10,
    title: "Facilities Management System",
    description: "A sudden thunderstorm has knocked out power to the main data center, causing the facilities management system to shut down unexpectedly. When power was restored, dozens of maintenance requests submitted during the outage are in an uncertain state - some may have been lost, others partially processed.",
    question: "What recovery action do you take?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You revert to the last known good state, potentially losing some recent maintenance requests.", 
        score: 0,
        feedback: "Risky move. That 'lost' maintenance request could be a broken heater in winter or a security door that won't lock properly."
      },
      { 
        text: "Commit", 
        outcome: "You recover to the point of failure and manually verify the state of recent requests.", 
        score: 1,
        feedback: "Thorough approach. Campus maintenance can't afford to lose requests - better to double-check everything than miss a critical repair."
      }
    ],
    nextScenarioModifiers: {
      Rollback: { systemConsistency: true, serviceMissed: true },
      Commit: { manualWorkload: true, serviceComplete: true }
    }
  }
];

export default function DatabaseRecoveryGame() {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [completionTime, setCompletionTime] = useState(null);
  const [startTime] = useState(new Date().getTime());

  useEffect(() => {
    const shuffledScenarios = [...initialScenarios].sort(() => Math.random() - 0.5);
    setScenarios(shuffledScenarios);
  }, []);

  const handleAnswer = (option) => {
    setSelectedOption(option);
    setShowOutcome(true);
    setScore(prevScore => Math.max(0, Math.min(10, prevScore + option.score)));
  };

  const nextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      const nextScenarioIndex = currentScenario + 1;
      const currentModifiers = scenarios[currentScenario].nextScenarioModifiers[selectedOption.text];

      setScenarios(prevScenarios => {
        const updatedScenarios = [...prevScenarios];
        const nextScenario = { ...updatedScenarios[nextScenarioIndex] };

        // Shuffle options for variety
        nextScenario.options.sort(() => Math.random() - 0.5);

        updatedScenarios[nextScenarioIndex] = nextScenario;
        return updatedScenarios;
      });

      setCurrentScenario(nextScenarioIndex);
      setShowOutcome(false);
      setSelectedOption(null);
    } else {
      setCompletionTime(new Date().getTime());
      setGameOver(true);
    }
  };

  const getPerformanceSummary = (score) => {
    if (score <= 2) {
      return "Poor performance: Most decisions were incorrect, leading to significant system issues and data problems.";
    } else if (score <= 4) {
      return "Below average performance: Several incorrect decisions have caused delays and data inconsistencies.";
    } else if (score <= 6) {
      return "Average performance: Mixed results with some correct and incorrect decisions affecting system operation.";
    } else if (score <= 8) {
      return "Good performance: Most decisions were correct, leading to smooth operation with minimal issues.";
    } else {
      return "Excellent performance: Optimal decisions have ensured the system operates as expected, especially in critical data areas.";
    }
  };

  const getContextualSummary = (score, scenarioNumber) => {
    if (scenarioNumber === 0) {
      return null; // No summary for the first scenario
    }
    
    const correctAnswers = score;
    const totalAnswers = scenarioNumber;
    const percentage = Math.round((correctAnswers / totalAnswers) * 100);
    
    if (percentage >= 80) {
      return `Strong performance so far: ${correctAnswers}/${totalAnswers} optimal decisions (${percentage}%). Your database management approach is showing excellent judgment.`;
    } else if (percentage >= 60) {
      return `Good progress: ${correctAnswers}/${totalAnswers} correct decisions (${percentage}%). You're making solid choices with room for improvement.`;
    } else if (percentage >= 40) {
      return `Mixed results: ${correctAnswers}/${totalAnswers} optimal decisions (${percentage}%). Consider the context more carefully - timing and impact matter.`;
    } else {
      return `Challenging start: ${correctAnswers}/${totalAnswers} correct decisions (${percentage}%). Focus on balancing data integrity with operational needs.`;
    }
  };

  const generateCompletionCode = (finalScore, completionTime) => {
    // Simple encoding: score (0-10) + time hash (2 chars) + checksum (3 chars)
    // Score: A-K (A=0, B=1, C=2, ... K=10)
    const scoreChar = String.fromCharCode(65 + finalScore); // A-K
    
    // Time hash: Use last 4 digits of timestamp, convert to base36, take first 2 chars
    const timeHash = (completionTime % 10000).toString(36).toUpperCase().padStart(2, '0').slice(0, 2);
    
    // Checksum: Simple hash of score and time for verification
    const checksumSeed = finalScore * 7 + (completionTime % 1000);
    const checksum = checksumSeed.toString(36).toUpperCase().padStart(3, '0').slice(-3);
    
    return `${scoreChar}${timeHash}${checksum}`;
  };

  const decodeCompletionCode = (code) => {
    if (!code || code.length !== 6) return null;
    
    const scoreChar = code[0];
    const timeHash = code.slice(1, 3);
    const checksum = code.slice(3, 6);
    
    const score = scoreChar.charCodeAt(0) - 65;
    const timeValue = parseInt(timeHash, 36);
    
    return { score, timeHash: timeValue, checksum };
  };

  const restartGame = () => {
    const shuffledScenarios = [...initialScenarios].sort(() => Math.random() - 0.5);
    setScenarios(shuffledScenarios);
    setCurrentScenario(0);
    setScore(0);
    setShowOutcome(false);
    setSelectedOption(null);
    setGameOver(false);
    setCompletionTime(null);
  };

  if (scenarios.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Enhanced Database Recovery Concepts Game</h1>
      <p className="mb-4 text-center text-lg">Current Score: {score}</p>
      <p className="mb-2 text-center text-lg">Scenario {currentScenario + 1} of {scenarios.length}</p>
      {getContextualSummary(score, currentScenario) && (
        <p className="mb-4 text-center text-sm italic text-gray-700 bg-gray-50 p-2 rounded">
          {getContextualSummary(score, currentScenario)}
        </p>
      )}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500">Database Recovery Concepts:</h2>
        <div className="space-y-3">
          <div>
            <p><strong>Rollback Recovery:</strong> Used when a transaction was interrupted before it could complete and commit. The system failure occurred while the transaction was still in progress.</p>
            <p className="text-sm text-gray-600 ml-4">• Undoes partial changes to restore the database to its state before the failed transaction began</p>
          </div>
          <div>
            <p><strong>Commit Recovery:</strong> Used when a transaction successfully completed and committed, but a system failure occurred after the commit but before all changes were fully written to permanent storage.</p>
            <p className="text-sm text-gray-600 ml-4">• Reapplies these changes to ensure committed transactions aren&apos;t lost</p>
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">Key Timing Difference:</p>
            <p className="text-sm text-blue-700">Rollback = failure during an incomplete transaction | Commit recovery = failure after a complete transaction but before full persistence</p>
          </div>
        </div>
      </div>
      {!gameOver ? (
        <Card className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-500">{scenarios[currentScenario].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{scenarios[currentScenario].description}</p>
            <p className="font-semibold mb-2">{scenarios[currentScenario].question}</p>
            {!showOutcome && scenarios[currentScenario].options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                className="mr-2 mb-2 bg-blue-500 text-white hover:bg-blue-700"
              >
                {option.text}
              </Button>
            ))}
            {showOutcome && (
              <div className={`mt-4 p-4 rounded ${selectedOption.score > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-semibold">Outcome:</p>
                <p>{selectedOption.outcome}</p>
                <p className="mt-2 font-semibold">Feedback:</p>
                <p>{selectedOption.feedback}</p>
                <Button onClick={nextScenario} className="mt-2 bg-blue-500 text-white hover:bg-blue-700">
                  {currentScenario < scenarios.length - 1 ? "Next Scenario" : "Finish Game"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <AlertDialog open={gameOver}>
          <AlertDialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-600 text-center">Scenarios Complete! 🎉</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                <div className="space-y-4">
                  <p>Your final score: <span className="font-bold text-lg">{score} out of {scenarios.length}</span></p>
                  <p className="text-sm text-gray-600">{getPerformanceSummary(score)}</p>
                  
                  {completionTime && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="font-semibold text-green-800 mb-2">📋 Completion Code for Canvas:</p>
                      <div className="bg-white border-2 border-green-300 rounded p-3 font-mono text-xl text-center font-bold text-green-700">
                        {generateCompletionCode(score, completionTime)}
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        Copy this code and submit it with your team information on Canvas
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <a 
                      href="https://canvas.wayne.edu/courses/228219/assignments/2184480"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      📚 Submit on Canvas Assignment
                    </a>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="justify-center">
              <AlertDialogAction onClick={restartGame} className="bg-blue-500 text-white hover:bg-blue-700">Play Again</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}