import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header-gerente',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-gerente.component.html',
  styleUrls: ['./header-gerente.component.css']
})
export class HeaderGerenteComponent {
}
