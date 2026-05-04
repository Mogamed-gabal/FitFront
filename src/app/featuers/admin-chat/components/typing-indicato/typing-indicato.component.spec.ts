import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypingIndicatoComponent } from './typing-indicato.component';

describe('TypingIndicatoComponent', () => {
  let component: TypingIndicatoComponent;
  let fixture: ComponentFixture<TypingIndicatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypingIndicatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypingIndicatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
