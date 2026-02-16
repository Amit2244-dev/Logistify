import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserServices } from '../../services/user/user-services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackbarService } from '../../common/utils/snackbar';
import { RESET_PASSWORD_FAILED, RESET_PASSWORD_SUCCESS } from '../../common/constants/message';
import { Router } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  @Input() onResetPasswordTrigger = new EventEmitter<void>();
  @Output() onLoginTrigger = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();
  @Output() openSignup = new EventEmitter<void>();
  @Output() onSignUpTrigger = new EventEmitter<void>();

  formSubmitted = false;
  isLoading = false;
  resetForm: FormGroup;

  constructor(private fb: FormBuilder, private userServices: UserServices, private snackbarService: SnackbarService, private router: Router) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.userServices.resetPassword(this.resetForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          const { message, status, icon } = RESET_PASSWORD_SUCCESS;
          this.snackbarService.show(message, status, icon);
          setTimeout(() => {
            this.openSignup.emit();
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          const { message, status, icon } = RESET_PASSWORD_FAILED;
          this.snackbarService.show(error?.message || message, status, icon);
        }
      });

    }
  }

  openLoginPopup(): void {
    this.onClose.emit();
    this.onSignUpTrigger.emit();
  }
}