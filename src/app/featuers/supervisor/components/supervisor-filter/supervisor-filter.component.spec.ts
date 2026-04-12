import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorFilterComponent } from './supervisor-filter.component';

describe('SupervisorFilterComponent', () => {
  let component: SupervisorFilterComponent;
  let fixture: ComponentFixture<SupervisorFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupervisorFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
