import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginCapacitador } from './login-capacitador/login-capacitador';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginCapacitador],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front';
}
