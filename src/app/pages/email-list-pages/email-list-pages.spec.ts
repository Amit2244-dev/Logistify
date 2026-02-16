import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailListPages } from './email-list-pages';

describe('EmailListPages', () => {
  let component: EmailListPages;
  let fixture: ComponentFixture<EmailListPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailListPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailListPages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
