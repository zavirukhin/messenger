import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TranslocoDirective } from '@jsverse/transloco';
import { finalize } from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input
} from '@angular/core';
import {
  TuiButton,
  TuiError,
  TuiTextfield,
  TuiTitle 
} from '@taiga-ui/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AuthorizationService } from '../../services/authorization/authorization.service';

@Component({
  selector: 'lib-modal-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TuiHeader,
    TuiTitle,
    TuiTextfield,
    TuiButton,
    TuiError,
    TuiFieldErrorPipe
  ],
  templateUrl: './modal-create.component.html',
  styleUrl: './modal-create.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalCreateComponent {
  public readonly phone = input.required<string>();

  public readonly code = input.required<string>();

  private readonly authorizationService = inject(AuthorizationService);

  private readonly router = inject(Router);

  public readonly form = new FormGroup({
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)])
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.form.disable();

      this.authorizationService.createProfile({
        lastName: this.form.value.lastName ?? '',
        firstName: this.form.value.firstName ?? '',
        phone: this.phone(),
        code: this.code()
      }).pipe(
        finalize(() => {
          this.form.enable();
        })
      ).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }
}
