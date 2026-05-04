import React from "react";
import { AnalyticsPanel } from "./components/AnalyticsPanel.jsx";
import { Layout } from "./components/Layout.jsx";
import { OrderPanel } from "./components/OrderPanel.jsx";
import { ProductGrid } from "./components/ProductGrid.jsx";
import { TodayOrdersPanel } from "./components/TodayOrdersPanel.jsx";
import { menuItems } from "./data/menu.js";
import { ORDER_STORAGE_KEY, useOrder } from "./hooks/useOrder.js";
import { useAnalytics } from "./hooks/useAnalytics.js";
import { usePosIntegrations } from "./hooks/usePosIntegrations.js";
import { SALES_STORAGE_KEY, useSales } from "./hooks/useSales.js";

export default function App() {
  const [activeView, setActiveView] = React.useState("pos");
  const { orderItems, total, itemCount, addItem, removeOne, clearOrder } = useOrder();
  const { sales, recordSale, resetSales } = useSales();
  const analytics = useAnalytics(sales);
  const { reserveInventory, syncOrder, recordDailySale } = usePosIntegrations();

  const handleCheckout = async () => {
    if (orderItems.length === 0) {
      return;
    }

    const sale = recordSale({
      items: orderItems,
      total
    });

    await Promise.all([
      reserveInventory(sale),
      syncOrder(sale),
      recordDailySale(sale)
    ]);

    window.alert("結帳完成");
    clearOrder();
  };

  const handleResetData = () => {
    const confirmed = window.confirm("確定要清除所有營業資料嗎？此操作不可復原");

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(SALES_STORAGE_KEY);
    window.localStorage.removeItem(ORDER_STORAGE_KEY);
    resetSales();
    clearOrder();
  };

  return (
    <Layout
      activeView={activeView}
      onViewChange={setActiveView}
      contentClassName={
        activeView === "analytics"
          ? "overflow-y-auto scroll-smooth p-5 lg:p-7"
          : "overflow-hidden"
      }
    >
      {activeView === "pos" ? (
        <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[1.45fr_0.8fr_0.85fr]">
          <ProductGrid products={menuItems} onAddItem={addItem} />
          <OrderPanel
            items={orderItems}
            total={total}
            itemCount={itemCount}
            onRemoveOne={removeOne}
            onCheckout={handleCheckout}
          />
          <TodayOrdersPanel orders={analytics.todayOrders} />
        </div>
      ) : (
        <AnalyticsPanel analytics={analytics} onResetData={handleResetData} />
      )}
    </Layout>
  );
}
