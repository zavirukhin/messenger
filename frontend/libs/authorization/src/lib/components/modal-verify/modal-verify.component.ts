import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output
} from '@angular/core';
import {
  TuiAlertService,
  TuiError,
  TuiLink,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import {
  FormControl, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { RequestError } from '@social/shared';
import { AuthorizationService } from '../../services/authorization/authorization.service';
import { Token } from '../../interfaces/token.interface';
import { PhoneVerify } from '../../interfaces/phone.interface';
import { NextAttempt } from '../../interfaces/next-attempt.interface';

@Component({
  selector: 'lib-modal-verify',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiHeader,
    TuiTitle,
    TuiTextfield,
    TuiLink,
    TuiError,
    TuiFieldErrorPipe,
    TranslocoDirective
  ],
  templateUrl: './modal-verify.component.html',
  styleUrl: './modal-verify.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      deps: [TranslocoService],
      useFactory: (translocoService: TranslocoService) => ({
        required: translocoService.translate('required')
      })
    }
  ]
})
export class ModalVerifyComponent implements OnInit {
  public phoneChanged = output<PhoneVerify>();

  public codeChanged = output<string>();

  private readonly authorizationService = inject(AuthorizationService);

  private readonly translocoService = inject(TranslocoService);

  private readonly alerts = inject(TuiAlertService);

  private readonly router = inject(Router);

  public readonly nextAttempt = input.required<number>();

  public readonly phone = input.required<string>();

  public readonly form = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.maxLength(6)])
  });

  public sendCode() {
    this.form.disable({ emitEvent: false });
    this.authorizationService.sendCode(this.phone()).pipe(
      catchError((error: RequestError) => {
        this.form.enable({ emitEvent: false });

        this.alerts.open(error.message, {
          label: this.translocoService.translate('error'),
          appearance: 'error'
        })
        .subscribe();

        return of();
      })
    ).subscribe((nextAttempt: NextAttempt) => {
      this.form.reset();
      this.form.enable({ emitEvent: false });
      this.phoneChanged.emit({ phone: this.phone(), ...nextAttempt });
    });
  }

  ngOnInit() {
    this.form.controls.code.valueChanges.subscribe((code) => {
      if (code?.length === 6) {
        this.form.disable({ emitEvent: false });

        this.authorizationService.verifyPhone(this.phone(), code).pipe(
          catchError((error: RequestError) => {
            this.form.enable({ emitEvent: false });

            if (error.statusCode === 404 && error.errorCode === 'USER_NOT_FOUND') {
              this.codeChanged.emit(code);
              return of();
            }

            this.alerts.open(error.message, {
              label: this.translocoService.translate('error'),
              appearance: 'error'
            })
            .subscribe();

            return of();
          })
        )
        .subscribe((token: Token) => {
          this.form.enable({ emitEvent: false });
          this.authorizationService.saveToken(token.token);

          this.router.navigate(['/']);
        });
      }
    });
  }
}
