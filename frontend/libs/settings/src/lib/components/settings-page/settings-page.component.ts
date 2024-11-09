import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TUI_VALIDATION_ERRORS, TuiAvatar, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiButton, TuiError, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { ProfileService, Profile } from '@social/messenger';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
    }
  ]
})
export class SettingsPageComponent {
  public profile = signal<Profile>({
    id: 1,
    phone: '123',
    first_name: 'First name',
    last_name: 'Last name',
    avatar_base64: '',
    custom_name: 'customUrl',
    last_activity: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  });

  public readonly form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    customName: new FormControl('', [Validators.required, Validators.maxLength(50)])
  });

  private readonly profileService = inject(ProfileService);

  private readonly router = inject(Router);

  constructor() {
    this.profileService.getProfile().subscribe(profile => {
      this.profile.set(profile);

      this.form.setValue({
        firstName: profile.first_name,
        lastName: profile.last_name,
        customName: profile.custom_name
      });
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
