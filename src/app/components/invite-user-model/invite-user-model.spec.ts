import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteUserModel } from './invite-user-model';

describe('InviteUserModel', () => {
  let component: InviteUserModel;
  let fixture: ComponentFixture<InviteUserModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteUserModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteUserModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
