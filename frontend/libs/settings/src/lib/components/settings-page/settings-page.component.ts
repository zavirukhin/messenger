import { CommonModule } from '@angular/common';
import { ProfileService, Profile } from '@social/messenger';
import { Router } from '@angular/router';
import { combineLatest, take } from 'rxjs';
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
  TuiButton,
  TuiError,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import { langReady } from '@social/shared';
import { loader } from '../../transloco-loader';

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
    TuiFieldErrorPipe
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
      scope: 'settings',
      loader
    })
  ]
})
export class SettingsPageComponent {
  public profile = signal<Profile>({
    first_name: 'First name',
    last_name: 'Last name',
    custom_name: 'example',
    avatar_base64: ''
  });

  public isLoading = signal<boolean>(true);

  public readonly form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    customName: new FormControl('', [Validators.maxLength(50)])
  });

  private readonly profileService = inject(ProfileService);

  private readonly router = inject(Router);

  constructor() {
    combineLatest(
      [this.profileService.getProfile(), langReady('settings')]
    )
    .pipe(take(1))
    .subscribe(([profile]) => {
      this.profile.set(profile);

      this.form.setValue({
        firstName: profile.first_name,
        lastName: profile.last_name,
        customName: profile.custom_name
      });
      this.isLoading.set(false);
    });
  }

  public getAvatarByName() {
    return this.profile().first_name[0] + this.profile().last_name[0];
  }

  public onSubmit() {
    if (this.form.valid) {
      const profile = {
        last_name: this.form.controls.lastName.value ?? '',
        first_name: this.form.controls.firstName.value ?? '',
        custom_name: this.form.controls.customName.value ?? ''
      }

      this.profileService.updateProfile(profile).subscribe();
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  public logout() {
    this.profileService.deleteToken();
    this.router.navigate(['auth']);
  }
}
