import React from "react";
import { AnalyticsPanel } from "./components/AnalyticsPanel.jsx";
import { InventoryPanel } from "./components/InventoryPanel.jsx";
import { Layout } from "./components/Layout.jsx";
import { OrderPanel } from "./components/OrderPanel.jsx";
import { ProductGrid } from "./components/ProductGrid.jsx";
import { SauceSelectionModal } from "./components/SauceSelectionModal.jsx";
import { TodayOrdersPanel } from "./components/TodayOrdersPanel.jsx";
import { menuItems, productRequiresSauce } from "./data/menu.js";
import { ORDER_STORAGE_KEY, useOrder } from "./hooks/useOrder.js";
import { useAnalytics } from "./hooks/useAnalytics.js";
import { useInventory } from "./hooks/useInventory.js";
import { usePosIntegrations } from "./hooks/usePosIntegrations.js";
import {
  ORDERS_STORAGE_KEY,
  SALES_STORAGE_KEY,
  useSales
} from "./hooks/useSales.js";

const formatShortage = (shortage) =>
  `${shortage.name} 需要 ${shortage.required}${shortage.unit}，目前 ${shortage.available}${shortage.unit}`;

export default function App() {
  const [activeView, setActiveView] = React.useState("pos");
  const [pendingSauceProduct, setPendingSauceProduct] = React.useState(null);
  const { orderItems, total, itemCount, addItem, removeOne, clearOrder } = useOrder();
  const { sales, orders, recordSale, cancelSale, resetSales } = useSales();
  const {
    inventoryList,
    addStock,
    deductInventory,
    restoreInventory
  } = useInventory();
  const analytics = useAnalytics(sales, orders);
  const { reserveInventory, syncOrder, recordDailySale } = usePosIntegrations();

  const handleAddProduct = (product) => {
    if (productRequiresSauce(product)) {
      setPendingSauceProduct(product);
      return;
    }

    addItem(product);
  };

  const handleSauceSelected = (sauce) => {
    addItem(pendingSauceProduct, { sauce });
    setPendingSauceProduct(null);
  };

  const handleCheckout = async () => {
    if (orderItems.length === 0) {
      return;
    }

    const deduction = deductInventory(orderItems);

    if (!deduction.ok) {
      window.alert(`庫存不足，無法結帳：\n${deduction.shortages.map(formatShortage).join("\n")}`);
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

  const handleCancelOrder = (order) => {
    if (!order || order.status === "cancelled") {
      return;
    }

    const confirmed = window.confirm("確定要取消此訂單並回補庫存嗎？");

    if (!confirmed) {
      return;
    }

    restoreInventory(order.items || []);
    cancelSale(order.id);
  };

  const handleResetData = () => {
    const confirmed = window.confirm("確定要清除所有營業資料嗎？此操作不可復原");

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(SALES_STORAGE_KEY);
    window.localStorage.removeItem(ORDERS_STORAGE_KEY);
    window.localStorage.removeItem(ORDER_STORAGE_KEY);
    resetSales();
    clearOrder();
  };

  return (
    <Layout
      activeView={activeView}
      onViewChange={setActiveView}
      contentClassName={
        activeView === "pos" ? "overflow-hidden" : "overflow-y-auto scroll-smooth p-5 lg:p-7"
      }
    >
      {activeView === "pos" ? (
        <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[1.45fr_0.8fr_0.85fr]">
          <ProductGrid products={menuItems} onAddItem={handleAddProduct} />
          <OrderPanel
            items={orderItems}
            total={total}
            itemCount={itemCount}
            onRemoveOne={removeOne}
            onCheckout={handleCheckout}
          />
          <TodayOrdersPanel
            orders={analytics.todayOrders}
            onCancelOrder={handleCancelOrder}
          />
        </div>
      ) : null}

      {activeView === "analytics" ? (
        <AnalyticsPanel analytics={analytics} onResetData={handleResetData} />
      ) : null}

      {activeView === "inventory" ? (
        <InventoryPanel inventoryItems={inventoryList} onAddStock={addStock} />
      ) : null}

      <SauceSelectionModal
        product={pendingSauceProduct}
        onSelect={handleSauceSelected}
        onClose={() => setPendingSauceProduct(null)}
      />
    </Layout>
  );
}
