import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { CustomerModel } from '../../components/add-customer/customer-model';
import { CustomersService } from '../../services/customer/customer-service';
import { MatNativeDateModule } from '@angular/material/core';
import { AddCustomerPayload, Customer } from '../../models/customer.model';
import { SnackbarService } from '../../common/utils/snackbar';
import { ADD_CUSTOMER_FAILED, ADD_CUSTOMER_SUCCESS, DELETE_CUSTOMER_FAILED, DELETE_CUSTOMER_SUCCESS, UPDATE_CUSTOMER_FAILED, UPDATE_CUSTOMER_SUCCESS } from '../../common/constants/message';
import { MatMenuModule } from '@angular/material/menu';
import { EmailQueryParams } from '../../models/email.model';
import { UserStoreService } from '../../core/userStore';

@Component( {
  selector: 'app-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule,
    MatMenuModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginator,
    CustomerModel
  ],
  templateUrl: './customers-page.html',
  styleUrl: './customers-page.scss'
} )
export class CustomersPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild( MatSort, { static: true } ) sort!: MatSort;
  @ViewChild( MatPaginator ) paginator!: MatPaginator;

  customers: Customer[] = [];
  ApiErrorMsg: string[] = [];
  viewCustomer: Partial<Customer> = {};
  totalCustomers = 0;
  Modelheader = 'Add';
  loading = false;
  isFetching = false;
  openCustomerModal = false;
  hideShowFilter: Boolean = false;

  columns = [
    { key: 'companyName', label: 'Company Name', sortable: true, width: 20 },
    { key: 'companyAddress', label: 'Company Address', sortable: true, width: 20 },
    { key: 'contacts.email', label: 'Email', sortable: true, width: 25 },
    { key: 'createdAt', label: 'Created At', sortable: true, width: 20 },
    { key: 'actions', label: 'Actions', sortable: false, width: 15 }
  ];
  displayedColumns = this.columns.map( c => c.key );

  companyNameControl = new FormControl( '' );
  companyAddressControl = new FormControl( '' );
  private subscription!: Subscription;
  contactsEmailControl = new FormControl( '' );
  dateRange = new FormGroup( {
    start: new FormControl<Date | null>( null ),
    end: new FormControl<Date | null>( null )
  } );

  filters: EmailQueryParams = {
    page: 1,
    limit: 10,
    search: '',
    sortOrder: 'asc',
    sortBy: 'companyName',
    startDate: '',
    endDate: '',
    searchKeys: {},
    emailAccount: '',
    emailStatus: ''
  };

  subscriptions: Subscription[] = [];
  toggelSidebar: boolean = false;

  constructor(
    private customerSvc: CustomersService,
    private cdr: ChangeDetectorRef,
    private userStore: UserStoreService,
    private snackbar: SnackbarService
  ) { }

  ngOnInit(): void {
    this.checkScreenSize();
    this.fetchCustomers();
    this.subscription = this.userStore.sidebarIconsState$.subscribe( value => {
      this.toggelSidebar = value;
      this.cdr.markForCheck();
    } );
  }

  get isFilterApplied(): boolean {
    return Object.values( this.filters.searchKeys ).some( v => !!v ) || !!this.filters.emailAccount || !!this.filters.endDate;
  }

  ngAfterViewInit(): void {
    this.cdr.markForCheck();

    this.checkScreenSize();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( sub => sub.unsubscribe() );
  }

  fetchCustomers( showSpinner: boolean = true ): void {
    if ( showSpinner ) this.loading = true;

    this.customerSvc.getAllCustomers( this.filters ).subscribe( {
      next: ( res: { data: Customer[]; total: number } ) => {
        this.customers = res.data;
        this.totalCustomers = res.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    } );
  }

  // Handle search when Enter is pressed
  searchByCompanyName(): void {
    this.filters.searchKeys.companyName = this.companyNameControl.value || '';
    this.filters.page = 1;
    this.fetchCustomers();
  }

  // Handle input event for company name
  onCompanyNameInput( event: Event ): void {
    if ( this.companyNameControl.value === '' ) {
      this.filters.searchKeys.companyName = '';
      this.filters.page = 1;
      this.fetchCustomers();
    }
  }

  // Handle search when Enter is pressed
  searchByCompanyAddress(): void {
    this.filters.searchKeys.companyAddress = this.companyAddressControl.value || '';
    this.filters.page = 1;
    this.fetchCustomers();
  }

  // Handle input event for company address
  onCompanyAddressInput( event: Event ): void {
    if ( this.companyAddressControl.value === '' ) {
      this.filters.searchKeys.companyAddress = '';
      this.filters.page = 1;
      this.fetchCustomers();
    }
  }

  // Handle search when Enter is pressed
  searchByContactsEmail(): void {
    this.filters.searchKeys.contactsEmail = this.contactsEmailControl.value || '';
    this.filters.page = 1;
    this.fetchCustomers();
  }

  // Handle input event for contacts email
  onContactsEmailInput( event: Event ): void {
    if ( this.contactsEmailControl.value === '' ) {
      this.filters.searchKeys.contactsEmail = '';
      this.filters.page = 1;
      this.fetchCustomers();
    }
  }

  applyFilters(): void {
    const { start, end } = this.dateRange.value;
    this.filters.startDate = start ? start.toISOString() : '';
    this.filters.endDate = end ? end.toISOString() : '';
    this.filters.page = 1;
    this.fetchCustomers();
  }

  // Handle date range selection when the picker is closed
  onDateRangeClosed(): void {
    this.applyFilters();
  }

  handlePageChange( event: PageEvent ): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.fetchCustomers();
  }

  onSort( event: Sort ): void {
    this.filters.sortBy = event.active;
    this.filters.sortOrder = event.direction || 'asc';
    this.filters.page = 1;
    this.fetchCustomers( false );
  }

  openNewCustomer(): void {
    this.Modelheader = 'Add';
    this.viewCustomer = {};
    this.openCustomerModal = true;
  }

  closeCustomerModal(): void {
    this.openCustomerModal = false;
  }

  save( data: AddCustomerPayload ): void {
    this.isFetching = true;
    const saveCustomer$ =
      this.Modelheader !== 'Update'
        ? this.customerSvc.addNewCustomer( data )
        : this.customerSvc.updateCustomer( data, this.viewCustomer._id! );

    saveCustomer$.subscribe( {
      next: () => {
        const success = this.Modelheader !== 'Update'
          ? ADD_CUSTOMER_SUCCESS
          : UPDATE_CUSTOMER_SUCCESS;

        this.snackbar.show( success.message, success.status, success.icon );

        this.isFetching = false;
        this.closeCustomerModal();
        this.cdr.markForCheck();
        this.fetchCustomers();
      },
      error: ( error ) => {
        this.ApiErrorMsg = error;
        const fail = this.Modelheader !== 'Update'
          ? ADD_CUSTOMER_FAILED
          : UPDATE_CUSTOMER_FAILED;
        this.isFetching = false;
        this.snackbar.show( fail.message, fail.status, fail.icon );
        this.cdr.markForCheck();
      }
    } );
  }

  view( customer: Customer ): void {
    this.Modelheader = "Update";
    this.viewCustomer = customer;
    this.openCustomerModal = true;
  }

  remove( customer: Customer ): void {
    this.loading = true;
    const customerId = customer._id;
    this.customerSvc.removeCustomer( customerId ).subscribe( {
      next: () => {
        this.snackbar.show( DELETE_CUSTOMER_SUCCESS.message, DELETE_CUSTOMER_SUCCESS.status, DELETE_CUSTOMER_SUCCESS.icon );
        this.loading = false;
        this.closeCustomerModal();
        this.cdr.markForCheck();
        this.fetchCustomers();
      },
      error: () => {
        this.closeCustomerModal();
        this.loading = false;
        this.snackbar.show( DELETE_CUSTOMER_FAILED.message, DELETE_CUSTOMER_FAILED.status, DELETE_CUSTOMER_FAILED.icon );
        this.cdr.markForCheck();
      }
    } );
  }

  clearDate( event: { stopPropagation: () => void } ): void {
    event.stopPropagation();
    this.dateRange.get( 'start' )?.setValue( null );
    this.dateRange.get( 'end' )?.setValue( null );
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.fetchCustomers();
  }

  hideShowFilters(): void {
    this.hideShowFilter = !this.hideShowFilter;
  }

  ClearAllFilters( event: { stopPropagation: () => void } ): void {
    this.clearDate( event );
    this.filters.sortOrder = 'asc';
    this.filters.sortBy = '';
    this.filters.searchKeys = {};
    this.companyNameControl.reset();
    this.companyAddressControl.reset();
    this.contactsEmailControl.reset();
    this.fetchCustomers();
  }

  @HostListener( 'window:resize', ['$event'] )
  onResize( event: any ) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.toggelSidebar = window.innerWidth < 768;
  }
}