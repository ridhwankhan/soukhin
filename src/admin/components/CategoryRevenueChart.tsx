import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  fetchCategoryRevenue,
  fetchTopLevelCategories,
  getDateRange,
  TimeFrame,
  TopLevelCategory,
} from '../../lib/dashboardService';

const TIME_FRAMES: { id: TimeFrame; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

const CHART_COLORS = ['#1B4332', '#B8860B', '#C2704A', '#2D6A4F', '#40916C', '#52B788', '#74C69D'];

export default function CategoryRevenueChart() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('30d');
  const [categories, setCategories] = useState<TopLevelCategory[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [chartData, setChartData] = useState<{ name: string; revenue: number; orders: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    fetchTopLevelCategories()
      .then((cats) => {
        setCategories(cats);
        setSelectedSlugs(cats.map((c) => c.slug));
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { start, end } = getDateRange(
          timeFrame,
          customStart ? new Date(customStart) : undefined,
          customEnd ? new Date(customEnd + 'T23:59:59') : undefined
        );
        const slugs = selectedSlugs.length === categories.length ? undefined : selectedSlugs;
        const revenue = await fetchCategoryRevenue(start, end, slugs);
        setChartData(
          revenue.map((row) => ({
            name: row.categoryName,
            revenue: row.revenue,
            orders: row.orderCount,
          }))
        );
      } catch {
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    if (categories.length > 0 && selectedSlugs.length > 0) {
      load();
    }
  }, [timeFrame, selectedSlugs, categories.length, customStart, customEnd]);

  const toggleCategory = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const totalRevenue = useMemo(
    () => chartData.reduce((sum, row) => sum + row.revenue, 0),
    [chartData]
  );

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#2D2D2D]">Revenue by Category</h2>
          <p className="text-sm text-[#666666]">
            Total: ৳{totalRevenue.toLocaleString()} in selected period
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TIME_FRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeFrame(tf.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                timeFrame === tf.id
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-[#F8F6F3] text-[#666666] hover:bg-[#F5F0E8]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => { setCustomStart(e.target.value); setTimeFrame('custom'); }}
            className="px-2 py-1 text-xs border border-[#D4C4B5] rounded-sm"
          />
          <span className="text-xs text-[#666666]">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => { setCustomEnd(e.target.value); setTimeFrame('custom'); }}
            className="px-2 py-1 text-xs border border-[#D4C4B5] rounded-sm"
          />
        </div>
        <button
          onClick={() => setSelectedSlugs(categories.map((c) => c.slug))}
          className="text-xs text-[#1B4332] hover:underline"
        >
          Select all
        </button>
        <button
          onClick={() => setSelectedSlugs([])}
          className="text-xs text-[#666666] hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => toggleCategory(cat.slug)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              selectedSlugs.includes(cat.slug)
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-[#666666] border-[#D4C4B5] hover:border-[#1B4332]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-72 flex items-center justify-center text-sm text-[#666666]">Loading chart...</div>
      ) : chartData.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-sm text-[#666666]">
          No revenue data for this period. Orders will appear here once sales are recorded.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F0E8" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'revenue' ? `৳${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders',
              ]}
            />
            <Legend />
            <Bar dataKey="revenue" name="Revenue (৳)" fill="#1B4332" radius={[4, 4, 0, 0]} />
            <Bar dataKey="orders" name="Orders" fill="#B8860B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
