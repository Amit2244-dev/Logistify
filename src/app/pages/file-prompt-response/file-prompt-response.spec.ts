import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilePromptResponse } from './file-prompt-response';

describe('FilePromptResponse', () => {
  let component: FilePromptResponse;
  let fixture: ComponentFixture<FilePromptResponse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilePromptResponse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilePromptResponse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
