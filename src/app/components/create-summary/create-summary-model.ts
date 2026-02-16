import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UserStoreService } from '../../core/userStore';
import { UserServices } from '../../services/user/user-services';
import { EmailServices } from '../../services/email/email-services';
import { EmailQueryParams, UserAccountOption } from '../../models/email.model';
import { CreateAccountSummaryPayload } from '../../models/account-Summary.model';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTimepickerToggle } from '@angular/material/timepicker';
import { UserResponse } from '../../models/user.model';
import { MatSelectInfiniteScrollDirective } from '../../shared/mat-select-infinite-scroll';

@Component({
  selector: 'app-create-summary-model',
  standalone: true,
  imports: [
    CommonModule,
    MatTimepickerModule,
    MatTimepickerToggle,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectInfiniteScrollDirective
  ],
  templateUrl: './create-summary-model.html',
  styleUrls: ['./create-summary-model.scss']
})
export class CreateSummary implements OnInit {
  @Input() initialData: Partial<CreateAccountSummaryPayload> = {};
  @Input() isLoading = false;
  @Input() mode: 'create' | 'view' = 'create';
  @Output() save = new EventEmitter<CreateAccountSummaryPayload>();
  @Output() close = new EventEmitter<void>();

  createSummary!: FormGroup;
  dateRange!: FormGroup;

  filteredEmailAccounts: UserAccountOption[] = [];
  filteredUserAccounts: UserAccountOption[] = [];
  loading: boolean = false;

  dateOptionControl = new FormControl('today');
  daysControl = new FormControl();
  customDateControl = new FormControl();
  last7Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  filters: EmailQueryParams = {
    page: 1,
    limit: 10,
    search: '',
    sortOrder: 'asc',
    sortBy: 'userAccount',
    startDate: '',
    endDate: '',
    searchKeys: {},
    emailAccount: '',
    emailStatus: ''
  };

  constructor(
    private fb: FormBuilder,
    private userService: UserServices,
    private emailService: EmailServices
  ) { }

  ngOnInit() {
    this.dateRange = this.fb.group({
      start: [null],
      end: [null]
    });

    this.createSummary = this.fb.group({
      aiSummaryResponse: [this.initialData.aiSummaryResponse || ''],
      userAccount: [null, Validators.required],
      emailAccount: [this.initialData.emailAccount || null, Validators.required],
      startTime: ['00:00'],
      endTime: ['23:59']
    }, { validators: this.timeRangeValidator });
    this.loadMoreUsers(true);
  }

  timeRangeValidator(group: FormGroup) {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;

    if (!start || !end) return null;

    let startDate: Date;
    let endDate: Date;

    if (start instanceof Date && end instanceof Date) {
      startDate = start;
      endDate = end;
    } else {
      startDate = new Date(`1970-01-01T${start}`);
      endDate = new Date(`1970-01-01T${end}`);
    }

    return endDate.getTime() > startDate.getTime() ? null : { timeRangeInvalid: true };
  }

  onClose() {
    this.close.emit();
  }

  onUserAccountSelect(selected: UserAccountOption) {
    this.loading = true;
    this.filters.searchKeys.userId = selected.userId;
    this.filters.page = 1;
    this.emailService.getAllEmailAccounts(this.filters).subscribe(res => {
      this.loading = false;
      this.filteredEmailAccounts = res.data.map(item => ({
        value: item.email,
        viewValue: item.email,
        userId: item._id
      }));
    });
  }

  getDateLabel(): string {
    const value = this.dateOptionControl.value;
    if (!value) return '';
    const map: Record<string, string> = {
      today: 'Today',
      yesterday: 'Yesterday',
      last7days: 'Custom Days',
      lastWeek: 'Weekly',
      thisMonth: 'Monthly',
      thisQuarter: 'Quarterly',
      thisYear: 'Yearly',
      custom: 'Custom Date'
    };
    return map[value] || '';
  }

  onSubmit() {
    if (this.mode === 'view') return;
    if (this.createSummary.invalid) {
      this.createSummary.markAllAsTouched();
      return;
    }

    const userAccount: UserAccountOption | null = this.createSummary.get('userAccount')?.value || null;
    const today = new Date();

    let startDate: Date = new Date(today);
    let endDate: Date = new Date(today);

    const setRange = (
      d: Date,
      sH = 0, sM = 0, sS = 0, sMs = 0,
      eH = 23, eM = 59, eS = 59, eMs = 999
    ) => {
      const s = new Date(d); s.setHours(sH, sM, sS, sMs);
      const e = new Date(d); e.setHours(eH, eM, eS, eMs);
      return [s, e] as [Date, Date];
    };

    switch (this.dateOptionControl.value) {
      case 'today':
        [startDate, endDate] = setRange(today);
        break;

      case 'yesterday': {
        const y = new Date(today); y.setDate(today.getDate() - 1);
        [startDate, endDate] = setRange(y);
        break;
      }

      case 'last7days': {
        if (this.daysControl.value) {
          const dayMap: Record<string, number> = {
            Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
            Thursday: 4, Friday: 5, Saturday: 6
          };
          const target = dayMap[this.daysControl.value];
          for (let i = 0; i < 7; i++) {
            const d = new Date(today); d.setDate(today.getDate() - i);
            if (d.getDay() === target) {
              [startDate, endDate] = setRange(d);
              break;
            }
          }
        } else {
          const e = new Date(today); e.setHours(23, 59, 59, 999);
          const s = new Date(today); s.setDate(today.getDate() - 6); s.setHours(0, 0, 0, 0);
          startDate = s; endDate = e;
        }
        break;
      }

      case 'custom': {
        startDate = new Date(this.dateRange.get('start')?.value || today);
        endDate = new Date(this.dateRange.get('end')?.value || startDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      default:
        [startDate, endDate] = setRange(today);
    }

    const fmt = (t: any) => t instanceof Date ? t.toTimeString().slice(0, 5) : t;
    const startTime = fmt(this.createSummary.get('startTime')?.value || '00:00');
    const endTime = fmt(this.createSummary.get('endTime')?.value || '23:59');

    const payload: CreateAccountSummaryPayload = {
      userAccount: userAccount?.value || '',
      userAccountId: userAccount?.userId || '',
      emailAccount: this.createSummary.get('emailAccount')?.value || '',
      aiSummaryResponse: this.createSummary.get('aiSummaryResponse')?.value || '',
      range: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      timeWindow: { startTime, endTime }
    };

    this.save.emit(payload);
  }

  userAccountsComplete = false;

  loadMoreUsers(reset: boolean = false) {
    if (this.userAccountsComplete) return;

    if (reset) {
      this.filters.page = 1;
      this.filteredUserAccounts = [];
      this.userAccountsComplete = false;
    }

    this.userService.getAllUserDetail(this.filters).subscribe((res: UserResponse) => {
      const newUsers = res.data.map(u => ({
        value: u.email || '',
        viewValue: u.email || '',
        userId: u._id || ''
      }));

      this.filteredUserAccounts = [...this.filteredUserAccounts, ...newUsers];

      if (newUsers.length < this.filters.limit) {
        this.userAccountsComplete = true;
      } else {
        this.filters.page++;
      }

      if (this.initialData.userAccountId) {
        const found = this.filteredUserAccounts.find(
          u => u.userId === this.initialData.userAccountId
        );
        if (found) {
          this.createSummary.patchValue({ userAccount: found });
        }
      }
    });
  }

}
