import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBundleModalComponent } from './update-bundle-modal.component';

describe('UpdateBundleModalComponent', () => {
  let component: UpdateBundleModalComponent;
  let fixture: ComponentFixture<UpdateBundleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBundleModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBundleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
