import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UsersService } from 'src/app/services/users.service';
import {map} from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  chargingData:boolean = true;
  user:User;
  notifications = [];

  constructor(private userSrv:UsersService, private routerActive: ActivatedRoute, private authSrv: AuthService) {
    console.log(this.routerActive.queryParams);
    this.routerActive.queryParams.subscribe(p => {
      console.log(p)
      this.user = JSON.parse(p.user);
      console.log(this.user);
    });
  }

  ngOnInit(): void {
    this.initCharge();
  }

  async initCharge(){
    await this.getNotifications();

    this.chargingData = false;
  }

  async getNotifications(){
    let idList = [];
    this.user.notifications.filter( n => { if(n.receive != undefined && n.receive != null && n.receive != ''){idList.push(n.receive);} });
    await this.userSrv.getNotifications(this.authSrv.getToken(), idList).then( res => {
      console.log(res);
      this.notifications = res;
    })
  }

}
