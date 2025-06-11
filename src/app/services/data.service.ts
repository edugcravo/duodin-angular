import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'revenue';
  date: string;
  responsiblePartner: string;
  category: string;
}

export interface Budget {
  category: string;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly STORAGE_KEY = 'sarcasticFinanceAppCouple';

  // State subjects
  private balanceSubject       = new BehaviorSubject<number>(0);
  private revenueSubject       = new BehaviorSubject<number>(0);
  private expenseSubject       = new BehaviorSubject<number>(0);
  private sumRemainingSubject  = new BehaviorSubject<number>(0);
  private budgetsSubject       = new BehaviorSubject<Budget[]>([]);
  private transactionsSubject  = new BehaviorSubject<Transaction[]>([]);
  private namesSubject         = new BehaviorSubject<{partner1:string,partner2:string}>({partner1:'Pessoa 1',partner2:'Pessoa 2'});

  // Public observables
  balance$       = this.balanceSubject.asObservable();
  totalRevenue$  = this.revenueSubject.asObservable();
  totalExpense$  = this.expenseSubject.asObservable();
  sumRemaining$  = this.sumRemainingSubject.asObservable();
  budgets$       = this.budgetsSubject.asObservable();
  transactions$  = this.transactionsSubject.asObservable();
  coupleNames$   = this.namesSubject.asObservable();

  constructor() {
    this.loadFromStorage();
    // Recalculate on any change
    this.transactions$.subscribe(() => this.recalculate());
    this.budgets$.subscribe(() => this.recalculate());
  }

  private loadFromStorage() {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) return;
    try {
      const data = JSON.parse(json);
      this.namesSubject.next(data.coupleNames);
      this.transactionsSubject.next(data.transactions);
      this.budgetsSubject.next(data.budgets);
    } catch { localStorage.removeItem(this.STORAGE_KEY); }
  }

  private saveToStorage() {
    const payload = {
      coupleNames: this.namesSubject.value,
      transactions: this.transactionsSubject.value,
      budgets: this.budgetsSubject.value
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
  }

  private recalculate() {
    const txs = this.transactionsSubject.value;
    const budgets = this.budgetsSubject.value;

    const revenue = txs.filter(t => t.type==='revenue').reduce((sum,t)=>sum+t.amount,0);
    const expense = txs.filter(t => t.type==='expense').reduce((sum,t)=>sum+Math.abs(t.amount),0);
    const balance = revenue - expense;

    const sumRemaining = budgets.reduce((sum,b)=>{
      const spent = this.getSpent(b.category);
      return sum + (b.limit - spent);
    }, 0);

    this.revenueSubject.next(revenue);
    this.expenseSubject.next(expense);
    this.balanceSubject.next(balance);
    this.sumRemainingSubject.next(sumRemaining);
    this.saveToStorage();
  }

  addTransaction(
    description: string,
    rawAmount: string,
    type: 'expense'|'revenue',
    responsiblePartner: string,
    category: string
  ) {
    const amount = parseFloat(rawAmount)/100;
    if (!description || !responsiblePartner || isNaN(amount) || amount<=0) return;
    const tx: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount: type==='expense' ? -Math.abs(amount) : amount,
      type,
      date: new Date().toISOString(),
      responsiblePartner,
      category
    };
    this.transactionsSubject.next([...this.transactionsSubject.value, tx]);
  }

  deleteTransaction(id: string) {
    this.transactionsSubject.next(this.transactionsSubject.value.filter(t=>t.id!==id));
  }

  markPaid(category: string) {
    const budget = this.budgetsSubject.value.find(b=>b.category===category);
    if (!budget) return;
    // create an expense equal to the budget limit, by partner1
    const tx: Transaction = {
      id: crypto.randomUUID(),
      description: `Pagamento: ${category}`,
      amount: -budget.limit,
      type: 'expense',
      date: new Date().toISOString(),
      responsiblePartner: this.namesSubject.value.partner1,
      category
    };
    this.transactionsSubject.next([...this.transactionsSubject.value, tx]);
  }

  getSpent(category: string): number {
    return this.transactionsSubject.value
      .filter(t=>t.type==='expense'&&t.category===category)
      .reduce((sum,t)=>sum+Math.abs(t.amount),0);
  }

  // Simple sarcastic advice based on balance
  getAdvice(): string {
    const bal = this.balanceSubject.value;
    if (bal<0)    return 'No vermelho? Parabéns, a conta de luz agradece!';
    if (bal<500)  return 'Saldo baixo, mas a pizza sempre cabe em qualquer orçamento.';
    if (bal<2000) return 'Guardando o suficiente para fingir planejamento.';
    return 'Saldo folgado… até o próximo boleto aparecer.';
  }

  // Optionally expose methods to update names, budgets, etc.
  setCoupleNames(p1: string, p2: string) {
    this.namesSubject.next({partner1:p1,partner2:p2});
    this.saveToStorage();
  }
}
