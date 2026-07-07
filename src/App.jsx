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
import { FUND_ACCOUNTS_STORAGE_KEY, FUND_HISTORY_STORAGE_KEY, LEGACY_CASH_HISTORY_STORAGE_KEY, LEGACY_CURRENT_CASH_STORAGE_KEY, useFunds } from "./hooks/useFunds.js";
import { INVENTORY_LOSSES_STORAGE_KEY, useInventory } from "./hooks/useInventory.js";
import { ORDER_STORAGE_KEY, useOrder } from "./hooks/useOrder.js";
import { usePosIntegrations } from "./hooks/usePosIntegrations.js";
import { ORDERS_STORAGE_KEY, SALES_STORAGE_KEY, useSales } from "./hooks/useSales.js";

export default function App() {
  const [activeView, setActiveView] = React.useState("pos");
  const [pendingProduct, setPendingProduct] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const order = useOrder();
  const salesState = useSales();
  const expenseState = useExpenses();
  const inventory = useInventory();
  const funds = useFunds();
  const analytics = useAnalytics(salesState.sales, salesState.orders, expenseState.expenses, inventory.inventoryList, inventory.inventoryLosses, funds);
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
    const sale = salesState.recordSale({ items: order.orderItems, total: order.total, mode: order.orderMode, paymentMethod });
    funds.deposit(paymentMethod, sale.total, paymentMethod === "bank" ? "匯款收入" : "現金收入", { referenceId: sale.id });
    await Promise.all([reserveInventory(sale), syncOrder(sale), recordDailySale(sale)]);
    order.clearOrder();
    window.alert("結帳完成");
  };

  const cancelOrder = (sale) => {
    if (!sale || sale.status === "cancelled") return;
    if (!window.confirm("確定要取消這筆訂單嗎？庫存將自動回補。")) return;
    inventory.restoreInventory(sale.items || []);
    const saleAccount = sale.paymentMethod === "bank" ? "bank" : "cash";
    funds.withdraw(saleAccount, sale.total, "取消訂單收入回沖", { referenceId: sale.id, allowNegative: true });
    salesState.cancelSale(sale.id);
  };

  const validExpense = (input) => input.date && input.category && input.item?.trim() && Number(input.amount) > 0;

  const addExpense = (input) => {
    if (!validExpense(input)) { window.alert("請完整填寫日期、類別、項目與正確金額"); return false; }
    if (input.paymentMethod !== "other") {
      const result = funds.withdraw(input.paymentMethod, input.amount, `${input.category}支出`);
      if (!result.ok) { window.alert(`${input.paymentMethod === "bank" ? "銀行戶頭" : "店內現金"}餘額不足`); return false; }
    }
    return Boolean(expenseState.addExpense(input));
  };

  const updateExpense = (id, input) => {
    if (!validExpense(input)) { window.alert("請完整填寫日期、類別、項目與正確金額"); return false; }
    const previous = expenseState.expenses.find((record) => record.id === id);
    if (!previous) return false;
    const changes = [];
    if (previous.paymentMethod !== "other") changes.push({ accountId: previous.paymentMethod === "cashFloat" ? "cash" : previous.paymentMethod, amount: Number(previous.amount), type: "支出調整回補" });
    if (input.paymentMethod !== "other") changes.push({ accountId: input.paymentMethod, amount: -Number(input.amount), type: "支出調整" });
    if (changes.length) {
      const result = funds.commitChanges(changes, { referenceId: id });
      if (!result.ok) { window.alert(`${result.accountId === "bank" ? "銀行戶頭" : "店內現金"}餘額不足`); return false; }
    }
    expenseState.updateExpense(id, input);
    return true;
  };

  const deleteExpense = (id) => {
    const previous = expenseState.expenses.find((record) => record.id === id);
    if (!previous) return false;
    expenseState.deleteExpense(id);
    if (previous.paymentMethod !== "other") funds.deposit(previous.paymentMethod === "cashFloat" ? "cash" : previous.paymentMethod, previous.amount, "刪除支出回補", { referenceId: id });
    return true;
  };

  const resetData = () => {
    if (!window.confirm("確定要清除所有營業資料嗎？此操作不可復原")) return;
    [SALES_STORAGE_KEY, ORDERS_STORAGE_KEY, ORDER_STORAGE_KEY, EXPENSES_STORAGE_KEY, INVENTORY_LOSSES_STORAGE_KEY, FUND_ACCOUNTS_STORAGE_KEY, FUND_HISTORY_STORAGE_KEY, LEGACY_CURRENT_CASH_STORAGE_KEY, LEGACY_CASH_HISTORY_STORAGE_KEY].forEach((key) => window.localStorage.removeItem(key));
    salesState.resetSales();
    order.clearOrder();
    window.location.reload();
  };

  return <Layout activeView={activeView} onViewChange={setActiveView} contentClassName={activeView === "pos" ? "overflow-hidden" : "overflow-y-auto scroll-smooth p-5 lg:p-7"}>
    {activeView === "pos" ? <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[1.45fr_0.8fr_0.85fr]">
      <ProductGrid products={menuItems} mode={order.orderMode} onModeChange={order.setOrderMode} onAddItem={addProduct}/>
      <OrderPanel items={order.orderItems} total={order.total} itemCount={order.itemCount} mode={order.orderMode} paymentMethod={paymentMethod} onPaymentMethodChange={setPaymentMethod} onRemoveOne={order.removeOne} onCheckout={checkout}/>
      <TodayOrdersPanel orders={analytics.todayOrders} onCancelOrder={cancelOrder}/>
    </div> : null}
    {activeView === "expenses" ? <ExpensePanel expenses={expenseState.expenses} onAdd={addExpense} onUpdate={updateExpense} onDelete={deleteExpense} funds={funds}/> : null}
    {activeView === "analytics" ? <AnalyticsPanel analytics={analytics} onResetData={resetData}/> : null}
    {activeView === "inventory" ? <InventoryPanel inventoryItems={inventory.inventoryList} inventoryHistory={inventory.inventoryHistory} onAddStock={inventory.addStock} onAdjustStock={inventory.adjustStock} onSetSafeStock={inventory.setSafeStock} onRecordLoss={inventory.recordLoss}/> : null}
    <SauceSelectionModal product={pendingProduct} onSelect={selectSauce} onClose={() => setPendingProduct(null)}/>
  </Layout>;
}
