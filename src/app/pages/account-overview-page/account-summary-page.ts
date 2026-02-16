import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, Subscription } from 'rxjs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SnackbarService } from '../../common/utils/snackbar';
import { EmailAddress, EmailQueryParams, UserAccountOption } from '../../models/email.model';
import { CreateSummary } from '../../components/create-summary/create-summary-model';
import { CreateAccountSummaryPayload } from '../../models/account-Summary.model';
import { AccountSummary } from '../../services/account-Summary/account-summary';
import { MatMenuModule } from '@angular/material/menu';
import { TruncatePipe } from '../../common/utils/truncate-Pipe';
import { ACCOUNT_OVERVIEW_FAILED, ACCOUNT_OVERVIEW_SUCCESS } from '../../common/constants/message';
import { UserStoreService } from '../../core/userStore';
import { MatSelectModule } from '@angular/material/select';
import { UserServices } from '../../services/user/user-services';
import { MatSelectInfiniteScrollDirective } from '../../shared/mat-select-infinite-scroll';
import { UserResponse } from '../../models/user.model';

@Component( {
  selector: 'app-account-summary-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginator,
    CreateSummary,
    TruncatePipe,
    MatMenuModule,
    MatSelectInfiniteScrollDirective
  ],
  templateUrl: './account-summary-page.html',
  styleUrl: './account-summary-page.scss'
} )
export class AccountSummaryPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild( MatSort, { static: true } ) sort!: MatSort;
  @ViewChild( MatPaginator ) paginator!: MatPaginator;

  ApiErrorMsg: string[] = [];
  accountSummaryList: CreateAccountSummaryPayload[] = [];
  selectedAccountSummary: Partial<CreateAccountSummaryPayload> = {};
  totalAccountSummary = 0;
  loading = false;
  selectedEmailType: string = '';
  emailAccounts: EmailAddress[] = [];
  filteredEmailAccounts: EmailAddress[] = [];
  filteredUserAccounts: UserAccountOption[] = [];
  userAccountsComplete = false;
  isFetching = false;
  openAccountSummaryModel = false;
  hideShowFilter = false;
  toggelSidebar: boolean = false;

  columns = [
    { key: 'userAccount', label: 'User Account', sortable: true, width: 15 },
    { key: 'emailAccount', label: 'Email Account', sortable: true, width: 15 },
    { key: 'aiSummaryResponse', label: 'Summary', sortable: true, width: 35 },
    { key: 'createdAt', label: 'Created At', sortable: true, width: 20 },
    { key: 'actions', label: 'Actions', sortable: false, width: 15 }
  ];
  displayedColumns = this.columns.map( c => c.key );
  private subscription!: Subscription;
  modalMode: 'create' | 'view' = 'create';
  userAccountControl = new FormControl( '' );
  emailAccountControl = new FormControl( '' );
  summaryControl = new FormControl( '' );
  dateRange = new FormGroup( {
    start: new FormControl<Date | null>( null ),
    end: new FormControl<Date | null>( null )
  } );

  filters: EmailQueryParams = {
    page: 1,
    limit: 10,
    search: '',
    sortOrder: 'desc',
    sortBy: 'createdAt',
    startDate: '',
    endDate: '',
    searchKeys: {},
    emailAccount: '',
    emailStatus: ''
  };

  subscriptions: Subscription[] = [];

  constructor(
    private accountSummaryService: AccountSummary,
    private cdr: ChangeDetectorRef,
    private snackbarservice: SnackbarService,
    private userStore: UserStoreService,
    private userService: UserServices
  ) { }

  ngOnInit(): void {

    this.fetchAccountSummary();

    this.loadMoreUsers( true ); // Initialize user accounts for dropdown
    // Subscribe to dateRange changes only, no debounce
    // this.subscriptions.push(
    //   this.dateRange.valueChanges.pipe( debounceTime( 800 ) ).subscribe( () => this.applyFilters() )
    // );

    this.subscription = this.userStore.sidebarIconsState$.subscribe( value => {
      this.toggelSidebar = value;
      this.cdr.markForCheck();
    } );

    this.userStore.emailAccountsList$.subscribe( emailAccounts => {
      if ( !emailAccounts ) return;

      this.emailAccounts = [...emailAccounts];
      this.filteredEmailAccounts = [
        {
          value: '',
          viewValue: 'All',
          provider: '',
          isConnected: false,
          expiresAt: 0,
          customEmailReplyPrompt: ''
        },
        ...emailAccounts
      ];
    } );
  }

  ngAfterViewInit(): void {
    this.cdr.markForCheck();
    this.checkScreenSize();
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach( sub => sub.unsubscribe() );
  }

  get isFilterApplied(): boolean {
    return Object.values( this.filters.searchKeys ).some( v => !!v ) || !!this.filters.endDate;
  }

  fetchAccountSummary( showSpinner: boolean = true ): void {
    if ( showSpinner ) this.loading = true;
    this.accountSummaryService.getAllAccountSummary( this.filters ).subscribe( {
      next: ( res ) => {
        this.accountSummaryList = res.data;
        this.totalAccountSummary = res.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    } );
  }

  // Handle user account selection
  onUserAccountSelect( value: string ): void {
    this.filters.searchKeys.userAccount = value || '';
    this.filters.page = 1;
    this.fetchAccountSummary();
  }

  // Load more users for infinite scroll
  loadMoreUsers( reset: boolean = false ): void {
    if ( this.userAccountsComplete ) return;

    if ( reset ) {
      this.filters.page = 1;
      this.filteredUserAccounts = [];
      this.userAccountsComplete = false;
    }

    this.userService.getAllUserDetail( this.filters ).subscribe( ( res: UserResponse ) => {
      const newUsers = res.data.map( u => ( {
        value: u.email || '',
        viewValue: u.email || '',
        userId: u._id || ''
      } ) );

      this.filteredUserAccounts = [...this.filteredUserAccounts, ...newUsers];

      if ( newUsers.length < this.filters.limit ) {
        this.userAccountsComplete = true;
      } else {
        this.filters.page++;
      }

      this.cdr.markForCheck();
    } );
  }

  onEmailTypeSelect(): void {
    this.filters.searchKeys.emailAccount = this.selectedEmailType;
    this.filters.page = 1;
    this.fetchAccountSummary();
  }

  // Handle input event for email account
  onEmailAccountInput( event: Event ): void {
    if ( this.emailAccountControl.value === '' ) {
      this.filters.searchKeys.emailAccount = '';
      this.filters.page = 1;
      this.fetchAccountSummary();
    }
  }

  // Handle search when Enter is pressed
  searchBySummary(): void {
    this.filters.searchKeys.aiSummaryResponse = this.summaryControl.value || '';
    this.filters.page = 1;
    this.fetchAccountSummary();
  }

  // Handle input event for summary
  onSummaryInput( event: Event ): void {
    if ( this.summaryControl.value === '' ) {
      this.filters.searchKeys.aiSummaryResponse = '';
      this.filters.page = 1;
      this.fetchAccountSummary();
    }
  }

  openNewAccountSummary(): void {
    this.selectedAccountSummary = {};
    this.modalMode = 'create';
    this.openAccountSummaryModel = true;
  }

  openViewSummary( item: CreateAccountSummaryPayload ): void {
    this.selectedAccountSummary = item;
    this.modalMode = 'view';
    this.openAccountSummaryModel = true;
  }

  applyFilters(): void {
    const { start, end } = this.dateRange.value;
    this.filters.startDate = start ? start.toISOString() : '';
    this.filters.endDate = end ? end.toISOString() : '';
    this.filters.page = 1;
    this.fetchAccountSummary();
  }

  handlePageChange( event: PageEvent ): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.fetchAccountSummary();
  }

  onSort( event: Sort ): void {
    this.filters.sortBy = event.active;
    this.filters.sortOrder = event.direction || 'asc';
    this.filters.page = 1;
    this.fetchAccountSummary( false );
  }

  closeAccountSummaryModel(): void {
    this.openAccountSummaryModel = false;
  }

  save( data: CreateAccountSummaryPayload ): void {
    this.isFetching = true;
    this.accountSummaryService.createAccountSummary( data ).subscribe( {
      next: () => {
        const success = ACCOUNT_OVERVIEW_SUCCESS;
        this.snackbarservice.show( success.message, success.status, success.icon );
        this.isFetching = false;
        this.closeAccountSummaryModel();
        this.fetchAccountSummary();
      },
      error: ( error ) => {
        const success = ACCOUNT_OVERVIEW_FAILED;
        this.snackbarservice.show( error?.message || success.message, success.status, success.icon );
        this.ApiErrorMsg = error;
        this.isFetching = false;
      }
    } );
  }

  clearDate( event: { stopPropagation: () => void }, skipApply: boolean = false ): void {
    event.stopPropagation();
    this.dateRange.get( 'start' )?.setValue( null );
    this.dateRange.get( 'end' )?.setValue( null );
    this.filters.startDate = '';
    this.filters.endDate = '';
    if ( !skipApply ) {
      this.applyFilters();
    }
  }

  hideShowFilters(): void {
    this.hideShowFilter = !this.hideShowFilter;
  }

  onDateRangeClosed(): void {
    if ( this.dateRange.value.start || this.dateRange.value.end ) {
      this.applyFilters();
    }
  }

  async ClearAllFilters( event: { stopPropagation: () => void } ): Promise<void> {
    this.clearDate( event, true );
    this.filters.sortOrder = 'asc';
    this.filters.sortBy = '';
    this.filters.page = 1;
    this.filters.searchKeys = {};
    this.userAccountControl.setValue( '' );
    this.selectedEmailType = '';
    this.emailAccountControl.reset();
    this.summaryControl.reset();

    this.fetchAccountSummary();
  }

  @HostListener( 'window:resize', ['$event'] )
  onResize( event: any ) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.toggelSidebar = window.innerWidth < 768;
  }
}