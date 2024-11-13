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
  public readonly form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    customName: new FormControl('', [Validators.maxLength(50)]),
    avatarBase64: new FormControl('')
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
      this.form.setValue({
        firstName: profile.firstName,
        lastName: profile.lastName,
        customName: profile.customName,
        avatarBase64: profile.avatarBase64
      });
      this.isLoading.set(false);
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.form.disable();
      this.profileService.updateProfile({
        firstName: this.form.controls.firstName.value ?? '',
        lastName: this.form.controls.lastName.value ?? '',
        customName: this.form.controls.customName.value,
        avatarBase64: this.form.controls.avatarBase64.value
      }).subscribe();
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
      //this.form.get('avatar_base64')?.setValue(event.target.result);
    }
  }
}
