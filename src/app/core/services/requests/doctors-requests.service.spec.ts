import { TestBed } from '@angular/core/testing';

import { DoctorsRequestsService } from './doctors-requests.service';

describe('DoctorsRequestsService', () => {
  let service: DoctorsRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DoctorsRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
