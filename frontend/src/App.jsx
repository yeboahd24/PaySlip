import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const BulkPage = lazy(() => import('./pages/BulkPage'));
const SalaryPage = lazy(() => import('./pages/SalaryPage'));
const SalaryIndexPage = lazy(() => import('./pages/SalaryIndexPage'));

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-ghana-green text-white'
      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
  }`;

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px] text-gray-400 text-sm">
      Loading...
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Header dark={dark} onToggleDark={() => setDark(!dark)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <NavLink to="/" end className={navLinkClass}>Calculator</NavLink>
            <NavLink to="/compare" className={navLinkClass}>Compare Packages</NavLink>
            <NavLink to="/bulk" className={navLinkClass}>Bulk Calculator</NavLink>
            <NavLink to="/salary" className={navLinkClass}>Salary Levels</NavLink>
          </div>
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<CalculatorPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/bulk" element={<BulkPage />} />
            <Route path="/salary" element={<SalaryIndexPage />} />
            <Route path="/salary/:amount" element={<SalaryPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
