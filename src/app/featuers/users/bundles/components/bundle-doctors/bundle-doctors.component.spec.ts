import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleDoctorsComponent } from './bundle-doctors.component';

describe('BundleDoctorsComponent', () => {
  let component: BundleDoctorsComponent;
  let fixture: ComponentFixture<BundleDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BundleDoctorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BundleDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
