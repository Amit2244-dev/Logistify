import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailAccounts } from './email-accounts';

describe('EmailAccounts', () => {
  let component: EmailAccounts;
  let fixture: ComponentFixture<EmailAccounts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailAccounts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailAccounts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
