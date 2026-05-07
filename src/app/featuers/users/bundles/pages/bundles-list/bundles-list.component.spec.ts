import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BundlesListComponent } from './bundles-list.component';

describe('BundlesListComponent', () => {
  let component: BundlesListComponent;
  let fixture: ComponentFixture<BundlesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BundlesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BundlesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
