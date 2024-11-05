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
    /*
      maybe use interceptor and get the base url from environment, but transloco
      request use httpClient (maybe) and this request handle by interceptors
      APP_INIT TOKEN
    */
    return this.http.post<NextAttempt>(environment.apiUrl + '/auth/send-sms', { phone });
  }
}
