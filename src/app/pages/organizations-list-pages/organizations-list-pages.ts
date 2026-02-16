import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { SnackbarService } from '../../common/utils/snackbar';
import { UserServices } from '../../services/user/user-services';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InviteUserModel } from '../../components/invite-user-model/invite-user-model';
import { EmailQueryParams } from '../../models/email.model';
import { MatNativeDateModule } from '@angular/material/core';
import { OrganizationsServices } from '../../services/organizations/organizations-services';
import { ViewOrganizationModel } from '../../components/view-organization-model/view-organization-model';
import { UpdateUser } from '../../models/user.model';
import { PROFILE_UPDATE_ERROR, PROFILE_UPDATE_SUCCESS, SEND_INVITATION_FAILED, SEND_INVITATION_SUCCESS } from '../../common/constants/message';
import { OrganizationOption } from '../../models/organization.model';
import { UserStoreService } from '../../core/userStore';

@Component( {
  selector: 'app-organizations-list-pages',
  templateUrl: './organizations-list-pages.html',
  styleUrls: ['./organizations-list-pages.scss'],
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
    MatPaginator,
    MatSortModule,
    InviteUserModel,
    ViewOrganizationModel
  ]
} )
export class OrganizationsListPages implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild( MatSort, { static: true } ) sort!: MatSort;
  @ViewChild( MatPaginator ) paginator!: MatPaginator;

  users: any[] = [];
  loading = false;
  totalUsers = 0;
  openInviteModal = false;
  Modelheader = 'Add';
  isFetching = false;
  hideShowFilter = false;
  selectedUser: UpdateUser = {};
  openOrgnizationModal = false;
  organizationOptions: OrganizationOption[] = [];
  toggelSidebar: boolean = false;

  columns = [
    { key: 'fullName', label: 'Full Name', sortable: true, width: 15 },
    { key: 'email', label: 'Email', sortable: true, width: 20 },
    { key: 'roles', label: 'Role', sortable: true, width: 15 },
    { key: 'organization', label: 'Organization', sortable: true, width: 20 },
    { key: 'createdAt', label: 'Created At', sortable: true, width: 20 },
    { key: 'actions', label: 'Actions', sortable: false, width: 10 }
  ];
  displayedColumns = this.columns.map( c => c.key );
  private subscription!: Subscription;
  fullNameControl = new FormControl( '' );
  organizationControl = new FormControl( '' );
  emailControl = new FormControl( '' );
  roleControl = new FormControl( '' );
  dateRange = new FormGroup( {
    start: new FormControl<Date | null>( null ),
    end: new FormControl<Date | null>( null )
  } );

  filters: EmailQueryParams = {
    page: 1,
    limit: 10,
    search: '',
    sortOrder: 'asc',
    sortBy: 'fullName',
    startDate: '',
    endDate: '',
    searchKeys: {
      fullName: '',
      email: '',
      roles: ''
    },
    emailAccount: '',
    emailStatus: ''
  };

  subscriptions: Subscription[] = [];


  constructor(
    private userService: UserServices,
    private cdr: ChangeDetectorRef,
    private snackbar: SnackbarService,
    private organizationSvc: OrganizationsServices,
    private userStore: UserStoreService,
  ) { }

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchOrganizations();
    this.subscription = this.userStore.sidebarIconsState$.subscribe( value => {
      this.toggelSidebar = value;
      this.cdr.markForCheck();
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

  fetchUsers( showSpinner: boolean = true ): void {
    if ( showSpinner ) this.loading = true;
    this.userService.getAllUserDetail( this.filters ).subscribe( {
      next: res => {
        this.users = res.data;
        this.totalUsers = res.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    } );
  }

  fetchOrganizations( showSpinner: boolean = true ): void {
    if ( showSpinner ) this.loading = true;
    this.organizationSvc.getOrganizationsDetail().subscribe( {
      next: res => {
        res
          .filter( ( item: any ) => item.name === 'Logistify' )
          .map( ( items ) => {
            this.organizationOptions.push( { id: items._id, value: items.name, key: items.name, vectorStoreId: items.vectorStoreId } );
          } );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    } );
  }

  searchByFullName(): void {
    this.filters.searchKeys.fullName = this.fullNameControl.value || '';
    this.filters.page = 1;
    this.fetchUsers();
  }

  onFullNameInput( event: Event ): void {
    if ( this.fullNameControl.value === '' ) {
      this.filters.searchKeys.fullName = '';
      this.filters.page = 1;
      this.fetchUsers();
    }
  }

  searchByEmail(): void {
    this.filters.searchKeys.email = this.emailControl.value || '';
    this.filters.page = 1;
    this.fetchUsers();
  }

  onEmailInput( event: Event ): void {
    if ( this.emailControl.value === '' ) {
      this.filters.searchKeys.email = '';
      this.filters.page = 1;
      this.fetchUsers();
    }
  }

  searchByRole(): void {
    this.filters.searchKeys.roles = this.roleControl.value || '';
    this.filters.page = 1;
    this.fetchUsers();
  }

  onRoleInput( event: Event ): void {
    if ( this.roleControl.value === '' ) {
      this.filters.searchKeys.roles = '';
      this.filters.page = 1;
      this.fetchUsers();
    }
  }

  applyFilters(): void {
    const { start, end } = this.dateRange.value;
    this.filters.startDate = start ? start.toISOString() : '';
    this.filters.endDate = end ? end.toISOString() : '';
    this.filters.page = 1;
    this.fetchUsers();
  }

  onDateRangeClosed(): void {
    if ( this.dateRange.value.start || this.dateRange.value.end ) {
      this.applyFilters();
    }
  }

  handlePageChange( event: PageEvent ): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.fetchUsers();
  }

  onSort( event: Sort ): void {
    this.filters.sortBy = event.active;
    this.filters.sortOrder = event.direction || 'asc';
    this.filters.page = 1;
    this.fetchUsers( false );
  }

  openNewUser(): void {
    this.Modelheader = 'Add';
    this.openInviteModal = true;
  }

  closeInvitationModal(): void {
    this.openInviteModal = false;
  }

  sendInvitation( data: any ): void {
    this.isFetching = true;
    this.organizationSvc.sendInvitation( data ).subscribe( {
      next: () => {
        const success = SEND_INVITATION_SUCCESS;
        this.snackbar.show( success.message, 'success', success.icon );
        this.isFetching = false;
        this.closeInvitationModal();
        this.cdr.markForCheck();
        this.fetchUsers();
      },
      error: ( error ) => {
        const fail = SEND_INVITATION_FAILED;
        this.isFetching = false;
        this.snackbar.show( error.message || fail.message, 'error', fail.icon );
        this.cdr.markForCheck();
      }
    } );
  }

  updateprofile( updateData: any ): void {
    this.isFetching = true;
    this.userService.updateUserProfile( updateData ).subscribe( {
      next: () => {
        const { message, status, icon } = PROFILE_UPDATE_SUCCESS;
        this.snackbar.show( message, status, icon );
        this.isFetching = false;
        this.openOrgnizationModal = false;
        this.fetchUsers();
      },
      error: ( err ) => {
        const { message, status, icon } = PROFILE_UPDATE_ERROR;
        this.snackbar.show( err?.message || message, status, icon );
        this.isFetching = false;
      }
    } );
  }

  openNewOrgnization( user: any ): void {
    this.Modelheader = 'Add';
    this.openOrgnizationModal = true;
    this.selectedUser = user;
  }

  hideShowFilters(): void {
    this.hideShowFilter = !this.hideShowFilter;
  }

  ClearAllFilters( event: { stopPropagation: () => void } ): void {
    event.stopPropagation();
    this.fullNameControl.reset();
    this.emailControl.reset();
    this.roleControl.reset();
    this.dateRange.reset();
    this.filters.searchKeys = { fullName: '', email: '', roles: '' };
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.filters.sortBy = 'fullName';
    this.filters.sortOrder = 'asc';
    this.fetchUsers();
  }

  searchByOrganization(): void {
    this.filters.page = 1;
    this.fetchUsers();
  }

  onOrganizationInput( event: Event ): void {
    if ( this.organizationControl.value === '' ) {
      this.filters.page = 1;
      this.fetchUsers();
    }
  }


  @HostListener( 'window:resize', ['$event'] )
  onResize( event: any ) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.toggelSidebar = window.innerWidth < 768;
  }
}