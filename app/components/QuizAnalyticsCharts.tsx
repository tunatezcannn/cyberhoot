import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { QuizAnalytics } from '~/services/analyticsService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Common chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#e5e7eb', // text-gray-200
        font: {
          size: 12,
        },
      },
    },
    title: {
      display: true,
      color: '#e5e7eb', // text-gray-200
      font: {
        size: 16,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#9ca3af', // text-gray-400
      },
      grid: {
        color: 'rgba(75, 85, 99, 0.2)', // text-gray-600 with opacity
      },
    },
    y: {
      ticks: {
        color: '#9ca3af', // text-gray-400
      },
      grid: {
        color: 'rgba(75, 85, 99, 0.2)', // text-gray-600 with opacity
      },
    },
  },
};

// Custom colors for charts
const chartColors = {
  primary: '#10b981', // cyber-green
  secondary: '#6366f1', // indigo-500
  tertiary: '#f97316', // orange-500
  quaternary: '#a855f7', // purple-500
  background: '#272b38', // cyber-navy
  text: '#e5e7eb', // text-gray-200
};

interface QuizAnalyticsChartsProps {
  quizAnalytics: QuizAnalytics[];
}

const QuizAnalyticsCharts: React.FC<QuizAnalyticsChartsProps> = ({ quizAnalytics }) => {
  // Calculate completions per quiz topic
  const quizTopics = quizAnalytics.reduce((topics, quiz) => {
    const topic = quiz.quizTopic || 'Unknown';
    if (!topics[topic]) {
      topics[topic] = {
        answeredQuestions: 0,
        quizCount: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalScore: 0,
      };
    }
    
    topics[topic].quizCount++;
    const answeredCount = quiz.answeredQuestions.length;
    topics[topic].answeredQuestions += answeredCount;
    
    if (answeredCount > 0) {
      quiz.answeredQuestions.forEach(q => {
        if (q.correct) {
          topics[topic].correctAnswers++;
        } else {
          topics[topic].incorrectAnswers++;
        }
        topics[topic].totalScore += q.score;
      });
    }
    
    return topics;
  }, {} as Record<string, {
    answeredQuestions: number;
    quizCount: number;
    correctAnswers: number;
    incorrectAnswers: number;
    totalScore: number;
  }>);
  
  // Sort topic names by number of answered questions (descending)
  const sortedTopicNames = Object.keys(quizTopics).sort(
    (a, b) => quizTopics[b].answeredQuestions - quizTopics[a].answeredQuestions
  );
  
  const completionsData = {
    labels: sortedTopicNames,
    datasets: [
      {
        label: 'Answered Questions',
        data: sortedTopicNames.map(topic => quizTopics[topic].answeredQuestions),
        backgroundColor: chartColors.primary,
        borderColor: chartColors.primary,
        borderWidth: 1,
      },
    ],
  };
  
  // Calculate correct vs incorrect answers based on the correct property
  const correctAnswers = Object.values(quizTopics).reduce(
    (sum, topic) => sum + topic.correctAnswers, 0
  );
  
  const incorrectAnswers = Object.values(quizTopics).reduce(
    (sum, topic) => sum + topic.incorrectAnswers, 0
  );
  
  const correctVsIncorrectData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [correctAnswers, incorrectAnswers],
        backgroundColor: [chartColors.primary, chartColors.tertiary],
        borderColor: [chartColors.primary, chartColors.tertiary],
        borderWidth: 1,
      },
    ],
  };
  
  // Quiz type distribution
  const quizTypes = quizAnalytics.reduce((types, quiz) => {
    const type = quiz.quizType || 'Unknown';
    types[type] = (types[type] || 0) + 1;
    return types;
  }, {} as Record<string, number>);
  
  const quizTypeData = {
    labels: Object.keys(quizTypes),
    datasets: [
      {
        data: Object.values(quizTypes),
        backgroundColor: [
          chartColors.primary,
          chartColors.secondary,
          chartColors.tertiary,
          chartColors.quaternary,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Calculate average score per quiz
  const avgScoreData = {
    labels: quizAnalytics
      .filter(quiz => quiz.answeredQuestions.length > 0)
      .map(quiz => quiz.quizName),
    datasets: [
      {
        label: 'Average Score',
        data: quizAnalytics
          .filter(quiz => quiz.answeredQuestions.length > 0)
          .map(quiz => {
            const totalScore = quiz.answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
            return quiz.answeredQuestions.length > 0 
              ? totalScore / quiz.answeredQuestions.length 
              : 0;
          }),
        backgroundColor: chartColors.secondary,
        borderColor: chartColors.secondary,
      },
    ],
  };

  // Calculate average score per topic
  const topicScoreData = {
    labels: sortedTopicNames,
    datasets: [
      {
        label: 'Accuracy %',
        data: sortedTopicNames.map(topic => {
          const total = quizTopics[topic].correctAnswers + quizTopics[topic].incorrectAnswers;
          return total > 0 
            ? Math.round((quizTopics[topic].correctAnswers / total) * 100) 
            : 0;
        }),
        backgroundColor: chartColors.quaternary,
        borderColor: chartColors.quaternary,
        borderWidth: 1,
      },
    ],
  };

  // Check if we have quiz analytics data
  const hasData = quizAnalytics.some(quiz => quiz.answeredQuestions.length > 0);

  if (!hasData) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10 text-gray-400">
        <div className="text-center">
          <svg 
            className="mx-auto h-16 w-16 text-gray-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-white">No quiz data yet</h3>
          <p className="mt-2 text-sm text-gray-400">
            Complete some quizzes to see your performance analytics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Quiz Completions Chart */}
      <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
        <h3 className="mb-4 text-lg font-bold text-white">Quiz Completions</h3>
        <div className="h-64">
          <Bar 
            data={completionsData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Answered Questions per Quiz Topic',
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Correct vs Incorrect Chart */}
      <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
        <h3 className="mb-4 text-lg font-bold text-white">Answer Accuracy</h3>
        <div className="h-64">
          <Doughnut 
            data={correctVsIncorrectData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Correct vs Incorrect Answers',
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Quiz Type Distribution */}
      <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
        <h3 className="mb-4 text-lg font-bold text-white">Quiz Types</h3>
        <div className="h-64">
          <Pie 
            data={quizTypeData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Quiz Type Distribution',
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Average Score Chart */}
      <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
        <h3 className="mb-4 text-lg font-bold text-white">Quiz Performance</h3>
        <div className="h-64">
          <Bar 
            data={avgScoreData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Average Raw Score Per Quiz',
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Topic Accuracy Chart */}
      <div className="rounded-xl bg-cyber-navy p-6 shadow-cyber">
        <h3 className="mb-4 text-lg font-bold text-white">Topic Accuracy</h3>
        <div className="h-64">
          <Bar 
            data={topicScoreData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Accuracy % Per Topic',
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}

export default QuizAnalyticsCharts; 