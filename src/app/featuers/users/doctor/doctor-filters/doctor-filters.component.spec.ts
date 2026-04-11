import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFiltersComponent } from './doctor-filters.component';

describe('DoctorFiltersComponent', () => {
  let component: DoctorFiltersComponent;
  let fixture: ComponentFixture<DoctorFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
