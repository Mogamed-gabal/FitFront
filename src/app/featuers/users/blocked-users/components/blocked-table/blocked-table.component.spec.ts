import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedTableComponent } from './blocked-table.component';

describe('BlockedTableComponent', () => {
  let component: BlockedTableComponent;
  let fixture: ComponentFixture<BlockedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockedTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
