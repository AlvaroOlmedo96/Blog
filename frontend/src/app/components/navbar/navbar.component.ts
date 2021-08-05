import { Component, OnInit } from '@angular/core';
import {MenuItem, MessageService} from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  providers: [MessageService],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  navbarSearchText:string = '';
  options: MenuItem[];

  constructor(private authSrv: AuthService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.options = [
      {label: 'Setup', icon: 'pi pi-cog', routerLink: ['/login']},
      {label: 'Show Toast', icon: 'pi pi-info', command: () => {
        this.showToast('success');
      }},
      {separator:true},
      {label: 'SignOut', icon: 'pi pi-times', command: () => {
        this.authSrv.signOut();
      }}
    ];
  }

  showToast(severity){
    this.messageService.add({severity: severity, summary:'Success', detail:'Data Saved'});
  }

}
