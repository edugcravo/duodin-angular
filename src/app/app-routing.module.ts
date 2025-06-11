import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { LoginComponent } from './componentes/login/login.component';

// importe aqui todos os componentes de página que você já criou
// import { GoalsComponent }     from './components/goals/goals.component';
// import { BudgetsComponent }   from './components/budgets/budgets.component';
// import { RouletteComponent }  from './components/roulette/roulette.component';
// import { JournalComponent }   from './components/journal/journal.component';
// import { SummaryComponent }   from './components/summary/summary.component';
// import { CalendarComponent }  from './components/calendar/calendar.component';
// import { LoginComponent }     from './components/login/login.component';

const routes: Routes = [
  { path: 'login',      component: LoginComponent },
  { path: 'dashboard',  component: DashboardComponent },

  // redireciona raiz para login (ou dashboard, se preferir)
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // rota coringa para 404
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
