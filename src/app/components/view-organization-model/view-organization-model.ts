import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UpdateUser, UserPayload } from '../../models/user.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ORGANIZATION } from '../../common/constants/constant';
import { OrganizationOption } from '../../models/organization.model';


@Component( {
  selector: 'app-view-organization-model',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule],
  templateUrl: './view-organization-model.html',
  styleUrl: './view-organization-model.css'
} )
export class ViewOrganizationModel implements OnInit {
  @Input() mode: 'create' | 'view' = 'create';
  @Input() loading: boolean = false;
  @Input() initialData: Partial<UpdateUser> = {};
  @Output() save = new EventEmitter<{ id?: string; updatedData: UserPayload }>();
  @Output() close = new EventEmitter<void>();
  @Input() organizationOptions: OrganizationOption[] = [];

  userForm!: FormGroup;
  availableRoles = ['user', 'manager'];
  constructor( private fb: FormBuilder ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group( {
      fullName: [this.initialData?.fullName || '', Validators.required],
      email: [this.initialData?.email || '', [Validators.required, Validators.email]],
      organizationId: [this.initialData?.organizationId || "", Validators.required],
      roles: [this.initialData?.roles || [], Validators.required]
    } );
    
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if ( this.userForm.invalid ) {
      this.userForm.markAllAsTouched();
      return;
    }

    const { email, ...rest } = this.userForm.value;
    const updatedData: UserPayload = {
      ...rest,
      roles: this.userForm.value.roles || []
    };

    this.save.emit( { id: this.initialData._id, updatedData } );
  }
}