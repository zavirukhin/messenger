import { TestBed } from '@angular/core/testing';

import { MultilingualService } from './multilingual.service';

describe('MultilingualService', () => {
  let service: MultilingualService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultilingualService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
