import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UsersService } from 'src/app/services/users.service';
import {map} from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { SocketWebService } from 'src/app/services/socket-web.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  chargingData:boolean = true;
  user:User;
  notifications = [];

  constructor(private userSrv:UsersService, private routerActive: ActivatedRoute, private authSrv: AuthService, private socketSrv: SocketWebService) {
    this.routerActive.queryParams.subscribe(p => {
      this.user = JSON.parse(p.user);
      console.log(this.user);
    });
    this.socketSrv.cb_newNotification.subscribe( res => {
      console.log("SOCKET cb_newNotification Notification", res);
      this.notifications.unshift(res);
    });
  }

  ngOnInit(): void {
    this.initCharge();
  }

  async initCharge(){
    await this.getProfile();
    await this.getNotifications();

    this.chargingData = false;
  }

  async getProfile(){
    await this.userSrv.getUserById(this.authSrv.getToken(), this.user._id).then( res => {
      this.user = res;
    })
  }

  async getNotifications(){
    let idList = [];
    this.user.notifications.filter( n => { if(n.receive != undefined && n.receive != null && n.receive != ''){idList.push(n.receive);} });
    await this.userSrv.getNotifications(this.authSrv.getToken(), idList).then( res => {
      this.notifications = res;
    });
  }

  async acceptFriendRequest(notification){
    let body = {
      emiterUserId: notification.emiterUserId,
      receiverUserId: notification.receiveUserId,
      notificationId: notification._id
    }
    this.userSrv.acceptFriendRequest( this.authSrv.getToken(), body).then( res => {
      console.log(res);
    });
  }

  async declineFriendRequest(notification){
    let body = {
      emiterUserId: notification.emiterUserId,
      receiverUserId: notification.receiveUserId,
      notificationId: notification._id
    }
    this.userSrv.declineFriendRequest( this.authSrv.getToken(), body).then( res => {
      console.log(res);
      this.notifications = this.notifications.filter( not => not != notification);
    });
  }

}
