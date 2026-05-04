import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const COLORS = ["#C6A96B", "#B8BFCB", "#7E8796", "#6F5F3D", "#D8C690"];

function EmptyChart() {
  return (
    <div className="flex h-80 items-center justify-center rounded-2xl border border-white/10 bg-[#0F1115] text-zinc-600">
      尚無商品銷售資料
    </div>
  );
}

export function ProductDistributionChart({ data }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#1A1D23] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C6A96B]/75">
          Product Mix
        </p>
        <h2 className="mt-2 text-2xl font-medium text-zinc-50">商品銷售占比</h2>
      </div>

      {data.length ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="qty"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={3}
                  stroke="#0F1115"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111217",
                    border: "1px solid rgba(198,169,107,0.24)",
                    borderRadius: "16px",
                    color: "#fafafa"
                  }}
                  formatter={(value, _name, item) => [
                    `${value} 份 (${item.payload.percent}%)`,
                    item.payload.name
                  ]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ color: "#d4d4d8", fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 self-center">
            {data.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate font-medium text-zinc-200">{item.name}</span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-zinc-400">
                  {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyChart />
      )}
    </article>
  );
}
