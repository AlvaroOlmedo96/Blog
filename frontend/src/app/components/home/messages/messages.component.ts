import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { SocketWebService } from 'src/app/services/socket-web.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  chargingData: boolean = true;

  user:User;
  chats = [];
  currentChatMessages:any = [];
  currentChatRoomId = '';
  friendsList = [];
  selectedUserForChat: any = '';

  constructor(private authSrv: AuthService, private userSrv: UsersService, private socketSrv: SocketWebService) { 

    socketSrv.cb_newMessage.subscribe( async res => {
      console.log("SOCKET cb_newMessage", res);
      this.currentChatMessages.push(res);
    });
  }

  ngOnInit(): void {
    this.initCharge();
  }

  async initCharge(){
    await this.getProfile();
    await this.getFriends();
    if(this.chats.length > 0){
      this.selectedUserForChat = this.chats[0].userOfChat;
      this.currentChatRoomId = this.chats[0].chatId;
      this.getChat(this.currentChatRoomId).then( chat => {
        this.currentChatMessages = chat.chat.messages;
      });
    }else{
      this.selectedUserForChat = this.friendsList[0];
    }
    this.chargingData = false;
  }

  async getProfile(){
    await this.authSrv.getProfile().then( res => {
      this.user = res.user;

      this.getChatList(this.user.chats);
    });
  }

  async getChatList(chats){
    console.log("CHATS", chats);
    //Variamos la busqueda en función de si es un chat privado o un grupo
    let privateChats = chats.filter( c => c.typeChat === 'private');
    let groupChats = chats.filter( c => c.typeChat == 'group');

    console.log("Private Chats", privateChats);
    console.log("Group Chats", groupChats);

    //Obtenemos el id de los miembros del chat privado
    for(let pc of privateChats){
      let otherUserId = pc.members.find(m => m != this.user._id);//Obtenemos el userId del usuario con el que estamos hablando
      this.getUserById(otherUserId).then( userInfo => {
        this.chats.push({
          chatId: pc._id,
          userOfChat: userInfo[0]
        });
      });
    }
    console.log("CHATS WITH USERINFO", this.chats);

  }

  async getChat(chatRoomId){
    return this.userSrv.getChat(this.authSrv.getToken(), chatRoomId).then( res => {
      return res;
    });
  }
  async getFriends(){
    await this.userSrv.getUsersById(this.authSrv.getToken(), this.user.contacts).then( async res => {
      this.friendsList = res;
      let friendsWithData = [];
      for(let friend of this.friendsList){
        friend.label = friend.username;
        await this.getUserById(friend._id).then( user => {
          console.log(user);
          friendsWithData.push(user[0]);
        });
      }
      this.friendsList = friendsWithData;
    });
  }

  changeSelectedContact(contact){
    console.log(contact);
    this.currentChatRoomId = '';
    //Obtenemos la Info del user/chat seleccionado
    this.getUserById(contact._id).then( res => {
      this.selectedUserForChat = res[0];
    });
    //Comprobamos si ya tenemos un chat con ese usuario
    let alreadyInChat = false;
    for(let c of this.chats){
      if(c.userOfChat._id === contact._id){
        alreadyInChat = true;
        this.currentChatRoomId = c.chatId;
      }
    }
    
    if(alreadyInChat){
      this.getChat(this.currentChatRoomId).then( chat => {
        console.log(chat);
        this.currentChatMessages = chat.chat.messages;
        console.log(this.currentChatMessages);
      })
    }else{
      this.currentChatMessages = [];
    }
    
  }

  sendMessage(msg){
    console.log(msg.value);
    let receiverUser = {
      _id: this.selectedUserForChat._id,
      username: this.selectedUserForChat.username
    }
    let message = {
      msg: msg.value,
      emiterUserId: this.user._id,
      emiterUsername: this.user.username,
      receiveUserId: receiverUser._id,
      receiveUsername: receiverUser.username,
      createdAt: new Date(),
      isReaded: false
    };
    this.userSrv.sendMessage(this.authSrv.getToken(), this.currentChatRoomId, this.user, receiverUser, message).then( res => {
      console.log(res);
      msg.value = '';
      this.currentChatMessages.push(message);
    });
  }

  scrollBottom(){
    let message = document.getElementById('message');
    message.scrollIntoView({behavior: "smooth"});
  }

  async getUserById(userIds){
    let users = [];
    await this.userSrv.getUserById(this.authSrv.getToken(), userIds).then( async user => {
      if(user.profileImg != '' && user.profileImg != null && user.profileImg != undefined){
        await this.authSrv.getProfileImg(user.profileImg).then( img => {
          let reader = new FileReader();
          if(!img.error){ 
            reader.readAsDataURL(img);
            reader.onload = (_event) => {
              user.profileImg = reader.result.toString();
            }
          }else{user.profileImg = '';}
          users.push(user);
        });
      }else{
        users.push(user);
      }
    });
    return users;
  }

}
