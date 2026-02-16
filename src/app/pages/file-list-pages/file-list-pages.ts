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
import { FileService } from '../../services/file/file-service';
import { MatNativeDateModule } from '@angular/material/core';
import { TruncatePipe } from '../../common/utils/truncate-Pipe';
import { ViewFileModel } from '../../components/view-file-model/view-file-model';
import { ViewFile } from '../../models/file.model';
import { MatMenuModule } from '@angular/material/menu';
import { EmailAddress, EmailQueryParams } from '../../models/email.model';
import { UploadFilesModel, UploadedFile } from '../../components/upload-files-model/upload-files-model';
import { SnackbarService } from '../../common/utils/snackbar';
import { FILE_UPLOAD_SUCCESS, FILE_UPLOAD_FAILED } from '../../common/constants/message';
import { UserStoreService } from '../../core/userStore';
import { MatSelectModule } from '@angular/material/select';

@Component( {
  selector: 'app-file-list-pages',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    TruncatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginator,
    ViewFileModel,
    UploadFilesModel
  ],
  templateUrl: './file-list-pages.html',
  styleUrl: './file-list-pages.scss'
} )
export class FileListPages implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild( MatSort, { static: true } ) sort!: MatSort;
  @ViewChild( MatPaginator ) paginator!: MatPaginator;

  files: UploadedFile[] = [];
  uploadedFiles: UploadedFile[] = [];
  totalFiles = 0;
  loading: Boolean = false;
  isLoading: Boolean = false;
  viewFileModel: Boolean = false;
  hideShowFilter: Boolean = false;
  selectedEmailType: string = '';
  filteredEmailAccounts: EmailAddress[] = [];
  emailAccounts: EmailAddress[] = [];
  toggelSidebar: boolean = false;
  viewFileDetails: ViewFile = {
    s3FileName: '',
    fileName: '',
    aiGeneratedResponse: ''
  };

  openUploadModel: boolean = false;

  columns = [
    { key: 'emailAccount', label: 'Source', sortable: true, width: 15 },
    { key: 'fileName', label: 'File Name', sortable: true, width: 15 },
    { key: 'aiGeneratedResponse', label: 'File Summary', sortable: true, width: 40 },
    { key: 'createdAt', label: 'Created At', sortable: true, width: 15 },
    { key: 'actions', label: 'Actions', sortable: false, width: 15 }
  ];

  displayedColumns = this.columns.map( c => c.key );
  fromEmailControl = new FormControl( '' );
  fileNameControl = new FormControl( '' );
  aiGeneratedResponseControl = new FormControl( '' );
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

  private subscriptions: Subscription[] = [];

  constructor(
    private fileSvc: FileService,
    private cdr: ChangeDetectorRef,
    private snackbar: SnackbarService,
    private userStore: UserStoreService
  ) { }
  private subscription!: Subscription;

  ngOnInit(): void {
    this.checkScreenSize();

    this.fetchFiles();
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
        {
          value: 'Manual upload',
          viewValue: 'Manual upload',
          provider: '',
          isConnected: false,
          expiresAt: 0,
          customEmailReplyPrompt: ''
        },
        ...emailAccounts
      ];
    } );
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

  fetchFiles( showSpinner: boolean = true ): void {
    if ( showSpinner ) this.loading = true;

    this.fileSvc.getAllFiles( this.filters ).subscribe( {
      next: ( res: { data: UploadedFile[]; total: number } ) => {
        this.files = res.data;
        this.totalFiles = res.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    } );
  }

  searchByEmail(): void {
    this.filters.searchKeys.emailAccount = this.fromEmailControl.value || '';
    this.filters.page = 1;
    this.fetchFiles();
  }

  onEmailTypeSelect(): void {
    this.filters.searchKeys.emailAccount = this.selectedEmailType;
    this.filters.page = 1;
    this.fetchFiles();
  }

  searchByFileName(): void {
    this.filters.searchKeys.fileName = this.fileNameControl.value || '';
    this.filters.page = 1;
    this.fetchFiles();
  }

  onFileNameInput(): void {
    if ( this.fileNameControl.value === '' ) {
      this.filters.searchKeys.fileName = '';
      this.filters.page = 1;
      this.fetchFiles();
    }
  }

  searchByAiResponse(): void {
    this.filters.searchKeys.aiGeneratedResponse = this.aiGeneratedResponseControl.value || '';
    this.filters.page = 1;
    this.fetchFiles();
  }

  onAiResponseInput(): void {
    if ( this.aiGeneratedResponseControl.value === '' ) {
      this.filters.searchKeys.aiGeneratedResponse = '';
      this.filters.page = 1;
      this.fetchFiles();
    }
  }

  toggleViewFileModel( file: ViewFile ): void {
    this.viewFileDetails = file;
    this.viewFileModel = true;
  }

  closeViewModelFile(): void {
    this.viewFileModel = false;
  }

  viewFiles( s3FileName: string ): void {
    this.isLoading = true;
    this.fileSvc.viewFiles( s3FileName ).subscribe( {
      next: ( res ) => {
        window.open( res.signedUrl, '_blank', 'noopener,noreferrer' );
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    } );
  }

  applyFilters(): void {
    const { start, end } = this.dateRange.value;
    this.filters.startDate = start ? start.toISOString() : '';
    this.filters.endDate = end ? end.toISOString() : '';
    this.filters.page = 1;
    this.fetchFiles();
  }

  onDateRangeClosed(): void {
    if ( this.dateRange.value.start || this.dateRange.value.end ) {
      this.applyFilters();
    }
  }

  handlePageChange( event: PageEvent ): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.fetchFiles();
  }

  onSort( event: Sort ): void {
    this.filters.sortBy = event.active;
    this.filters.sortOrder = event.direction || 'asc';
    this.filters.page = 1;
    this.fetchFiles( false );
  }

  clearDate( event: { stopPropagation: () => void } ): void {
    event.stopPropagation();
    this.dateRange.get( 'start' )?.setValue( null );
    this.dateRange.get( 'end' )?.setValue( null );
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.applyFilters();
  }

  hideShowFilters(): void {
    this.hideShowFilter = !this.hideShowFilter;
  }

  ClearAllFilters( event: { stopPropagation: () => void } ): void {
    this.clearDate( event );
    this.filters.sortOrder = 'asc';
    this.filters.sortBy = '';
    this.filters.searchKeys = {};
    this.selectedEmailType = '';
    this.fromEmailControl.reset();
    this.fileNameControl.reset();
    this.aiGeneratedResponseControl.reset();
    this.fetchFiles();
  }

  uploadFiles(): void {
    this.openUploadModel = !this.openUploadModel;
  }

  saveFiles( files: UploadedFile[] ): void {
    this.files = [...this.files, ...files];
    this.isLoading = true;
    const formData = new FormData();
    files.forEach( file => {
      formData.append( 'attachments', file.file, file.name );
    } );
    this.fileSvc.uploadFile( formData ).subscribe( {
      next: ( res ) => {
        const message = FILE_UPLOAD_SUCCESS;
        this.snackbar.show( message.message, 'success', message.icon );
        this.isLoading = false;
        this.uploadFiles();
        this.fetchFiles();
        this.cdr.markForCheck();
      },
      error: () => {
        const message = FILE_UPLOAD_FAILED;
        this.snackbar.show( message.message, 'error', message.icon );
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    } );
  }

  removeAiResponse( event: Event ): void {
    if ( this.aiGeneratedResponseControl.value === '' ) {
      this.filters.searchKeys.aiGeneratedResponse = '';
      this.filters.page = 1;
      this.fetchFiles();
    }
  }

  removeFileName( event: Event ): void {
    if ( this.fileNameControl.value === '' ) {
      this.filters.searchKeys.fileName = '';
      this.filters.page = 1;
      this.fetchFiles();
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