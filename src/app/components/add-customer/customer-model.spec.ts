import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerModel } from './customer-model';

describe('CustomerModel', () => {
  let component: CustomerModel;
  let fixture: ComponentFixture<CustomerModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
