import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NextAttempt } from '../../interfaces/next-attempt.interface';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private http = inject(HttpClient);

  public sendSms(phone: string): Observable<NextAttempt> {
    return this.http.post<NextAttempt>(environment.apiUrl + '/auth/send-sms', { phone });
  }
}
