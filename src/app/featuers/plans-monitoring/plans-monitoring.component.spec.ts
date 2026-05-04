import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansMonitoringComponent } from './plans-monitoring.component';

describe('PlansMonitoringComponent', () => {
  let component: PlansMonitoringComponent;
  let fixture: ComponentFixture<PlansMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
