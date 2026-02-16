import {
  ChangeDetectorRef, Component, EventEmitter, Inject, Output,
  PLATFORM_ID, ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuillModule } from 'ngx-quill';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { EmailContentType, EmailQueryParams, SendEmailPayload } from '../../models/email.model';
import { SnackbarService } from '../../common/utils/snackbar';
import { EmailServices } from '../../services/email/email-services';
import {
  EMAIL_FIELDS_REQUIRED, EMAIL_SEND_FAILED, EMAIL_SENT_SUCCESS
} from '../../common/constants/message';
import { UserStoreService } from '../../core/userStore';
import { QUILL_MODULES } from '../../common/constants/constant';

@Component({
  selector: 'app-send-mail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    QuillModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './send-mail.html',
  styleUrls: ['./send-mail.css']
})
export class SendMail {
  @Output() onClose = new EventEmitter<boolean>();
  @ViewChild('fileInput') fileInput: any;
  @ViewChild('quillEditor') quillEditorComponent: any;

  fromEmailSearch = '';
  fromEmail = '';
  showDropdown = false;
  fromEmailOptions: string[] = [];
  emailTypeFilter = '';
  filteredEmailAccounts: { value: string; viewValue: string, provider: string }[] = [];

  subject = '';
  editorContent = '';
  toEmails: string[] = [];
  ccEmails: string[] = [];
  bccEmails: string[] = [];
  newToInput = '';
  newCcInput = '';
  newBccInput = '';
  showCcBccOptions = false;
  showCcField = false;
  showBccField = false;
  isLoading = false;
  loading = false;
  formSubmitted = false;

  attachments: File[] = [];

  filters: EmailQueryParams = {
    page: 1, limit: 10, search: '', sortOrder: 'asc',
    sortBy: 'subject', startDate: '', endDate: '',
    emailAccount: '', emailStatus: '',
    searchKeys: {},
  };

  modules = {
    ...QUILL_MODULES,
    toolbar: {
      ...QUILL_MODULES.toolbar,
      handlers: {
        attach: () => this.handleAttachClick()
      }
    }
  };

  constructor(
    private snackbar: SnackbarService,
    private emailSvc: EmailServices,
    private cdr: ChangeDetectorRef,
    private userStore: UserStoreService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      const Quill = (await import('quill')).default;
      const quillIcons = Quill.import('ui/icons') as any;
      quillIcons['attach'] = '<i class="material-icons" style="font-size: 20px;">attach_file</i>';
    }

    this.userStore.emailAccountsList$.subscribe(emailAccounts => {
      if (emailAccounts) this.filteredEmailAccounts = emailAccounts;
    });
  }

  get quillEditor() {
    return this.quillEditorComponent?.quillEditor;
  }

  filterEmailTypes(): void {
    const filterValue = this.emailTypeFilter.toLowerCase();
    this.filteredEmailAccounts = this.fromEmailOptions
      .filter(email => email.toLowerCase().includes(filterValue))
      .map(email => ({ value: email, viewValue: email, provider: email }));
  }

  selectEmail(email: string) {
    this.fromEmail = this.fromEmailSearch = email;
    this.showDropdown = false;
  }

  handleAttachClick() {
    this.fileInput.nativeElement.click();
  }

  hideDropdown() { setTimeout(() => this.showDropdown = false, 200); }
  onFocusToField() { this.showCcBccOptions = true; }
  toggleCc() { this.showCcField = !this.showCcField; }
  toggleBcc() { this.showBccField = !this.showBccField; }
  handleClose() { this.onClose.emit(true); }

  addEmail(list: string[], input: string): string[] {
    const trimmed = input.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !list.includes(trimmed) ? [...list, trimmed] : list;
  }

  removeEmail(list: string[], email: string): string[] {
    return list.filter(e => e !== email);
  }

  private isFormValid(): boolean {
    return !!this.subject && !!this.editorContent && this.toEmails.length > 0;
  }

  private mapEmail = (email: string) => ({ emailAddress: { address: email } });

  sendEmail(): void {
    this.formSubmitted = true;
    if (!this.isFormValid()) {
      this.snackbar.show(EMAIL_FIELDS_REQUIRED.message, EMAIL_FIELDS_REQUIRED.status, EMAIL_FIELDS_REQUIRED.icon);
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    formData.append('subject', this.subject);
    formData.append('body', JSON.stringify({ contentType: 'HTML', content: this.editorContent }));
    formData.append('toRecipients', JSON.stringify(this.toEmails.map(this.mapEmail)));

    if (this.ccEmails.length) formData.append('ccRecipients', JSON.stringify(this.ccEmails.map(this.mapEmail)));
    if (this.bccEmails.length) formData.append('bccRecipients', JSON.stringify(this.bccEmails.map(this.mapEmail)));
    this.attachments?.forEach(file => formData.append('attachments', file));

    const provider = this.filteredEmailAccounts.find(i => i.value === this.fromEmail)?.provider || '';

    this.emailSvc.sendNewEmail(formData, this.fromEmail, provider).subscribe({
      next: () => {
        this.snackbar.show(EMAIL_SENT_SUCCESS.message, EMAIL_SENT_SUCCESS.status, EMAIL_SENT_SUCCESS.icon);
        this.handleClose();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.snackbar.show(err?.message || EMAIL_SEND_FAILED.message, EMAIL_SEND_FAILED.status, EMAIL_SEND_FAILED.icon);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      this.attachments.push(file);
    }

    this.fileInput.nativeElement.value = '';
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }
}
