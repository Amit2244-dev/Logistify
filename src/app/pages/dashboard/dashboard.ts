import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-dashboard',
  imports: [MatMenuModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  dashboardIcons = {
    logo: 'assets/images/sidebar/noogata.svg',
    digitalShelf: 'assets/images/dashboard/digital-shelf.svg',
    favDown: 'assets/images/dashboard/fav-down.svg',
    share: 'assets/images/dashboard/share.svg',
    starTick: 'assets/images/dashboard/star-tick.svg',
    favLeft: 'assets/images/dashboard/fav-left.svg',
  };
}
