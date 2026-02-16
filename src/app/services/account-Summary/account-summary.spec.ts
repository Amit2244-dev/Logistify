import { TestBed } from '@angular/core/testing';

import { AccountSummary } from './account-summary';

describe('AccountSummary', () => {
  let service: AccountSummary;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountSummary);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
