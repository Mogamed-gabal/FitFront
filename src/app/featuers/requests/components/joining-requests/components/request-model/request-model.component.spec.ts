import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestModelComponent } from './request-model.component';

describe('RequestModelComponent', () => {
  let component: RequestModelComponent;
  let fixture: ComponentFixture<RequestModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
