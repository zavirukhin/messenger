import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, finalize, take } from 'rxjs';
import {
  ChangeDetectionStrategy, 
  Component,
  inject,
  Signal,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  provideTranslocoScope,
  TranslocoDirective,
  TranslocoService
} from '@jsverse/transloco';
import {
  TUI_VALIDATION_ERRORS,
  TuiAvatar,
  TuiFieldErrorPipe,
  TuiSkeleton
} from '@taiga-ui/kit';
import {
  TuiButton,
  TuiError,
  TuiFallbackSrcPipe,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import { langReady } from '@social/shared';
import { loader } from '../../transloco-loader';
import { ProfileService } from '../../services/profile/profile.service';
import { Profile } from '../../types/profile.type';

@Component({
  selector: 'lib-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TuiAvatar,
    TuiTitle,
    TuiTextfield,
    TuiButton,
    TuiError,
    TuiSkeleton,
    TuiFieldErrorPipe,
    TuiFallbackSrcPipe
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      deps: [TranslocoService],
      useFactory: (transloco: TranslocoService) => ({
        required: transloco.translate('required')
      })
    },
    provideTranslocoScope({
      scope: 'messenger',
      loader
    })
  ]
})
export class SettingsPageComponent {
  private readonly profileService = inject(ProfileService);

  private readonly router = inject(Router);

  public isLoading = signal<boolean>(true);

  public profile: Signal<Profile | undefined>;

  public readonly form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    customName: new FormControl('', [Validators.maxLength(50)]),
    avatarBase64: new FormControl('')
  });

  constructor() {
    const profile$ = this.profileService.getProfile();

    combineLatest([profile$, langReady('messenger')]).pipe(
      take(1)
    ).subscribe(([profile]) => {
      this.form.setValue({
        firstName: profile.first_name,
        lastName: profile.last_name,
        customName: profile.custom_name,
        avatarBase64: profile.avatar_base64
      });
      this.isLoading.set(false);
    });

    this.profile = toSignal(this.profileService.getProfile());
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.form.disable();
      this.profileService.updateProfile({
        first_name: this.form.controls.firstName.value ?? '',
        last_name: this.form.controls.lastName.value ?? '',
        custom_name: this.form.controls.customName.value,
        avatar_base64: this.form.controls.avatarBase64.value
      }).pipe(
        finalize(() => this.form.enable())
      ).subscribe();
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  public logout(): void {
    this.profileService.deleteToken();
    this.router.navigate(['auth']);
  }
}
