import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SidebarComponent {
  @Input() currentPage!: string;
  @Input() isMobileOpen = false;
  @Input() coupleNames!: { partner1: string; partner2: string };
  @Output() pageChange = new EventEmitter<string>();
  @Output() closeMobile = new EventEmitter<void>();

  navItems = [
    { id: 'dashboard', label: 'Dashboard do Apocalipse', icon: '💀' },
    { id: 'calendar',   label: 'Memória de Peixe',         icon: '📅' },
    { id: 'goals',      label: 'Metas de Sofrimento',      icon: '🎯' },
    { id: 'budgets',    label: 'Grande Orçamento da Ilusão',icon: '💸' },
    { id: 'roulette',   label: 'Roleta Gastronômica',      icon: '🎰' },
    { id: 'journal',    label: 'Diário de Humor',          icon: '✍️' },
    { id: 'summary',    label: 'Canto do Divórcio',        icon: '💔' },
  ];

  select(id: string) {
    this.pageChange.emit(id);
    this.closeMobile.emit();
  }
}