import { CommonModule } from '@angular/common';
import { TuiCardLarge } from '@taiga-ui/layout';
import { interval, takeWhile, tap } from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component, 
  signal, 
  WritableSignal
} from '@angular/core';
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
export class AuthorizationPageComponent {
  public phoneVerify: WritableSignal<PhoneVerify> | null = null;

  public step: Step = 'phone';

  public onPhoneChanged(phoneVerify: PhoneVerify) {
    this.phoneVerify = signal(phoneVerify);
    this.startTimer();
    this.step = 'verify';
  }

  private startTimer() {
    interval(1000).pipe(
      takeWhile(() => this.phoneVerify !== null && this.phoneVerify().nextAttempt > 0),
      tap(() => this.phoneVerify?.update(v => ({...v, nextAttempt: v.nextAttempt - 1})))
    ).subscribe();
  }
}
