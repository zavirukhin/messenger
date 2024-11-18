import { CommonModule, formatDate } from '@angular/common';
import { TuiAvatar, TuiChip, TuiSkeleton } from '@taiga-ui/kit';
import { TuiButton, TuiFallbackSrcPipe, TuiTitle } from '@taiga-ui/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  combineLatest,
  EMPTY,
  finalize,
  map,
  Observable,
  switchMap,
  take
} from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { langReady, RequestError } from '@social/shared';
import { User } from '../../interfaces/user.interface';
import { ProfileService } from '../../services/profile/profile.service';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'lib-user-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoDirective,
    TuiAvatar,
    TuiSkeleton,
    TuiTitle,
    TuiChip,
    TuiButton,
    TuiFallbackSrcPipe
  ],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPageComponent {
  public user = signal<User | null>(null);

  public isLoading = signal<boolean>(true);

  public isDisabled = signal<boolean>(false);

  private profileService = inject(ProfileService);

  private activatedRoute = inject(ActivatedRoute);

  private router = inject(Router);

  constructor() {
    this.activatedRoute.params.pipe(
      take(1),
      map(params => params['id']),
      switchMap((id) => this.getUserData(id))
    ).subscribe((user) => {
      this.user.set(user);
      this.isLoading.set(false);
    });
  }

  private getUserData(id: string): Observable<User> {
    return combineLatest([
      this.profileService.getProfileById(id),
      langReady('messenger')
    ]).pipe(
      take(1),
      map(([user]) => user),
      catchError((error: RequestError) => {
        if (error.errorCode === 'USER_NOT_FOUND') {
          this.router.navigate(['/']);
        }

        return EMPTY;
      })
    )
  }

  public getLastActivity(date: Date): string {
    const SECONDS_IN_DAY = 86400;
    const time = new Date(date);

    if ((new Date().getTime() - time.getTime()) < SECONDS_IN_DAY * 1000) {
      return formatDate(time, 'HH:MM', 'ru-RU');
    }

    return formatDate(time, 'dd:MM:yyyy', 'ru-RU');
  }

  public blockHandler(): void {
    const user = this.user();

    if (!user) {
      return;
    }

    this.isDisabled.set(true);

    if (user.isBlockedByMe) {
      this.profileService.unblockUserById(user.id).pipe(
        finalize(() => this.isDisabled.set(false))
      ).subscribe(() => {
        this.user.set({
          ...user,
          isBlockedByMe: false
        })
      });
    }
    else {
      this.profileService.blockUserById(user.id).pipe(
        finalize(() => this.isDisabled.set(false))
      ).subscribe(() => {
        this.user.set({
          ...user,
          isBlockedByMe: true
        });
      });
    }
  }

  public contactHandler(): void {
    const user = this.user();

    if (!user) {
      return;
    }

    this.isDisabled.set(true);

    if (user.isContactedByMe) {
      this.profileService.removeToContact(user.id).pipe(
        finalize(() => this.isDisabled.set(false))
      ).subscribe(() => {
        this.user.set({
          ...user,
          isContactedByMe: false
        });
      });
    }
    else {
      this.profileService.addToContact(user.id).pipe(
        finalize(() => this.isDisabled.set(false))
      ).subscribe(() => {
        this.user.set({
          ...user,
          isContactedByMe: true
        });
      })
    }
  }
}
