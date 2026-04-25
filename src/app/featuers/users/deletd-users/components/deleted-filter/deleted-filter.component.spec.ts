import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedFilterComponent } from './deleted-filter.component';

describe('DeletedFilterComponent', () => {
  let component: DeletedFilterComponent;
  let fixture: ComponentFixture<DeletedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
