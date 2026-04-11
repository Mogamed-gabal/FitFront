import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedFilterComponent } from './blocked-filter.component';

describe('BlockedFilterComponent', () => {
  let component: BlockedFilterComponent;
  let fixture: ComponentFixture<BlockedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockedFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
