import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  combineLatest,
  finalize,
  map,
  Observable,
  switchMap,
  take
} from 'rxjs';
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
import { UpdateChatPayload } from '../../types/update-chat-payload.type';
import { Members } from '../../interfaces/members.interface';
import { ProfileService } from '../../services/profile/profile.service';

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
  public listMembers: Members[] | null = null;
  public id: number | null = null;

  public isOwner = false;

  private updateChat = (data: ChatEvent | UpdateChatPayload): void => {
    this.chatService
      .updateChat$(data)
      .pipe(
        finalize(() => {
          this.router.navigate(['/chat', this.id]);
          this.form.enable();
          this.removeFile();
        })
      )
      .subscribe(),
      take(1);
  };

  public readonly file$ = this.form.controls.avatar.valueChanges;

  public idUser: number | null = null;

  private readonly profileService = inject(ProfileService);

  private activatedRoute = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private cdRef = inject(ChangeDetectorRef);

  constructor(private readonly chatService: ChatSettingsService) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        map((params) => params['id']),
        switchMap((id) => {
          this.id = id;

          return combineLatest({
            chat: this.chatService.getChat$(id),
            listMembers: this.chatService.getChatMembers$(id),
            profile: this.profileService.getProfile()
          });
        }),
        take(1)
      )
      .subscribe(({ chat, listMembers, profile }) => {
        this.chat = chat;
        this.idUser = profile.id;
        this.isOwner = (listMembers.find((member)=>member.chatRole === 'owner'))?.user.id === profile.id;
        this.listMembers = listMembers;
        this.form.setValue({
          name: chat?.name ?? '',
          avatar: null
        });
      });

    this.form.controls.avatar.valueChanges.subscribe((file) => {
      fileToBase64$(file)
        .pipe(take(1))
        .subscribe((base64) => {
          if (this.chat && base64) {
            this.chat.avatar = base64;
            this.cdRef.markForCheck();
          }
        });
    });
  }

  public onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();

      return;
    }
    this.form.disable();

    fileToBase64$(this.form.controls.avatar.value).subscribe((avatar) => {
      const avatarOld = this.chat?.avatar ?? null;

      if (this.chat?.id) {
        this.updateChat({
          name: this.form.controls.name.value ?? '',
          chatId: this.chat?.id,
          avatar: avatar !== '' ? avatar : avatarOld
        });
      }
    }),
      take(1);
  }

  public removeFile(): void {
    this.form.controls.avatar.setValue(null);
  }

  public removeAvatar(): void {
    if (this.chat) {
      this.form.disable();
      this.updateChat({
        chatId: this.chat.id,
        name: this.chat.name,
        avatar: null
      });
    }
  }

  public removeChatMember(id: number) {
    if (this.id && id) {
      this.chatService
        .removeChatMember$({
          memberIdToRemove: +id,
          chatId: +this.id
        })
        .subscribe((req) => {
          console.log(req);
          this.router.navigate(['/chat', this.id]);
        }),
        take(1);
    }
  }
}
