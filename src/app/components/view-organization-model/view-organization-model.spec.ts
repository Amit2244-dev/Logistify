import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrganizationModel } from './view-organization-model';

describe('ViewOrganizationModel', () => {
  let component: ViewOrganizationModel;
  let fixture: ComponentFixture<ViewOrganizationModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOrganizationModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrganizationModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
