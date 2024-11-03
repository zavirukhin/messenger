import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCardLarge } from '@taiga-ui/layout';
import { interval, takeWhile } from 'rxjs';
import { ModalTelephoneNumberComponent } from '../modal-telephone-number/modal-telephone-number.component';
import { Step } from '../../types/step.type';
import { ModalVerifyComponent } from '../modal-verify/modal-verify.component';

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
  public phoneVerify = signal<PhoneVerify | null>(null);

  public step: Step = 'phone';

  public onPhoneChanged(phoneVerify: PhoneVerify) {
    this.phoneVerify = phoneVerify;
    this.step = 'verify';

    this.startTimer();
  }

  private startTimer() {
    if (this.phoneVerify) {
      interval(1000).pipe(
        takeWhile(() => this.phoneVerify !== null && this.phoneVerify.nextAttempt > 0)
      ).subscribe(() => {
        if (this.phoneVerify) {
          this.phoneVerify.nextAttempt--;
        }
      });
    }
  }
}
