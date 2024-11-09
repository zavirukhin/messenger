import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { Observable, of } from 'rxjs';
import { Profile } from '../../interfaces/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);

  currentUser: Profile | null = null;

  getProfile(): Observable<Profile> {
    if (this.currentUser === null) {
      return this.http.get<Profile>(environment.apiUrl + '/users/profile');
    }
    return of(this.currentUser);
  }
}
