import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSummary } from './create-summary-model';

describe('CreateSummary', () => {
  let component: CreateSummary;
  let fixture: ComponentFixture<CreateSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
