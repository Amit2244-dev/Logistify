import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FileService } from '../../services/file/file-service';
import { SnackbarService } from '../../common/utils/snackbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmailAddress, EmailQueryParams, PreviousChat } from '../../models/email.model';
import { TruncatePipe } from '../../common/utils/truncate-Pipe';
import { Subscription } from 'rxjs';
import { UserStoreService } from '../../core/userStore';

@Component( {
  selector: 'app-file-prompt-response',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, TruncatePipe],
  templateUrl: './file-prompt-response.html',
  styleUrl: './file-prompt-response.css'
} )
export class FilePromptResponse implements OnInit {

  @ViewChild( 'scrollContainer' ) private scrollContainer!: ElementRef;

  isCollapsed: boolean = true;
  prompt: string = '';
  isLoading: boolean = false;
  loading: boolean = false;
  isNew: boolean = true;
  selectedChatId: string = '';
  toggelSidebar: boolean = false;
  emailAccounts: EmailAddress[] = [];
  filteredEmailAccounts: EmailAddress[] = [];
  private subscription!: Subscription;


  previousChatMessages: PreviousChat[] = [{ _id: '', messages: [{ key: '', value: '', filename: [] }] }];
  messages: { type: string; text: string, data: { filename?: string[] | undefined } }[] = [];

  constructor(
    private fileSvc: FileService,
    private cdr: ChangeDetectorRef,
    private snackbar: SnackbarService,
    private userStore: UserStoreService,

  ) { }

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

  // textareaHeight = 45; // start with 1 line height
  // maxRows = 8;

  // adjustHeight(event: Event) {
  //   const textarea = event.target as HTMLTextAreaElement;

  //   textarea.style.height = 'auto'; // reset to calculate correctly
  //   const computedStyle = window.getComputedStyle(textarea);
  //   const lineHeight = parseInt(computedStyle.lineHeight || '22', 13);

  //   const maxHeight = lineHeight * this.maxRows;

  //   // grow until maxRows, then fix height
  //   const newHeight = Math.min(textarea.scrollHeight, maxHeight);

  //   textarea.style.height = newHeight + 'px';
  //   this.textareaHeight = newHeight;
  //   console.log(lineHeight, 'Adjusted height:', newHeight, maxHeight, computedStyle.lineHeight);
  // }

  ngOnInit(): void {
    this.checkScreenSize();
    this.subscription = this.userStore.sidebarIconsState$.subscribe( value => {
      this.toggelSidebar = value;
      this.cdr.markForCheck();
    } );
  }

  ngAfterViewInit(): void {
    this.checkScreenSize();
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
    // this.checkScreenSize();
    this.cdr.detectChanges();
  }



  cleanText( msg: string ): string {
    return msg?.replace( /\b\d{13,}-/g, '' );
  }

  cleanFile( fileName: string ): string {
    return fileName?.replace( /^\d+.*?-(.+)$/gm, '$1' )
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch ( err ) { }
  }

  startNewChat(): void {
    this.isCollapsed = false;
    this.messages = [];
    this.prompt = '';
    this.isNew = true;
    this.selectedChatId = '';
  }

  loadChat( chat: PreviousChat ): void {
    this.selectedChatId = chat._id;
    this.isCollapsed = false;
    this.isNew = false;

    this.messages = chat.messages.flatMap( m => [
      { type: 'receiver', text: m.key, data: { filename: m.filename } },
      { type: 'sender', text: m.value, data: { filename: m.filename } }
    ] );
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

  fetchFiles( showSpinner: boolean = true ): void {
    if ( showSpinner ) this.loading = true;
    this.fileSvc.getAllAiVectorMessages( this.filters ).subscribe( {
      next: ( res ) => {
        this.previousChatMessages = res.data as PreviousChat[];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    } );
  }

  send() {
    if ( !this.prompt.trim() ) return;
    this.isLoading = true;
    const query = { prompt: this.prompt.trim(), isNew: this.isNew, _id: ( this.selectedChatId && this.selectedChatId !== '' ) ? this.selectedChatId : this.previousChatMessages[0]?._id };
    this.messages.push( { type: 'receiver', text: this.prompt.trim(), data: {} } );
    this.messages.push( { type: 'sender', text: '', data: {} } );
    this.prompt = '';
    this.fileSvc.fetchFileResponse( query ).subscribe( {
      next: ( res ) => {
        const lastMsg = this.messages[this.messages.length - 1];
        if ( lastMsg && lastMsg.type === 'sender' ) {
          lastMsg.text = res.text;
          lastMsg.data = { filename: res.data as unknown as string[] };
        }
        this.isNew = false;
        this.fetchFiles( false );
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    } );
  }
  
  @HostListener( 'window:resize', ['$event'] )
  onResize( event: any ) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.toggelSidebar = window.innerWidth < 768;
  }
}
