import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { BehaviorSubject, finalize, map, Observable, switchMap } from 'rxjs';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import { Profile } from '../../types/profile.type';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  public profile: BehaviorSubject<ProfileResponse> | null = null;

  getProfile(): Observable<ProfileResponse> {
    if (this.profile) {
      return this.profile;
    }
    return this.http.get<ProfileResponse>(environment.apiUrl + '/users/profile').pipe(
      map((response: ProfileResponse) => {
        this.profile = new BehaviorSubject<ProfileResponse>(response);
        return this.profile;
      }),
      switchMap((profile) => profile)
    );
  }

  updateProfile(profile: Omit<Profile, 'id'>): Observable<void> {
    return this.http.patch<void>(environment.apiUrl + '/users/update', profile).pipe(
      finalize(() => {
        this.profile?.next({
          ...this.profile?.value,
          ...profile
        });
      })
    );
  }

  deleteToken(): void {
    localStorage.removeItem('token');
  }
}
