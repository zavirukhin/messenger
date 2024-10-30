import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthorizationService } from './authorization.service';
import { provideHttpClient } from '@angular/common/http';

describe('AuthorizationService', () => {
  let service: AuthorizationService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthorizationService);
  });

  it('Если сервис создан, то он должен быть определен', () => {
    expect(service).toBeTruthy();
  });

  it('Если отправляем запрос на получение кода, то ')
});