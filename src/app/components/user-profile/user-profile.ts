import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { UpdateUser, User } from '../../models/user.model';
import { UserServices } from '../../services/user/user-services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../common/utils/snackbar';
import { PROFILE_UPDATE_ERROR, PROFILE_UPDATE_SUCCESS } from '../../common/constants/message';
import { UserStoreService } from '../../core/userStore';
import { MatSelectModule } from '@angular/material/select';
import { OrganizationOption } from '../../models/organization.model';
import { ORGANIZATION } from '../../common/constants/constant';
import { OrganizationsServices } from '../../services/organizations/organizations-services';

@Component( {
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
} )
export class UserProfile {

  organizationOptions: OrganizationOption[] = [];
  user: UpdateUser | null = null;
  profileForm: FormGroup;
  submitted = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userStore: UserStoreService,
    public userServices: UserServices,
    private snackbarService: SnackbarService,
    private organizationSvc: OrganizationsServices
  ) {
    this.profileForm = this.fb.group( {
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      mobilePhone: ['', Validators.required],
      organizationId: [''],
      address: this.fb.group( {
        line1: [''],
        line2: [''],
        city: [''],
        zipCode: ['']
      } )
    } );

    this.userStore.user$.subscribe( user => {
      this.user = user;
      if ( user ) {
        this.profileForm.patchValue( {
          email: user.email || '',
          fullName: user.fullName || '',
          mobilePhone: user.mobilePhone || '',
          organizationId: user.organizationId || '',
          address: {
            line1: user.address?.line1 || '',
            line2: user.address?.line2 || '',
            city: user.address?.city || '',
            zipCode: user.address?.zipCode || ''
          }
        } );
      }
    } );
    this.fetchOrganizations();
  }

  isInvalidOrg(): boolean {
    const selectedOrgId = this.profileForm.get( 'organizationId' )?.value;
    return !!( selectedOrgId && !this.organizationOptions.some( opt => opt.id === selectedOrgId ) );
  }

  onSubmit() {
    this.submitted = true;
    if ( this.profileForm.valid ) {
      const updatedData: UpdateUser = {
        mobilePhone: this.profileForm.get( 'mobilePhone' )?.value || '',
        email: this.profileForm.get( 'email' )?.value || '',
        fullName: this.profileForm.get( 'fullName' )?.value || '',
        terms: false,
        address: this.profileForm.get( 'address' )?.value || {},
        organizationId: this.profileForm.get( 'organizationId' )?.value || '',
        roles: this.user?.roles,
        vectorStoreId: this.organizationOptions.filter( ( item: any ) => item.id === this.profileForm.get( 'organizationId' )?.value || '' )[0].vectorStoreId
      };

      const query = { id: this.user?._id, updatedData }
      this.isLoading = true;
      this.userServices.updateUserProfile( query ).subscribe( {
        next: () => {
          const { message, status, icon } = PROFILE_UPDATE_SUCCESS;
          this.snackbarService.show( message, status, icon );

          this.userServices.getUserDetail().subscribe( user => {
            this.userStore.setUser( user );
          } );
        },
        error: ( err ) => {
          const { message, status, icon } = PROFILE_UPDATE_ERROR;
          this.snackbarService.show( err?.message || message, status, icon );
        },
        complete: () => {
          this.isLoading = false;
        }
      } );
    }
  }

  fetchOrganizations( showSpinner: boolean = true ) {
    if ( showSpinner ) this.isLoading = true;
    this.organizationSvc.getOrganizationsDetail().subscribe( {
      next: res => {
        res.map( ( items ) => {
          this.organizationOptions.push( { id: items._id, value: items.name, key: items.name, vectorStoreId: items.vectorStoreId } )
        } )
        this.isLoading = false
      },
      error: () => { this.isLoading = false }
    } );
  }

}
