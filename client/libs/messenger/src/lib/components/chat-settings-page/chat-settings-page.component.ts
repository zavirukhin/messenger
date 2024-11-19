/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChangeDetectionStrategy, Component, inject, signal, Signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, EMPTY, filter, finalize, map, Observable, of, switchMap, take } from 'rxjs';
import { fileToBase64$ } from '../../utils/file-to-base64';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { langReady, RequestError } from '@social/shared';
import { Profile } from '../../types/profile.type';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile/profile.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiAvatar, TuiFieldErrorPipe, TuiFiles, TuiSkeleton } from '@taiga-ui/kit';
import { TuiButton, TuiError, TuiFallbackSrcPipe, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { User } from '../../interfaces/user.interface';
import { ChatEvent } from '../../interfaces/chat-event.interface';
import { ChatSettingsService } from '../../services/chat-settings/chat-settings.service';

@Component({
  selector: 'lib-chat-settings-page',
  standalone: true,
  imports: [CommonModule,
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

public readonly file$ = this.form.controls.avatar.valueChanges;

  private activatedRoute = inject(ActivatedRoute);

  private readonly router = inject(Router);

  constructor(private readonly chatService: ChatSettingsService) {
    
    this.activatedRoute.params.pipe(
      take(1),
      map(params => params['id']),
      switchMap((id) => {
      this.loadChat(id);
      this.id = id;

      return this.chatService.getChat$(id);})
    ).subscribe((chat) => {
      this.chat = chat;
      this.form.setValue({
        name: chat?.name ?? '',
        avatar: null
      });
    });
  }

  ngOnInit(): void {
    if (this.id){
    this.loadChat(this.id);

    }
  }

  private loadChat(id:string): void {
    this.chat$ = this.chatService.getChat$(id);
  }
 
  public onSubmit(): void {
    if (this.form.valid) {
      this.form.disable();

      fileToBase64$(this.form.controls.avatar.value).subscribe((avatar) => {
        const avatar_old = this.chat?.avatar ?? null;

if (this.chat?.id){
        this.chatService.updateChat({
          name: this.form.controls.name.value ?? '',
          chatId: this.chat?.id,
          avatar: avatar !== '' ? avatar : avatar_old
        }).pipe(
          finalize(() => {
            this.router.navigate(['/chat',this.id]);
            this.form.enable();
            this.removeFile();
          })
        ).subscribe();}
      });
    }
    else {
      this.form.markAllAsTouched();
    }
  }
  
  public removeFile(): void {
    this.form.controls.avatar.setValue(null);
  }

  public removeAvatar(): void {
    const chat = this.chat;

    if (chat) {
      this.form.disable();

      this.chatService.updateChat({
        chatId: chat.id,
       name: chat.name,
        avatar: null
      }).pipe(
        finalize(() => {
          this.router.navigate(['/chat',this.id]);
          this.form.enable();
          this.removeFile();
        })
      ).subscribe();
    }
  }
}
