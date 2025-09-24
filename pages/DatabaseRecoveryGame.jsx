import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const initialScenarios = [
  {
    id: 1,
    title: "University Library System",
    description: "You're managing the university's library database. A small error occurred while updating the status of several books.",
    question: "What recovery method would you use?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You successfully undo the error, but it delays the system update.", 
        score: 1,
        feedback: "Good choice. For a small error in a largely read-only database, rollback is often the safest option."
      },
      { 
        text: "Commit", 
        outcome: "The error persists, affecting the accuracy of the book status.", 
        score: 0,
        feedback: "A commit here allows the error to persist. For small errors in mostly read-only databases, rollback is usually better."
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
    description: "It's time for course registration. The system is experiencing high traffic.",
    question: "Which recovery method is more suitable?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You maintain data accuracy but cause registration delays.", 
        score: 0,
        feedback: "While this maintains accuracy, it might not be the best choice during high-traffic periods. Consider the impact on user experience."
      },
      { 
        text: "Commit", 
        outcome: "Registration proceeds quickly but with some data inconsistencies.", 
        score: 1,
        feedback: "Good choice. In high-traffic scenarios, maintaining system availability is often prioritized. You can address inconsistencies later."
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
    description: "A professor's research data has been uploaded to the university's repository.",
    question: "What's the best recovery approach for a small error in the metadata?",
    options: [
      { 
        text: "Rollback", 
        outcome: "The metadata is corrected, but it delays other uploads.", 
        score: 1,
        feedback: "Good choice. For research data, accuracy is crucial. The small delay is worth ensuring correct metadata."
      },
      { 
        text: "Commit", 
        outcome: "The erroneous metadata remains, potentially affecting research discoverability.", 
        score: 0,
        feedback: "While this avoids delays, incorrect metadata can significantly impact research discoverability. For crucial data, accuracy often outweighs speed."
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
    description: "The campus security system has logged an unusual number of entries.",
    question: "How would you handle potential errors in the security logs?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You remove potentially erroneous entries, risking the loss of valid security data.", 
        score: 0,
        feedback: "Caution is good, but rolling back security logs could lose crucial data. It's often better to keep all entries and verify later."
      },
      { 
        text: "Commit", 
        outcome: "All entries are kept, requiring manual verification later.", 
        score: 1,
        feedback: "Good choice. In security scenarios, it's often better to keep all data and verify later, rather than risk losing important information."
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
    description: "It's time to disburse financial aid to students. The previous decisions have affected system performance and data accuracy.",
    question: "Given the current system state, what recovery strategy would you employ?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You ensure accurate disbursements but may delay some payments.", 
        score: 1,
        feedback: "Good choice. In financial transactions, accuracy is paramount. Slight delays are preferable to incorrect disbursements."
      },
      { 
        text: "Commit", 
        outcome: "All disbursements are processed quickly, but some may be incorrect.", 
        score: 0,
        feedback: "Speed is good, but not at the cost of financial accuracy. For financial transactions, it's usually better to ensure accuracy even if it causes some delay."
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
    description: "During a university-wide online exam, the system experiences a brief outage.",
    question: "How do you handle the partial exam submissions?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You reset all exams to their pre-outage state, requiring students to retake parts of the exam.", 
        score: 0,
        feedback: "While this ensures fairness, it can cause significant stress for students and administrative burden."
      },
      { 
        text: "Commit", 
        outcome: "You save all partial submissions and allow students to continue from where they left off.", 
        score: 1,
        feedback: "Good choice. This minimizes disruption and stress for students, though it may require some manual verification later."
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
    description: "The alumni donation system has processed several large donations, but there's suspicion of a processing error.",
    question: "How do you approach this situation?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You reverse all recent transactions to ensure no errors, but this may upset some donors.", 
        score: 0,
        feedback: "While thorough, this approach might damage relationships with donors. It's often better to verify first before taking drastic actions."
      },
      { 
        text: "Commit", 
        outcome: "You keep all transactions and initiate a review process, potentially allowing erroneous transactions to stand temporarily.", 
        score: 1,
        feedback: "Good choice. This maintains donor trust while still addressing the issue. Any errors can be corrected after verification."
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
    description: "A software update to the student health system has caused some records to be flagged as potentially corrupted.",
    question: "What's your recovery strategy?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You revert to the previous version of the system, losing some recent but uncorrupted updates.", 
        score: 0,
        feedback: "While this ensures data integrity, it also loses valid recent updates. For health records, a more targeted approach is often better."
      },
      { 
        text: "Commit", 
        outcome: "You keep the current state and initiate a manual review of flagged records.", 
        score: 1,
        feedback: "Good choice. This preserves all data and allows for a careful, targeted review of potentially problematic records."
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
    description: "The campus Wi-Fi system has been logging unusually high data usage, possibly due to a recording error.",
    question: "How do you handle this data anomaly?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You reset the logs to the last known good state, potentially losing some valid usage data.", 
        score: 0,
        feedback: "This approach might lose important data. For usage logs, it's often better to keep the data for analysis rather than discard it."
      },
      { 
        text: "Commit", 
        outcome: "You retain all logs and flag them for further investigation.", 
        score: 1,
        feedback: "Good choice. Keeping the logs allows for thorough analysis and can help identify if there's a real issue or just a recording error."
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
    description: "A power outage has caused the facilities management system to shut down unexpectedly, leaving some maintenance requests in an unknown state.",
    question: "What recovery action do you take?",
    options: [
      { 
        text: "Rollback", 
        outcome: "You revert to the last known good state, potentially losing some recent maintenance requests.", 
        score: 0,
        feedback: "While this ensures system consistency, it may result in missed maintenance requests, potentially causing issues."
      },
      { 
        text: "Commit", 
        outcome: "You recover to the point of failure and manually verify the state of recent requests.", 
        score: 1,
        feedback: "Good choice. This approach ensures no maintenance requests are lost, even though it requires some manual work."
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

        const performanceSummary = getPerformanceSummary(score);

        nextScenario.description += ` ${performanceSummary}`;

        nextScenario.options.sort(() => Math.random() - 0.5);

        updatedScenarios[nextScenarioIndex] = nextScenario;
        return updatedScenarios;
      });

      setCurrentScenario(nextScenarioIndex);
      setShowOutcome(false);
      setSelectedOption(null);
    } else {
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

  const restartGame = () => {
    const shuffledScenarios = [...initialScenarios].sort(() => Math.random() - 0.5);
    setScenarios(shuffledScenarios);
    setCurrentScenario(0);
    setScore(0);
    setShowOutcome(false);
    setSelectedOption(null);
    setGameOver(false);
  };

  if (scenarios.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Enhanced Database Recovery Concepts Game</h1>
      <p className="mb-4 text-center text-lg">Current Score: {score}</p>
      <p className="mb-4 text-center text-lg">Scenario {currentScenario + 1} of {scenarios.length}</p>
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-blue-500">Reminder:</h2>
        <p><strong>Rollback/Undo:</strong> Reverts the database to a previous state, undoing recent changes.</p>
        <p><strong>Commit/Redo:</strong> Saves all changes made during the current transaction to the database.</p>
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
          <AlertDialogContent className="bg-white p-4 rounded-lg shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-600">Game Over!</AlertDialogTitle>
              <AlertDialogDescription>
                You&apos;ve completed all scenarios. Your final score is {score} out of {scenarios.length}.
                {getPerformanceSummary(score)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={restartGame} className="bg-blue-500 text-white hover:bg-blue-700">Play Again</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}