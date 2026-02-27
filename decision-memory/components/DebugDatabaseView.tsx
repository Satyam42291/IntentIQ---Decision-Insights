'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { decisionRepository, reviewRepository, clearDatabase, seedSampleDecisions } from '@/lib';
import type { Decision, Review } from '@/lib';

export default function DebugPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📊 Debug: Starting database fetch...');
        
        const decidersData = await decisionRepository.getAll();
        console.log('📊 Debug: Fetched decisions:', decidersData);
        
        const reviewsData = await reviewRepository.getAll();
        console.log('📊 Debug: Fetched reviews:', reviewsData);
        
        setDecisions(decidersData);
        setReviews(reviewsData);
        setError(null);
        
        console.log('✅ Debug: Data loaded successfully');
      } catch (err) {
        console.error('❌ Debug: Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add 20 realistic sample decisions + reviews (does not clear DB)
  async function handleSeedFourRealistic() {
    try {
      setBusy(true);
      setError(null);
      setSeedSuccess(false);
      await seedSampleDecisions();
      const decs = await decisionRepository.getAll();
      const revs = await reviewRepository.getAll();
      setDecisions(decs);
      setReviews(revs);
      setSeedSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  // Helper: Clear DB and optionally seed sample decisions+reviews
  async function handleClearAndSeed(seedCount = 0) {
    try {
      setBusy(true);
      // Clear (client-side confirm happens in clearDatabase)
      await clearDatabase();

      // Optionally seed sample data
      if (seedCount > 0) {
        const types = ['personal', 'work', 'finance', 'health', 'other'] as const;
        const importances = ['low', 'medium', 'high'] as const;
        const speeds = ['quick', 'moderate', 'slow'] as const;
        for (let i = 0; i < seedCount; i++) {
          const dec = {
            title: `Sample Decision ${i + 1}`,
            reasoning: `Reasoning for sample decision ${i + 1}`,
            confidence: 50 + (i % 50),
            decision_type: types[i % types.length],
            importance: importances[i % importances.length],
            decision_speed: speeds[i % speeds.length],
            expected_outcome: `Expected outcome ${i + 1}`,
            review_date: new Date(),
          };
          const id = await decisionRepository.create(dec as any);
          // Create a paired review
          await reviewRepository.create({
            decision_id: id,
            expectation_comparison: i % 2 === 0 ? 'as_expected' : 'slightly_better',
            decision_quality: 'reasonable',
            surprise_score: 10 + (i % 50),
            what_happened: `Outcome for sample ${i + 1}`,
            learning_note: `Learning note ${i + 1}`,
            would_repeat: i % 3 === 0 ? 'yes' : i % 3 === 1 ? 'no' : 'unsure',
            reviewed_at: new Date(),
          });
        }
      }

      // Refresh view
      const decs = await decisionRepository.getAll();
      const revs = await reviewRepository.getAll();
      setDecisions(decs);
      setReviews(revs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Database Debug</h1>

        {seedSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <p className="text-emerald-800 font-medium">
              ✓ 20 sample decisions and reviews added. View them on the <Link href="/timeline" className="underline font-semibold">Timeline</Link> or <Link href="/" className="underline font-semibold">Home</Link>.
            </p>
            <button type="button" onClick={() => setSeedSuccess(false)} className="text-emerald-600 hover:text-emerald-800 text-sm">Dismiss</button>
          </div>
        )}
        <div className="flex items-center gap-3 mb-6">
          <button
            className="px-3 py-2 bg-emerald-600 text-white rounded shadow"
            onClick={handleSeedFourRealistic}
            disabled={busy}
          >
            Add 20 sample decisions (realistic)
          </button>
          <button
            className="px-3 py-2 bg-red-600 text-white rounded shadow"
            onClick={() => handleClearAndSeed(0)}
            disabled={busy}
          >
            Clear DB
          </button>
          <button
            className="px-3 py-2 bg-gray-800 text-white rounded shadow"
            onClick={() => handleClearAndSeed(3)}
            disabled={busy}
          >
            Clear + Seed 3
          </button>
          <button
            className="px-3 py-2 bg-gray-800 text-white rounded shadow"
            onClick={() => handleClearAndSeed(8)}
            disabled={busy}
          >
            Clear + Seed 8
          </button>
          <button
            className="px-3 py-2 bg-gray-800 text-white rounded shadow"
            onClick={() => handleClearAndSeed(12)}
            disabled={busy}
          >
            Clear + Seed 12
          </button>
          {busy && <span className="ml-4 text-sm text-gray-600">Working...</span>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">
            <p className="mb-2">⏳ Loading database contents...</p>
            <p className="text-sm text-gray-500">If this takes longer than 5 seconds, open the browser console to check for errors.</p>
          </div>
        ) : (
          <>
            {/* Decisions Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Decisions ({decisions.length})
              </h2>
              {decisions.length === 0 ? (
                <p className="text-gray-500">No decisions in database</p>
              ) : (
                <div className="space-y-4">
                  {decisions.map((decision) => (
                    <div key={decision.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">ID:</span>{' '}
                          <span className="text-gray-600">{decision.id}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Created:</span>{' '}
                          <span className="text-gray-600">
                            {new Date(decision.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">Title:</span>{' '}
                          <span className="text-gray-600">{decision.title}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">Reasoning:</span>{' '}
                          <span className="text-gray-600">{decision.reasoning}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Confidence:</span>{' '}
                          <span className="text-gray-600">{decision.confidence}%</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Type:</span>{' '}
                          <span className="text-gray-600">{decision.decision_type}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Importance:</span>{' '}
                          <span className="text-gray-600">{decision.importance}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Review Date:</span>{' '}
                          <span className="text-gray-600">
                            {new Date(decision.review_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">Expected Outcome:</span>{' '}
                          <span className="text-gray-600">{decision.expected_outcome}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews in database</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">ID:</span>{' '}
                          <span className="text-gray-600">{review.id}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Decision ID:</span>{' '}
                          <span className="text-gray-600">{review.decision_id}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Expectation Comparison:</span>{' '}
                          <span className="text-gray-600">{review.expectation_comparison}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Decision Quality:</span>{' '}
                          <span className="text-gray-600">{review.decision_quality}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Surprise Score:</span>{' '}
                          <span className="text-gray-600">{review.surprise_score}%</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">What Happened:</span>{' '}
                          <span className="text-gray-600">{review.what_happened}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">Learning Note:</span>{' '}
                          <span className="text-gray-600">{review.learning_note}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                <span className="font-semibold">Summary:</span> {decisions.length} decisions logged,{' '}
                {reviews.length} reviews completed
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
