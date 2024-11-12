import { CommonModule } from '@angular/common';
import { TuiCardLarge } from '@taiga-ui/layout';
import { TUI_VALIDATION_ERRORS } from '@taiga-ui/kit';
import { TranslocoService } from '@jsverse/transloco';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  signal
} from '@angular/core';
import {
  interval,
  Subject,
  takeUntil,
  takeWhile,
  tap
} from 'rxjs';
import { Step } from '../../types/step.type';
import { ModalTelephoneNumberComponent } from '../modal-telephone-number/modal-telephone-number.component';
import { ModalVerifyComponent } from '../modal-verify/modal-verify.component';
import { PhoneVerify } from '../../interfaces/phone.interface';
import { ModalCreateComponent } from '../modal-create/modal-create.component';

@Component({
  selector: 'lib-authorization-page',
  standalone: true,
  imports: [
    CommonModule,
    TuiCardLarge,
    ModalTelephoneNumberComponent,
    ModalVerifyComponent,
    ModalCreateComponent
  ],
  templateUrl: './authorization-page.component.html',
  styleUrl: './authorization-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      deps: [TranslocoService],
      useFactory: (translocoService: TranslocoService) => ({
        required: translocoService.translate('required'),
        phoneNumber: translocoService.translate('phoneNumber')
      })
    }
  ]
})
export class AuthorizationPageComponent implements OnDestroy {
  public phoneVerify = signal<PhoneVerify>({phone: '', nextAttempt: 0});

  public code = signal<string>('');

  public step: Step = 'phone';

  public destroy$ = new Subject<void>();

  public onPhoneChanged(phoneVerify: PhoneVerify) {
    const nextAttempt = Math.floor(phoneVerify.nextAttempt / 1000); 

    this.destroy$.next();
    this.phoneVerify.set({...phoneVerify, nextAttempt});
    this.startTimer();
    this.step = 'verify';
  }

  public onCodeChanged(code: string) {
    this.code.set(code);
    this.step = 'create';
  }

  private startTimer(): void {
    interval(1000).pipe(
      tap(() => this.phoneVerify.update(v => ({...v, nextAttempt: v.nextAttempt - 1}))),
      takeWhile(() => this.phoneVerify().nextAttempt > 0),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
