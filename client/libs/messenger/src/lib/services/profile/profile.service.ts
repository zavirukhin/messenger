import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { BehaviorSubject, map, Observable, switchMap, tap } from 'rxjs';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import { Profile } from '../../types/profile.type';
import { User } from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  private profile: BehaviorSubject<ProfileResponse> | null = null;

  public getProfile(): Observable<ProfileResponse> {
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

  public updateProfile(profile: Omit<Profile, 'id'>): Observable<void> {
    return this.http.patch<void>(environment.apiUrl + '/users/update', profile).pipe(
      tap(() => {
        this.profile?.next({
          ...this.profile?.value,
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

  public addToContact(id: number): Observable<void> {
    return this.http.post<void>(environment.apiUrl + '/contacts/add', {
      contactId: id
    });
  }

  public deleteToken(): void {
    localStorage.removeItem('token');
  }
}
