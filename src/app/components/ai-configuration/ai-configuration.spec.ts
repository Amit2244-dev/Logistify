import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIConfiguration } from './ai-configuration';

describe('AIConfiguration', () => {
  let component: AIConfiguration;
  let fixture: ComponentFixture<AIConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIConfiguration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AIConfiguration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
