'use client';

import { useEffect, useState } from 'react';
import { decisionRepository, reviewRepository, generateInsights } from '@/lib';
import type {
  Insights as LegacyInsights,
  CalibrationBucket,
  InfluenceComparisonRow,
  DomainRegretRow,
  TrendMonthRow,
  SurpriseTrendMonthRow,
  DerivedDecision,
} from '@/lib';

const EXPECTATION_LABELS: Record<string, string> = {
  much_better: 'Much better',
  slightly_better: 'Slightly better',
  as_expected: 'As expected',
  slightly_worse: 'Slightly worse',
  much_worse: 'Much worse',
};

const DRIVER_LABELS: Record<string, string> = {
  logic: 'Logic',
  urgency: 'Urgency',
  fear: 'Fear',
  opportunity: 'Opportunity',
  external_pressure: 'External pressure',
  emotion: 'Emotion',
};

export default function InsightsView() {
  const [insights, setInsights] = useState<LegacyInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ title: string; segmentLabel: string; decisions: DerivedDecision[] } | null>(null);

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
                  ✓ At 3 reviews: Core insights (Surprise patterns, Speed &amp; Regret) and charts
                </li>
                <li className={insights.reviewCount >= 8 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  ✓ At 8+ reviews: Segment patterns (influence, domain regret)
                </li>
                <li className={insights.reviewCount >= 12 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  ✓ At 12+ reviews: Trend analysis (outcome and surprise over time)
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Here's how you think
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Based on {insights.reviewCount} decisions you've reviewed.
          </p>
        </div>

        {/* Cards and charts in order: row1 Calibration + Speed, row2 Influence + Domain Regret, row3 Trend + Surprise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Calibration Chart */}
          {insights.chartData?.calibration.some((b) => b.count > 0) && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Calibration Chart</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Confidence buckets vs % of outcomes that were as expected or better. Click a bucket to see which decisions contributed.
              </p>
              <CalibrationChart
                buckets={insights.chartData.calibration}
                onOpenDrawer={(segmentLabel, decisions) => setDrawer({ title: 'Calibration Chart', segmentLabel, decisions })}
              />
            </div>
          )}

          {/* 2. Speed & Regret */}
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
              segments={[
                { segmentLabel: 'Quick', count: insights.speed.quickDecisions.length, decisions: insights.speed.quickDecisions },
                { segmentLabel: 'Moderate', count: insights.speed.moderateDecisions.length, decisions: insights.speed.moderateDecisions },
                { segmentLabel: 'Slow', count: insights.speed.slowDecisions.length, decisions: insights.speed.slowDecisions },
              ]}
              onOpenDrawer={(segmentLabel, decisions) => setDrawer({ title: 'Speed & Regret', segmentLabel, decisions })}
            />
          )}

          {/* 3. Influence Comparison */}
          {insights.chartData?.influence && insights.chartData.influence.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Influence Comparison</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                For each influence type: % worse-than-expected and % would not repeat. Click a row to see which decisions contributed.
              </p>
              <InfluenceBarChart
                rows={insights.chartData.influence}
                onOpenDrawer={(segmentLabel, decisions) => setDrawer({ title: 'Influence Comparison', segmentLabel, decisions })}
              />
            </div>
          )}

          {/* 4. Domain Regret Distribution */}
          {insights.chartData?.domainRegret && insights.chartData.domainRegret.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Domain Regret Distribution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                % of decisions marked &quot;would not repeat&quot; per domain. Click a row to see which decisions contributed.
              </p>
              <DomainRegretChart
                rows={insights.chartData.domainRegret}
                onOpenDrawer={(segmentLabel, decisions) => setDrawer({ title: 'Domain Regret', segmentLabel, decisions })}
              />
            </div>
          )}

          {/* 5. Trend Over Time */}
          {insights.chartData?.trendOverTime && insights.chartData.trendOverTime.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Trend Over Time</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Monthly % worse than expected. Click a month to see which decisions contributed.
              </p>
              <TrendLineChart
                rows={insights.chartData.trendOverTime}
                onOpenDrawer={(segmentLabel, decisions) => setDrawer({ title: 'Trend Over Time', segmentLabel, decisions })}
              />
            </div>
          )}

          {/* 6. Surprise Patterns */}
          {insights.surprise?.surpriseTrendOverTime && insights.surprise.surpriseTrendOverTime.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Surprise Patterns</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Monthly % of decisions marked high surprise (score &gt;70). Click a month to see those decisions.
              </p>
              <SurpriseTrendChart
                rows={insights.surprise.surpriseTrendOverTime}
                onOpenDrawer={(segmentLabel, decisions) => setDrawer({ title: 'Surprise Patterns', segmentLabel, decisions })}
              />
            </div>
          )}
        </div>

        {/* Drill-down drawer */}
        {drawer && (
          <DrillDownDrawer
            title={drawer.title}
            segmentLabel={drawer.segmentLabel}
            decisions={drawer.decisions}
            onClose={() => setDrawer(null)}
          />
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

interface DrillDownSegment {
  segmentLabel: string;
  count: number;
  decisions: DerivedDecision[];
}

interface InsightCardProps {
  emoji: string;
  title: string;
  message: string;
  details: string[];
  segments?: DrillDownSegment[];
  onOpenDrawer?: (segmentLabel: string, decisions: DerivedDecision[]) => void;
}

function InsightCard({ emoji, title, message, details, segments, onOpenDrawer }: InsightCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8">
      <div className="flex items-start gap-4 mb-6">
        <span className="text-4xl">{emoji}</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
        <ul className="space-y-2">
          {details.map((detail, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-3">
              <span className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full shrink-0" />
              {detail}
            </li>
          ))}
        </ul>
        {segments && onOpenDrawer && segments.some((s) => s.count > 0) && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Click to see which decisions contributed:</p>
            <div className="flex flex-wrap gap-2">
              {segments.filter((s) => s.count > 0).map((s) => (
                <button
                  key={s.segmentLabel}
                  type="button"
                  onClick={() => onOpenDrawer(s.segmentLabel, s.decisions)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {s.segmentLabel}: {s.count} decision{s.count !== 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DrillDownDrawer({
  title,
  segmentLabel,
  decisions,
  onClose,
}: {
  title: string;
  segmentLabel: string;
  decisions: DerivedDecision[];
  onClose: () => void;
}) {
  const drivers = (d: DerivedDecision) => {
    const dr = d.decision.decision_drivers ?? (d.decision.decision_driver ? [d.decision.decision_driver] : []);
    return dr.map((x) => DRIVER_LABELS[x] ?? x).join(', ') || '—';
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" aria-hidden onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl z-50 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{segmentLabel} · {decisions.length} decision{decisions.length !== 1 ? 's' : ''}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {decisions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No decisions in this segment.</p>
          ) : (
            decisions.map((d) => (
              <div key={String(d.decision.id)} className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800/50 space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{d.decision.title}</p>
                <dl className="text-xs grid gap-1">
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500 dark:text-gray-400">Confidence</dt>
                    <dd className="text-gray-900 dark:text-white">{d.decision.confidence}%</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500 dark:text-gray-400">Outcome</dt>
                    <dd className="text-gray-900 dark:text-white">{EXPECTATION_LABELS[d.review.expectation_comparison] ?? d.review.expectation_comparison}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500 dark:text-gray-400">Influence</dt>
                    <dd className="text-gray-900 dark:text-white">{drivers(d)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500 dark:text-gray-400">Domain</dt>
                    <dd className="text-gray-900 dark:text-white capitalize">{d.decision.decision_type}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500 dark:text-gray-400">Review date</dt>
                    <dd className="text-gray-900 dark:text-white">{d.reviewedAt.toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// --- Chart components (SVG / CSS) ---

const CHART_WIDTH = 500;
const CHART_HEIGHT = 220;
const PAD = { left: 50, right: 20, top: 20, bottom: 40 };

function CalibrationChart({ buckets, onOpenDrawer }: { buckets: CalibrationBucket[]; onOpenDrawer?: (segmentLabel: string, decisions: DerivedDecision[]) => void }) {
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
      <div className="flex flex-wrap gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><span className="inline-block w-4 h-0.5 bg-blue-500" /> Actual</span>
        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><span className="inline-block w-4 h-0.5 bg-slate-400 border border-dashed" /> Ideal</span>
        {onOpenDrawer && withData.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={() => onOpenDrawer(`${b.label}% confidence → ${b.actualPctAsExpectedOrBetter}% aligned`, b.decisions)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {b.label}: {b.count} decision{b.count !== 1 ? 's' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfluenceBarChart({ rows, onOpenDrawer }: { rows: InfluenceComparisonRow[]; onOpenDrawer?: (segmentLabel: string, decisions: DerivedDecision[]) => void }) {
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
          {onOpenDrawer ? (
            <button type="button" onClick={() => onOpenDrawer(r.label, r.decisions)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline w-20 text-left">
              n={r.count}
            </button>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16">n={r.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function DomainRegretChart({ rows, onOpenDrawer }: { rows: DomainRegretRow[]; onOpenDrawer?: (segmentLabel: string, decisions: DerivedDecision[]) => void }) {
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
          {onOpenDrawer ? (
            <button type="button" onClick={() => onOpenDrawer(r.label, r.decisions)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              ({r.count})
            </button>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">({r.count})</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TrendLineChart({ rows, onOpenDrawer }: { rows: TrendMonthRow[]; onOpenDrawer?: (segmentLabel: string, decisions: DerivedDecision[]) => void }) {
  const innerW = CHART_WIDTH - PAD.left - PAD.right;
  const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const maxPct = 100;
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
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Y-axis: % worse than expected. Click a month below to see decisions:</p>
      {onOpenDrawer && (
        <div className="flex flex-wrap gap-2 mt-2">
          {rows.map((r) => (
            <button
              key={r.month}
              type="button"
              onClick={() => onOpenDrawer(r.monthLabel, r.decisions)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {r.monthLabel} ({r.count})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SurpriseTrendChart({ rows, onOpenDrawer }: { rows: SurpriseTrendMonthRow[]; onOpenDrawer?: (segmentLabel: string, decisions: DerivedDecision[]) => void }) {
  const innerW = CHART_WIDTH - PAD.left - PAD.right;
  const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const maxPct = 100;
  const x = (i: number) => PAD.left + (i / Math.max(rows.length - 1, 1)) * innerW;
  const y = (pct: number) => PAD.top + innerH - (pct / maxPct) * innerH;

  const points = rows.map((r, i) => `${x(i)},${y(r.pctHighSurprise)}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg width={CHART_WIDTH} height={CHART_HEIGHT} className="min-w-[320px]">
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke="currentColor" strokeWidth={1} className="text-gray-400 dark:text-gray-500" />
        <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="currentColor" strokeWidth={1} className="text-gray-400 dark:text-gray-500" />
        <polyline points={points} fill="none" stroke="#8b5cf6" strokeWidth={2} />
        {rows.map((r, i) => (
          <text key={r.month} x={x(i)} y={CHART_HEIGHT - 8} textAnchor="middle" className="text-[10px] fill-gray-600 dark:fill-gray-400">
            {r.monthLabel}
          </text>
        ))}
      </svg>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Y-axis: % high surprise (score &gt;70). Click a month to see those decisions:</p>
      {onOpenDrawer && (
        <div className="flex flex-wrap gap-2 mt-2">
          {rows.map((r) => (
            <button
              key={r.month}
              type="button"
              onClick={() => onOpenDrawer(`${r.monthLabel} (high surprise)`, r.highSurpriseDecisions)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {r.monthLabel} ({r.highSurpriseDecisions.length} high / {r.count})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
