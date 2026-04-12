import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatSupervisorModalComponent } from './creat-supervisor-modal.component';

describe('CreatSupervisorModalComponent', () => {
  let component: CreatSupervisorModalComponent;
  let fixture: ComponentFixture<CreatSupervisorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatSupervisorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatSupervisorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
