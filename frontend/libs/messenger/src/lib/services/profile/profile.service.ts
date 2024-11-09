import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import { Profile } from '../../types/profile-update.type';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(environment.apiUrl + '/users/profile');
  }

  updateProfile(profile: Partial<Profile>): Observable<void> {
    return this.http.patch<void>(environment.apiUrl + '/users/profile', profile);
  }

  deleteToken(): void {
    localStorage.removeItem('token');
  }
}
