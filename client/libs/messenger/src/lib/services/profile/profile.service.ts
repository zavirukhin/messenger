import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { map, Observable, switchMap, tap } from 'rxjs';
import { CacheService } from '@social/shared';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import { Profile } from '../../types/profile.type';
import { User } from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly cacheService = inject(CacheService);

  public getProfile(): Observable<ProfileResponse> {
    const profile = this.cacheService.get<ProfileResponse>('profile');

    if (profile !== null) {
      return profile;
    }

    return this.http.get<ProfileResponse>(environment.apiUrl + '/users/profile').pipe(
      map((response: ProfileResponse) => {
        return this.cacheService.set<ProfileResponse>('profile', response);
      }),
      switchMap((profile) => profile)
    );
  }

  public updateProfile(profile: Omit<Profile, 'id'>): Observable<void> {
    return this.http.patch<void>(environment.apiUrl + '/users/update', profile).pipe(
      tap(() => {
        const profileCache = this.cacheService.get<ProfileResponse>('profile');
        this.cacheService.set('profile', {
          ...profileCache,
          ...profile
        });
      })
    );
  }

  public getProfileById(id: string): Observable<User> {
    return this.http.get<User>(environment.apiUrl + `/users/profile/${id}`);
  }

  public blockUserById(id: number): Observable<void> {
    return this.http.post<void>(environment.apiUrl + '/blocked-users/block', {
      userId: id
    });
  }

  public unblockUserById(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + `/blocked-users/unblock/${id}`);
  }

  public addToContact(id: number): Observable<void> {
    return this.http.post<void>(environment.apiUrl + '/contacts/add', {
      contactId: id
    });
  }

  public removeToContact(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + `/contacts/remove/${id}`);
  }

  public deleteToken(): void {
    localStorage.removeItem('token');
    this.cacheService.destroyCache();
  }
}
