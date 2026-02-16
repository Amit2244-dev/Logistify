import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFileModel } from './view-file-model';

describe('ViewFileModel', () => {
  let component: ViewFileModel;
  let fixture: ComponentFixture<ViewFileModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFileModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewFileModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
