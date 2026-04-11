import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDetailsModalComponent } from './doctor-details-modal.component';

describe('DoctorDetailsModalComponent', () => {
  let component: DoctorDetailsModalComponent;
  let fixture: ComponentFixture<DoctorDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
