import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  chargingData:boolean = true;
  isBrowser:boolean = false;

  editProfileForm: FormGroup;
  isUpdatingProfile: Boolean = false;

  items: MenuItem[];
  activeItem: MenuItem;

  displayEditProfileModal:boolean = false;
  modalWidth = {width: '80vw'};

  user:User = {
    username : '',
    profileImg: '',
    profileCoverImg: '',
    biography: ''
  };
  profileImg: string = '';
  profileCoverImg: string = '';

  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService, private formBuilder: FormBuilder, private userSrv:UsersService) { 
    this.isBrowser = isPlatformBrowser(platformId);

    this.editProfileForm = this.formBuilder.group({
      profileImg: new FormControl(''),
      profileCoverImg: new FormControl(''),
      biography: new FormControl(this.user.biography),
    });

  }

  ngOnInit(): void {
    this.items = [
      {label: 'Publicaciones', icon: '', command: (event) => {
        //this.
      }},
      {label: 'Contactos', icon: ''},
    ];
    this.activeItem = this.items[0];

    this.initCharge();
  }

  async initCharge(){
    if(this.isBrowser){this.modalWidth = (window.innerWidth <= 1150) ? {width: '90vw'} : {width: '30vw'}};
    await this.getProfile();
    this.chargingData = false;
  }


  async getProfile(){
    await this.authSrv.getProfile().then( res => {
      this.user = res.user;
      let reader = new FileReader();
      let reader2 = new FileReader();

      if(!res.profileImgURL.error){ 
        reader.readAsDataURL(res.profileImgURL);
        reader.onload = (_event) => {
          this.profileImg = reader.result.toString();
        }
      }else{this.profileImg = '';}

      if(!res.profileCoverImgURL.error){ 
        reader2.readAsDataURL(res.profileCoverImgURL);
        reader2.onload = (_event) => {
          this.profileCoverImg = reader2.result.toString();
        }
      }else{this.profileCoverImg = '';}
    });
  }

  showEditProfile(){
    this.displayEditProfileModal = true;
  }

  lastFileOpened = '';
  openFile(inputId){
    this.lastFileOpened = inputId;
    document.getElementById(inputId).click();
  }

  uploadImg:any = {profileImg: '', profileCoverImg: ''};
  onBasicUpload(event){
    const file = event.target.files[0];
    //Para previsualizar
    var reader = new FileReader();
    reader.readAsDataURL(file); 
    reader.onload = (_event) => { 
      if(this.lastFileOpened == 'profileImgInput'){ this.uploadImg.profileImg = reader.result;}
      if(this.lastFileOpened == 'coverImgInput'){ this.uploadImg.profileCoverImg = reader.result;}
    }

    if(this.lastFileOpened == 'profileImgInput'){ this.editProfileForm.controls['profileImg'].setValue(file);}
    if(this.lastFileOpened == 'coverImgInput'){ this.editProfileForm.controls['profileCoverImg'].setValue(file);}
  }

  async updateProfile(){
    this.isUpdatingProfile = true;
    const profileImg = this.editProfileForm.controls['profileImg'].value;
    const profileCoverImg = this.editProfileForm.controls['profileCoverImg'].value;

    let credentials = {
      token: this.authSrv.getToken(),
      userId: this.user._id
    }

    let body = {
      token: this.authSrv.getToken(),
      userId: this.user._id,
      biography: this.editProfileForm.controls['biography'].value,
      profileImgURL: this.user.profileImg,
      profileCoverImgURL: this.user.profileCoverImg,
    }
    
    if(profileImg != null && profileImg != undefined && profileImg != ''){
      const formDataProfile = new FormData();
      formDataProfile.append('file', profileImg);
      await this.userSrv.updateProfileImages(credentials, 'profileImg', formDataProfile).then( res => {
        body.profileImgURL = res.profileImgURL;
      });
    }
    if(profileCoverImg != null && profileCoverImg != undefined && profileCoverImg != ''){
      const formDataCover = new FormData();
      formDataCover.append('file', profileCoverImg);
      await this.userSrv.updateProfileImages(credentials, 'profileCoverImg', formDataCover).then( res => {
        body.profileCoverImgURL = res.profileCoverImgURL;
      });
    }

    await this.userSrv.updateProfile(body).then( res => {
      this.displayEditProfileModal = false;   
    });
    this.isUpdatingProfile = false;
  }

}
