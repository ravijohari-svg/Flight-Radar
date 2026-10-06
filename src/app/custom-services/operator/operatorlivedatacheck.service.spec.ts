import { TestBed } from '@angular/core/testing';

import { OperatorlivedatacheckService } from './operatorlivedatacheck.service';

describe('OperatorlivedatacheckService', () => {
  let service: OperatorlivedatacheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperatorlivedatacheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
