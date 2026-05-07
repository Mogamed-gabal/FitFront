import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBundleModalComponent } from './create-bundle-modal.component';

describe('CreateBundleModalComponent', () => {
  let component: CreateBundleModalComponent;
  let fixture: ComponentFixture<CreateBundleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBundleModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBundleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
