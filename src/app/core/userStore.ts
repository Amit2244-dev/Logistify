import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UpdateUser } from '../models/user.model';
import { EmailAddress, EmailQueryParams } from '../models/email.model';

@Injectable( { providedIn: 'root' } )
export class UserStoreService {
  private userSubject = new BehaviorSubject<UpdateUser | null>( null );
  private allEmailAccounts = new BehaviorSubject<EmailAddress[]>( [] );
  private allEmailFilters = new BehaviorSubject<EmailQueryParams[]>( [] );
  private tempTokenSubject = new BehaviorSubject<string | null>( null );
  private tags = new BehaviorSubject<string[] | null>( null );

  private sidebarIconsState = new BehaviorSubject<boolean>( false );
  sidebarIconsState$ = this.sidebarIconsState.asObservable();

  emailAccountsList$ = this.allEmailAccounts.asObservable();
  tagsList$ = this.tags.asObservable();
  allEmailFilters$ = this.allEmailFilters.asObservable();
  user$ = this.userSubject.asObservable();
  tempToken$ = this.tempTokenSubject.asObservable();

  setUser( user: UpdateUser ) {
    this.userSubject.next( user );
  }

  getUser(): UpdateUser | null {
    return this.userSubject.getValue();
  }

  toggleSidebarIcons(): void {
    this.sidebarIconsState.next( !this.sidebarIconsState.value );
  }

  setSidebarIconsState( value: boolean ): void {
    this.sidebarIconsState.next( value );
  }

  clearUser() {
    this.userSubject.next( null );
  }

  setEmailAccounts( emailAddresses: EmailAddress[] ) {
    this.allEmailAccounts.next( emailAddresses );
  }

  getEmailAccounts() {
    return this.allEmailAccounts.getValue();
  }

  clearEmailAccounts() {
    return this.allEmailAccounts.next( [] );
  }

  setTags( tags: string[] ) {
    this.tags.next( tags );
  }

  getTags() {
    return this.tags.getValue();
  }

  clearTags() {
    return this.tags.next( [] );
  }

  setEmailsfilter( emailQuery: EmailQueryParams[] ) {
    this.allEmailFilters.next( emailQuery );
  }

  getEmailsfilter() {
    return this.allEmailFilters.getValue();
  }

  setTempToken( token: string ) {
    this.tempTokenSubject.next( token );
  }

  getTempToken(): string | null {
    return this.tempTokenSubject.getValue();
  }

  clearTempToken() {
    this.tempTokenSubject.next( null );
  }

  clearAll() {
    this.clearUser();
    this.clearTempToken();
  }
}
