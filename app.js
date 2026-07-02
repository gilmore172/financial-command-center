const STORAGE_KEY = "fcc_v1_budget";

const demoData = {
  income: [
    { name: "JPMorgan Paycheck", amount: 6000 },
    { name: "VA Disability", amount: 4537 }
  ],
  expense: [
    { name: "Mortgage", amount: 3000 },
    { name: "Utilities", amount: 600 },
    { name: "Insurance", amount: 350 },
    { name: "Groceries", amount: 900 },
    { name: "Gas", amount: 300 },
    { name: "Truck", amount: 1533 },
    { name: "Golf Cart", amount: 250 },
    { name: "Camper", amount: 250 },
    { name: "Horses", amount: 1500 }
  ],
  debt: [
    { name: "Truck Loan", amount: 90000 },
    { name: "NFCU Card", amount: 24000 },
    { name: "NFCU Card 2", amount: 24000 },
    { name: "USAA Card", amount: 20000 }
  ],
  asset: [
    { name: "401(k)", amount: 103000 },
    { name: "Pension Balance", amount: 12000 }
  ],
  retirementBalance: 103000,
  retirementTarget: 1150000
};

let state = load();
let modalType = null;

function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(demoData);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function sum(type) {
  return state[type].reduce((total, item) => total + Number(item.amount || 0), 0);
}

function renderList(type, elementId) {
  const el = document.getElementById(elementId);
  el.innerHTML = "";
  state[type].forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-amount">${money(item.amount)}</div>
      <button class="delete" aria-label="Delete ${item.name}">Delete</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      state[type].splice(index, 1);
      save();
      render();
    });
    el.appendChild(row);
  });
}

function render() {
  const totalIncome = sum("income");
  const totalExpenses = sum("expense");
  const totalDebt = sum("debt");
  const totalAssets = sum("asset");
  const netWorth = totalAssets - totalDebt;
  const retirementProgress = Math.min((state.retirementBalance / state.retirementTarget) * 100, 100) || 0;

  document.getElementById("monthName").textContent = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  document.getElementById("totalIncome").textContent = money(totalIncome);
  document.getElementById("totalExpenses").textContent = money(totalExpenses);
  document.getElementById("leftOver").textContent = money(totalIncome - totalExpenses);
  document.getElementById("totalDebt").textContent = money(totalDebt);
  document.getElementById("netWorth").textContent = money(netWorth);

  document.getElementById("retirementBalance").value = state.retirementBalance;
  document.getElementById("retirementTarget").value = state.retirementTarget;
  document.getElementById("retirementProgress").style.width = `${retirementProgress}%`;
  document.getElementById("retirementProgressText").textContent = `${retirementProgress.toFixed(1)}%`;

  renderList("income", "incomeList");
  renderList("expense", "expenseList");
  renderList("debt", "debtList");
  renderList("asset", "assetList");
}

function openModal(type) {
  modalType = type;
  document.getElementById("modalTitle").textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  document.getElementById("itemName").value = "";
  document.getElementById("itemAmount").value = "";
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

document.querySelectorAll("[data-add]").forEach(button => {
  button.addEventListener("click", () => openModal(button.dataset.add));
});

document.getElementById("saveItem").addEventListener("click", () => {
  const name = document.getElementById("itemName").value.trim();
  const amount = Number(document.getElementById("itemAmount").value);
  if (!name || Number.isNaN(amount)) return;
  state[modalType].push({ name, amount });
  save();
  closeModal();
  render();
});

document.getElementById("cancelItem").addEventListener("click", closeModal);

document.getElementById("retirementBalance").addEventListener("input", e => {
  state.retirementBalance = Number(e.target.value);
  const asset401k = state.asset.find(item => item.name === "401(k)");
  if (asset401k) asset401k.amount = state.retirementBalance;
  save();
  render();
});

document.getElementById("retirementTarget").addEventListener("input", e => {
  state.retirementTarget = Number(e.target.value);
  save();
  render();
});

document.getElementById("resetDemo").addEventListener("click", () => {
  state = structuredClone(demoData);
  save();
  render();
});

render();
