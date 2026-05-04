import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString("en-US")}`;

function EmptyChart({ label }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-2xl border border-white/10 bg-[#0F1115] text-zinc-600">
      {label}
    </div>
  );
}

export function DailyRevenueChart({ data }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#1A1D23] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C6A96B]/75">
          Daily Revenue
        </p>
        <h2 className="mt-2 text-2xl font-medium text-zinc-50">每日營業額</h2>
      </div>

      {data.length ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(198,169,107,0.1)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickFormatter={formatCurrency}
                width={72}
              />
              <Tooltip
                cursor={{ fill: "rgba(198,169,107,0.06)" }}
                contentStyle={{
                  background: "#111217",
                  border: "1px solid rgba(198,169,107,0.24)",
                  borderRadius: "16px",
                  color: "#fafafa"
                }}
                formatter={(value) => [formatCurrency(value), "營業額"]}
                labelStyle={{ color: "#d4d4d8" }}
              />
              <Bar dataKey="revenue" fill="#C6A96B" radius={[10, 10, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyChart label="尚無銷售資料" />
      )}
    </article>
  );
}
