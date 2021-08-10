import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {AvatarModule} from 'primeng/avatar';
import {AvatarGroupModule} from 'primeng/avatargroup';
import {DialogModule} from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import {MenuModule} from 'primeng/menu';
import {PanelMenuModule} from 'primeng/panelmenu';
import {ButtonModule} from 'primeng/button';
import { ProfileComponent } from './profile/profile.component';
import {TabMenuModule} from 'primeng/tabmenu';
import {FileUploadModule} from 'primeng/fileupload';
import {MessageModule} from 'primeng/message';

import {NgxImageCompressService} from 'ngx-image-compress';
import { ImageCropperModule } from 'ngx-image-cropper';
import { BlobImageService } from 'src/app/services/blobImages.service';

const routes: Routes =[
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent }
];

@NgModule({
  declarations: [
    HomeComponent,
    ProfileComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AvatarModule,
    AvatarGroupModule,
    DialogModule,
    ToastModule,
    MenuModule,
    PanelMenuModule,
    ButtonModule,
    TabMenuModule,
    FileUploadModule,
    MessageModule,
    ImageCropperModule
  ],
  providers: [
    NgxImageCompressService,
    BlobImageService
  ]
})
export class HomeModule { }
