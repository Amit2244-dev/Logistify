import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyEmails } from './reply-emails';

describe('ReplyEmails', () => {
  let component: ReplyEmails;
  let fixture: ComponentFixture<ReplyEmails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyEmails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplyEmails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
