import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { UserProfile } from '../../components/user-profile/user-profile';
import { UpdatePassword } from '../../components/update-password/update-password';
import { EmailAccounts } from '../../components/email-accounts/email-accounts';
import { AIConfiguration } from '../../components/ai-configuration/ai-configuration';
import { UserStoreService } from '../../core/userStore';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component( {
  selector: 'app-settings',
  standalone: true,
  imports: [MatTabsModule, CommonModule, FormsModule, UserProfile, UpdatePassword, EmailAccounts, AIConfiguration],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
} )
export class Settings implements OnInit {
  selectedTabIndex = 0;
  private subscription!: Subscription;

  private tabMap: Record<string, number> = {
    profile: 0,
    security: 1,
    accounts: 2
  };

  subscriptions: Subscription[] = [];
  toggelSidebar: boolean = false;

  constructor( private route: ActivatedRoute, private cdr: ChangeDetectorRef,
    private userStore: UserStoreService, ) {

  }



  ngOnInit(): void {
    this.route.queryParams.subscribe( params => {
      const tabName = ( params['tab'] || '' ).toLowerCase();
      this.selectedTabIndex = this.tabMap[tabName] ?? 0;
    } );
    this.subscription = this.userStore.sidebarIconsState$.subscribe( value => {
      this.toggelSidebar = value;
      this.cdr.markForCheck();
    } );
  }

  ngAfterViewInit(): void {
    this.checkScreenSize();
  }

  @HostListener( 'window:resize', ['$event'] )
  onResize( event: any ) {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.toggelSidebar = window.innerWidth < 768;
  }
}


