import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedTableComponent } from './deleted-table.component';

describe('DeletedTableComponent', () => {
  let component: DeletedTableComponent;
  let fixture: ComponentFixture<DeletedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
