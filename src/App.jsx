import React from "react";
import { AnalyticsPanel } from "./components/AnalyticsPanel.jsx";
import { ExpensePanel } from "./components/ExpensePanel.jsx";
import { InventoryPanel } from "./components/InventoryPanel.jsx";
import { Layout } from "./components/Layout.jsx";
import { OrderPanel } from "./components/OrderPanel.jsx";
import { ProductGrid } from "./components/ProductGrid.jsx";
import { SauceSelectionModal } from "./components/SauceSelectionModal.jsx";
import { TodayOrdersPanel } from "./components/TodayOrdersPanel.jsx";
import { menuItems, productRequiresSauce } from "./data/menu.js";
import { useAnalytics } from "./hooks/useAnalytics.js";
import { useExpenses, EXPENSES_STORAGE_KEY } from "./hooks/useExpenses.js";
import { useInventory } from "./hooks/useInventory.js";
import { ORDER_STORAGE_KEY, useOrder } from "./hooks/useOrder.js";
import { usePosIntegrations } from "./hooks/usePosIntegrations.js";
import { ORDERS_STORAGE_KEY, SALES_STORAGE_KEY, useSales } from "./hooks/useSales.js";

export default function App() {
  const [activeView, setActiveView] = React.useState("pos");
  const [pendingProduct, setPendingProduct] = React.useState(null);
  const order = useOrder();
  const salesState = useSales();
  const expenseState = useExpenses();
  const inventory = useInventory();
  const analytics = useAnalytics(salesState.sales, salesState.orders, expenseState.expenses, inventory.inventoryList);
  const { reserveInventory, syncOrder, recordDailySale } = usePosIntegrations();

  const addProduct = (product) => productRequiresSauce(product) ? setPendingProduct(product) : order.addItem(product);
  const selectSauce = (sauce) => { order.addItem(pendingProduct, { sauce }); setPendingProduct(null); };

  const checkout = async () => {
    if (!order.orderItems.length) return;
    const deduction = inventory.deductInventory(order.orderItems);
    if (!deduction.ok) {
      window.alert(`庫存不足，無法結帳：\n${deduction.shortages.map((item) => `${item.name} 需要 ${item.required}${item.unit}，目前 ${item.available}${item.unit}`).join("\n")}`);
      return;
    }
    const sale = salesState.recordSale({ items: order.orderItems, total: order.total, mode: order.orderMode });
    await Promise.all([reserveInventory(sale), syncOrder(sale), recordDailySale(sale)]);
    order.clearOrder();
    window.alert("結帳完成");
  };

  const cancelOrder = (sale) => {
    if (!sale || sale.status === "cancelled") return;
    if (!window.confirm("確定要取消這筆訂單嗎？庫存將自動回補。")) return;
    inventory.restoreInventory(sale.items || []);
    salesState.cancelSale(sale.id);
  };

  const resetData = () => {
    if (!window.confirm("確定要清除所有營業資料嗎？此操作不可復原")) return;
    [SALES_STORAGE_KEY, ORDERS_STORAGE_KEY, ORDER_STORAGE_KEY, EXPENSES_STORAGE_KEY].forEach((key) => window.localStorage.removeItem(key));
    salesState.resetSales();
    order.clearOrder();
    window.location.reload();
  };

  return <Layout activeView={activeView} onViewChange={setActiveView} contentClassName={activeView === "pos" ? "overflow-hidden" : "overflow-y-auto scroll-smooth p-5 lg:p-7"}>
    {activeView === "pos" ? <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[1.45fr_0.8fr_0.85fr]">
      <ProductGrid products={menuItems} mode={order.orderMode} onModeChange={order.setOrderMode} onAddItem={addProduct}/>
      <OrderPanel items={order.orderItems} total={order.total} itemCount={order.itemCount} mode={order.orderMode} onRemoveOne={order.removeOne} onCheckout={checkout}/>
      <TodayOrdersPanel orders={analytics.todayOrders} onCancelOrder={cancelOrder}/>
    </div> : null}
    {activeView === "expenses" ? <ExpensePanel expenses={expenseState.expenses} onAdd={expenseState.addExpense} onUpdate={expenseState.updateExpense} onDelete={expenseState.deleteExpense}/> : null}
    {activeView === "analytics" ? <AnalyticsPanel analytics={analytics} onResetData={resetData}/> : null}
    {activeView === "inventory" ? <InventoryPanel inventoryItems={inventory.inventoryList} inventoryHistory={inventory.inventoryHistory} onAddStock={inventory.addStock} onAdjustStock={inventory.adjustStock} onSetSafeStock={inventory.setSafeStock}/> : null}
    <SauceSelectionModal product={pendingProduct} onSelect={selectSauce} onClose={() => setPendingProduct(null)}/>
  </Layout>;
}
