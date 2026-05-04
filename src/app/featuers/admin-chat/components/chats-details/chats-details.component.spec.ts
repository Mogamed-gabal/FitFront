import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsDetailsComponent } from './chats-details.component';

describe('ChatsDetailsComponent', () => {
  let component: ChatsDetailsComponent;
  let fixture: ComponentFixture<ChatsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
