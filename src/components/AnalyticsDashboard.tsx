import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Plus, Smartphone, TrendingUp } from 'lucide-react';
import { useCampus } from '../context/CampusContext';

export const AnalyticsDashboard: React.FC = () => {
  const {
    dailyAnalytics,
    analyticsEvents,
    sessionTelemetry,
    posts,
    programs,
    agenda,
    recordDailyAnalytics,
  } = useCampus();

  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);
  const [loggingSnapshot, setLoggingSnapshot] = useState(false);

  const chartData = useMemo(() => {
    const sliced = dailyAnalytics.slice(-rangeDays);
    if (sliced.length === 0) return [];
    // Reflect live session telemetry on the latest day cleanly
    return sliced.map((row, idx) => {
      if (idx === sliced.length - 1) {
        return {
          ...row,
          pageViews: row.pageViews + sessionTelemetry.pageViews,
          searches: row.searches + sessionTelemetry.searches,
          programViews: row.programViews + sessionTelemetry.programViews,
        };
      }
      return row;
    });
  }, [dailyAnalytics, rangeDays, sessionTelemetry]);

  const totals = useMemo(() => {
    const visitors = chartData.reduce((acc, r) => acc + r.visitors, 0);
    const pageViews = chartData.reduce((acc, r) => acc + r.pageViews, 0);
    const searches = chartData.reduce((acc, r) => acc + r.searches, 0);
    const avgMobile =
      chartData.length > 0
        ? Math.round(chartData.reduce((acc, r) => acc + r.mobileShare, 0) / chartData.length)
        : 68;
    return { visitors, pageViews, searches, avgMobile };
  }, [chartData]);

  const contentCategoryBreakdown = useMemo(() => {
    const newsViews = posts
      .filter((p) => p.category === 'news')
      .reduce((acc, p) => acc + p.views, 0);
    const articleViews = posts
      .filter((p) => p.category === 'article')
      .reduce((acc, p) => acc + p.views, 0);
    const announcementViews = posts
      .filter((p) => p.category === 'announcement')
      .reduce((acc, p) => acc + p.views, 0);
    return [
      { category: 'Announcements', views: announcementViews },
      { category: 'Campus News', views: newsViews },
      { category: 'Articles', views: articleViews },
    ];
  }, [posts]);

  const topPosts = useMemo(
    () => [...posts].sort((a, b) => b.views - a.views).slice(0, 6),
    [posts],
  );

  const mergedActivity = useMemo(() => {
    const firestoreItems = analyticsEvents.map((ev) => ({
      id: ev.id,
      eventType: ev.eventType,
      label: ev.label,
      timestamp: ev.createdAtMs ?? Date.now(),
      source: 'Firestore',
    }));
    const localItems = sessionTelemetry.recentEvents.map((ev) => ({
      ...ev,
      source: 'Live Session',
    }));
    return [...firestoreItems, ...localItems]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [analyticsEvents, sessionTelemetry.recentEvents]);

  const handleRecordToday = async () => {
    setLoggingSnapshot(true);
    try {
      const todayIso = new Date().toISOString().slice(0, 10);
      const dateLabel = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const latest = dailyAnalytics[dailyAnalytics.length - 1];
      await recordDailyAnalytics({
        dateLabel,
        isoDate: todayIso,
        visitors: (latest?.visitors ?? 680) + 12,
        pageViews: (latest?.pageViews ?? 2100) + sessionTelemetry.pageViews * 4 + 25,
        searches: (latest?.searches ?? 290) + sessionTelemetry.searches + 6,
        programViews: (latest?.programViews ?? 480) + sessionTelemetry.programViews + 11,
        mobileShare: latest?.mobileShare ?? 69,
      });
    } finally {
      setLoggingSnapshot(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#0F1F18]">
            Site Analytics Overview
          </h2>
          <p className="text-xs text-[#4A5D54] mt-0.5">
            Real-time traffic, search behavior, and publication engagement across STAI Al-Furqan Portal
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#D4DDD6] rounded-lg">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRangeDays(days)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  rangeDays === days
                    ? 'bg-[#0E5A36] text-white'
                    : 'text-[#4A5D54] hover:text-[#0F1F18]'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={loggingSnapshot}
            onClick={() => void handleRecordToday()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {loggingSnapshot ? 'Syncing...' : 'Sync Today Snapshot'}
          </button>
        </div>
      </div>

      {/* 4 Flat KPI Summary Cells */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8E2] rounded-xl p-5">
          <div className="text-xs text-[#4A5D54]">Unique Visitors ({rangeDays}d)</div>
          <div className="font-mono text-2xl font-semibold text-[#0F1F18] tabular-nums mt-1.5">
            {totals.visitors.toLocaleString()}
          </div>
          <div className="text-xs text-[#0E5A36] mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Admissions season growth
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E2] rounded-xl p-5">
          <div className="text-xs text-[#4A5D54]">Total Page Views</div>
          <div className="font-mono text-2xl font-semibold text-[#0F1F18] tabular-nums mt-1.5">
            {totals.pageViews.toLocaleString()}
          </div>
          <div className="text-xs text-[#6B7D74] mt-1 tabular-nums">
            {posts.length} posts · {programs.length} programs · {agenda.length} events
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E2] rounded-xl p-5">
          <div className="text-xs text-[#4A5D54]">Integrated Site Searches</div>
          <div className="font-mono text-2xl font-semibold text-[#0F1F18] tabular-nums mt-1.5">
            {totals.searches.toLocaleString()}
          </div>
          <div className="text-xs text-[#6B7D74] mt-1 tabular-nums">
            +{sessionTelemetry.searches} in current session
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E2] rounded-xl p-5">
          <div className="text-xs text-[#4A5D54]">Mobile Visitor Share</div>
          <div className="font-mono text-2xl font-semibold text-[#0F1F18] tabular-nums mt-1.5">
            {totals.avgMobile}%
          </div>
          <div className="text-xs text-[#6B7D74] mt-1 inline-flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-[#0E5A36]" />
            Responsive mobile primary
          </div>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Traffic & Pageviews Area Chart */}
        <div className="lg:col-span-8 bg-white border border-[#E2E8E2] rounded-xl p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-base font-semibold text-[#0F1F18]">
                Daily Visitors &amp; Page Views
              </h3>
              <p className="text-xs text-[#4A5D54]">
                Firestore-persisted traffic trend with live session telemetry overlay
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#4A5D54]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0E5A36]" />
                Page Views
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#C49A2C]" />
                Visitors
              </span>
            </div>
          </div>

          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E5A36" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0E5A36" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C49A2C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C49A2C" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE8" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 11, fill: '#4A5D54' }}
                  axisLine={{ stroke: '#E2E8E2' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#4A5D54' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D4DDD6',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  name="Page Views"
                  stroke="#0E5A36"
                  strokeWidth={2}
                  fill="url(#viewsFill)"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Visitors"
                  stroke="#C49A2C"
                  strokeWidth={2}
                  fill="url(#visitorsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Engagement Bar Chart */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8E2] rounded-xl p-6">
          <h3 className="text-base font-semibold text-[#0F1F18] mb-1">
            Reads by Content Category
          </h3>
          <p className="text-xs text-[#4A5D54] mb-5">
            Cumulative views across CMS publications
          </p>

          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contentCategoryBreakdown}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE8" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#4A5D54' }}
                  axisLine={{ stroke: '#E2E8E2' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#4A5D54' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D4DDD6',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="views" name="Total Views" fill="#0E5A36" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Data Tables: Top Publications & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E2E8E2] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8E2]">
            <h3 className="text-base font-semibold text-[#0F1F18]">
              Top Performing Content
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8E2] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D54]">
                  <th className="py-2.5 px-6">Title</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-6 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1EE] text-xs">
                {topPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FAFBF9]">
                    <td className="py-3 px-6 font-medium text-[#0F1F18] max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="py-3 px-4 text-[#4A5D54] capitalize">{post.category}</td>
                    <td className="py-3 px-4 font-mono text-[#6B7D74] tabular-nums whitespace-nowrap">
                      {post.publishedDate}
                    </td>
                    <td className="py-3 px-6 font-mono font-semibold text-[#0F1F18] text-right tabular-nums">
                      {post.views.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E2E8E2] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8E2]">
            <h3 className="text-base font-semibold text-[#0F1F18]">
              Recent Interaction Stream
            </h3>
          </div>
          <div className="divide-y divide-[#EDF1EE] max-h-[300px] overflow-y-auto">
            {mergedActivity.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#4A5D54]">
                Browse articles, search programs, or explore the campus map to observe live events.
              </div>
            ) : (
              mergedActivity.map((ev) => (
                <div key={ev.id} className="px-6 py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-medium text-[#0F1F18] truncate">{ev.label}</div>
                    <div className="text-[11px] text-[#6B7D74]">
                      {ev.eventType.replace('_', ' ')} · {ev.source}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#6B7D74] tabular-nums shrink-0">
                    {new Date(ev.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
