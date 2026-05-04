import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietProgressComponent } from './diet-progress.component';

describe('DietProgressComponent', () => {
  let component: DietProgressComponent;
  let fixture: ComponentFixture<DietProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
