import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

interface MockUser {
  password: string;
  partner1: string;
  partner2: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  mockUsers: Record<string, MockUser> = {
    edubia: { password: 'Banana123@', partner1: 'A Rainha do mimimei', partner2: 'Chefe da Fatura Surpresa' },
    test:   { password: 'test',        partner1: 'Humano 1',            partner2: 'Humano 2' }
  };

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  onSubmit() {
    this.error = '';
    const user = this.mockUsers[this.username];
    if (user && user.password === this.password) {
      // salva nomes no dataService e marca como logado
      this.dataService.setCoupleNames(user.partner1, user.partner2);
      // this.dataService.setLoggedIn(true);
      // redireciona para dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Credenciais inválidas. Vocês erram a senha igual erram as contas!';
    }
  }
}
