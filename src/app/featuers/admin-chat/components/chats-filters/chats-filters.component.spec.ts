import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsFiltersComponent } from './chats-filters.component';

describe('ChatsFiltersComponent', () => {
  let component: ChatsFiltersComponent;
  let fixture: ComponentFixture<ChatsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatsFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
