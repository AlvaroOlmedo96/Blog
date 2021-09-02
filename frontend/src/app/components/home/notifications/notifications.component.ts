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
      console.log(this.user);
    })
  }

  async getNotifications(){
    let idList = [];
    this.user.notifications.filter( n => { if(n.receive != undefined && n.receive != null && n.receive != ''){idList.push(n.receive);} });
    await this.userSrv.getNotifications(this.authSrv.getToken(), idList).then( async (res) => {
      console.log("getNotifications()", res);
      res.forEach(async (notInfo) => {
        this.notifications.push(notInfo);
        //Obtiene userInfo de cada Notificacion
        await this.userSrv.getUsersById(this.authSrv.getToken(), notInfo.emiterUserId).then( async users => {
          for(let user of users){
            if(user.profileImg != '' && user.profileImg != null && user.profileImg != undefined){
              await this.authSrv.getProfileImg(user.profileImg).then( img => {
                let reader = new FileReader();
                if(!img.error){ 
                  reader.readAsDataURL(img);
                  reader.onload = (_event) => {
                    notInfo.profileImg = reader.result.toString();
                  }
                }else{notInfo.profileImg = '';}
              });
            }else{
              notInfo.profileImg = '';
            }
          };
        });
      });
      
    });
  }

  async acceptFriendRequest(notification){
    let body = {
      emiterUserId: notification.emiterUserId,
      receiverUserId: notification.receiveUserId,
      notificationId: notification._id
    }
    this.userSrv.acceptFriendRequest( this.authSrv.getToken(), body).then( res => {
      this.notifications = this.notifications.filter( not => not != notification);
    });
  }

  async declineFriendRequest(notification){
    let body = {
      emiterUserId: notification.emiterUserId,
      receiverUserId: notification.receiveUserId,
      notificationId: notification._id
    }
    this.userSrv.declineFriendRequest( this.authSrv.getToken(), body).then( res => {
      this.notifications = this.notifications.filter( not => not != notification);
    });
  }

}
