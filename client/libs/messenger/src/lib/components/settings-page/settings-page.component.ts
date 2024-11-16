import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, finalize, take } from 'rxjs';
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
  TranslocoDirective,
  TranslocoService
} from '@jsverse/transloco';
import {
  TUI_VALIDATION_ERRORS,
  TuiAvatar,
  TuiFieldErrorPipe,
  TuiFiles,
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
import { ProfileService } from '../../services/profile/profile.service';
import { Profile } from '../../types/profile.type';
import { fileToBase64 } from '../../utils/file-to-base64';

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
    TuiFiles,
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
    }
  ]
})
export class SettingsPageComponent {
  public readonly form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    customName: new FormControl('', [Validators.maxLength(50)]),
    avatar: new FormControl<File | null>(null)
  });

  private readonly profileService = inject(ProfileService);

  private readonly router = inject(Router);

  public isLoading = signal<boolean>(true);

  public profile: Signal<Profile | undefined>;

  public readonly file$ = this.form.controls.avatar.valueChanges;

  constructor() {
    this.profile = toSignal(this.profileService.getProfile());

    combineLatest([
      toObservable(this.profile),
      langReady('messenger')
    ]).pipe(
      filter(([profile]) => !!profile),
      take(1)
    ).subscribe(([profile]) => {
      this.form.setValue({
        firstName: profile?.firstName ?? '',
        lastName: profile?.lastName ?? '',
        customName: profile?.customName ?? '',
        avatar: null
      });
      this.isLoading.set(false);
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.form.disable();

      fileToBase64(this.form.controls.avatar.value).subscribe((avatar) => {
        const custom_name = this.form.controls.customName.value;
        const avatar_old = this.profile()?.avatar ?? null;

        this.profileService.updateProfile({
          firstName: this.form.controls.firstName.value ?? '',
          lastName: this.form.controls.lastName.value ?? '',
          customName: custom_name ? custom_name : null,
          avatar: avatar !== '' ? avatar : avatar_old
        }).pipe(
          finalize(() => {
            this.form.enable();
            this.removeFile();
          })
        ).subscribe();
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  public logout(): void {
    this.profileService.deleteToken();
    this.router.navigate(['auth']);
  }

  public removeFile(): void {
    this.form.controls.avatar.setValue(null);
  }

  public removeAvatar(): void {
    const profile = this.profile();
    if (profile) {
      this.form.disable();

      this.profileService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        customName: profile.customName,
        avatar: null
      }).pipe(
        finalize(() => {
          this.form.enable();
          this.removeFile();
        })
      ).subscribe();
    }
  }
}
