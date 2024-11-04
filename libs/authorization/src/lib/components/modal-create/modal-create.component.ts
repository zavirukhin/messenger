import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';
import { TuiButton, TuiError, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      deps: [TranslocoService],
      useFactory: (transloco: TranslocoService) => ({
        required: transloco.translate('required')
      })
    }
  ]
})
export class ModalCreateComponent {
  public readonly phone = input.required<string>();

  public readonly code = input.required<string>();

  private readonly authorizationService = inject(AuthorizationService);

  public readonly form = new FormGroup({
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)])
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.authorizationService.createProfile({
        lastName: this.form.value.firstName ?? '',
        firstName: this.form.value.lastName ?? '',
        phone: this.phone(),
        code: this.code()
      })
      .subscribe();
    }
    else {
      this.form.markAllAsTouched();
    }
  }
}
