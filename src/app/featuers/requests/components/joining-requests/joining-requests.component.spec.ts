import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoiningRequestsComponent } from './joining-requests.component';

describe('JoiningRequestsComponent', () => {
  let component: JoiningRequestsComponent;
  let fixture: ComponentFixture<JoiningRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoiningRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoiningRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
