import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendMail } from './send-mail';

describe('SendMail', () => {
  let component: SendMail;
  let fixture: ComponentFixture<SendMail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendMail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendMail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
