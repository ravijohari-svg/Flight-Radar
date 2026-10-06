import { TestBed } from '@angular/core/testing';

import { CesiumFunctionService } from './cesium-function.service';

describe('CesiumFunctionService', () => {
  let service: CesiumFunctionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CesiumFunctionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
