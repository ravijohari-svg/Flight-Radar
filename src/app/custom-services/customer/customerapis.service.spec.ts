import { TestBed } from '@angular/core/testing';

import { CustomerapisService } from './customerapis.service';

describe('CustomerapisService', () => {
  let service: CustomerapisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerapisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
