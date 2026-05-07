import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleFiltersComponent } from './bundle-filters.component';

describe('BundleFiltersComponent', () => {
  let component: BundleFiltersComponent;
  let fixture: ComponentFixture<BundleFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BundleFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BundleFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
