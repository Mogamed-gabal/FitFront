import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleStatusDialogComponent } from './bundle-status-dialog.component';

describe('BundleStatusDialogComponent', () => {
  let component: BundleStatusDialogComponent;
  let fixture: ComponentFixture<BundleStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BundleStatusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BundleStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
