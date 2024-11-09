import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';
import { TuiAlertService, TuiButton, TuiError, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { catchError, of } from 'rxjs';
import { RequestError } from '@social/shared';
import { AuthorizationService } from '../../services/authorization/authorization.service';
import { Token } from '../../interfaces/token.interface';

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

  private readonly router = inject(Router);

  private readonly alerts = inject(TuiAlertService);

  private readonly translocoService = inject(TranslocoService);

  public readonly form = new FormGroup({
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)])
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.form.disable();

      this.authorizationService.createProfile({
        last_name: this.form.value.firstName ?? '',
        first_name: this.form.value.lastName ?? '',
        phone: this.phone(),
        code: this.code()
      })
      .pipe(
        catchError((error: RequestError) => {
          this.form.enable();

          this.alerts.open(error.message, {
            label: this.translocoService.translate('error'),
            appearance: 'error'
          })
          .subscribe();

          return of();
        })
      )
      .subscribe((token: Token) => {
        this.form.enable();
        this.authorizationService.saveToken(token.token);
        
        this.router.navigate(['/messenger']);
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }
}
