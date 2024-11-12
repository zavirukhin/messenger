import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, combineLatest, of, take } from 'rxjs';
import {
  ChangeDetectionStrategy, 
  Component,
  inject,
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
  TuiAlertService,
  TuiButton,
  TuiError,
  TuiFallbackSrcPipe,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import { langReady, RequestError } from '@social/shared';
import { loader } from '../../transloco-loader';
import { ProfileService } from '../../services/profile/profile.service';
import { Profile } from '../../types/profile-update.type';

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
  public profile = signal<Profile>({
    id: 0,
    first_name: 'First name',
    last_name: 'Last name',
    custom_name: 'example',
    avatar_base64: ''
  });

  public readonly form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    customName: new FormControl('', [Validators.maxLength(50)]),
    avatar_base64: new FormControl('')
  });

  public isLoading = signal<boolean>(true);

  private readonly profileService = inject(ProfileService);

  private readonly router = inject(Router);

  private readonly alerts = inject(TuiAlertService);

  private readonly translocoService = inject(TranslocoService);

  constructor() {
    combineLatest([
      this.profileService.getProfile(), 
      langReady('messenger')
    ])
    .pipe(
      take(1),
      catchError((error: RequestError) => {
        this.alerts.open(error.message, {
          label: this.translocoService.translate('error'),
          appearance: 'error'
        })
        .subscribe();

        return of();
      })
    )
    .subscribe(([profile]) => {
      this.profile.set(profile);

      this.form.setValue({
        firstName: profile.first_name,
        lastName: profile.last_name,
        customName: profile.custom_name,
        avatar_base64: profile.avatar_base64
      });
      this.isLoading.set(false);
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const profile: Partial<Profile> = {};

      if (this.form.value.firstName !== this.profile().first_name) {
        profile.first_name = this.form.value.firstName ?? '';
      }
      if (this.form.value.lastName !== this.profile().last_name) {
        profile.last_name = this.form.value.lastName ?? '';
      }
      if (this.form.value.customName !== this.profile().custom_name) {
        profile.custom_name = this.form.value.customName !== '' 
          ? this.form.value.customName 
          : null;
      }
      if (this.form.value.avatar_base64 !== this.profile().avatar_base64) {
        profile.avatar_base64 = this.form.value.avatar_base64 ?? '';
      }

      if (Object.keys(profile).length) {
        this.form.disable();
        this.profileService.updateProfile(profile)
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
        .subscribe(() => {
          this.profile.update(v => ({ ...v, ...profile }));
          this.form.enable();
        });
      }
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  public updateAvatar(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg';
    input.onchange = this.onFileChange.bind(this);
    input.click();
  }

  public logout(): void {
    this.profileService.deleteToken();
    this.router.navigate(['auth']);
  }

  private onFileChange(event: Event): void {
    if (event.target instanceof HTMLInputElement && event.target.files?.length) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0])
      reader.onload = this.onFileLoad.bind(this);
    }
  }

  private onFileLoad(event: ProgressEvent<FileReader>): void {
    if (typeof event.target?.result === 'string') {
      this.form.get('avatar_base64')?.setValue(event.target.result);
    }
  }
}
