import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, map, Observable, switchMap, take } from 'rxjs';
import { fileToBase64$ } from '../../utils/file-to-base64';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import {
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
import { ChatEvent } from '../../interfaces/chat-event.interface';
import { ChatSettingsService } from '../../services/chat-settings/chat-settings.service';

@Component({
  selector: 'lib-chat-settings-page',
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
    TuiFallbackSrcPipe,
    RouterLink
  ],
  templateUrl: './chat-settings-page.component.html',
  styleUrl: './chat-settings-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatSettingsPageComponent implements OnInit {
  public readonly form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    avatar: new FormControl<File | null>(null)
  });

  public chat$: Observable<ChatEvent> | null = null;
  public chat: ChatEvent | null = null;
  public id: string | null = null;
  private updateChat = (): void => {
    this.router.navigate(['/chat', this.id]);
    this.form.enable();
    this.removeFile();
  };

  public readonly file$ = this.form.controls.avatar.valueChanges;

  private activatedRoute = inject(ActivatedRoute);

  private readonly router = inject(Router);

  constructor(private readonly chatService: ChatSettingsService) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        map((params) => params['id']),
        switchMap((id) => {
          this.id = id;

          return this.chatService.getChat$(id);
        }),
        take(1)
      )
      .subscribe((chat) => {
        this.chat = chat;
        this.form.setValue({
          name: chat?.name ?? '',
          avatar: null
        });
      });
  }

  public onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();

      return;
    }
    this.form.disable();

    fileToBase64$(this.form.controls.avatar.value)
      .pipe(take(1))
      .subscribe((avatar) => {
        const avatarOld = this.chat?.avatar ?? null;

        if (this.chat?.id) {
          this.chatService
            .updateChat$({
              name: this.form.controls.name.value ?? '',
              chatId: this.chat?.id,
              avatar: avatar !== '' ? avatar : avatarOld
            })
            .pipe(finalize(this.updateChat))
            .pipe(take(1))
            .subscribe();
        }
      });
  }

  public removeFile(): void {
    this.form.controls.avatar.setValue(null);
  }

  public removeAvatar(): void {
    if (this.chat) {
      this.form.disable();

      this.chatService
        .updateChat$({
          chatId: this.chat.id,
          name: this.chat.name,
          avatar: null
        })
        .pipe(finalize(this.updateChat), take(1))
        .subscribe();
    }
  }
}
