import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountSummaryPage } from './account-summary-page';


describe('AccountSummaryPage', () => {
  let component: AccountSummaryPage;
  let fixture: ComponentFixture<AccountSummaryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSummaryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
