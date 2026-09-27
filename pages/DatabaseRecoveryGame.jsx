import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const ROLLBACK = "Rollback (undo)";
const COMMIT = "Commit recovery (redo)";

const initialScenarios = [
  {
    id: 1,
    title: "Campus Bookstore: In-Store Checkout",
    description: "It's the first day of classes and the bookstore line is out the door. A student is buying a $480 textbook bundle. The register had deducted 3 of the 5 books from inventory and was still waiting on card authorization when the point-of-sale server crashed. No receipt printed and the card was never charged. The store manager wants the line moving again as fast as possible.",
    question: "Which recovery method should the system apply to this sale?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The partial inventory changes are undone. The cashier rings the sale up again and the student walks out with their books a minute later.",
        score: 1,
        feedback: "Correct. The crash hit before the sale was committed - no charge, no receipt. Undoing the half-finished sale keeps inventory accurate, and re-ringing it costs the store about a minute."
      },
      {
        text: COMMIT,
        outcome: "Inventory now shows 3 books sold that are still on the shelf, and the store has no payment for them.",
        score: 0,
        feedback: "Not quite. Commit recovery only redoes transactions that already committed. This sale never finished - there's no charge and no receipt - so keeping its partial changes leaves the store with phantom sales and inventory it can't trust."
      }
    ]
  },
  {
    id: 2,
    title: "Campus Bookstore: Online Order",
    description: "A student ordered the same $480 bundle online. Their card was charged and the order confirmation email with an order number landed in their inbox. Seconds later, the store's database server lost power before the order data in memory had been written to disk. The e-commerce manager is worried about customer complaints either way.",
    question: "Which recovery method should the system apply to this order?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The order disappears from the system, but the student's card was still charged. They email support with their confirmation number and nobody can find the order.",
        score: 0,
        feedback: "Costly mistake. The order had already committed - the charge and confirmation email prove it. Erasing it means you took the customer's money and lost their order, which leads to chargebacks and bad reviews."
      },
      {
        text: COMMIT,
        outcome: "On restart, the system replays the committed order from its log. The books ship on time and the customer never knows anything went wrong.",
        score: 1,
        feedback: "Correct. The failure came after the commit, so the order is a promise the business already made. Commit recovery redoes the committed work from the log so that promise is kept."
      }
    ]
  },
  {
    id: 3,
    title: "Financial Aid: Refund Batch Crash",
    description: "It's the week before rent is due and 1,800 students are waiting on $2.3M in financial aid refunds. The nightly disbursement job had written refund records for about 1,100 students when it crashed. The batch was still running, no refund notices had gone out, and the bank transfer file had not been created yet. A dean asks, \"Can't we just keep the 1,100 that went through?\"",
    question: "Which recovery method should the system apply to this batch?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The partial batch is undone and the full job reruns cleanly an hour later. All 1,800 refunds go out together and the ledger matches the bank file.",
        score: 1,
        feedback: "Correct. Nothing went through - the batch never reached its commit and no money left the bank. Keeping the half-written records would leave the ledger out of sync with what was actually paid. A short delay is much cheaper than an audit finding."
      },
      {
        text: COMMIT,
        outcome: "The ledger shows 1,100 refunds as paid, but no bank file was ever sent. Students see \"disbursed\" in the portal and have no money.",
        score: 0,
        feedback: "Not quite. The dean's instinct is understandable, but the batch never committed, so there's nothing valid to redo. The records say students were paid when they weren't - an accounting and customer-service mess."
      }
    ]
  },
  {
    id: 4,
    title: "Financial Aid: After the Transfer",
    description: "It's the week before rent is due and the nightly financial aid job has just completed its full run of $2.3M in refunds for 1,800 students. The bank transfer file went out to the bank, and students got texts saying \"Your refund is on the way.\" Minutes later, the database server crashed before the completed batch had been fully written from memory to disk. The bursar is nervous and suggests \"putting everything back the way it was\" to be safe.",
    question: "Which recovery method should the system apply?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The database now says no refunds were paid, but $2.3M already left the bank. The next run would pay everyone a second time.",
        score: 0,
        feedback: "Dangerous. The batch committed and the money moved. Rolling it back erases the university's record of real payments, which invites double payments and a failed audit. Undo is for work that never committed."
      },
      {
        text: COMMIT,
        outcome: "The committed refunds are replayed from the log. The books match the bank, and students get exactly one refund each.",
        score: 1,
        feedback: "Correct. The failure came after the commit, so those payments are business facts. Commit recovery restores them to permanent storage so the records match what actually happened."
      }
    ]
  },
  {
    id: 5,
    title: "Course Registration Day",
    description: "It's 8 AM on registration day and a required capstone course has 3 seats left. A student clicks Register, pays the $150 course fee, and sees \"Registration confirmed - Confirmation #48213.\" A moment later, one of the registration servers crashes before its confirmed changes are fully saved to disk. The registrar's office is flooded with calls and wants the system stable fast.",
    question: "Which recovery method should the system apply to this registration?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The student's seat reopens and someone else takes it. The first student shows up on day one with a confirmation number and no seat.",
        score: 0,
        feedback: "Not quite. The student saw a confirmation number, which means the registration committed. Undoing it breaks a promise the university made, and the student may have to delay graduation."
      },
      {
        text: COMMIT,
        outcome: "The committed registration is redone from the log. The student keeps their seat and the class roster stays accurate.",
        score: 1,
        feedback: "Correct. A confirmation number means the transaction committed before the crash. Commit recovery makes sure the committed seat and payment survive the failure."
      }
    ]
  },
  {
    id: 6,
    title: "HR Payroll: Mid-Year Raise",
    description: "The board approved a 3% raise for 400 staff, effective this Friday's payroll. HR's salary update had changed about 240 employee records when the payroll server crashed, before the update committed. The payroll director is under pressure: \"Most people already have their raise - let's keep what's there and fix the rest later.\"",
    question: "Which recovery method should the system apply to this salary update?",
    options: [
      {
        text: ROLLBACK,
        outcome: "All 240 partial changes are undone. HR reruns the full update that afternoon and every eligible employee gets the same raise on Friday.",
        score: 1,
        feedback: "Correct. The update never committed, so it has to be all or nothing. Rolling back the partial changes avoids a payroll where some colleagues got the raise and others didn't - a pay-equity problem no HR director wants."
      },
      {
        text: COMMIT,
        outcome: "Friday's payroll gives 240 people a raise and leaves out 160. HR gets a flood of complaints and a pay-equity grievance.",
        score: 0,
        feedback: "Not quite. The update never committed, so there's nothing valid to redo. Keeping the partial changes means paying equal employees unequally, which becomes a legal, trust and morale problem."
      }
    ]
  },
  {
    id: 7,
    title: "Alumni Donation Gala",
    description: "At the annual fundraising gala, an alumna pledges $250,000. Her card is charged, the gift is processed, and the development office puts \"Thank you, Class of '98!\" on the big screen. A few minutes later, the donation server crashes before those processed changes reach permanent storage. Nervous about accuracy, a staffer suggests reverting tonight's transactions and re-entering them next week.",
    question: "Which recovery method should the system apply to this gift?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The gift disappears from the records even though her card was charged. The finance office can't match the money to a donor, and her tax receipt never goes out.",
        score: 0,
        feedback: "Heavy-handed. The gift was fully processed and charged - it committed. Reverting it loses a real $250,000 transaction and embarrasses a major donor. Rollback is for work that never finished."
      },
      {
        text: COMMIT,
        outcome: "The committed gift is redone from the log. Her tax receipt goes out on time and the campaign total is correct.",
        score: 1,
        feedback: "Correct. The charge and public thank-you show the donation committed before the crash. Commit recovery preserves it, protecting both the university's revenue and the donor relationship."
      }
    ]
  },
  {
    id: 8,
    title: "Dining Services: Supplier Order",
    description: "Dining Services is placing a $60,000 bulk food order before the semester rush. The purchasing system had entered 12 of the order's 30 line items when the server crashed. The order was never submitted to the supplier and no purchase order number was issued. The kitchen manager points out that the 12 saved items are the most urgent ones.",
    question: "Which recovery method should the system apply to this order?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The partial order is cleared. Purchasing re-enters and submits the complete order, and the supplier delivers everything on one truck.",
        score: 1,
        feedback: "Correct. No PO number and nothing sent to the supplier means the order never committed. Undoing the partial order and resubmitting it whole avoids a budget that shows $60K committed for an order that's only 40% there."
      },
      {
        text: COMMIT,
        outcome: "Budget reports show a partial order that the supplier never received. Nobody is sure what was actually ordered.",
        score: 0,
        feedback: "Not quite. The urgent items feel important, but the order never committed, so there's nothing to redo. Keeping half an order creates a mismatch between the budget, the supplier and the kitchen."
      }
    ]
  },
  {
    id: 9,
    title: "Parking Permit Sales",
    description: "Semester parking permits are selling fast. A commuter student pays $320, gets a digital permit on their phone, and receives an emailed receipt. Shortly after, the parking system's server fails before those completed sales are fully written to disk. Parking Services worries that some records from right before the crash might be bad.",
    question: "Which recovery method should the system apply to this sale?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The permit record is wiped. The next morning, enforcement tickets the student's car even though they paid and have a receipt.",
        score: 0,
        feedback: "Not quite. A receipt and an issued permit mean the sale committed. Rolling it back punishes a paying customer and creates refund and appeal work for Parking Services."
      },
      {
        text: COMMIT,
        outcome: "The committed sale is redone from the log. The student's permit is valid, their payment is recorded, and there are no tickets.",
        score: 1,
        feedback: "Correct. The receipt proves the transaction committed before the failure. Commit recovery ensures that paid permits are honored."
      }
    ]
  },
  {
    id: 10,
    title: "Budget Office: Department Transfer",
    description: "The CFO approved moving $500,000 from the Athletics budget to Facilities for an emergency roof repair. The transfer had subtracted $500,000 from Athletics, but the server crashed before adding it to Facilities and before the transfer committed. The quarterly budget report goes to the Board of Trustees tomorrow morning.",
    question: "Which recovery method should the system apply to this transfer?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The $500,000 is restored to Athletics and the transfer reruns successfully. Tomorrow's board report balances to the penny.",
        score: 1,
        feedback: "Correct. Only half the transfer happened and it never committed. Rollback undoes the debit so money doesn't vanish between two accounts. A transfer must be all or nothing."
      },
      {
        text: COMMIT,
        outcome: "Athletics is down $500,000 and Facilities never received it. The board report is off by half a million dollars.",
        score: 0,
        feedback: "Not quite. The transfer never committed, so there's nothing valid to redo. Keeping the half-finished transfer makes money disappear from the books the night before a board meeting."
      }
    ]
  },
  {
    id: 11,
    title: "Ford Field: Game-Day Food Ordering",
    newsLink: {
      label: "AWS was down: live updates following massive outage that broke the internet (Tom's Guide, Oct. 2025)",
      url: "https://www.tomsguide.com/news/live/amazon-outage-october-2025"
    },
    description: "It's a sold-out Lions home game at Ford Field. A fan orders $38 of food in the stadium app for pickup at halftime. While the app was saving the order, the cloud provider that hosts it went down in a regional outage, like the big cloud outages that have taken down thousands of apps at once in recent years. The fan's card was never charged and no pickup number appeared. The concessions manager is worried about losing halftime sales.",
    question: "Which recovery method should the system apply to this order?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The half-saved order is cleared. When the app comes back, the fan places the order again and picks it up at halftime.",
        score: 1,
        feedback: "Correct. No charge and no pickup number means the order never committed. Undoing it keeps the kitchen from cooking unpaid orders and keeps the sales numbers accurate."
      },
      {
        text: COMMIT,
        outcome: "The kitchen gets a ticket for an order nobody paid for. The food goes to waste and the sales report is off.",
        score: 0,
        feedback: "Not quite. Commit recovery only redoes work that committed. This order never got a charge or a pickup number, so there's nothing valid to redo - just a half-saved order that costs the stand money."
      }
    ]
  },
  {
    id: 12,
    title: "Eastern Market: Storm Power Outage",
    newsLink: {
      label: "Storms knock out power for more than 200K DTE customers across Metro Detroit (ClickOnDetroit, Sept. 2026)",
      url: "https://www.clickondetroit.com/news/local/2026/09/03/storms-knock-out-power-for-more-than-200000-dte-customers-across-metro-detroit/"
    },
    description: "It's a busy Saturday at Eastern Market. A flower vendor sells $1,200 of arrangements to a Corktown restaurant. The card is approved and the receipt is texted to the restaurant owner. Minutes later, a summer thunderstorm knocks out power to thousands of DTE customers, including the vendor's stall. The point-of-sale system shut down before the sale had been fully written from memory to disk. The vendor's partner suggests deleting anything from right before the outage and ringing it up again.",
    question: "Which recovery method should the system apply to this sale?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The sale disappears from the vendor's books. If they ring it up again, the restaurant gets charged twice for one order.",
        score: 0,
        feedback: "Not quite. The approved card and texted receipt show the sale committed before the power went out. Rolling it back loses a real sale, and ringing it up again double-charges a regular wholesale customer."
      },
      {
        text: COMMIT,
        outcome: "When power returns, the system replays the committed sale from its log. The vendor's books match the card processor's deposit.",
        score: 1,
        feedback: "Correct. The failure came after the commit. Commit recovery restores the sale so the books, the bank deposit and the customer's receipt all agree."
      }
    ]
  },
  {
    id: 13,
    title: "Detroit Free Press Marathon: Group Registration",
    newsLink: {
      label: "Website Glitch Delays Chicago Marathon Registration (CBS Chicago, 2014)",
      url: "https://www.cbsnews.com/chicago/news/website-glitch-delays-chicago-marathon-registration/"
    },
    description: "Registration for the Detroit Free Press Marathon just opened and traffic is spiking. A running club captain is registering 25 members in one group sign-up. The site had assigned bib numbers to 14 runners when the web server failed under the load. Payment for the group had not gone through, and no confirmation email was sent. The captain calls and asks the race office to \"at least keep the 14 who got bibs.\"",
    question: "Which recovery method should the system apply to this group registration?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The 14 bib assignments are released. The captain submits the full group again when the site recovers, and all 25 runners are registered and paid together.",
        score: 1,
        feedback: "Correct. No payment and no confirmation means the group sign-up never committed. Keeping 14 unpaid bibs would hold race spots nobody paid for and break the club's all-or-nothing group registration."
      },
      {
        text: COMMIT,
        outcome: "Fourteen unpaid runners hold bibs while other runners are told the race is full. Finance can't match the entries to any payment.",
        score: 0,
        feedback: "Not quite. The captain's request is understandable, but the sign-up never committed, so there's nothing valid to redo. Keeping partial, unpaid entries costs the race revenue and blocks paying runners."
      }
    ]
  },
  {
    id: 14,
    title: "DTW Airport: Global IT Outage",
    newsLink: {
      label: "Detroit Metro Airport travelers react to delays and cancelations from CrowdStrike-related IT outage (WXYZ Detroit, July 2024)",
      url: "https://www.wxyz.com/news/detroit-metro-airport-travelers-react-to-delays-and-cancelations-from-crowdstrike-related-it-outage"
    },
    description: "A faulty security software update is crashing computers around the world, like the July 2024 global IT outage that grounded flights everywhere. At Detroit Metro Airport, a gate agent rebooks a family of four onto a later flight to Orlando. The new seats are confirmed, and boarding passes are printed and texted to the family. Seconds later, the airline's reservation server crashes before the rebooking is fully written from memory to disk. A supervisor suggests wiping the last few minutes of changes to be safe.",
    question: "Which recovery method should the system apply to this rebooking?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The family's new seats vanish. At boarding, their passes don't scan and the seats have been given to standby passengers.",
        score: 0,
        feedback: "Not quite. Confirmed seats and printed boarding passes show the rebooking committed. Rolling it back strands a family that did everything right, and during a mass outage there may be no other seats left."
      },
      {
        text: COMMIT,
        outcome: "The committed rebooking is redone from the log. The family's boarding passes scan and they make it to Orlando.",
        score: 1,
        feedback: "Correct. The failure came after the commit. Commit recovery keeps the airline's promise to the customer, which matters even more when thousands of other passengers are also stranded."
      }
    ]
  },
  {
    id: 15,
    title: "Auto Supplier: Internet Outage",
    newsLink: {
      label: "Cut fiber cable causing Verizon service outage in Kalamazoo County was an act of vandalism (WWMT, Apr. 2026)",
      url: "https://wwmt.com/news/local/verizon-outage-services-cut-fiber-restoration-time-cell-signal-network-systems-kalamazoo-county-engineers-fix-portage-augusta-western-michigan-infrastructure"
    },
    description: "A Detroit-area auto parts supplier ships brake assemblies just in time to a nearby assembly plant. The shipping clerk was recording a 5-pallet shipment and had entered 3 pallets when vandals cut a fiber line in the area, knocking out the building's internet and its connection to the database. The truck is still at the dock and no bill of lading has been printed. The plant needs the parts by the afternoon shift, and the shipping manager says, \"The 3 pallets are in the system - just send them.\"",
    question: "Which recovery method should the system apply to this shipment record?",
    options: [
      {
        text: ROLLBACK,
        outcome: "The partial record is cleared. The clerk enters all 5 pallets once the connection is back, the bill of lading prints, and the full shipment arrives before the shift.",
        score: 1,
        feedback: "Correct. No bill of lading and a truck still at the dock mean the shipment record never committed. Undoing the partial record keeps inventory and billing accurate, so the plant is charged for exactly what it gets."
      },
      {
        text: COMMIT,
        outcome: "The system shows 3 pallets shipped while 5 are on the truck. The plant's receiving count doesn't match and the invoice is wrong.",
        score: 0,
        feedback: "Not quite. The shipment never committed, so there's nothing valid to redo. Keeping 3 of 5 pallets on record creates inventory and billing errors with the supplier's most important customer."
      }
    ]
  }
];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const shuffleScenarios = () =>
  shuffle(initialScenarios).map(scenario => ({ ...scenario, options: shuffle(scenario.options) }));

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
    setScenarios(shuffleScenarios());
  }, []);

  const handleAnswer = (option) => {
    setSelectedOption(option);
    setShowOutcome(true);
    setScore(prevScore => Math.max(0, Math.min(scenarios.length, prevScore + option.score)));
  };

  const nextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setShowOutcome(false);
      setSelectedOption(null);
    } else {
      setCompletionTime(new Date().getTime());
      setGameOver(true);
    }
  };

  const getPerformanceSummary = (score) => {
    const percentage = (score / scenarios.length) * 100;
    if (percentage < 30) {
      return "Poor performance: Most decisions were incorrect, leading to significant system issues and data problems.";
    } else if (percentage < 50) {
      return "Below average performance: Several incorrect decisions have caused delays and data inconsistencies.";
    } else if (percentage < 70) {
      return "Average performance: Mixed results with some correct and incorrect decisions affecting system operation.";
    } else if (percentage < 90) {
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
      return `Mixed results: ${correctAnswers}/${totalAnswers} optimal decisions (${percentage}%). Look closely at when the failure happened - before or after the commit?`;
    } else {
      return `Challenging start: ${correctAnswers}/${totalAnswers} correct decisions (${percentage}%). In each story, look for evidence of whether the transaction committed (a receipt, a confirmation, money moved) before the failure.`;
    }
  };

  const generateCompletionCode = (finalScore, completionTime) => {
    // Simple encoding: score (0-15) + time hash (2 chars) + checksum (3 chars)
    // Score: A-P (A=0, B=1, C=2, ... P=15)
    const scoreChar = String.fromCharCode(65 + finalScore); // A-P
    
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
    setScenarios(shuffleScenarios());
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
            <p><strong>Rollback (undo)</strong></p>
            <ul className="text-sm text-gray-700 ml-4 list-disc list-inside">
              <li>Use rollback when the system failure occurs before the transaction commits.</li>
              <li>The transaction is not complete.</li>
              <li>Some changes can be in memory (RAM). Some changes can be on the hard drive.</li>
              <li>Rollback removes all of the changes from the transaction.</li>
              <li>The database goes back to its condition before the transaction started.</li>
            </ul>
          </div>
          <div>
            <p><strong>Commit recovery (redo)</strong></p>
            <ul className="text-sm text-gray-700 ml-4 list-disc list-inside">
              <li>Use commit recovery when the system failure occurs after the transaction commits.</li>
              <li>The transaction is complete. The log on the hard drive records the commit.</li>
              <li>Some changes are only in memory (RAM). The system failure erases the memory.</li>
              <li>Commit recovery reads the log. Then it writes the changes to the hard drive.</li>
              <li>The database keeps all of the committed work.</li>
            </ul>
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">Key question: Did the transaction commit before the system failure?</p>
            <ul className="text-sm text-blue-700 ml-4 list-disc list-inside">
              <li>No: use rollback.</li>
              <li>Yes: use commit recovery.</li>
            </ul>
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
            {scenarios[currentScenario].newsLink && (
              <p className="mb-4 text-sm text-gray-600">
                📰 Based on a real-life story:{" "}
                <a
                  href={scenarios[currentScenario].newsLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {scenarios[currentScenario].newsLink.label}
                </a>
              </p>
            )}
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
                      href="https://canvas.wayne.edu/courses/245765/assignments/2364160?module_item_id=6584822"
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