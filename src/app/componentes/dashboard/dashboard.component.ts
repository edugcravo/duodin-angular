import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  balance = 0;
  totalRevenue = 0;
  totalExpense = 0;
  sumRemaining = 0;
  budgets: Array<{category:string, limit:number}> = [];
  transactions: Array<any> = [];
  description = '';
  rawAmount = '';
  type: 'expense'|'revenue' = 'expense';
  selectedCategory = 'Outros';
  responsiblePartner = '';
  coupleNames: { partner1: string; partner2: string } = { partner1: '', partner2: '' };
  @ViewChild('financeChart', { static: true }) financeChartEl!: ElementRef<SVGElement>;
  @ViewChild('categoryChart', { static: true }) categoryChartEl!: ElementRef<SVGElement>;

  constructor(public dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.balance$.subscribe(b => this.balance = b);
    this.dataService.totalRevenue$.subscribe(r => this.totalRevenue = r);
    this.dataService.totalExpense$.subscribe(e => this.totalExpense = e);
    this.dataService.sumRemaining$.subscribe(s => this.sumRemaining = s);
    this.dataService.budgets$.subscribe(bs => this.budgets = bs);
    this.dataService.transactions$.subscribe(ts => this.transactions = ts);
    this.dataService.coupleNames$.subscribe(names => {
      this.responsiblePartner = names.partner1;
    });
  }

  ngAfterViewInit() {
    this.renderFinanceChart();
    this.renderCategoryChart();
    this.dataService.totalRevenue$.subscribe(() => this.renderFinanceChart());
    this.dataService.totalExpense$.subscribe(() => this.renderFinanceChart());
    this.dataService.transactions$.subscribe(() => this.renderCategoryChart());
  }

  addTransaction() {
    this.dataService.addTransaction(
      this.description,
      this.rawAmount,
      this.type,
      this.responsiblePartner,
      this.selectedCategory
    );
    this.description = '';
    this.rawAmount = '';
  }

  deleteTransaction(id: string) {
    this.dataService.deleteTransaction(id);
  }

  markPaid(cat: string) {
    this.dataService.markPaid(cat);
  }

  private renderFinanceChart() {
    const svg = d3.select(this.financeChartEl.nativeElement);
    svg.selectAll('*').remove();
    const data = [
      { name: 'Receitas', value: this.totalRevenue, color: '#4ade80' },
      { name: 'Despesas', value: this.totalExpense, color: '#ef4444' }
    ];
    const width = 300, height = 200, margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const g = svg
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    const x = d3.scaleBand().domain(data.map(d => d.name)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value)! * 1.1]).range([height, 0]);
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `R$ ${d}`));
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('x', d => x(d.name)!)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill', d => d.color)
      .attr('rx', 5).attr('ry', 5);
    g.selectAll('.label')
      .data(data)
      .enter().append('text')
      .attr('x', d => x(d.name)! + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .text(d => `R$ ${d.value.toFixed(2).replace('.', ',')}`);
  }

  private renderCategoryChart() {
    const svg = d3.select(this.categoryChartEl.nativeElement);
    svg.selectAll('*').remove();
    const expenseData: Record<string, number> = {};
    this.transactions.filter(t => t.type === 'expense' && t.category).forEach(t => {
      expenseData[t.category] = (expenseData[t.category] || 0) + Math.abs(t.amount);
    });
    const data = Object.entries(expenseData).map(([category, amount]) => ({ category, amount }));
    if (!data.length) return;
    const width = 300, height = 300, radius = Math.min(width, height) / 2;
    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const pie = d3.pie<any>().value(d => d.amount).sort(null);
    const arc = d3.arc<any>().innerRadius(0).outerRadius(radius);
    const arcs = g.selectAll('.arc').data(pie(data)).enter().append('g').attr('class', 'arc');
    arcs.append('path').attr('d', arc).attr('fill', d => color(d.data.category)!).attr('stroke', '#374151').style('stroke-width', '1px');
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '8px')
      .text(d => `${d.data.category} (${(d.data.amount / d3.sum(data, d => d.amount) * 100).toFixed(1)}%)`);
  }
}
