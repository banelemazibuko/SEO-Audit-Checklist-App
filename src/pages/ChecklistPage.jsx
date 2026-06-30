// Checklist page for working through SEO audit categories and ticking items.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ChecklistCategory from '../components/checklist/ChecklistCategory.jsx';
import ProgressBar from '../components/checklist/ProgressBar.jsx';
import useAuth from '../hooks/useAuth.js';
import { loadAuditSession, saveAuditSession } from '../firebase/firestore.js';
import checklistData from '../data/checklistData.js';

const ChecklistPage = () => {
  const { user, loading: authLoading } = useAuth();

  // Which item ids are checked — lives here so all categories share one list
  const [checkedItems, setCheckedItems] = useState([]);

  // Which category tab is visible — starts on the first category
  const [activeCategoryId, setActiveCategoryId] = useState(checklistData[0].id);

  // True while loading saved progress from Firestore
  const [sessionLoading, setSessionLoading] = useState(false);

  // Shown if a Firestore save or load fails (checklist still works locally)
  const [saveError, setSaveError] = useState('');

  // Flatten every item from every category for overall progress
  const allItems = checklistData.flatMap((category) => category.items);

  // Count checked items that exist in our checklist (ignores stray ids)
  const overallCompleted = allItems.filter((item) =>
    checkedItems.includes(item.id),
  ).length;

  // The category object for the currently selected tab
  const activeCategory = checklistData.find(
    (category) => category.id === activeCategoryId,
  );

  // Load saved progress when a logged-in user opens the page
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setCheckedItems([]);
      setSessionLoading(false);
      setSaveError('');
      return;
    }

    const loadProgress = async () => {
      setSessionLoading(true);
      const result = await loadAuditSession(user.uid);

      if (result.error) {
        setSaveError(result.error);
      } else {
        setCheckedItems(result.completedItems);
        setSaveError('');
      }

      setSessionLoading(false);
    };

    loadProgress();
  }, [user, authLoading]);

  const handleToggleItem = async (itemId) => {
    let nextChecked = [];

    setCheckedItems((prev) => {
      nextChecked = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      return nextChecked;
    });

    // Guests: Phase 1 behaviour — memory only, no Firestore
    if (!user) {
      return;
    }

    const result = await saveAuditSession(user.uid, nextChecked);

    if (result.error) {
      setSaveError(result.error);
    } else {
      setSaveError('');
    }
  };

  const isPageLoading = authLoading || (user && sessionLoading);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        {/* Page header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            SEO Audit Checklist
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Work through each category and tick items as you complete your audit.
          </p>
          {user && !authLoading && (
            <p className="mt-2 text-sm text-slate-500">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          )}
        </header>

        {/* Guest banner — suggest login to save progress */}
        {!authLoading && !user && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p>
              Log in to save your progress across devices.{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Log in
              </Link>{' '}
              or{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                register
              </Link>
              .
            </p>
          </div>
        )}

        {/* Firestore error — non-blocking; local ticks still work */}
        {saveError && (
          <div
            className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            <p>{saveError}</p>
            <button
              type="button"
              onClick={() => setSaveError('')}
              className="shrink-0 font-medium text-red-800 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {isPageLoading ? (
          <p className="py-12 text-center text-slate-500">Loading your progress...</p>
        ) : (
          <>
            {/* Overall progress across ALL categories */}
            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Overall progress
              </h2>
              <ProgressBar completed={overallCompleted} total={allItems.length} />
            </section>

            {/* Category tabs — click to switch which section is shown */}
            <nav
              className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200"
              aria-label="Checklist categories"
            >
              {checklistData.map((category) => {
                const isActive = category.id === activeCategoryId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {category.name}
                  </button>
                );
              })}
            </nav>

            {/* Active category content — only one category visible at a time */}
            {activeCategory && (
              <ChecklistCategory
                category={activeCategory}
                checkedItems={checkedItems}
                onToggleItem={handleToggleItem}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ChecklistPage;
