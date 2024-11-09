import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { Profile } from '../../interfaces/profile.interface';
import { ProfileUpdate } from '../../types/profile-update.type';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(environment.apiUrl + '/users/profile');
  }

  updateProfile(profile: ProfileUpdate): Observable<Profile> {
    return this.http.patch<Profile>(environment.apiUrl + '/users/profile', profile);
  }

  deleteToken(): void {
    localStorage.removeItem('token');
  }
}
