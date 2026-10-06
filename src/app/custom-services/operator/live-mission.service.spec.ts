import { TestBed } from '@angular/core/testing';

import { LiveMissionService } from './live-mission.service';

describe('LiveMissionService', () => {
  let service: LiveMissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveMissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
