import { CommonModule } from '@angular/common';
import { TuiHeader } from '@taiga-ui/layout';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TranslocoDirective } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output
} from '@angular/core';
import {
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalVerifyComponent implements OnInit {
  public phoneChanged = output<PhoneVerify>();

  public codeChanged = output<string>();

  public readonly nextAttempt = input.required<number>();

  public readonly phone = input.required<string>();

  private readonly authorizationService = inject(AuthorizationService);

  private readonly router = inject(Router);

  public readonly form = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.maxLength(6)])
  });

  public sendCode() {
    this.form.disable({ emitEvent: false });
    this.authorizationService.sendCode(this.phone()).pipe(
      finalize(() => {
        this.form.reset();
        this.form.enable({ emitEvent: false });
      })
    ).subscribe((nextAttempt: NextAttempt) => {
      this.phoneChanged.emit({ phone: this.phone(), ...nextAttempt });
    });
  }

  ngOnInit() {
    this.form.controls.code.valueChanges.subscribe((code) => {
      if (code?.length === 6) {
        this.form.disable({ emitEvent: false });

        this.authorizationService.verifyPhone(this.phone(), code).pipe(
          catchError((error: RequestError) => {
            if (error.errorCode === 'USER_NOT_FOUND') {
              this.codeChanged.emit(code);
            }

            return EMPTY;
          }),
          finalize(() => {
            this.form.enable({ emitEvent: false });
          })
        ).subscribe(() => {
          this.router.navigate(['/']);
        });
      }
    });
  }
}
