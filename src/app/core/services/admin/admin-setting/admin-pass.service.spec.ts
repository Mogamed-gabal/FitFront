import { TestBed } from '@angular/core/testing';

import { AdminPassService } from './admin-pass.service';

describe('AdminPassService', () => {
  let service: AdminPassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminPassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
