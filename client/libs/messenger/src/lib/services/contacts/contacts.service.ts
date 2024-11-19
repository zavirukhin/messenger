import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ProfileResponse } from '../../interfaces/profile-response.interface';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private readonly http = inject(HttpClient);

  private contacts$ = new BehaviorSubject<ProfileResponse[] | null>(null);

  public getContacts$(): Observable<ProfileResponse[]> {  
    return this.http
      .get<ProfileResponse[]>(environment.apiUrl + '/contacts/list')
      .pipe(
        tap((response) => {
          this.contacts$.next(response);

          return this.contacts$;
        })
      );
  }
}
