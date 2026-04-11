import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawlRequestsComponent } from './withdrawl-requests.component';

describe('WithdrawlRequestsComponent', () => {
  let component: WithdrawlRequestsComponent;
  let fixture: ComponentFixture<WithdrawlRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawlRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithdrawlRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
