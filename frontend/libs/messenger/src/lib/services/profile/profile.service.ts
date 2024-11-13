import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { Observable, of } from 'rxjs';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import { Profile } from '../../types/profile.type';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profile: ProfileResponse | null = null;

  private readonly http = inject(HttpClient);

  getProfile(): Observable<ProfileResponse> {
    if (this.profile) {
      return of(this.profile);
    }
    return this.http.get<ProfileResponse>(environment.apiUrl + '/users/profile');
  }

  updateProfile(profile: Omit<Profile, 'id'>): Observable<void> {
    return this.http.patch<void>(environment.apiUrl + '/users/update', profile).pipe();
  }

  deleteToken(): void {
    localStorage.removeItem('token');
  }
}
