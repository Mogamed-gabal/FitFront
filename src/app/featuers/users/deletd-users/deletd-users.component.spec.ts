import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletdUsersComponent } from './deletd-users.component';

describe('DeletdUsersComponent', () => {
  let component: DeletdUsersComponent;
  let fixture: ComponentFixture<DeletdUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletdUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletdUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
