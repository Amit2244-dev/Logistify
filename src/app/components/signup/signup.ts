import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { UserServices } from '../../services/user/user-services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackbarService } from '../../common/utils/snackbar';
import { ACCOUNT_CREATED_FAILED, ACCOUNT_CREATED_SUCCESS } from '../../common/constants/message';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  @Output() onClose = new EventEmitter<void>();
  @Output() onLoginTrigger = new EventEmitter<void>();
  @Input() title?: boolean;

  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(private fb: FormBuilder, private userServices: UserServices, private snackbarService: SnackbarService) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
      ]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.matchPasswords });
  }

  get f() {
    return this.signupForm.controls;
  }

  private matchPasswords(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  triggerLogin(): void {
    this.onLoginTrigger.emit();
    this.onClose.emit();
  }

  handleSubmit(event?: Event): void {
    event?.preventDefault();
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.userServices.signup(this.signupForm.value).subscribe({
      next: () => {
        const { message, status, icon } = ACCOUNT_CREATED_SUCCESS;
        this.isLoading = false;
        this.snackbarService.show(message, status, icon);
        this.triggerLogin();
      },
      error: (error) => {
        const { message, status, icon } = ACCOUNT_CREATED_FAILED;
        this.isLoading = false;
        this.snackbarService.show(error?.message || message, status, icon);
      }
    });
  }


}
