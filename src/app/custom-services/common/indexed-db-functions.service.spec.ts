import { TestBed } from '@angular/core/testing';

import { IndexedDBFunctionsService } from './indexed-db-functions.service';

describe('IndexedDBFunctionsService', () => {
  let service: IndexedDBFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexedDBFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
