const DEFAULT_DATA = {
  settings: { retirementGoal: 1150000, emergencyGoal: 30000, cash: 12000 },
  income: [
    { id: crypto.randomUUID(), name: "Brandon JPMorgan Take-Home", amount: 6000 },
    { id: crypto.randomUUID(), name: "VA Disability", amount: 4537 },
    { id: crypto.randomUUID(), name: "Ginny Take-Home", amount: 3033 }
  ],
  expenses: [
    { id: crypto.randomUUID(), name: "Mortgage", amount: 3000 },
    { id: crypto.randomUUID(), name: "Utilities", amount: 600 },
    { id: crypto.randomUUID(), name: "Insurance", amount: 350 },
    { id: crypto.randomUUID(), name: "Groceries", amount: 900 },
    { id: crypto.randomUUID(), name: "Gas", amount: 300 },
    { id: crypto.randomUUID(), name: "Truck", amount: 1533 },
    { id: crypto.randomUUID(), name: "Horses", amount: 1500 },
    { id: crypto.randomUUID(), name: "Camper", amount: 250 },
    { id: crypto.randomUUID(), name: "Golf Cart", amount: 250 }
  ],
  debts: [
    { id: crypto.randomUUID(), name: "Truck", amount: 90000, rate: 7.25 },
    { id: crypto.randomUUID(), name: "Credit Cards", amount: 68000, rate: 14.0 }
  ],
  investments: [
    { id: crypto.randomUUID(), name: "Brandon 401(k)", amount: 103000, rate: 5 },
    { id: crypto.randomUUID(), name: "Ginny 401(k)", amount: 30000, rate: 5 },
    { id: crypto.randomUUID(), name: "Small Pension Balance", amount: 12000, rate: 0 }
  ],
  goals: ["Pay off credit cards", "Truck below $75,000", "Increase Brandon 401(k) to 10%", "Reach $250k retirement", "Build $30k emergency fund", "Retire at 56"]
};

let data = loadData();
let addType = null;

function loadData(){
  const saved = localStorage.getItem("fccDataV02");
  return saved ? JSON.parse(saved) : structuredClone(DEFAULT_DATA);
}
function saveData(){ localStorage.setItem("fccDataV02", JSON.stringify(data)); }
function money(n){ return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0); }
function sum(arr){ return arr.reduce((t,x)=>t+Number(x.amount||0),0); }
function pct(value,total){ return total ? Math.min(100, Math.max(0, (value/total)*100)) : 0; }

function render(){
  const income = sum(data.income), expenses = sum(data.expenses), available = income - expenses;
  const debt = sum(data.debts), retirement = sum(data.investments);
  const retirementPct = pct(retirement, data.settings.retirementGoal);
  const emergencyPct = pct(data.settings.cash, data.settings.emergencyGoal);
  const budgetScore = available > 0 ? 25 : 8;
  const emergencyScore = Math.min(20, emergencyPct * .2);
  const retirementScore = Math.min(30, retirementPct * 2.5);
  const debtScore = debt < 100000 ? 25 : debt < 160000 ? 16 : 8;
  const score = Math.round(budgetScore + emergencyScore + retirementScore + debtScore);

  document.documentElement.style.setProperty("--score", `${score}%`);
  document.getElementById("healthScore").textContent = score;
  document.getElementById("scoreRingText").textContent = `${score}%`;
  document.getElementById("healthMessage").textContent = score >= 80 ? "Strong progress. Stay consistent." : score >= 65 ? "Good foundation. Debt payoff is the focus." : "Focus on debt and cash flow first.";
  document.getElementById("monthlyIncome").textContent = money(income);
  document.getElementById("monthlyExpenses").textContent = money(expenses);
  document.getElementById("monthlyAvailable").textContent = money(available);
  document.getElementById("debtRemaining").textContent = money(debt);
  document.getElementById("retirementTotal").textContent = money(retirement);
  document.getElementById("retirementPercent").textContent = `${retirementPct.toFixed(1)}%`;
  document.getElementById("retirementBar").style.width = `${retirementPct}%`;
  document.getElementById("missionTitle").textContent = new Date().toLocaleString("en-US",{month:"long",year:"numeric"});
  document.getElementById("missionList").innerHTML = [
    available > 0 ? `✓ You have ${money(available)} available after planned expenses.` : `⚠ Planned expenses are above income.`,
    `✓ Household retirement is ${money(retirement)}.`,
    `→ Next objective: ${data.goals[0] || "Update goals"}.`
  ].map(x=>`<li>${x}</li>`).join("");
  document.getElementById("goalsList").innerHTML = data.goals.map(g=>`<div class="goal">⬜ <strong>${g}</strong></div>`).join("");
  document.getElementById("retirementGoalInput").value = data.settings.retirementGoal;
  document.getElementById("emergencyGoalInput").value = data.settings.emergencyGoal;
  document.getElementById("cashInput").value = data.settings.cash;

  renderList("incomeList", data.income, "income");
  renderList("expenseList", data.expenses, "expenses");
  renderList("debtList", data.debts, "debts", true);
  renderList("investmentList", data.investments, "investments", true);
}

function renderList(el, items, key, showRate=false){
  document.getElementById(el).innerHTML = items.map(item=>`
    <div class="row">
      <div class="row-top">
        <div><h4>${item.name}</h4>${showRate ? `<p class="muted">${item.rate || 0}%</p>` : ""}</div>
        <div class="amount">${money(item.amount)}</div>
      </div>
      <button onclick="deleteItem('${key}','${item.id}')">Delete</button>
    </div>`).join("");
}

window.deleteItem = (key,id)=>{ data[key]=data[key].filter(x=>x.id!==id); saveData(); render(); };

document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active-screen"));
  btn.classList.add("active"); document.getElementById(btn.dataset.tab).classList.add("active-screen");
}));

document.querySelectorAll("[data-add]").forEach(btn=>btn.addEventListener("click",()=>{
  addType = btn.dataset.add;
  document.getElementById("modalTitle").textContent = `Add ${addType}`;
  document.getElementById("itemName").value = ""; document.getElementById("itemAmount").value = ""; document.getElementById("itemRate").value = "";
  document.getElementById("itemRateWrap").style.display = addType === "budget" ? "none" : "block";
  document.getElementById("modal").classList.remove("hidden");
}));

document.getElementById("cancelModal").onclick = ()=>document.getElementById("modal").classList.add("hidden");
document.getElementById("saveItem").onclick = ()=>{
  const name = document.getElementById("itemName").value.trim(); const amount = Number(document.getElementById("itemAmount").value); const rate = Number(document.getElementById("itemRate").value);
  if(!name || !amount) return;
  const item = { id: crypto.randomUUID(), name, amount, rate };
  if(addType === "budget") data.expenses.push(item);
  if(addType === "debt") data.debts.push(item);
  if(addType === "investment") data.investments.push(item);
  saveData(); render(); document.getElementById("modal").classList.add("hidden");
};

document.getElementById("saveSettings").onclick = ()=>{
  data.settings.retirementGoal = Number(document.getElementById("retirementGoalInput").value);
  data.settings.emergencyGoal = Number(document.getElementById("emergencyGoalInput").value);
  data.settings.cash = Number(document.getElementById("cashInput").value);
  saveData(); render();
};
document.getElementById("resetBtn").onclick = ()=>{ if(confirm("Reset all local data?")){ localStorage.removeItem("fccDataV02"); data = structuredClone(DEFAULT_DATA); render(); }};

const hour = new Date().getHours();
document.getElementById("greeting").textContent = `${hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"} Brandon`;
render();
