import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListPages } from './file-list-pages';

describe('FileListPages', () => {
  let component: FileListPages;
  let fixture: ComponentFixture<FileListPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileListPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileListPages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
