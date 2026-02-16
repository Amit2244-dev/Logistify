import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiInputModel } from './ai-input-model';

describe('AiInputModel', () => {
  let component: AiInputModel;
  let fixture: ComponentFixture<AiInputModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiInputModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiInputModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
