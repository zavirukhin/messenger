import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import { environment } from '@env';
import { Users } from '../../interfaces/users.interface';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private readonly http = inject(HttpClient);

  public getContacts$(): Observable<ProfileResponse[]> {
    return this.http
      .get<ProfileResponse[]>(environment.apiUrl + '/contacts/list')
      .pipe(tap());
  }

  public getFullListUser$(): Observable<Users[]> {
    return this.http
      .get<Users[]>(environment.apiUrl + '/users/list')
      .pipe(tap());
  }
}
