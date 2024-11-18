import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CanActivate, GuardResult, MaybeAsync, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  private readonly router = inject(Router);

  private readonly httpBackend = inject(HttpBackend);

  private readonly http = new HttpClient(this.httpBackend);

  canActivate(): MaybeAsync<GuardResult> {
    const token = localStorage.getItem('token');

    if (token === null) {
      return true;
    }

    return this.http.get(environment.apiUrl + '/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      switchMap(() => this.router.navigate(['/'])),
      catchError(() => of(true))
    );
  }
}