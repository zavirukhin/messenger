import { CommonModule } from '@angular/common';
import { TuiCardLarge } from '@taiga-ui/layout';
import { interval, Subject, takeUntil, takeWhile, tap } from 'rxjs';
import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { Step } from '../../types/step.type';
import { ModalTelephoneNumberComponent } from '../modal-telephone-number/modal-telephone-number.component';
import { ModalVerifyComponent } from '../modal-verify/modal-verify.component';
import { PhoneVerify } from '../../interfaces/phone.interface';

@Component({
  selector: 'lib-authorization-page',
  standalone: true,
  imports: [
    CommonModule,
    TuiCardLarge,
    ModalTelephoneNumberComponent,
    ModalVerifyComponent
  ],
  templateUrl: './authorization-page.component.html',
  styleUrl: './authorization-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationPageComponent implements OnDestroy {
  public phoneVerify = signal<PhoneVerify>({phone: '', nextAttempt: 0});

  public step: Step = 'phone';

  public destroy$ = new Subject<void>();

  public onPhoneChanged(phoneVerify: PhoneVerify) {
    this.destroy$.next();
    this.phoneVerify.set(phoneVerify);
    this.startTimer();
    this.step = 'verify';
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
