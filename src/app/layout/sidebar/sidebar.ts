import {
  AfterViewInit,
  Component,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Signup } from '../../components/signup/signup';
import { Login } from '../../components/login/login';
import { ForgotPassword } from '../../components/forgot-password/forgot-password';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session/session-services';
import { UserServices } from '../../services/user/user-services';
import { UpdateUser } from '../../models/user.model';
import { TwoFactorAuth } from '../../components/two-factor-auth/two-factor-auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth-service';
import { UserStoreService } from '../../core/userStore';
import { EmailQueryParams } from '../../models/email.model';
import { EmailServices } from '../../services/email/email-services';
import { TruncatePipe } from '../../common/utils/truncate-Pipe';

export interface SidebarIcon {
  label: string;
  fontIcon: string;
}

export interface SidebarTopBottom {
  logo: string;
  expand: string;
  arrows: string;
  avatar: string;
  handle: string;
  handleWhite: string;
  shrinkOut: string;
  logoWithText: string;
  settingIcon: string;
  chevronDown: string;
  userIcon: string;
}

@Component( {
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    TruncatePipe,
    Signup,
    Login,
    ForgotPassword,
    MatIconModule,
    MatProgressSpinnerModule,
    TwoFactorAuth
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
} )

export class Sidebar implements AfterViewInit {
  isLoadingUser = true;
  @Input() user: UpdateUser | null = null;
  private userSubscription: Subscription | undefined;

  sidebarTopIcons: SidebarIcon[] = [
    { label: 'Emails', fontIcon: 'mailSharpIcon' },
    { label: 'Customers', fontIcon: 'groupSharp' },
    { label: 'Files', fontIcon: 'description' },
  ];

  sidebarTopBottom: SidebarTopBottom = {
    logo: 'assets/images/sidebar/logo.png',
    logoWithText: 'assets/images/sidebar/logowithimg.png',
    expand: 'assets/images/sidebar/expand.svg',
    arrows: 'assets/images/sidebar/arrows.svg',
    avatar: 'assets/images/sidebar/avatar.png',
    handle: 'assets/images/sidebar/handle.svg',
    handleWhite: 'assets/images/sidebar/handleWhite.svg',
    shrinkOut: 'assets/images/sidebar/shrinkOut.svg',
    settingIcon: 'assets/images/sidebar/setting.svg',
    chevronDown: 'assets/images/sidebar/chevron-down-fill.svg',
    userIcon: 'assets/images/sidebar/userIcon.svg',
  };

  isMobileSidebarOpen = true;
  isSidebarExpanded = false;
  isSignupOpen = false;
  isLoginOpen = false;
  isResetPasswordOpen = false;
  isTwoFactorAuthOpen = false;
  filters: EmailQueryParams = {
    page: 1, limit: 10, search: '', sortOrder: 'asc',
    sortBy: 'subject', startDate: '', endDate: '',
    emailAccount: '', emailStatus: '',
    searchKeys: {},
  };

  constructor(
    private router: Router,
    public sessionService: SessionService,
    private emailSvc: EmailServices,
    private userServices: UserServices,
    private authService: AuthService,
    private userStore: UserStoreService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    if ( this.user ) {
      this.isLoginOpen = false;
      this.router.navigate( ['/allEmails'] );
      this.cdr.detectChanges();
    } else {
      if ( this.sessionService.getRefreshToken() === "false" ) {
        this.isLoginOpen = true;
        this.cdr.detectChanges();
      }
      else {
        this.isLoginOpen = false;
        if ( this.router.url === `/settings?tab=accounts` ) this.router.navigate( ['/settings'], { queryParams: { tab: 'accounts' } } );
        else this.router.navigate( ['/allEmails'] );
        this.cdr.detectChanges();
      }
    }
    this.cdr.detectChanges();
  }

  ngOnChanges(): void {
    this.sidebarTopIcons = [
      { label: 'Emails', fontIcon: 'mailSharpIcon' },
      { label: 'Customers', fontIcon: 'groupSharp' },
      { label: 'Files', fontIcon: 'description' },
      { label: 'Knowledge Base', fontIcon: 'library_books' },
      ...( this.user?.roles?.includes( 'manager' ) ? [{ label: 'Account Overview', fontIcon: 'account_circle' }, { label: 'Manage Users', fontIcon: 'business' }] : [] )
    ];
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen
    this.userStore.setSidebarIconsState( this.isMobileSidebarOpen )
  }

  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  toggleTwoFactorAuth(): void {
    this.isTwoFactorAuthOpen = !this.isTwoFactorAuthOpen;
    this.isLoginOpen = !this.isLoginOpen;
  }

  toggleSignupPopupOpen(): void {
    this.isSignupOpen = true;
  }

  toggleSignupPopupClose(): void {
    this.isSignupOpen = false;
  }

  toggleLoginPopup(): void {
    this.isLoginOpen = !this.isLoginOpen;
  }

  toggleResetPasswordPopup(): void {
    this.isResetPasswordOpen = !this.isResetPasswordOpen;
  }

  toggleResetPopupOpenLogin(): void {
    this.isResetPasswordOpen = !this.isResetPasswordOpen;
    this.isLoginOpen = !this.isLoginOpen;
  }

  togglelink( item: string ): void {
    if ( item === 'Emails' ) {
      this.router.navigate( ['/allEmails'] );
    } else if ( item === 'Customers' ) {
      this.router.navigate( ['/customers'] );
    } else if ( item === 'Files' ) {
      this.router.navigate( ['/files'] );
    } else if ( item === 'Account Overview' ) {
      this.router.navigate( ['/accountOverview'] );
    } else if ( item === 'Knowledge Base' ) {
      this.router.navigate( ['/knowledgeBase'] );
    } else if ( item === 'Manage Users' ) {
      this.router.navigate( ['/organizations'] );
    } else if ( item === 'settings' ) {
      this.router.navigate( ['/settings'] );
    } else {
      this.router.navigate( ['/'] );
    }
  }

  logout(): void {
    this.authService.logout();
    this.userStore.clearUser();
    this.isLoginOpen = true;
  }

  isActiveLink( path: string ): boolean {
    if ( path === 'Emails' ) return this.router.url.includes( '/allEmails' );
    if ( path === 'Customers' ) return this.router.url.includes( '/customers' );
    if ( path === 'Files' ) return this.router.url.includes( '/files' );
    if ( path === 'Account Overview' ) return this.router.url.includes( '/accountOverview' );
    if ( path === 'Knowledge Base' ) return this.router.url.includes( '/knowledgeBase' );
    if ( path === 'Manage Users' ) return this.router.url.includes( '/organizations' );
    if ( path === 'settings' ) return this.router.url.includes( '/settings' );
    return false;
  }
}
