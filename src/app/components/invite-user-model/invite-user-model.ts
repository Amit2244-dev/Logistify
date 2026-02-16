import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ORGANIZATION } from '../../common/constants/constant';
import { OrganizationOption } from '../../models/organization.model';


@Component( {
  selector: 'app-invite-user-model',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './invite-user-model.html',
  styleUrls: ['./invite-user-model.css'],
} )
export class InviteUserModel {
  @Input() header: string = 'Send Invitation';
  @Input() loading: boolean = false;
  @Input() organizationOptions: OrganizationOption[] = [];

  @Output() save = new EventEmitter<{ organizationName: string; email: string, organizationId: string, vectorStoreId: string }>();
  @Output() close = new EventEmitter<void>();

  inviteForm: FormGroup;

  constructor( private fb: FormBuilder ) {
    this.inviteForm = this.fb.group( {
      organizationName: ['', Validators.required],
      email: [
        '',
        [Validators.required, Validators.pattern( /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ )]
      ],
    } );
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if ( this.inviteForm.invalid ) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    const selectedOrg = this.organizationOptions.find(
      option => option.value === this.inviteForm.get( 'organizationName' )?.value
    );
    this.save.emit( {
      organizationId: selectedOrg?.id || '',
      organizationName: this.inviteForm.get( 'organizationName' )?.value,
      email: this.inviteForm.get( 'email' )?.value,
      vectorStoreId: selectedOrg?.vectorStoreId || ''
    } );
  }
}