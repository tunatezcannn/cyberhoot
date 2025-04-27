import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { isAuthenticated, getAuthToken, getUsername, clearAuthToken } from "~/services/authService";
import { fetchQuizAnalytics, QuizAnalytics } from "~/services/analyticsService";
import QuizAnalyticsCharts from "~/components/QuizAnalyticsCharts";

// Categories and quiz topics
type QuizTopic = {
  title: string;
  difficulty: "easy" | "medium" | "hard";
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  topics: QuizTopic[];
};

type AnalyticsData = {
  completedQuizzes: number;
  totalScore: number;
  averageScore: number;
  streakDays: number;
  lastQuizDate: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Check for authentication cookie in the request headers
  const cookieHeader = request.headers.get("Cookie");
  const hasAuthCookie = cookieHeader && cookieHeader.includes("auth_token=");
  
  // Check if user is authenticated either via cookie or in-memory token
  if (!hasAuthCookie && !isAuthenticated()) {
    return redirect("/login");
  }

  // Predefined categories and quiz topics
  const categories: Category[] = [
    {
      id: "passwords",
      name: "Passwords & Authentication",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      color: "blue",
      description: "Learn to create strong passwords and secure your accounts",
      topics: [
        { 
          title: "Build a memorable, unique password (length ≥ 12, pass-phrases)", 
          difficulty: "easy" 
        },
        { 
          title: "Adopt a password manager to store and autofill credentials safely", 
          difficulty: "medium" 
        },
        { 
          title: "Turn on and troubleshoot multi-factor authentication (MFA) for critical accounts", 
          difficulty: "hard" 
        }
      ]
    },
    {
      id: "phishing",
      name: "Phishing & Social Engineering",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      color: "yellow",
      description: "Identify and avoid phishing attempts and social engineering tactics",
      topics: [
        { 
          title: "Spot obvious phishing signs (poor grammar, urgent tone, mismatched sender)", 
          difficulty: "easy" 
        },
        { 
          title: "Safely inspect links & attachments without clicking (hover, sandbox viewers)", 
          difficulty: "medium" 
        },
        { 
          title: "Identify sophisticated spear-phishing/BEC attempts and report them", 
          difficulty: "hard" 
        }
      ]
    },
    {
      id: "device-security",
      name: "Device Security & Updates",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      color: "green",
      description: "Keep your devices secure with proper updates and configurations",
      topics: [
        { 
          title: "Run automatic OS & app updates to patch vulnerabilities", 
          difficulty: "easy" 
        },
        { 
          title: "Review app permissions and remove unused software on phone/PC", 
          difficulty: "medium" 
        },
        { 
          title: "Configure encrypted backups & secure-boot/Find My Device features", 
          difficulty: "hard" 
        }
      ]
    },
    {
      id: "browsing",
      name: "Safe Browsing & Network Use",
      icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
      color: "purple",
      description: "Browse safely and protect your data on public and home networks",
      topics: [
        { 
          title: "Check the padlock / HTTPS before entering data online", 
          difficulty: "easy" 
        },
        { 
          title: "Use a VPN on public Wi-Fi and understand captive portal risks", 
          difficulty: "medium" 
        },
        { 
          title: "Harden your home router (change default creds, WPA3, guest network, firmware updates)", 
          difficulty: "hard" 
        }
      ]
    },
    {
      id: "privacy",
      name: "Privacy & Data Protection",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "red",
      description: "Protect your personal data and maintain privacy online",
      topics: [
        { 
          title: "Adjust social-media privacy settings (limit public posts, friend lists)", 
          difficulty: "easy" 
        },
        { 
          title: "Block trackers & limit app data sharing with browser extensions and OS controls", 
          difficulty: "medium" 
        },
        { 
          title: "Leverage end-to-end-encrypted and anonymizing tools (Signal, Tor, encrypted email)", 
          difficulty: "hard" 
        }
      ]
    }
  ];

  const analytics: AnalyticsData = {
    completedQuizzes: 12,
    totalScore: 87,
    averageScore: 84.6,
    streakDays: 5,
    lastQuizDate: "2023-06-15"
  };

  // Fetch quiz analytics data
  let quizAnalytics: QuizAnalytics[] = [];
  try {
    // Since this is server-side, we should fetch directly from the API endpoint
    const apiUrl = "http://10.8.51.23:8080/ws/questions/getAllAnsweredQuestionsAndQuizzes";
    
    // Try to extract username from cookie or use a default
    let username = "anonymous";
    if (hasAuthCookie && cookieHeader) {
      const match = cookieHeader.match(/username=([^;]+)/);
      if (match) {
        username = match[1];
      }
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        // Pass the auth token if available
        ...(hasAuthCookie && { 
          "Cookie": cookieHeader || "" 
        })
      },
      body: JSON.stringify({ username })
    });
    
    if (response.ok) {
      quizAnalytics = await response.json();
    }
  } catch (error) {
    console.error("Error fetching quiz analytics:", error);
    // We'll return an empty array in case of error, and the client-side will handle it
  }

  return json({
    categories,
    analytics,
    quizAnalytics
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - CyberHoot" },
    { name: "description", content: "Your CyberHoot dashboard and learning center" },
  ];
};

export default function Dashboard() {
  const { categories, analytics: staticAnalytics, quizAnalytics } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<"quizzes" | "analytics">("quizzes");
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("User");
  const [clientQuizAnalytics, setClientQuizAnalytics] = useState<QuizAnalytics[]>(quizAnalytics);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Calculate real analytics from the quiz data
  const realAnalytics = useMemo(() => {
    // Count completed quizzes (quizzes with at least one answered question)
    const completedQuizzes = clientQuizAnalytics.filter(
      quiz => quiz.answeredQuestions.length > 0
    ).length;
    
    // Calculate average score across all quizzes
    let totalScore = 0;
    let totalQuestions = 0;
    
    clientQuizAnalytics.forEach(quiz => {
      quiz.answeredQuestions.forEach(question => {
        totalScore += question.score || 0;
        totalQuestions++;
      });
    });
    
    const averageScore = totalQuestions > 0 
      ? totalScore / totalQuestions 
      : 0;
    
    // Calculate streak based on quiz answer timestamps
    let streakDays = 0;
    let lastQuizDate = '';
    
    // Get all quiz answer dates
    const allAnswerDates: string[] = [];
    clientQuizAnalytics.forEach(quiz => {
      quiz.answeredQuestions.forEach(question => {
        if (question.createdAt) {
          allAnswerDates.push(question.createdAt.split('T')[0]); // Extract the date part only
        }
      });
    });
    
    if (allAnswerDates.length > 0) {
      // Sort dates in descending order (newest first)
      const sortedDates = [...new Set(allAnswerDates)]
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      lastQuizDate = sortedDates[0];
      
      // Calculate streak - count consecutive days
      streakDays = 1; // Start with current day
      
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = new Date(sortedDates[i]);
        const prevDate = new Date(sortedDates[i + 1]);
        
        // Check if dates are consecutive days
        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streakDays++;
        } else {
          // Break streak if days are not consecutive
          break;
        }
      }
    } else {
      // Use static data as fallback if no answer timestamps available
      streakDays = staticAnalytics.streakDays;
      lastQuizDate = staticAnalytics.lastQuizDate;
    }
    
    return {
      completedQuizzes,
      totalScore,
      averageScore,
      streakDays,
      lastQuizDate
    };
  }, [clientQuizAnalytics, staticAnalytics]);

  // Get the most recent quiz activities
  const recentQuizActivities = useMemo(() => {
    const allQuizzes = clientQuizAnalytics
      .filter(quiz => quiz.answeredQuestions.length > 0)
      .map(quiz => {
        // Find the most recent answered question in this quiz
        const lastAnsweredQuestion = [...quiz.answeredQuestions]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          
        return {
          quizId: quiz.quizId,
          quizName: quiz.quizName,
          quizTopic: quiz.quizTopic,
          score: quiz.answeredQuestions.filter(q => q.correct).length / quiz.answeredQuestions.length * 100,
          completedAt: lastAnsweredQuestion.createdAt,
          isComplete: true
        };
      });
      
    // Sort by date (newest first) and take the first 3
    return allQuizzes
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 3);
  }, [clientQuizAnalytics]);

  // Add CSS for animations only on the client side
  useEffect(() => {
    // This code only runs in the browser, not during SSR
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes float {
        0% {
          transform: translateY(0) translateX(0);
          opacity: 0;
        }
        10% {
          opacity: 0.5;
        }
        90% {
          opacity: 0.5;
        }
        100% {
          transform: translateY(-100vh) translateX(20px);
          opacity: 0;
        }
      }
      
      .shadow-glow-sm {
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up the style element when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Get username from cookie
  useEffect(() => {
    setUsername(getUsername());
  }, []);
  
  // Fetch analytics data on component mount
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchQuizAnalytics();
        setClientQuizAnalytics(data);
        setLastFetchTime(Date.now());
      } catch (error) {
        console.error("Failed to fetch quiz analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // If the data from the server is empty or has no quiz analytics, fetch client-side
    if (!clientQuizAnalytics.length || !clientQuizAnalytics.some(quiz => quiz.answeredQuestions.length > 0)) {
      fetchAnalyticsData();
    }
  }, []);
  
  // Handle client-side logout
  const handleLogout = () => {
    clearAuthToken();
    navigate("/login");
  };

  // Navigate to quiz setup with predefined parameters
  const handleStartCategoryQuiz = (categoryId: string, topic: QuizTopic) => {
    const queryParams = new URLSearchParams();
    queryParams.set("topic", topic.title);
    queryParams.set("type", "multiple-choice");
    queryParams.set("difficulty", topic.difficulty);
    queryParams.set("count", "10");
    
    navigate(`/quiz-setup?${queryParams.toString()}`);
  };

  // Fetch analytics data only if cache is expired when switching to analytics tab
  useEffect(() => {
    const currentTime = Date.now();
    const cacheExpired = currentTime - lastFetchTime > CACHE_DURATION;
    
    if (activeTab === "analytics" && cacheExpired) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await fetchQuizAnalytics();
          setClientQuizAnalytics(data);
          setLastFetchTime(currentTime);
        } catch (error) {
          console.error("Failed to fetch quiz analytics:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [activeTab, lastFetchTime]);

  // Function to calculate time ago
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Future date safety check
    if (seconds < 0) {
      return 'just now';
    }
    
    let interval = seconds / 31536000; // Years
    if (interval > 1) {
      return Math.floor(interval) + ' years ago';
    }
    
    interval = seconds / 2592000; // Months
    if (interval > 1) {
      return Math.floor(interval) + ' months ago';
    }
    
    interval = seconds / 86400; // Days
    if (interval > 1) {
      return Math.floor(interval) + ' days ago';
    }
    
    interval = seconds / 3600; // Hours
    if (interval > 1) {
      return Math.floor(interval) + ' hours ago';
    }
    
    interval = seconds / 60; // Minutes
    if (interval > 1) {
      return Math.floor(interval) + ' minutes ago';
    }
    
    return 'just now';
  };

  return (
    <div className="flex min-h-screen flex-col bg-cyber-dark">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,200,150,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,150,0.07)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      {/* Floating particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-cyber-green opacity-20"
            style={{
              width: `${Math.random() * 10 + 3}px`,
              height: `${Math.random() * 10 + 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Header */}
      <header className="relative border-b border-cyber-border bg-cyber-navy p-4 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/favicon.ico" alt="CyberHoot" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-white text-glow">CyberHoot</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 rounded-full bg-cyber-navy-light px-4 py-2">
              <svg className="h-5 w-5 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium text-white">{username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-400 hover:text-cyber-green"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Welcome card */}
            <div className="col-span-1 rounded-xl bg-cyber-navy p-6 shadow-cyber md:col-span-2">
              <h2 className="mb-2 text-xl font-bold text-white">
                Welcome back, <span className="text-cyber-green">{username}</span>
              </h2>
              <p className="mb-4 text-gray-400">
                Your current streak is <span className="font-bold text-cyber-green">{realAnalytics.streakDays} days</span>. 
                Keep learning to maintain your progress!
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  className="rounded-md bg-cyber-green px-4 py-2 text-sm font-bold text-cyber-dark transition-all hover:bg-opacity-90"
                  onClick={() => navigate("/quiz-setup")}
                >
                  Start Quiz
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className="rounded-md border border-cyber-green bg-transparent px-4 py-2 text-sm font-bold text-cyber-green transition-all hover:bg-cyber-green hover:bg-opacity-20"
                >
                  View Analytics
                </button>
              </div>
            </div>

            {/* Stats cards */}
            <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Completed Quizzes</p>
                  <h3 className="text-2xl font-bold text-white">{realAnalytics.completedQuizzes}</h3>
                </div>
                <div className="rounded-full bg-cyber-green bg-opacity-20 p-3">
                  <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 h-1 w-full rounded-full bg-cyber-dark">
                <div className="h-1 rounded-full bg-cyber-green" style={{ width: `${(realAnalytics.completedQuizzes / 20) * 100}%` }}></div>
              </div>
            </div>

            <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg. Score</p>
                  <h3 className="text-2xl font-bold text-white">{Math.round(realAnalytics.averageScore)}</h3>
                </div>
                <div className="rounded-full bg-cyber-green bg-opacity-20 p-3">
                  <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 h-1 w-full rounded-full bg-cyber-dark">
                <div className="h-1 rounded-full bg-cyber-green" style={{ width: `${Math.min(100, realAnalytics.averageScore / 5)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 border-b border-cyber-border">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`border-b-2 pb-4 pt-2 text-sm font-medium transition-colors ${
                  activeTab === "quizzes"
                    ? "border-cyber-green text-cyber-green"
                    : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300"
                }`}
              >
                Quiz Categories
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`border-b-2 pb-4 pt-2 text-sm font-medium transition-colors ${
                  activeTab === "analytics"
                    ? "border-cyber-green text-cyber-green"
                    : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300"
                }`}
              >
                Your Analytics
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="mt-6">
            {activeTab === "quizzes" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <div key={category.id} className="overflow-hidden rounded-xl bg-cyber-navy shadow-cyber transition-all hover:shadow-glow-sm">
                    <div className={`bg-${category.color}-500 bg-opacity-10 p-6`}>
                      <div className="mb-4 flex items-center">
                        <div className={`mr-4 rounded-lg bg-${category.color}-500 bg-opacity-20 p-3`}>
                          <svg className={`h-6 w-6 text-${category.color}-400`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">{category.name}</h3>
                      </div>
                      <p className="mb-4 text-sm text-gray-400">{category.description}</p>
                      
                      <div className="space-y-3">
                        {category.topics.map((topic, index) => (
                          <div 
                            key={index} 
                            className="flex cursor-pointer items-center justify-between rounded-lg bg-cyber-dark p-3 transition-all hover:bg-cyber-navy-light"
                            onClick={() => handleStartCategoryQuiz(category.id, topic)}
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{topic.title}</p>
                            </div>
                            <div className="ml-4 flex items-center">
                              <span 
                                className={`mr-2 rounded-full px-2 py-1 text-xs font-medium ${
                                  topic.difficulty === "easy" 
                                    ? "bg-green-500 bg-opacity-20 text-green-400" 
                                    : topic.difficulty === "medium"
                                      ? "bg-yellow-500 bg-opacity-20 text-yellow-400"
                                      : "bg-red-500 bg-opacity-20 text-red-400"
                                }`}
                              >
                                {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
                              </span>
                              <svg className="h-4 w-4 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Quiz Analytics</h2>
                  <p className="text-gray-400">
                    Detailed insights into your quiz performance and progress
                  </p>
                </div>
                
                {isLoading ? (
                  <div className="flex h-64 w-full items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyber-green border-t-transparent"></div>
                  </div>
                ) : (
                  <>
                    {/* Original static analytics cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                      <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
                        <h3 className="mb-4 text-lg font-bold text-white">Performance Overview</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm text-gray-400">Completed Quizzes</span>
                              <span className="text-sm font-medium text-white">{realAnalytics.completedQuizzes}/20</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-cyber-dark">
                              <div 
                                className="h-2 rounded-full bg-cyber-green" 
                                style={{ width: `${(realAnalytics.completedQuizzes / 20) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm text-gray-400">Average Score</span>
                              <span className="text-sm font-medium text-white">{Math.round(realAnalytics.averageScore)}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-cyber-dark">
                              <div 
                                className="h-2 rounded-full bg-cyber-green" 
                                style={{ width: `${Math.min(100, realAnalytics.averageScore / 5)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm text-gray-400">Daily Streak</span>
                              <span className="text-sm font-medium text-white">{realAnalytics.streakDays} days</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-cyber-dark">
                              <div 
                                className="h-2 rounded-full bg-cyber-green" 
                                style={{ width: `${(realAnalytics.streakDays / 7) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
                        <h3 className="mb-4 text-lg font-bold text-white">Recent Activity</h3>
                        <div className="space-y-4">
                          {recentQuizActivities.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3 rounded-lg bg-cyber-dark p-3">
                              <div className="flex-shrink-0 rounded-full bg-green-500 bg-opacity-20 p-2">
                                <svg className="h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm text-white">{activity.quizName}</p>
                                <p className="text-xs text-gray-400">Score: {Math.round(activity.score)}% · {getTimeAgo(activity.completedAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* New dynamic quiz analytics charts */}
                    <div className="my-6">
                      <h3 className="text-xl font-bold text-white mb-4">Detailed Quiz Analytics</h3>
                      <QuizAnalyticsCharts quizAnalytics={clientQuizAnalytics} />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-cyber-border bg-cyber-navy-dark p-4 text-center text-sm text-gray-400">
        <p>© 2025 CyberHoot. All rights reserved.</p>
      </footer>
    </div>
  );
} 