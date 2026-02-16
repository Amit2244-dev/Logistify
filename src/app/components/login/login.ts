import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackbarService } from '../../common/utils/snackbar';
import { AuthService } from '../../services/auth/auth-service';
import { LOGIN_FAILED, LOGIN_PROFILE_LOAD_FAILED, LOGIN_SUCCESS, OTP_SENT_SUCCESS } from '../../common/constants/message';
import { UserStoreService } from '../../core/userStore';
import { Router } from '@angular/router';
import { UserServices } from '../../services/user/user-services';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  @Output() onClose = new EventEmitter<void>();
  @Output() onResetPasswordTrigger = new EventEmitter<void>();
  @Output() onSignUpTrigger = new EventEmitter<void>();
  @Output() onTwoFactorAuthTrigger = new EventEmitter<void>();

  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserServices,
    private snackbarService: SnackbarService,
    private userStore: UserStoreService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const credentials = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.tempToken !== '' && res.tempToken) {
          this.userStore.setTempToken(res.tempToken);
          const { message, status, icon } = OTP_SENT_SUCCESS;
          this.snackbarService.show(message, status, icon);
          this.onTwoFactorAuthTrigger.emit(); // Only emit if token is present?
        } else {
          this.onClose.emit();
          const { message, status, icon } = LOGIN_SUCCESS;
          this.snackbarService.show(message, status, icon);
          this.userService.getUserDetail().subscribe({
            next: (profile) => {
              this.userStore.setUser(profile);
              this.userStore.clearTempToken();
              const { message, status, icon } = LOGIN_SUCCESS;
              this.snackbarService.show(message, status, icon);
              this.router.navigate(['/allEmails']);
            },
            error: (err) => {
              const { message, status } = LOGIN_PROFILE_LOAD_FAILED;
              this.snackbarService.show(err?.message || message, status);
            }
          });
          this.router.navigate(['/allEmails']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        const { message, status, icon } = LOGIN_FAILED;
        this.snackbarService.show(error?.message || message, status, icon);
      }
    });
  }

  handleSignup(): void {
    this.onSignUpTrigger.emit();
    this.onClose.emit();
  }

  handleResetPassword(): void {
    this.onResetPasswordTrigger.emit();
    this.onClose.emit();
  }
}
