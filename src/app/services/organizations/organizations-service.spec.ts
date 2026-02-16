import { TestBed } from '@angular/core/testing';
import { OrganizationsServices } from './organizations-services';

describe('Organizations', () => {
  let service: OrganizationsServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationsServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
