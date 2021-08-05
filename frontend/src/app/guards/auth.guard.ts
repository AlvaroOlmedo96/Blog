import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authSrv: AuthService, private router: Router){

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){

        return this.authSrv.checkToken().then( (res:any) => {
          if(res){
            return true;
          }else{
            this.router.navigate(['login']);
            return false;
          }
        }).catch(error => {
          this.router.navigate(['login']);
          return false;
        });
  }
  
}
