import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  OnInit,
  DestroyRef
} from '@angular/core';
import { WarningPopup } from '../warning-popup/warning-popup';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmailServices } from '../../services/email/email-services';
import { Email, EmailQueryParams } from '../../models/email.model';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SessionService } from '../../services/session/session-services';
import { environment } from '../../../environment/environment';
import { API_ENDPOINTS } from '../../common/constants/apiUrls';
import { UserStoreService } from '../../core/userStore';
import { SnackbarService } from '../../common/utils/snackbar';
import { EMAIL_DISCONNECT_FAILED, EMAIL_DISCONNECT_SUCCESS, EMAIL_REMOVE_FAILED, EMAIL_REMOVE_SUCCESS } from '../../common/constants/message';
import { MatIconModule } from '@angular/material/icon';
import { isCurrentTimeGreaterThan } from '../../common/utils/common_Funs';

@Component( {
  selector: 'app-email-accounts',
  standalone: true,
  imports: [
    CommonModule,
    WarningPopup,
    MatTableModule,
    MatPaginator,
    MatSort,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    ReactiveFormsModule
  ],
  templateUrl: './email-accounts.html',
  styleUrl: './email-accounts.scss',
  changeDetection: ChangeDetectionStrategy.Default
} )
export class EmailAccounts implements OnInit {
  @ViewChild( MatSort ) sort!: MatSort;
  @ViewChild( MatPaginator ) paginator!: MatPaginator;

  isCurrentTimeGreaterThan = isCurrentTimeGreaterThan;
  emails: Email[] = [];
  totalEmailsCount = 0;
  loading = false;
  showWarning = false;
  showMobileFilters: boolean = false;

  displayedColumns = ['email', 'displayName', 'provider', 'expiresAt', 'linkedAt', 'Actions'];

  searchControl = new FormControl( '' );
  dateRange = new FormGroup( {
    start: new FormControl<Date | null>( null ),
    end: new FormControl<Date | null>( null )
  } );

  filters: EmailQueryParams = {
    page: 1,
    limit: 10,
    search: '',
    sortOrder: 'asc',
    sortBy: 'subject',
    startDate: '',
    endDate: '',
    emailAccount: '',
    emailStatus: "",
    searchKeys: {},
  };

  constructor( private emailService: EmailServices, private cdr: ChangeDetectorRef, private destroyRef: DestroyRef, private sessionService: SessionService, private userStore: UserStoreService, private snackbarService: SnackbarService ) { }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe( debounceTime( 400 ), takeUntilDestroyed( this.destroyRef ) )
      .subscribe( () => this.applyFilters() );

    this.dateRange.valueChanges
      .pipe( debounceTime( 300 ), takeUntilDestroyed( this.destroyRef ) )
      .subscribe( () => this.applyFilters() );
  }

  ngAfterViewInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.emailService.getAllEmailAccounts( this.filters ).subscribe( {
      next: ( { data, total = 0 } ) => {
        this.emails = [...data];
        this.cdr.markForCheck();
        const seen = new Set();
        const uniqueEmails = data
          .filter( e => e.email && !seen.has( e.email ) && seen.add( e.email ) )
          .map( e => ( {
            value: e.email,
            viewValue: e.email,
            provider: e.provider,
            expiresAt: e.expiresAt,
            isConnected: e.isConnected,
            customEmailReplyPrompt: e.customEmailReplyPrompt
          } ) );
        this.userStore.setEmailAccounts( uniqueEmails );
        this.cdr.markForCheck();
        this.totalEmailsCount = total;
        this.finishLoading();
      },
      error: () => this.finishLoading()
    } );
  }

  handlePageChange( { pageIndex, pageSize }: PageEvent ): void {
    this.updateFilters( { page: pageIndex + 1, limit: pageSize } );
  }

  onSort( { active, direction }: Sort ): void {
    this.updateFilters( {
      sortBy: direction ? active : '',
      sortOrder: direction || '',
      page: 1
    } );
  }

  applyFilters(): void {
    const { start, end } = this.dateRange.value;
    this.updateFilters( {
      search: this.searchControl.value || '',
      startDate: start?.toISOString() || '',
      endDate: end?.toISOString() || '',
      page: 1
    } );
  }

  openWarning(): void {
    this.showWarning = true;
  }

  onCancelAction(): void {
    this.showWarning = false;
  }

  onConfirmAction( filter: string ) {
    this.showWarning = false;
    this.loading = true;
    this.cdr.markForCheck();
    const access = this.sessionService.getAccessToken();

    if ( access ) {
      if ( filter === 'outlook' ) window.location.href = `${ environment.apiUrl }${ API_ENDPOINTS.ADD_Email_ACCOUNTS_OUTLOOK }?token=${ encodeURIComponent( access ) }`
      else window.location.href = `${ environment.apiUrl }${ API_ENDPOINTS.ADD_Email_ACCOUNTS_GMAIL }?token=${ encodeURIComponent( access ) }`
    }
    // this.emailService.AddnewEmail().subscribe({
    //   next: () => this.finishLoading(),
    //   error: () => this.finishLoading()
    // });

  }

  private updateFilters( partial: Partial<EmailQueryParams> ): void {
    this.filters = { ...this.filters, ...partial };
    this.fetchData();
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.markForCheck();
  }

  disconnectEmailAccount( email: string ): void {
    this.loading = true;
    const payload = {
      updateData: { isConnected: false },
      query: {
        email: email
      }
    }
    this.emailService.updateUserConfiguration( payload ).subscribe( {
      next: () => {
        this.snackbarService.show( EMAIL_DISCONNECT_SUCCESS.message, EMAIL_DISCONNECT_SUCCESS.status, EMAIL_DISCONNECT_SUCCESS.icon );
        this.loading = false;
        this.fetchData();
        this.cdr.detectChanges();
      },
      error: ( err ) => {
        this.snackbarService.show( err?.message || EMAIL_DISCONNECT_FAILED.message, EMAIL_DISCONNECT_FAILED.status, EMAIL_DISCONNECT_FAILED.icon );
        this.loading = false;
        this.cdr.detectChanges();
      }
    } );
  }

  removeEmailAccount( email: string ): void {
    this.loading = true;
    const payload = {
      updateData: { isDeleted: true },
      query: {
        email: email
      }
    }
    this.emailService.updateUserConfiguration( payload ).subscribe( {
      next: () => {
        this.snackbarService.show( EMAIL_REMOVE_SUCCESS.message, EMAIL_REMOVE_SUCCESS.status, EMAIL_REMOVE_SUCCESS.icon );
        this.loading = false;
        this.fetchData();
        this.cdr.detectChanges();
      },
      error: ( err ) => {
        this.snackbarService.show( err?.message || EMAIL_REMOVE_FAILED.message, EMAIL_REMOVE_FAILED.status, EMAIL_REMOVE_FAILED.icon );
        this.loading = false;
        this.cdr.detectChanges();
      }
    } );
  }

  clearDate( event: { stopPropagation: () => void } ): void {
    event.stopPropagation();
    this.dateRange.get( 'start' )?.setValue( null );
    this.dateRange.get( 'end' )?.setValue( null );
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.applyFilters();
  }
}
