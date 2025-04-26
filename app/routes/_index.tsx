import type { MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "CyberHoot - Secure Your Knowledge" },
    { name: "description", content: "Test and improve your cybersecurity knowledge with CyberHoot" },
  ];
};

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-cyber-dark">
      {/* Header */}
      <header className="border-b border-cyber-border bg-cyber-navy p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/favicon.ico" alt="CyberHoot" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-white text-glow">CyberHoot</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link to="/login" className="rounded-md px-4 py-2 text-sm font-medium text-white hover:text-cyber-green">
              Login
            </Link>
            <Link to="/register" className="rounded-md bg-cyber-green px-4 py-2 text-sm font-medium text-cyber-dark transition-colors hover:bg-opacity-90">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="relative mx-auto max-w-3xl">
          {/* Decorative elements */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyber-green opacity-10 blur-xl"></div>
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyber-green opacity-10 blur-xl"></div>
          
          <div className="relative z-10">
            <h2 className="mb-6 text-5xl font-bold text-white">Secure Your <span className="text-cyber-green">Knowledge</span></h2>
            <p className="mb-8 text-xl text-gray-400">Test and improve your cybersecurity skills with interactive quizzes and challenges.</p>
            
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link 
                to="/quiz-setup" 
                className="w-full rounded-md bg-cyber-green px-6 py-3 text-base font-medium text-cyber-dark transition-colors hover:bg-opacity-90 sm:w-auto"
              >
                <span className="flex items-center justify-center">
                  Take Quiz
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
              </Link>
              <Link 
                to="/login" 
                className="w-full rounded-md border border-cyber-green bg-transparent px-6 py-3 text-base font-medium text-cyber-green transition-colors hover:bg-cyber-green hover:text-cyber-dark sm:w-auto"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="group relative w-full overflow-hidden rounded-md bg-transparent border border-gray-600 px-6 py-3 text-base font-medium text-white transition-all duration-300 hover:border-white sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Register
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-cyber-border bg-cyber-navy p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyber-green bg-opacity-10">
              <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Cybersecurity Quizzes</h3>
            <p className="text-gray-400">Test your knowledge across various cybersecurity domains with our specialized quizzes.</p>
          </div>
          
          <div className="rounded-lg border border-cyber-border bg-cyber-navy p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyber-green bg-opacity-10">
              <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Skill Tracking</h3>
            <p className="text-gray-400">Monitor your progress and identify areas for improvement with detailed analytics.</p>
          </div>
          
          <div className="rounded-lg border border-cyber-border bg-cyber-navy p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyber-green bg-opacity-10">
              <svg className="h-6 w-6 text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Instant Feedback</h3>
            <p className="text-gray-400">Receive immediate insights and explanations to help deepen your understanding.</p>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="mt-16 mb-20">
          <Link
            to="/quiz-setup"
            className="cyber-border px-8 py-4 bg-cyber-dark text-white font-medium hover:border-cyber-green hover:text-cyber-green transition-all duration-300"
          >
            Start a Quiz Now
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border bg-cyber-navy py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center md:mb-0">
              <span className="text-sm text-gray-400">© 2023 CyberHoot. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <svg className="h-3 w-3 animate-pulse-slow text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" />
              </svg>
              <span>Secure your knowledge</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const resources = [
  {
    href: "https://remix.run/start/quickstart",
    text: "Quick Start (5 min)",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M8.51851 12.0741L7.92592 18L15.6296 9.7037L11.4815 7.33333L12.0741 2L4.37036 10.2963L8.51851 12.0741Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "https://remix.run/start/tutorial",
    text: "Tutorial (30 min)",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M4.561 12.749L3.15503 14.1549M3.00811 8.99944H1.01978M3.15503 3.84489L4.561 5.2508M8.3107 1.70923L8.3107 3.69749M13.4655 3.84489L12.0595 5.2508M18.1868 17.0974L16.635 18.6491C16.4636 18.8205 16.1858 18.8205 16.0144 18.6491L13.568 16.2028C13.383 16.0178 13.0784 16.0347 12.915 16.239L11.2697 18.2956C11.047 18.5739 10.6029 18.4847 10.505 18.142L7.85215 8.85711C7.75756 8.52603 8.06365 8.21994 8.39472 8.31453L17.6796 10.9673C18.0223 11.0653 18.1115 11.5094 17.8332 11.7321L15.7766 13.3773C15.5723 13.5408 15.5554 13.8454 15.7404 14.0304L18.1868 16.4767C18.3582 16.6481 18.3582 16.926 18.1868 17.0974Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "https://remix.run/docs",
    text: "Remix Docs",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M9.99981 10.0751V9.99992M17.4688 17.4688C15.889 19.0485 11.2645 16.9853 7.13958 12.8604C3.01467 8.73546 0.951405 4.11091 2.53116 2.53116C4.11091 0.951405 8.73546 3.01467 12.8604 7.13958C16.9853 11.2645 19.0485 15.889 17.4688 17.4688ZM2.53132 17.4688C0.951566 15.8891 3.01483 11.2645 7.13974 7.13963C11.2647 3.01471 15.8892 0.951453 17.469 2.53121C19.0487 4.11096 16.9854 8.73551 12.8605 12.8604C8.73562 16.9853 4.11107 19.0486 2.53132 17.4688Z"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "https://rmx.as/discord",
    text: "Join Discord",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 24 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M15.0686 1.25995L14.5477 1.17423L14.2913 1.63578C14.1754 1.84439 14.0545 2.08275 13.9422 2.31963C12.6461 2.16488 11.3406 2.16505 10.0445 2.32014C9.92822 2.08178 9.80478 1.84975 9.67412 1.62413L9.41449 1.17584L8.90333 1.25995C7.33547 1.51794 5.80717 1.99419 4.37748 2.66939L4.19 2.75793L4.07461 2.93019C1.23864 7.16437 0.46302 11.3053 0.838165 15.3924L0.868838 15.7266L1.13844 15.9264C2.81818 17.1714 4.68053 18.1233 6.68582 18.719L7.18892 18.8684L7.50166 18.4469C7.96179 17.8268 8.36504 17.1824 8.709 16.4944L8.71099 16.4904C10.8645 17.0471 13.128 17.0485 15.2821 16.4947C15.6261 17.1826 16.0293 17.8269 16.4892 18.4469L16.805 18.8725L17.3116 18.717C19.3056 18.105 21.1876 17.1751 22.8559 15.9238L23.1224 15.724L23.1528 15.3923C23.5873 10.6524 22.3579 6.53306 19.8947 2.90714L19.7759 2.73227L19.5833 2.64518C18.1437 1.99439 16.6386 1.51826 15.0686 1.25995ZM16.6074 10.7755L16.6074 10.7756C16.5934 11.6409 16.0212 12.1444 15.4783 12.1444C14.9297 12.1444 14.3493 11.6173 14.3493 10.7877C14.3493 9.94885 14.9378 9.41192 15.4783 9.41192C16.0471 9.41192 16.6209 9.93851 16.6074 10.7755ZM8.49373 12.1444C7.94513 12.1444 7.36471 11.6173 7.36471 10.7877C7.36471 9.94885 7.95323 9.41192 8.49373 9.41192C9.06038 9.41192 9.63892 9.93712 9.6417 10.7815C9.62517 11.6239 9.05462 12.1444 8.49373 12.1444Z"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];
