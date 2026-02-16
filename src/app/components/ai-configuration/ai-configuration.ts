import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SnackbarService } from '../../common/utils/snackbar';
import { EMAIL_REPLY_PROMPT_FAILED, EMAIL_REPLY_PROMPT_SUCCESS } from '../../common/constants/message';
import { EmailServices } from '../../services/email/email-services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserStoreService } from '../../core/userStore';

@Component({
  selector: 'app-ai-configuration',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './ai-configuration.html',
  styleUrls: ['./ai-configuration.css']
})
export class AIConfiguration {
  loading: boolean = false;
  promptText: string = '';
  errorMsg: string = '';

  constructor(
    private emailService: EmailServices,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private userStore: UserStoreService
  ) {
    this.userStore.emailAccountsList$.subscribe(emailAccounts => {
      if (!emailAccounts || emailAccounts.length === 0) return;
      this.promptText = emailAccounts[0].customEmailReplyPrompt || '';
    });
  }

  onInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    if (input.value.length > 500) {
      this.promptText = input.value.slice(0, 500);
    }
    else if (input.value.length === 500) {
      this.errorMsg = 'Limit exceeded!';
    } else {
      this.errorMsg = '';
    }
  }

  save(): void {
    this.loading = true;
    const payload = {
      updateData: { customEmailReplyPrompt: this.promptText },
      query: {}
    }
    this.emailService.updateUserConfiguration(payload).subscribe({
      next: () => {
        this.snackbarService.show(EMAIL_REPLY_PROMPT_SUCCESS.message, EMAIL_REPLY_PROMPT_SUCCESS.status, EMAIL_REPLY_PROMPT_SUCCESS.icon);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackbarService.show(err?.message || EMAIL_REPLY_PROMPT_FAILED.message, EMAIL_REPLY_PROMPT_FAILED.status, EMAIL_REPLY_PROMPT_FAILED.icon);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

}
