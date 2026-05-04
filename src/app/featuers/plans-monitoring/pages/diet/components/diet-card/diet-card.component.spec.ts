import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietCardComponent } from './diet-card.component';

describe('DietCardComponent', () => {
  let component: DietCardComponent;
  let fixture: ComponentFixture<DietCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
