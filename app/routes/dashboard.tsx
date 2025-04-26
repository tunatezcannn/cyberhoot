import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { isAuthenticated, getAuthToken, getUsername } from "~/services/authService";

// Sample types for dashboard data
type QuizOverview = {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  questionsCount: number;
  estimatedTime: string;
  category: string;
};

type AnalyticsData = {
  completedQuizzes: number;
  totalScore: number;
  averageScore: number;
  streakDays: number;
  lastQuizDate: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return redirect("/login");
  }

  // For server-side rendering, we should check for an auth cookie in the request headers
  // but since we don't have proper cookie parsing set up, we'll use the fallback approach
  // Check if user is authenticated - for now we're assuming the fallback token is valid
  // In a real app, you would validate the token from cookies or session
  
  // In a real app, you would fetch this data from your API
  // Sample data for demonstration
  const upcomingQuizzes: QuizOverview[] = [
    {
      id: "q1",
      title: "Cybersecurity Basics",
      difficulty: "Beginner",
      questionsCount: 10,
      estimatedTime: "15 min",
      category: "Security"
    },
    {
      id: "q2",
      title: "Password Management",
      difficulty: "Beginner",
      questionsCount: 8,
      estimatedTime: "12 min",
      category: "Security"
    },
    {
      id: "q3",
      title: "Network Security",
      difficulty: "Intermediate",
      questionsCount: 15,
      estimatedTime: "25 min",
      category: "Networking"
    },
    {
      id: "q4",
      title: "Advanced Threat Detection",
      difficulty: "Advanced",
      questionsCount: 20,
      estimatedTime: "35 min",
      category: "Security"
    }
  ];

  const analytics: AnalyticsData = {
    completedQuizzes: 12,
    totalScore: 87,
    averageScore: 84.6,
    streakDays: 5,
    lastQuizDate: "2023-06-15"
  };

  return json({
    upcomingQuizzes,
    analytics
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - CyberHoot" },
    { name: "description", content: "Your CyberHoot dashboard and learning center" },
  ];
};

export default function Dashboard() {
  const { upcomingQuizzes, analytics } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<"quizzes" | "analytics">("quizzes");
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("User");

  useEffect(() => {
    // Get username from cookie
    setUsername(getUsername());
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-cyber-dark">
      {/* Header */}
      <header className="border-b border-cyber-border bg-cyber-navy p-4 shadow-md">
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
            <Link to="/logout" className="rounded-md px-4 py-2 text-sm font-medium text-gray-400 hover:text-cyber-green">
              Logout
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Welcome card */}
            <div className="col-span-1 rounded-xl bg-cyber-navy p-6 shadow-cyber md:col-span-2">
              <h2 className="mb-2 text-xl font-bold text-white">
                Welcome back, <span className="text-cyber-green">{username}</span>
              </h2>
              <p className="mb-4 text-gray-400">
                Your current streak is <span className="font-bold text-cyber-green">{analytics.streakDays} days</span>. 
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
                  <h3 className="text-2xl font-bold text-white">{analytics.completedQuizzes}</h3>
                </div>
                <div className="rounded-full bg-cyber-green bg-opacity-20 p-3">
                  <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 h-1 w-full rounded-full bg-cyber-dark">
                <div className="h-1 rounded-full bg-cyber-green" style={{ width: `${(analytics.completedQuizzes / 20) * 100}%` }}></div>
              </div>
            </div>

            <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg. Score</p>
                  <h3 className="text-2xl font-bold text-white">{analytics.averageScore}%</h3>
                </div>
                <div className="rounded-full bg-cyber-green bg-opacity-20 p-3">
                  <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 h-1 w-full rounded-full bg-cyber-dark">
                <div className="h-1 rounded-full bg-cyber-green" style={{ width: `${analytics.averageScore}%` }}></div>
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
                Available Quizzes
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingQuizzes.map((quiz) => (
                  <div key={quiz.id} className="group relative overflow-hidden rounded-xl bg-cyber-navy transition-all hover:shadow-glow-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyber-green to-blue-500 opacity-0 transition-opacity group-hover:opacity-10"></div>
                    <div className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-lg font-bold text-white group-hover:text-cyber-green">{quiz.title}</h3>
                        <span 
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            quiz.difficulty === "Beginner" 
                              ? "bg-green-500 bg-opacity-20 text-green-400" 
                              : quiz.difficulty === "Intermediate"
                                ? "bg-yellow-500 bg-opacity-20 text-yellow-400"
                                : "bg-red-500 bg-opacity-20 text-red-400"
                          }`}
                        >
                          {quiz.difficulty}
                        </span>
                      </div>
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-400">
                          <svg className="mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {quiz.questionsCount} questions
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <svg className="mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {quiz.estimatedTime}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <svg className="mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {quiz.category}
                        </div>
                      </div>
                      <Link 
                        to={`/quiz/${quiz.id}`}
                        className="mt-4 inline-flex items-center rounded-md bg-cyber-green bg-opacity-10 px-4 py-2 text-sm font-medium text-cyber-green transition-all hover:bg-opacity-20"
                      >
                        Start Quiz
                        <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
                  <h3 className="mb-4 text-lg font-bold text-white">Performance Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-gray-400">Completed Quizzes</span>
                        <span className="text-sm font-medium text-white">{analytics.completedQuizzes}/20</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-cyber-dark">
                        <div 
                          className="h-2 rounded-full bg-cyber-green" 
                          style={{ width: `${(analytics.completedQuizzes / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-gray-400">Average Score</span>
                        <span className="text-sm font-medium text-white">{analytics.averageScore}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-cyber-dark">
                        <div 
                          className="h-2 rounded-full bg-cyber-green" 
                          style={{ width: `${analytics.averageScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-gray-400">Daily Streak</span>
                        <span className="text-sm font-medium text-white">{analytics.streakDays} days</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-cyber-dark">
                        <div 
                          className="h-2 rounded-full bg-cyber-green" 
                          style={{ width: `${(analytics.streakDays / 7) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
                  <h3 className="mb-4 text-lg font-bold text-white">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 rounded-lg bg-cyber-dark p-3">
                      <div className="flex-shrink-0 rounded-full bg-green-500 bg-opacity-20 p-2">
                        <svg className="h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white">Completed "Cybersecurity Basics" quiz</p>
                        <p className="text-xs text-gray-400">Score: 90% · 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 rounded-lg bg-cyber-dark p-3">
                      <div className="flex-shrink-0 rounded-full bg-yellow-500 bg-opacity-20 p-2">
                        <svg className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white">Started "Network Security" quiz</p>
                        <p className="text-xs text-gray-400">Progress: 60% · 3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 rounded-lg bg-cyber-dark p-3">
                      <div className="flex-shrink-0 rounded-full bg-blue-500 bg-opacity-20 p-2">
                        <svg className="h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white">Earned "Fast Learner" badge</p>
                        <p className="text-xs text-gray-400">4 days ago</p>
                      </div>
                    </div>
                  </div>
                  <button className="mt-4 w-full rounded-md border border-cyber-green bg-transparent px-4 py-2 text-sm font-medium text-cyber-green transition-all hover:bg-cyber-green hover:bg-opacity-10">
                    View All Activity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border bg-cyber-navy-dark p-4 text-center text-sm text-gray-400">
        <p>© 2023 CyberHoot. All rights reserved.</p>
      </footer>
    </div>
  );
} 