import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedModelComponent } from './deleted-model.component';

describe('DeletedModelComponent', () => {
  let component: DeletedModelComponent;
  let fixture: ComponentFixture<DeletedModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletedModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
