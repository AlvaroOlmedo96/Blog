import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoLoginGuard implements CanActivate {
  constructor(private authSrv: AuthService, private router: Router){

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
      
        return this.authSrv.checkToken().then( (res:any) => {
            if(res){
              this.router.navigate(['home']);
              return false;
            }else{
              return true;
            }
        }).catch(error => {
            return true;
        });
  }
  
}
