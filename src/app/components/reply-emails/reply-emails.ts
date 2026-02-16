import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output, PLATFORM_ID, ViewChild, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { Email, ReplyEmailPayload, SendEmailPayload } from '../../models/email.model';
import { SnackbarService } from '../../common/utils/snackbar';
import { EmailServices } from '../../services/email/email-services';
import {
  EMAIL_DRAFT_FAILED, EMAIL_DRAFT_REQUIRED, EMAIL_DRAFT_SUCCESS,
  EMAIL_FIELDS_REQUIRED, EMAIL_SEND_FAILED, EMAIL_SENT_SUCCESS,
  EMAIL_UPDATE_TAGS_FAILED, EMAIL_UPDATE_TAGS_SUCCESS
} from '../../common/constants/message';
import { AiInputModel } from '../ai-input-model/ai-input-model';
import { QUILL_MODULES } from '../../common/constants/constant';
import { FileService } from '../../services/file/file-service';
import { TagsService } from '../../services/tags/tags-service';

@Component( {
  selector: 'app-reply-emails',
  standalone: true,
  imports: [
    CommonModule, FormsModule, QuillModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, AiInputModel, MatSelectModule, MatChipsModule
  ],
  templateUrl: './reply-emails.html',
  styleUrl: './reply-emails.scss'
} )
export class ReplyEmails {
  @Input() emailData: Partial<Email> = {};
  @Output() onClose = new EventEmitter<boolean>();
  @Output() fetchallEmails = new EventEmitter<boolean>();
  @Input() allTagOptions: string[] = [];
  @ViewChild( 'fileInput' ) fileInput: any;
  @ViewChild( 'quillEditor' ) quillEditorComponent: any;

  userInput = '';
  subject = '';
  aiGeneratedResponse = '';
  editorContent = '';
  safeBody: SafeHtml | undefined;
  toEmails: string[] = [];
  ccEmails: string[] = [];
  bccEmails: string[] = [];
  searchText: string = '';
  filteredOptions: string[] = [];
  tags: string[] = [];
  newToInput = '';
  newCcInput = '';
  newBccInput = '';
  emailAccount = '';
  openNewResponseModel: boolean = false;
  emailId = '';
  provider = '';
  body = '';
  isDraftReply = false;
  summary = '';
  sanitizedSummary: SafeHtml = '';
  isFetchingNewResponse: boolean = false;
  showCcBccOptions = false;
  showCcField = false;
  showBccField = false;
  isExpanded = false;
  isExpandedBody = false;
  isLoading = false;
  formSubmitted = false;
  attachments: any[] = [];
  newAttachments: any[] = [];

  constructor(
    private snackbarService: SnackbarService,
    private emailService: EmailServices,
    private tagsService: TagsService,
    private sanitizer: DomSanitizer,
    private fileSvc: FileService,
    private cdr: ChangeDetectorRef,
    @Inject( PLATFORM_ID ) private platformId: Object
  ) { }

  async ngOnInit(): Promise<void> {
    const {
      subject, aiGeneratedResponse, fromEmail,
      ccEmail, bccEmail, emailId, providerId,
      isDraftReply, aiSummaryResponse, emailAccount, files,
      body, tags
    } = this.emailData || {};
    this.tags = tags || [];
    this.attachments = files || [];
    this.emailAccount = emailAccount || '';
    this.emailId = emailId || '';
    this.provider = providerId || '';
    this.subject = subject || '';
    this.aiGeneratedResponse = aiGeneratedResponse || '';
    this.body = body || '';
    this.editorContent = ( aiGeneratedResponse ) ? aiGeneratedResponse.replace( /```(?:\s*html)?/gi, '' ) : '';
    this.isDraftReply = !!isDraftReply;
    this.summary = aiSummaryResponse || '';
    this.sanitizedSummary = this.sanitizer.bypassSecurityTrustHtml( this.summary || '' );
    this.safeBody = this.sanitizer.bypassSecurityTrustHtml( body || '' );
    this.toEmails = fromEmail ? [fromEmail] : [];
    this.ccEmails = ccEmail || [];
    this.bccEmails = bccEmail || [];
    this.showCcField = this.ccEmails?.length > 0;
    this.showCcBccOptions = this.ccEmails?.length > 0 || this.bccEmails?.length > 0;
    this.showBccField = this.bccEmails?.length > 0;

    if ( isPlatformBrowser( this.platformId ) ) {
      const Quill = ( await import( 'quill' ) ).default;
      const quillIcons = Quill.import( 'ui/icons' ) as any;
      quillIcons['attach'] = '<i class="material-icons" style="font-size: 20px;">attach_file</i>';
    }
  }

  modules = {
    ...QUILL_MODULES,
    toolbar: {
      ...QUILL_MODULES.toolbar,
      handlers: {
        attach: () => this.handleAttachClick()
      }
    }
  };

  onFocusToField(): void {
    this.showCcBccOptions = true;
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleExpandBody(): void {
    this.isExpandedBody = !this.isExpandedBody;
  }

  filterOptions() {
    const search = this.searchText.trim().toLowerCase();
    if ( search.length < 0 ) {
      this.filteredOptions = [];
      return;
    }

    this.filteredOptions = this.allTagOptions.filter(
      option =>
        option.toLowerCase().includes( search ) &&
        !this.tags.includes( option )
    );
  }

  onInputClick() {
    const search = this.searchText.trim().toLowerCase();
    this.filteredOptions = this.allTagOptions.filter(
      option =>
        option.toLowerCase().includes( search ) &&
        !this.tags.includes( option )
    );
  }

  closeDropdown() {
    this.filteredOptions = [];
  }

  handleKeydown( event: KeyboardEvent ) {
    const key = event.key;
    if ( key === ',' || key === 'Enter' ) {
      event.preventDefault();
      this.processInput( this.searchText );
      this.saveTag();
    }
  }

  processInput( input: string ) {
    const values = input
      .split( /[,]+/ )
      .map( val => val.trim() )
      .filter( val => val.length > 0 && !this.tags.includes( val ) );
    this.tags.push( ...values );
    this.searchText = '';
    this.filteredOptions = [];
  }

  selectOption( option: string ) {
    if ( !this.tags.includes( option ) ) {
      this.tags.push( option );
    }
    this.searchText = '';
    this.filteredOptions = [];
    this.saveTag();
  }

  removeTag( item: string ) {
    this.tags = this.tags.filter( tags => tags !== item );
    this.saveTag();
  }

  compareOptions( o1: any, o2: any ): boolean {
    return o1 === o2;
  }

  toggleCc(): void {
    this.showCcField = !this.showCcField;
  }

  toggleBcc(): void {
    this.showBccField = !this.showBccField;
  }

  handleClose(): void {
    this.onClose.emit();
  }

  addEmail( list: string[], input: string ): string[] {
    const trimmed = input.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( trimmed );
    return trimmed && isValid && !list.includes( trimmed ) ? [...list, trimmed] : list;
  }

  addTags( list: string[], input: string ): string[] {
    const trimmed = input.trim();
    return trimmed && !list.includes( trimmed ) ? [...list, trimmed] : list;
  }

  removeEmail( list: string[], email: string ): string[] {
    return list.filter( e => e !== email );
  }

  private buildPayload(): FormData {
    const formData = new FormData();
    formData.append( 'subject', this.subject );
    formData.append( 'body', this.editorContent );
    formData.append( 'isDraftReply', String( this.isDraftReply ) );
    this.toEmails.forEach( email => formData.append( 'to', email ) );
    this.ccEmails.forEach( email => formData.append( 'cc', email ) );
    this.bccEmails.forEach( email => formData.append( 'bcc', email ) );
    this.attachments?.forEach( file => formData.append( 'attachments', file ) );
    return formData;
  }

  private isFormValid(): boolean {
    return !!this.subject && !!this.editorContent && this.toEmails.length > 0;
  }

  saveTag() {
    this.formSubmitted = true;
    this.isLoading = true;
    const payload = {
      id: this.emailData._id ?? '',
      tags: this.tags
    };
    this.filteredOptions = [];
    this.tagsService.addTags( payload ).subscribe( {
      next: () => {
        this.snackbarService.show( EMAIL_UPDATE_TAGS_SUCCESS.message, EMAIL_UPDATE_TAGS_SUCCESS.status, EMAIL_UPDATE_TAGS_SUCCESS.icon );
        this.tagsService.getTagsDetail().subscribe( {} );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.snackbarService.show( err?.message || EMAIL_UPDATE_TAGS_FAILED.message, EMAIL_UPDATE_TAGS_FAILED.status, EMAIL_UPDATE_TAGS_FAILED.icon );
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } );
  }

  formatRecipients = ( emails: string[] ) =>
    emails.map( email => ( { emailAddress: { address: email } } ) );

  sendEmail(): void {
    for ( const file of this.newAttachments ) {
      this.attachments.push( file );
    }
    this.formSubmitted = true;
    if ( !this.isFormValid() ) {
      this.snackbarService.show( EMAIL_FIELDS_REQUIRED.message, EMAIL_FIELDS_REQUIRED.status, EMAIL_FIELDS_REQUIRED.icon );
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    formData.append( 'id', this.emailData._id ?? '' );
    formData.append( 'subject', this.subject );
    formData.append( 'body', JSON.stringify( { contentType: 'HTML', content: this.editorContent } ) );
    formData.append( 'toRecipients', JSON.stringify( this.formatRecipients( this.toEmails ) ) );
    formData.append( 'aiGeneratedResponse', this.aiGeneratedResponse );
    if ( this.ccEmails.length > 0 ) {
      formData.append( 'ccRecipients', JSON.stringify( this.formatRecipients( this.ccEmails ) ) );
    }
    if ( this.bccEmails.length > 0 ) {
      formData.append( 'bccRecipients', JSON.stringify( this.formatRecipients( this.bccEmails ) ) );
    }
    this.attachments?.forEach( file => formData.append( 'attachments', file ) );
    if ( this.tags.length ) formData.append( 'tags', JSON.stringify( this.tags ) );

    this.emailService.sendNewEmail( formData, this.emailAccount, this.provider ).subscribe( {
      next: () => {
        this.snackbarService.show( EMAIL_SENT_SUCCESS.message, EMAIL_SENT_SUCCESS.status, EMAIL_SENT_SUCCESS.icon );
        this.handleClose();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.snackbarService.show( err?.message || EMAIL_SEND_FAILED.message, EMAIL_SEND_FAILED.status, EMAIL_SEND_FAILED.icon );
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } );
  }

  saveToDraft(): void {
    this.formSubmitted = true;
    if ( !this.isFormValid() ) {
      const { message, status, icon } = EMAIL_DRAFT_REQUIRED;
      this.snackbarService.show( message, status, icon );
      return;
    }
    const payload = this.buildPayload() as unknown as ReplyEmailPayload;
    this.isLoading = true;
    this.emailService.saveDraft( payload, this.emailId, this.emailAccount, this.provider ).subscribe( {
      next: () => this.handleSuccess( EMAIL_DRAFT_SUCCESS ),
      error: ( error ) => this.handleError( error, EMAIL_DRAFT_FAILED )
    } );
  }

  viewFiles( s3FileName: string ): void {
    this.isLoading = true;
    this.fileSvc.viewFiles( s3FileName ).subscribe( {
      next: ( res ) => {
        window.open( res.signedUrl, '_blank', 'noopener,noreferrer' );
        this.cdr.markForCheck();
        this.isLoading = false;
      },
      error: ( error ) => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    } );
  }

  private handleSuccess( { message, status, icon }: any ): void {
    this.snackbarService.show( message, status, icon );
    this.fetchallEmails.emit();
    this.isLoading = false;
    this.handleClose();
    this.cdr.detectChanges();
  }

  private handleError( error: any, fallback: any ): void {
    const { message, status, icon } = fallback;
    this.snackbarService.show( error?.message || message, status, icon );
    this.isLoading = false;
    this.isFetchingNewResponse = false;
    this.cdr.detectChanges();
  }

  generateNewResponseModel(): void {
    this.openNewResponseModel = !this.openNewResponseModel;
  }

  generateNewResponse( data: string ): void {
    this.isFetchingNewResponse = true;
    const payload = {
      email: this.emailData,
      apiMessages: [{ role: "user", content: this.editorContent }],
      customPrompt: `${ data }`
    };
    this.emailService.generateNewResponse( payload ).subscribe( {
      next: ( res ) => {
        this.editorContent = res.newAiResponse?.replace( /```(?:\s*html)?/gi, '' );
        this.isFetchingNewResponse = false;
        this.cdr.detectChanges();
      },
      error: ( error ) => this.handleError( error, EMAIL_SEND_FAILED )
    } );
  }

  isRTL( text: string ): boolean {
    const rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlPattern.test( text );
  }

  get editorDirection(): 'rtl' | 'ltr' {
    return this.isRTL( this.editorContent ) ? 'rtl' : 'ltr';
  }

  handleAttachClick() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected( event: any ) {
    const files: FileList = event.target.files;
    if ( !files || files.length === 0 ) return;
    this.newAttachments = Array.from( files );
    this.fileInput.nativeElement.value = '';
  }

  removeAttachment( index: number ) {
    this.newAttachments.splice( index, 1 );
  }
}