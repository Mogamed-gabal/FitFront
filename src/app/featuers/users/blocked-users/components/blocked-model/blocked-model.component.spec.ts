import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedModelComponent } from './blocked-model.component';

describe('BlockedModelComponent', () => {
  let component: BlockedModelComponent;
  let fixture: ComponentFixture<BlockedModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockedModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockedModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
