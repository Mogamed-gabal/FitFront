import { TestBed } from '@angular/core/testing';

import { DeletedUsersService } from './deleted-users.service';

describe('DeletedUsersService', () => {
  let service: DeletedUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeletedUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
