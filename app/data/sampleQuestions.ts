export type Question = {
  id: number;
  text: string;
  type: "multiple-choice" | "open-ended";
  options?: string[];
  correctAnswer?: string;
};

export const passwordSecurityQuestions: Question[] = [
  {
    id: 1,
    text: "Which of the following is the most secure password?",
    type: "multiple-choice",
    options: [
      "Password123",
      "p@ssw0rd",
      "Tr0ub4dor&3",
      "correct-horse-battery-staple"
    ],
    correctAnswer: "correct-horse-battery-staple"
  },
  {
    id: 2,
    text: "What is a common method used by attackers to obtain passwords?",
    type: "multiple-choice",
    options: [
      "Phishing",
      "Social engineering",
      "Brute force attacks",
      "All of the above"
    ],
    correctAnswer: "All of the above"
  },
  {
    id: 3,
    text: "How often should you change your password for critical accounts?",
    type: "multiple-choice",
    options: [
      "Every day",
      "Every 60-90 days",
      "Once a year",
      "Only when there's a suspected breach"
    ],
    correctAnswer: "Every 60-90 days"
  },
  {
    id: 4,
    text: "Which of these is the best way to store passwords?",
    type: "multiple-choice",
    options: [
      "In a text file on your desktop",
      "Write them down on a sticky note",
      "Use a password manager",
      "Use the same password for all accounts so you remember it"
    ],
    correctAnswer: "Use a password manager"
  },
  {
    id: 5,
    text: "Explain what two-factor authentication (2FA) is and why it's important for password security.",
    type: "open-ended"
  }
];

export const phishingAwarenessQuestions: Question[] = [
  {
    id: 1,
    text: "Which of these is a common indicator of a phishing email?",
    type: "multiple-choice",
    options: [
      "Comes from someone you know",
      "Contains urgent action requests",
      "Has a professional appearance",
      "Contains specific information only relevant to you"
    ],
    correctAnswer: "Contains urgent action requests"
  },
  {
    id: 2,
    text: "What should you do if you suspect an email is a phishing attempt?",
    type: "multiple-choice",
    options: [
      "Click links to investigate them",
      "Reply to ask if it's legitimate",
      "Delete it and report it to IT",
      "Forward it to colleagues to get their opinion"
    ],
    correctAnswer: "Delete it and report it to IT"
  },
  {
    id: 3,
    text: "Which of these URL addresses is most likely associated with a phishing attempt?",
    type: "multiple-choice",
    options: [
      "https://www.paypal.com/account",
      "https://www.paypa1.com/account",
      "https://accounts.paypal.com/login",
      "https://paypal.com/login"
    ],
    correctAnswer: "https://www.paypa1.com/account"
  },
  {
    id: 4,
    text: "What is spear phishing?",
    type: "multiple-choice",
    options: [
      "Sending phishing emails to everyone in an organization",
      "Targeted phishing attacks aimed at specific individuals",
      "Using fake websites to collect credentials",
      "Phishing through text messages"
    ],
    correctAnswer: "Targeted phishing attacks aimed at specific individuals"
  },
  {
    id: 5,
    text: "Describe a recent phishing attempt you've encountered or heard about, and how you could identify it was a phishing attempt.",
    type: "open-ended"
  }
];

export const networkSecurityQuestions: Question[] = [
  {
    id: 1,
    text: "What is the primary purpose of a firewall?",
    type: "multiple-choice",
    options: [
      "To scan for viruses",
      "To monitor network traffic and block unauthorized access",
      "To encrypt data",
      "To improve network speed"
    ],
    correctAnswer: "To monitor network traffic and block unauthorized access"
  },
  {
    id: 2,
    text: "Which of the following is NOT a secure Wi-Fi protocol?",
    type: "multiple-choice",
    options: [
      "WPA3",
      "WPA2",
      "WEP",
      "WPA2-Enterprise"
    ],
    correctAnswer: "WEP"
  },
  {
    id: 3,
    text: "What is a VPN and why is it used?",
    type: "multiple-choice",
    options: [
      "Virtual Private Network - creates a secure, encrypted connection",
      "Virtual Personal Network - authenticates users",
      "Verified Protocol Network - blocks hackers",
      "Virtual Protection Node - removes viruses"
    ],
    correctAnswer: "Virtual Private Network - creates a secure, encrypted connection"
  },
  {
    id: 4,
    text: "What is a potential risk of using public Wi-Fi?",
    type: "multiple-choice",
    options: [
      "Slow internet speeds",
      "Too many pop-up advertisements",
      "Man-in-the-middle attacks",
      "Higher data usage"
    ],
    correctAnswer: "Man-in-the-middle attacks"
  },
  {
    id: 5,
    text: "Explain what network segmentation is and how it improves security.",
    type: "open-ended"
  }
];

// Map of topics to their questions
export const quizQuestions: Record<string, Question[]> = {
  "Password Security": passwordSecurityQuestions,
  "Phishing Awareness": phishingAwarenessQuestions,
  "Network Security": networkSecurityQuestions
}; 