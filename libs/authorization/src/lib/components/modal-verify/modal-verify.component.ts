import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TranslocoService } from '@jsverse/transloco';
import { catchError, of } from 'rxjs';
import { RequestError } from '@social/shared';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit
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
import { AuthorizationService } from '../../services/authorization/authorization.service';
import { Token } from '../../interfaces/token.interface';

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
    TuiFieldErrorPipe
  ],
  templateUrl: './modal-verify.component.html',
  styleUrl: './modal-verify.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      deps: [TranslocoService],
      useFactory: (translocoService: TranslocoService) => {
        return {
          required: translocoService.translate('required')
        }
      }
    }
  ]
})
export class ModalVerifyComponent implements OnInit {
  private readonly authorizationService = inject(AuthorizationService);

  private readonly translocoService = inject(TranslocoService);

  private readonly alerts = inject(TuiAlertService);

  public readonly nextAttempt = input.required<number>();

  public readonly phone = input.required<string>();

  public readonly form = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.maxLength(6)])
  });

  ngOnInit() {
    this.form.controls.code.valueChanges.subscribe((code) => {
      if (code?.length === 6) {
        this.form.disable({ emitEvent: false });

        this.authorizationService.verifyPhone(this.phone(), code).pipe(
          catchError((error: RequestError) => {
            this.alerts
              .open(error.errorText, {
                label: this.translocoService.translate('error')
              })
              .subscribe();

            this.form.enable({ emitEvent: false });

            return of();
          })
        )
        .subscribe((token: Token) => {
          this.form.enable({ emitEvent: false });

          this.authorizationService.saveToken(token.token);
        });
      }
    });
  }
}
