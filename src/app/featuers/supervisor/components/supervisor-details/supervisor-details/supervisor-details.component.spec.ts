import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorDetailsComponent } from './supervisor-details.component';

describe('SupervisorDetailsComponent', () => {
  let component: SupervisorDetailsComponent;
  let fixture: ComponentFixture<SupervisorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupervisorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
