'use client';

import { useEffect, useState } from 'react';
import { decisionRepository, reviewRepository, generateInsights } from '@/lib';
import type {
  Insights as LegacyInsights,
  CalibrationBucket,
  InfluenceComparisonRow,
  DomainRegretRow,
  TrendMonthRow,
} from '@/lib';

export default function InsightsView() {
  const [insights, setInsights] = useState<LegacyInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const decisions = await decisionRepository.getAll();
        const reviews = await reviewRepository.getAll();
        const generated = await generateInsights(decisions, reviews);
        setInsights(generated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate insights');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">⏳ Analyzing your patterns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Unable to load insights</p>
          </div>
        </div>
      </div>
    );
  }

  if (insights.reviewCount < insights.minimumReviewsNeeded) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-8 text-center">
            <p className="text-2xl mb-4">🔍</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Patterns are still forming</h2>
            
            <div className="bg-white dark:bg-slate-900/50 rounded p-4 mb-4 text-left">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                <strong>You've reviewed {insights.reviewCount} decision{insights.reviewCount !== 1 ? 's' : ''}.</strong>
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className={insights.reviewCount >= 3 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  ✓ At 3 reviews: Core insights appear (confidence, surprise, speed, repeat)
                </li>
                <li className={insights.reviewCount >= 8 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  ✓ At 8+ reviews: Segment patterns (deep behavioral patterns)
                </li>
                <li className={insights.reviewCount >= 12 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  ✓ At 12+ reviews: Trend analysis (improvement/decline over time)
                </li>
              </ul>
            </div>

            <p className="text-blue-600 dark:text-blue-400 font-medium">
              You need {insights.minimumReviewsNeeded - insights.reviewCount} more review{(insights.minimumReviewsNeeded - insights.reviewCount) !== 1 ? 's' : ''} to unlock core insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Here's how you think
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Based on {insights.reviewCount} decisions you've reviewed.
          </p>
        </div>

        {/* Insight Cards */}
        <div className="space-y-8">
          {/* Confidence Insight */}
          {insights.confidence && (
            <InsightCard
              emoji={insights.confidence.emoji}
              title="Confidence Reality Gap"
              message={insights.confidence.message}
              details={[
                `Average confidence: ${insights.confidence.averageConfidence}%`,
                `Well-calibrated: ${insights.confidence.wellCalibratedCount} decisions`,
                `Overconfident moments: ${insights.confidence.overconfidentCount}`,
                `Underconfident moments: ${insights.confidence.underconfidentCount}`,
              ]}
            />
          )}

          {/* Surprise Insight */}
          {insights.surprise && (
            <InsightCard
              emoji={insights.surprise.emoji}
              title="Surprise Patterns"
              message={insights.surprise.message}
              details={[
                `Average surprise score: ${insights.surprise.averageSurpriseScore}/100`,
                ...(insights.surprise.mostSurprisedDomain
                  ? [`Most surprising: ${insights.surprise.mostSurprisedDomain} decisions`]
                  : []),
                ...(insights.surprise.leastSurprisedDomain
                  ? [`Most predictable: ${insights.surprise.leastSurprisedDomain} decisions`]
                  : []),
              ]}
            />
          )}

          {/* Speed Insight */}
          {insights.speed && (
            <InsightCard
              emoji={insights.speed.emoji}
              title="Speed & Regret"
              message={insights.speed.message}
              details={[
                `Quick decisions regretted: ${insights.speed.quickDecisionsRegretRate}%`,
                `Moderate decisions regretted: ${insights.speed.moderateDecisionsRegretRate}%`,
                `Slow decisions regretted: ${insights.speed.slowDecisionsRegretRate}%`,
              ]}
            />
          )}

          {/* Repeat Insight */}
          {insights.repeat && (
            <InsightCard
              emoji={insights.repeat.emoji}
              title="Repeat Rate"
              message={insights.repeat.message}
              details={[
                `Would repeat: ${insights.repeat.repeatRate}%`,
                `Repeat-worthy decisions: ${insights.repeat.wouldRepeatCount}`,
                `Regretted decisions: ${insights.repeat.wouldNotRepeatCount}`,
                `Unsure about: ${insights.repeat.unsureCount}`,
              ]}
            />
          )}
        </div>

        {/* Charts */}
        {insights.chartData && (
          <div className="space-y-8 mt-12">
            {/* A) Calibration Chart */}
            {insights.chartData.calibration.some((b) => b.count > 0) && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Calibration Chart</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Confidence buckets vs % of outcomes that were as expected or better. Diagonal = ideal calibration.
                </p>
                <CalibrationChart buckets={insights.chartData.calibration} />
              </div>
            )}

            {/* B) Influence Comparison */}
            {insights.chartData.influence.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Influence Comparison</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  For each influence type: % worse-than-expected outcomes and % would not repeat.
                </p>
                <InfluenceBarChart rows={insights.chartData.influence} />
              </div>
            )}

            {/* C) Domain Regret Distribution */}
            {insights.chartData.domainRegret.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Domain Regret Distribution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  % of decisions marked &quot;would not repeat&quot; per domain.
                </p>
                <DomainRegretChart rows={insights.chartData.domainRegret} />
              </div>
            )}

            {/* D) Trend Over Time */}
            {insights.chartData.trendOverTime.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Trend Over Time</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Monthly % of outcomes that were worse than expected.
                </p>
                <TrendLineChart rows={insights.chartData.trendOverTime} />
              </div>
            )}
          </div>
        )}

        {/* Reflection Prompt */}
        <div className="mt-16 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-blue-50 dark:to-blue-900/20 border border-purple-200 dark:border-slate-800 rounded-lg p-8 text-center">
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
            What stands out to you?
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The most value comes from noticing patterns you didn't expect. 
            Take a moment to think: "Is this how I actually think?"
          </p>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-8">
          Insights update as you log more decisions and reviews.
        </p>
      </div>
    </div>
  );
}

interface InsightCardProps {
  emoji: string;
  title: string;
  message: string;
  details: string[];
}

function InsightCard({ emoji, title, message, details }: InsightCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <span className="text-4xl">{emoji}</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
        <ul className="space-y-2">
          {details.map((detail, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-3">
              <span className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Chart components (SVG / CSS) ---

const CHART_WIDTH = 500;
const CHART_HEIGHT = 220;
const PAD = { left: 50, right: 20, top: 20, bottom: 40 };

function CalibrationChart({ buckets }: { buckets: CalibrationBucket[] }) {
  const withData = buckets.filter((b) => b.count > 0);
  if (withData.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">No data in any confidence bucket yet.</p>;

  const innerW = CHART_WIDTH - PAD.left - PAD.right;
  const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / Math.max(withData.length - 1, 1)) * innerW;
  const y = (pct: number) => PAD.top + innerH - (pct / 100) * innerH;

  const actualPoints = withData.map((b, i) => `${x(i)},${y(b.actualPctAsExpectedOrBetter)}`).join(' ');
  const idealPoints = withData.map((b, i) => `${x(i)},${y(b.idealPct)}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg width={CHART_WIDTH} height={CHART_HEIGHT} className="min-w-[320px]">
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke="currentColor" strokeWidth={1} className="text-gray-400 dark:text-gray-500" />
        <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="currentColor" strokeWidth={1} className="text-gray-400 dark:text-gray-500" />
        <polyline points={idealPoints} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" />
        <polyline points={actualPoints} fill="none" stroke="#3b82f6" strokeWidth={2} />
        {withData.map((b, i) => (
          <text key={b.label} x={x(i)} y={CHART_HEIGHT - 8} textAnchor="middle" className="text-[10px] fill-gray-600 dark:fill-gray-400">
            {b.label}
          </text>
        ))}
      </svg>
      <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-blue-500" /> Actual</span>
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-slate-400 border border-dashed" /> Ideal</span>
      </div>
    </div>
  );
}

function InfluenceBarChart({ rows }: { rows: InfluenceComparisonRow[] }) {
  const maxPct = Math.max(100, ...rows.flatMap((r) => [r.pctWorseThanExpected, r.pctNotRepeat]));

  return (
    <div className="space-y-4">
      <div className="flex gap-6 text-xs text-gray-600 dark:text-gray-400 mb-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" /> Worse than expected %</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500" /> Would not repeat %</span>
      </div>
      {rows.map((r) => (
        <div key={r.driver} className="flex items-center gap-3">
          <span className="w-28 text-sm text-gray-700 dark:text-gray-300 shrink-0">{r.label}</span>
          <div className="flex-1 flex items-center gap-1" style={{ maxWidth: 320 }}>
            <div
              className="h-6 rounded bg-amber-500 dark:bg-amber-600 shrink-0"
              style={{ width: Math.max(4, (r.pctWorseThanExpected / maxPct) * 200) }}
              title={`${r.pctWorseThanExpected}% worse`}
            />
            <div
              className="h-6 rounded bg-rose-500 dark:bg-rose-600 shrink-0"
              style={{ width: Math.max(4, (r.pctNotRepeat / maxPct) * 200) }}
              title={`${r.pctNotRepeat}% not repeat`}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-16">n={r.count}</span>
        </div>
      ))}
    </div>
  );
}

function DomainRegretChart({ rows }: { rows: DomainRegretRow[] }) {
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.domain} className="flex items-center gap-3">
          <span className="w-24 text-sm text-gray-700 dark:text-gray-300 shrink-0">{r.label}</span>
          <div className="flex-1 max-w-xs h-6 bg-gray-100 dark:bg-slate-800 rounded overflow-hidden">
            <div
              className="h-full bg-rose-500 dark:bg-rose-600 rounded"
              style={{ width: `${Math.min(100, r.pctNoRepeat)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">{r.pctNoRepeat}%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">({r.count})</span>
        </div>
      ))}
    </div>
  );
}

function TrendLineChart({ rows }: { rows: TrendMonthRow[] }) {
  const innerW = CHART_WIDTH - PAD.left - PAD.right;
  const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const maxPct = 100; // fixed 0-100% scale
  const x = (i: number) => PAD.left + (i / Math.max(rows.length - 1, 1)) * innerW;
  const y = (pct: number) => PAD.top + innerH - (pct / maxPct) * innerH;

  const points = rows.map((r, i) => `${x(i)},${y(r.pctWorseThanExpected)}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg width={CHART_WIDTH} height={CHART_HEIGHT} className="min-w-[320px]">
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke="currentColor" strokeWidth={1} className="text-gray-400 dark:text-gray-500" />
        <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="currentColor" strokeWidth={1} className="text-gray-400 dark:text-gray-500" />
        <polyline points={points} fill="none" stroke="#f43f5e" strokeWidth={2} />
        {rows.map((r, i) => (
          <text key={r.month} x={x(i)} y={CHART_HEIGHT - 8} textAnchor="middle" className="text-[10px] fill-gray-600 dark:fill-gray-400">
            {r.monthLabel}
          </text>
        ))}
      </svg>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Y-axis: % worse than expected in that month</p>
    </div>
  );
}
