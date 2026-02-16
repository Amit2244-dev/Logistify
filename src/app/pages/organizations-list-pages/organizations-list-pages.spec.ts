import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsListPages } from './organizations-list-pages';

describe('OrganizationsListPages', () => {
  let component: OrganizationsListPages;
  let fixture: ComponentFixture<OrganizationsListPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationsListPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationsListPages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
