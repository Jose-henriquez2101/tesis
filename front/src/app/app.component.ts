import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { NavSuperiorComponent } from './nav-superior/nav-superior.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavComponent, CommonModule, NavSuperiorComponent] ,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front';

  constructor(public authService: AuthService) {}

  get isLoggedIn$() {
    return this.authService.loggedIn$;
  }
}
