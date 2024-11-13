import { TUI_DARK_MODE, TuiRoot } from '@taiga-ui/core';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule, TuiRoot],
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  protected readonly darkMode = inject(TUI_DARK_MODE);
}
