import { CommonModule } from '@angular/common';
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
  selector: 'lib-messenger',
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

  public awaitRequest = signal<boolean>(false);

  private profileService = inject(ProfileService);

  private activatedRoute = inject(ActivatedRoute);

  private router = inject(Router);

  constructor() {
    this.activatedRoute.params.pipe(
      map(params => params['id']),
      switchMap(this.onLoadHandler.bind(this))
    ).subscribe((user) => {
      this.user.set(user);
      this.isLoading.set(false);
    });
  }

  private onLoadHandler(id: string): Observable<User> {
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

  public getLastActivity(time: Date): string {
    const SECONDS_IN_DAY = 86400;
    const userTime = new Date(time);

    const seconds = new Date().getSeconds() - userTime.getTime();
    if (seconds < SECONDS_IN_DAY) {
      return `${userTime.getHours()}:${userTime.getMinutes()}`;
    }
    return `${userTime.getDay()}:${userTime.getMonth()}:${userTime.getFullYear()}`;
  }

  public blockUser(): void {
    const userId = this.user()?.id;

    if (userId) {
      this.awaitRequest.set(true);
      this.profileService.blockUserById(userId).pipe(
        finalize(() => this.awaitRequest.set(false))
      ).subscribe();
    }
  }

  public addToContact(): void {
    const userId = this.user()?.id;
    this.awaitRequest.set(true);

    if (userId) {
      this.profileService.addToContact(userId).pipe(
        finalize(() => this.awaitRequest.set(false))
      ).subscribe();
    }
  }
}
