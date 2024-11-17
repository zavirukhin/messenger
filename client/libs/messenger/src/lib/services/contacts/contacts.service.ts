import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private readonly http = inject(HttpClient);

  private contacts: BehaviorSubject<ProfileResponse[]> | null = null;
  
    public getContacts(): Observable<ProfileResponse[]> {
      if (this.contacts) {
        return this.contacts;
      }
    return this.http.get<ProfileResponse[]>(environment.apiUrl + '/contacts/list').pipe(
      map((response) => {
        this.contacts = new BehaviorSubject<ProfileResponse[]>(response);
        return this.contacts;
      }),
      switchMap((profileRequests) =>  profileRequests)
    );
  }
}
