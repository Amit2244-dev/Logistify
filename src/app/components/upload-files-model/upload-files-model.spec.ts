import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFilesModel } from './upload-files-model';

describe('UploadFilesModel', () => {
  let component: UploadFilesModel;
  let fixture: ComponentFixture<UploadFilesModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadFilesModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadFilesModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
