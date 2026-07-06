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
import { CASH_HISTORY_STORAGE_KEY, CURRENT_CASH_STORAGE_KEY, useCash } from "./hooks/useCash.js";
import { INVENTORY_LOSSES_STORAGE_KEY, useInventory } from "./hooks/useInventory.js";
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
  const cash = useCash();
  const analytics = useAnalytics(salesState.sales, salesState.orders, expenseState.expenses, inventory.inventoryList, inventory.inventoryLosses, cash);
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
    const sale = salesState.recordSale({ items: order.orderItems, total: order.total, mode: order.orderMode, paymentMethod: "cash" });
    cash.addCash(sale.total, "現金收入", { referenceId: sale.id });
    await Promise.all([reserveInventory(sale), syncOrder(sale), recordDailySale(sale)]);
    order.clearOrder();
    window.alert("結帳完成");
  };

  const cancelOrder = (sale) => {
    if (!sale || sale.status === "cancelled") return;
    if (!window.confirm("確定要取消這筆訂單嗎？庫存將自動回補。")) return;
    inventory.restoreInventory(sale.items || []);
    cash.deductCash(sale.total, "取消訂單現金回沖", { referenceId: sale.id, allowNegative: true });
    salesState.cancelSale(sale.id);
  };

  const validExpense = (input) => input.date && input.category && input.item?.trim() && Number(input.amount) > 0;

  const addExpense = (input) => {
    if (!validExpense(input)) { window.alert("請完整填寫日期、類別、項目與正確金額"); return false; }
    if (input.paymentMethod === "cashFloat") {
      const result = cash.deductCash(input.amount, `${input.category}支出`);
      if (!result.ok) { window.alert(`店內流動資金不足，目前為 $${cash.currentCash.toLocaleString("zh-TW")}`); return false; }
    }
    return Boolean(expenseState.addExpense(input));
  };

  const updateExpense = (id, input) => {
    if (!validExpense(input)) { window.alert("請完整填寫日期、類別、項目與正確金額"); return false; }
    const previous = expenseState.expenses.find((record) => record.id === id);
    if (!previous) return false;
    const previousCash = previous.paymentMethod === "cashFloat" ? Number(previous.amount) : 0;
    const nextCash = input.paymentMethod === "cashFloat" ? Number(input.amount) : 0;
    const cashChange = previousCash - nextCash;
    if (cashChange < 0) {
      const result = cash.deductCash(Math.abs(cashChange), "支出調整", { referenceId: id });
      if (!result.ok) { window.alert(`店內流動資金不足，目前為 $${cash.currentCash.toLocaleString("zh-TW")}`); return false; }
    } else if (cashChange > 0) {
      cash.addCash(cashChange, "支出調整回補", { referenceId: id });
    }
    expenseState.updateExpense(id, input);
    return true;
  };

  const deleteExpense = (id) => {
    const previous = expenseState.expenses.find((record) => record.id === id);
    if (!previous) return false;
    expenseState.deleteExpense(id);
    if (previous.paymentMethod === "cashFloat") cash.addCash(previous.amount, "刪除支出回補", { referenceId: id });
    return true;
  };

  const resetData = () => {
    if (!window.confirm("確定要清除所有營業資料嗎？此操作不可復原")) return;
    [SALES_STORAGE_KEY, ORDERS_STORAGE_KEY, ORDER_STORAGE_KEY, EXPENSES_STORAGE_KEY, INVENTORY_LOSSES_STORAGE_KEY, CURRENT_CASH_STORAGE_KEY, CASH_HISTORY_STORAGE_KEY].forEach((key) => window.localStorage.removeItem(key));
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
    {activeView === "expenses" ? <ExpensePanel expenses={expenseState.expenses} onAdd={addExpense} onUpdate={updateExpense} onDelete={deleteExpense} cash={cash}/> : null}
    {activeView === "analytics" ? <AnalyticsPanel analytics={analytics} onResetData={resetData}/> : null}
    {activeView === "inventory" ? <InventoryPanel inventoryItems={inventory.inventoryList} inventoryHistory={inventory.inventoryHistory} onAddStock={inventory.addStock} onAdjustStock={inventory.adjustStock} onSetSafeStock={inventory.setSafeStock} onRecordLoss={inventory.recordLoss}/> : null}
    <SauceSelectionModal product={pendingProduct} onSelect={selectSauce} onClose={() => setPendingProduct(null)}/>
  </Layout>;
}
