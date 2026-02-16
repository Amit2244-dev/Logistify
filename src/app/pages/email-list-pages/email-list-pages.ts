import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of, Subscription } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EmailServices } from '../../services/email/email-services';
import { Email, EmailAddress, EmailQueryParams } from '../../models/email.model';
import { SendMail } from '../../components/send-mail/send-mail';
import { Router } from '@angular/router';
import { ReplyEmails } from '../../components/reply-emails/reply-emails';
import { TruncatePipe } from '../../common/utils/truncate-Pipe';
import { UserStoreService } from '../../core/userStore';
import { SessionService } from '../../services/session/session-services';
import { EMAIL_STATUS } from '../../common/constants/constant';
import { SnackbarService } from '../../common/utils/snackbar';
import { EMAIL_ARCHIVE_FAILED, EMAIL_ARCHIVE_SUCCESS, EMAIL_REFRESH_FAILED, EMAIL_REFRESH_SUCCESS } from '../../common/constants/message';
import { WarningPopup } from '../../components/warning-popup/warning-popup';
import { isCurrentTimeGreaterThan } from '../../common/utils/common_Funs';
import { TagsService } from '../../services/tags/tags-service';

@Component( {
  selector: 'app-email-list-pages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    TruncatePipe,
    MatPaginator,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    SendMail,
    MatIconModule,
    ReplyEmails,
    WarningPopup
  ],
  templateUrl: './email-list-pages.html',
  styleUrls: ['./email-list-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class EmailListPages implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild( MatSort, { static: true } ) sort!: MatSort;
  @ViewChild( MatPaginator ) paginator!: MatPaginator;

  emails: Email[] = [];
  totalEmailsCount = 0;
  loading = false;
  checkNoAccountAddedYet = false;
  ViewEmailData: Email = {} as Email;
  openSendEmailPopup = false;
  openReplyEmailPopup = false;
  openWorningPopup = false;
  showFilters = true;
  header = 'All Emails';
  selectedEmailType: string = '';
  selectedEmailStatus: string = '';
  selectedTags: string = '';
  filteredEmailAccounts: EmailAddress[] = [];
  emailAccounts: EmailAddress[] = [];
  filteredEmailStatus: EmailAddress[] = EMAIL_STATUS;
  filteredTags = [{ value: "", viewValue: "All" }];
  allTagOptions: string[] = [];
  hideShowFilter: Boolean = false;
  toggelSidebar: boolean = false;

  columns = [
    { key: 'fromEmail', label: 'Sender', sortable: true, width: 13 },
    { key: 'subject', label: 'Subject', sortable: true, width: 12 },
    { key: 'aiSummaryResponse', label: 'Summary', sortable: true, width: 30 },
    { key: 'tags', label: 'Tags', sortable: true, width: 15 },
    { key: 'status', label: 'Status', sortable: true, width: 10 },
    { key: 'createdAt', label: 'Received At', sortable: true, width: 20 },
  ];
  displayedColumns = this.columns.map( c => c.key );

  autoRefreshSub!: Subscription;
  subjectSearchControl = new FormControl( '' );
  aiSummarySearchControl = new FormControl( '' );
  dateRange = new FormGroup( {
    start: new FormControl<Date | null>( null ),
    end: new FormControl<Date | null>( null )
  } );

  private subscription!: Subscription;

  filters: EmailQueryParams = {
    page: 1,
    limit: 10,
    sortOrder: 'desc',
    sortBy: 'createdAt',
    startDate: '',
    endDate: '',
    emailAccount: '',
    emailStatus: 'active',
    searchKeys: {},
    search: "",
  };

  constructor(
    private emailService: EmailServices,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private snackbar: SnackbarService,
    private emailSvc: EmailServices,
    private userStore: UserStoreService,
    private sessionService: SessionService,
    private tagsService: TagsService
  ) { }

  ngOnInit(): void {
    this.checkScreenSize();

    this.getStoredFilter().pipe( take( 1 ) ).subscribe( storedFilter => {
      if ( storedFilter ) {
        this.filters = storedFilter;
        if ( this.filters.startDate || this.filters.endDate ) {
          this.dateRange.patchValue( {
            start: this.filters.startDate ? new Date( this.filters.startDate ) : null,
            end: this.filters.endDate ? new Date( this.filters.endDate ) : null
          }, { emitEvent: false } );
        }
        this.selectedEmailType = this.filters.emailAccount || '';
        this.selectedTags = this.filters.searchKeys?.tags || '';
      }
      this.filters.sortOrder = 'desc';
      this.filters.sortBy = 'createdAt';
      this.filters.emailStatus = "active";
      this.filters.searchKeys = {};
      this.selectedEmailStatus = this.filters.emailStatus || 'active';
      this.fetchData( this.filters );
    } );

    this.dateRange.valueChanges.pipe( debounceTime( 800 ) ).subscribe( () => this.applyFilters() );
    this.userStore.emailAccountsList$.subscribe( emailAccounts => {
      if ( !emailAccounts ) return;

      this.openWorningPopup = emailAccounts.some( item =>
        item.expiresAt !== undefined && isCurrentTimeGreaterThan( item.expiresAt )
      );
      this.emailAccounts = [...emailAccounts];
      this.filteredEmailAccounts = [
        { value: "", viewValue: "All", provider: "", isConnected: false, expiresAt: 0, customEmailReplyPrompt: '' },
        ...emailAccounts
      ];
    } );
    this.userStore.tagsList$.subscribe( tags => {
      if ( !tags ) return;
      this.filteredTags = [
        { value: "", viewValue: "All" },
        ...tags.map( tag => ( { value: tag, viewValue: tag } ) )
      ];
      this.allTagOptions = tags;
    } );
    this.subscription = this.userStore.sidebarIconsState$.subscribe( value => {
      this.toggelSidebar = value;
      this.cdr.markForCheck();
    } );
  }

  ngAfterViewInit(): void {
    if ( this.sort && this.filters.sortBy && this.filters.sortOrder ) {
      this.sort.active = this.filters.sortBy;
      this.sort.direction = this.filters.sortOrder as 'asc' | 'desc';
      this.sort.sortChange.emit( { active: this.filters.sortBy, direction: this.filters.sortOrder as 'asc' | 'desc' } );
    }
    this.cdr.markForCheck();

    this.checkScreenSize();
    this.cdr.detectChanges();

  }

  ngOnDestroy(): void {
    if ( this.autoRefreshSub ) {
      this.autoRefreshSub.unsubscribe();
    }
  }

  getStoredFilter(): Observable<EmailQueryParams> {
    const stored = this.sessionService.getEmailFiltersFromSession();
    return of( stored || { ...this.filters } );
  }

  fetchData( filter: EmailQueryParams ): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.emailService.getAllEmails( filter ).subscribe( {
      next: ( res ) => {
        this.emails = res.data;
        this.totalEmailsCount = res.total || 0;
        this.loading = false;
        this.checkNoAccountAddedYet = false;
        this.tagsService.getTagsDetail().subscribe( {} );
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.checkNoAccountAddedYet = true;
        this.cdr.markForCheck();
      }
    } );
  }

  fetchDataWithoutLoading(): void {
    this.emailService.getAllEmails( this.filters ).subscribe( {
      next: ( res ) => {
        this.emails = res.data;
        this.totalEmailsCount = res.total || 0;
        this.cdr.markForCheck();
      },
      error: () => {
        this.checkNoAccountAddedYet = true;
        this.cdr.markForCheck();
      }
    } );
  }

  handlePageChange( event: PageEvent ): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.sessionService.setEmailFiltersToSession( this.filters );
    this.fetchData( this.filters );
  }

  onSort( event: Sort ): void {
    this.filters.sortBy = event.active;
    this.filters.sortOrder = event.direction || 'asc';
    this.filters.page = 1;
    this.sessionService.setEmailFiltersToSession( this.filters );
    this.fetchDataWithoutLoading();
    this.cdr.markForCheck();
  }

  onEmailTypeSelect(): void {
    this.filters.emailAccount = this.selectedEmailType;
    this.filters.page = 1;
    this.sessionService.setEmailFiltersToSession( this.filters );
    this.fetchData( this.filters );
  }

  onTagSelect(): void {
    this.filters.searchKeys.tags = this.selectedTags || '';
    this.filters.page = 1;
    this.sessionService.setEmailFiltersToSession( this.filters );
    this.fetchData( this.filters );
  }

  onEmailStatusSelect(): void {
    this.filters.emailStatus = this.selectedEmailStatus;
    this.filters.page = 1;
    this.sessionService.setEmailFiltersToSession( this.filters );
    this.fetchData( this.filters );
  }

  onSubjectSearchEnter(): void {
    this.filters.searchKeys.subject = this.subjectSearchControl.value || '';
    this.filters.page = 1;
    this.sessionService.setEmailFiltersToSession( this.filters );
    this.fetchData( this.filters );
  }

  onAiSummarySearchEnter(): void {
    this.filters.searchKeys.aiSummaryResponse = this.aiSummarySearchControl.value || '';
    this.filters.page = 1;
    this.sessionService.setEmailFiltersToSession( this.filters );
    this.fetchData( this.filters );
  }

  onClearSearch( field: string ) {
    if ( field === "subject" ) {
      this.filters.searchKeys.subject = '';
      this.subjectSearchControl.setValue( '' );
    }
    if ( field === "aiSummaryResponse" ) {
      this.filters.searchKeys.aiSummaryResponse = '';
      this.aiSummarySearchControl.setValue( '' );
    }
    this.fetchData( this.filters );
  }

  get isFilterApplied(): boolean {
    return Object.values( this.filters.searchKeys ).some( v => !!v ) || !!this.filters.emailAccount || !!this.filters.endDate;
  }

  private applyFilters(): void {
    const { start, end } = this.dateRange.value;
    this.filters = {
      ...this.filters,
      startDate: start ? start.toISOString() : '',
      endDate: end ? end.toISOString() : '',
      page: 1
    };
    this.sessionService.setEmailFiltersToSession( this.filters );
    this.fetchData( this.filters );
  }

  OpenViewEmail( email: Email ): void {
    this.ViewEmailData = email;
    this.openReplyEmailPopup = true;
  }

  archiveEmail( email: Email ): void {
    this.ViewEmailData = email;
    const payload = { query: { id: email._id }, updateData: { isArchive: !email.isArchive } };
    this.emailSvc.updateEmail( payload ).subscribe( {
      next: () => {
        this.snackbar.show( EMAIL_ARCHIVE_SUCCESS.message, EMAIL_ARCHIVE_SUCCESS.status, EMAIL_ARCHIVE_SUCCESS.icon );
        this.fetchData( this.filters );
        this.cdr.detectChanges();
      },
      error: ( err ) => {
        this.snackbar.show( err?.message || EMAIL_ARCHIVE_FAILED.message, EMAIL_ARCHIVE_FAILED.status, EMAIL_ARCHIVE_FAILED.icon );
        this.cdr.detectChanges();
      }
    } );
  }

  refreshEmail(): void {
    this.loading = true;
    this.emailSvc.refreshEmails().subscribe( {
      next: () => {
        this.snackbar.show( EMAIL_REFRESH_SUCCESS.message, EMAIL_REFRESH_SUCCESS.status, EMAIL_REFRESH_SUCCESS.icon );
        this.fetchData( this.filters );
        this.cdr.detectChanges();
        this.loading = false;
      },
      error: ( err ) => {
        this.snackbar.show( err?.message || EMAIL_REFRESH_FAILED.message, EMAIL_REFRESH_FAILED.status, EMAIL_REFRESH_FAILED.icon );
        this.cdr.detectChanges();
        this.loading = false;
      }
    } );
  }

  OpenNewEmail(): void {
    this.openSendEmailPopup = true;
  }

  OnCloseViewEmail(): void {
    this.openSendEmailPopup = false;
    this.openReplyEmailPopup = false;
  }

  toggleAddEmails(): void {
    this.router.navigate( ['/settings'], { queryParams: { tab: 'accounts' } } );
  }

  fetchemailList(): void {
    this.fetchData( this.filters );
  }

  clearDate( event: { stopPropagation: () => void } ): void {
    event.stopPropagation();
    this.dateRange.get( 'start' )?.setValue( null );
    this.dateRange.get( 'end' )?.setValue( null );
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.applyFilters();
  }

  ClearAllFilters( event: { stopPropagation: () => void } ) {
    this.clearDate( event );
    this.filters.emailStatus = "active";
    this.filters.emailAccount = "";
    this.filters.sortOrder = 'asc';
    this.filters.searchKeys = {};
    this.filters.sortBy = '';
    this.filters.search = '';
    this.selectedEmailStatus = this.filters.emailStatus || 'active';
    this.selectedEmailType = this.filters.emailAccount || '';
    this.selectedTags = '';
    this.subjectSearchControl.reset();
    this.aiSummarySearchControl.reset();
    this.sessionService.setEmailFiltersToSession( this.filters );
    this.fetchData( this.filters );
  }

  onCancelAction(): void {
    this.openWorningPopup = false;
  }

  onConfirmAction( email: string ) {
    this.openWorningPopup = false;
    this.router.navigate( ['/settings'], { queryParams: { tab: 'accounts' } } );
  }

  hideShowFilters() {
    this.hideShowFilter = !this.hideShowFilter;
  }

  @HostListener( 'window:resize', ['$event'] )
  onResize( event: any ) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.toggelSidebar = window.innerWidth < 768;
  }
}



