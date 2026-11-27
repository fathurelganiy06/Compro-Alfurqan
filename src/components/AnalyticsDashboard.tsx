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
import type { AnalyticsEventType, PostCategory } from '../types/cms';

function categoryLabelId(cat: PostCategory): string {
  if (cat === 'announcement') return 'Pengumuman';
  if (cat === 'article') return 'Artikel Ilmiah';
  return 'Berita Kampus';
}

function eventTypeLabelId(eventType: AnalyticsEventType): string {
  switch (eventType) {
    case 'page_view':
      return 'Kunjungan Halaman';
    case 'search':
      return 'Pencarian Situs';
    case 'article_read':
      return 'Baca Publikasi';
    case 'program_view':
      return 'Lihat Program Studi';
    case 'map_interact':
      return 'Interaksi Peta Kampus';
    default:
      return eventType;
  }
}

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
      { category: 'Pengumuman', views: announcementViews },
      { category: 'Berita Kampus', views: newsViews },
      { category: 'Artikel', views: articleViews },
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
      source: 'Basis Data',
    }));
    const localItems = sessionTelemetry.recentEvents.map((ev) => ({
      ...ev,
      source: 'Sesi Aktif',
    }));
    return [...firestoreItems, ...localItems]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [analyticsEvents, sessionTelemetry.recentEvents]);

  const handleRecordToday = async () => {
    setLoggingSnapshot(true);
    try {
      const todayIso = new Date().toISOString().slice(0, 10);
      const dateLabel = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
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
            Ringkasan Analitik Situs
          </h2>
          <p className="text-xs text-[#4A5D54] mt-0.5">
            Trafik kunjungan, aktivitas pencarian, dan keterbacaan publikasi di Portal STAI Al-Furqan Makassar
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
                {days} Hari
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
            {loggingSnapshot ? 'Menyimpan...' : 'Catat Snapshot Hari Ini'}
          </button>
        </div>
      </div>

      {/* 4 Flat KPI Summary Cells */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8E2] rounded-xl p-5">
          <div className="text-xs text-[#4A5D54]">Pengunjung Unik ({rangeDays} hari)</div>
          <div className="font-mono text-2xl font-semibold text-[#0F1F18] tabular-nums mt-1.5">
            {totals.visitors.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-[#0E5A36] mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Pertumbuhan musim PMB
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E2] rounded-xl p-5">
          <div className="text-xs text-[#4A5D54]">Total Tayangan Halaman</div>
          <div className="font-mono text-2xl font-semibold text-[#0F1F18] tabular-nums mt-1.5">
            {totals.pageViews.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-[#6B7D74] mt-1 tabular-nums">
            {posts.length} publikasi · {programs.length} prodi · {agenda.length} agenda
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E2] rounded-xl p-5">
          <div className="text-xs text-[#4A5D54]">Pencarian Situs Terpadu</div>
          <div className="font-mono text-2xl font-semibold text-[#0F1F18] tabular-nums mt-1.5">
            {totals.searches.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-[#6B7D74] mt-1 tabular-nums">
            +{sessionTelemetry.searches} pada sesi saat ini
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E2] rounded-xl p-5">
          <div className="text-xs text-[#4A5D54]">Porsi Pengunjung Seluler</div>
          <div className="font-mono text-2xl font-semibold text-[#0F1F18] tabular-nums mt-1.5">
            {totals.avgMobile}%
          </div>
          <div className="text-xs text-[#6B7D74] mt-1 inline-flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-[#0E5A36]" />
            Dominan perangkat seluler
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
                Pengunjung Harian &amp; Tayangan Halaman
              </h3>
              <p className="text-xs text-[#4A5D54]">
                Tren kunjungan tersimpan dengan pembaruan telemetri sesi langsung
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#4A5D54]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0E5A36]" />
                Tayangan Halaman
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#C49A2C]" />
                Pengunjung
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
                  name="Tayangan Halaman"
                  stroke="#0E5A36"
                  strokeWidth={2}
                  fill="url(#viewsFill)"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Pengunjung"
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
            Pembaca per Kategori Konten
          </h3>
          <p className="text-xs text-[#4A5D54] mb-5">
            Akumulasi tayangan seluruh publikasi CMS
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
                <Bar dataKey="views" name="Total Tayangan" fill="#0E5A36" radius={[6, 6, 0, 0]} />
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
              Konten Terpopuler
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8E2] bg-[#FAFBF9] text-[11px] font-semibold text-[#4A5D54]">
                  <th className="py-2.5 px-6">Judul</th>
                  <th className="py-2.5 px-4">Kategori</th>
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-6 text-right">Tayangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1EE] text-xs">
                {topPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FAFBF9]">
                    <td className="py-3 px-6 font-medium text-[#0F1F18] max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="py-3 px-4 text-[#4A5D54] whitespace-nowrap">
                      {categoryLabelId(post.category)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#6B7D74] tabular-nums whitespace-nowrap">
                      {post.publishedDate}
                    </td>
                    <td className="py-3 px-6 font-mono font-semibold text-[#0F1F18] text-right tabular-nums">
                      {post.views.toLocaleString('id-ID')}
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
              Aktivitas Interaksi Terbaru
            </h3>
          </div>
          <div className="divide-y divide-[#EDF1EE] max-h-[300px] overflow-y-auto">
            {mergedActivity.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#4A5D54]">
                Jelajahi artikel, cari program studi, atau buka peta kampus untuk melihat aktivitas langsung.
              </div>
            ) : (
              mergedActivity.map((ev) => (
                <div key={ev.id} className="px-6 py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-medium text-[#0F1F18] truncate">{ev.label}</div>
                    <div className="text-[11px] text-[#6B7D74]">
                      {eventTypeLabelId(ev.eventType)} · {ev.source}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#6B7D74] tabular-nums shrink-0">
                    {new Date(ev.timestamp).toLocaleTimeString('id-ID', {
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
