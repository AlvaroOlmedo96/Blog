import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

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
    profileImg: ''
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService, private formBuilder: FormBuilder) { 
    this.isBrowser = isPlatformBrowser(platformId);

    this.editProfileForm = this.formBuilder.group({
      profileImg: new FormControl(this.user.profileImg),
      profileCoverImg: new FormControl(this.user.profileCoverImg),
      biography: new FormControl(this.user.biography),
    });

  }

  ngOnInit(): void {
    this.initCharge();
    this.items = [
      {label: 'Publicaciones', icon: '', command: (event) => {
        //this.
      }},
      {label: 'Contactos', icon: ''},
    ];
    this.activeItem = this.items[0];
  }

  async initCharge(){
    if(this.isBrowser){this.modalWidth = (window.innerWidth <= 1150) ? {width: '90vw'} : {width: '30vw'}};
    await this.getProfile();
    this.chargingData = false;
  }


  async getProfile(){
    await this.authSrv.currentUser().then( (res:User) => {
      this.user = res;
    });
  }

  updateProfile(){

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
    
    console.log(this.editProfileForm.controls);
    
  }

}
