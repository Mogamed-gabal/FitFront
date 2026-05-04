import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsTableComponent } from './chats-table.component';

describe('ChatsTableComponent', () => {
  let component: ChatsTableComponent;
  let fixture: ComponentFixture<ChatsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
