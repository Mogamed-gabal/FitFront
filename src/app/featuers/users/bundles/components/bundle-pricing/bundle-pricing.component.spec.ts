import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BundlePricingComponent } from './bundle-pricing.component';

describe('BundlePricingComponent', () => {
  let component: BundlePricingComponent;
  let fixture: ComponentFixture<BundlePricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BundlePricingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BundlePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
