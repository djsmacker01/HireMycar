import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, take, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.isLoading) {
          // If still loading, wait a bit and check again
          setTimeout(() => {
            const isAuth = this.authService.isAuthenticated();
            if (!isAuth) {
              this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
            }
          }, 100);
          return false; // Return false while loading
        }

        if (!authState.isAuthenticated) {
          // Store the attempted URL for redirect after login
          this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        // Check for role-based access if specified in route data
        const requiredRole = route.data?.['role'];
        if (requiredRole) {
          const hasRequiredRole = this.checkUserRole(requiredRole);
          if (!hasRequiredRole) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }

  private checkUserRole(requiredRole: string): boolean {
    const profile = this.authService.currentProfile();
    if (!profile) {
      return false;
    }

    switch (requiredRole) {
      case 'owner': {
        return profile.user_type === 'owner' || profile.user_type === 'admin';
      }
      case 'admin': {
        return profile.user_type === 'admin';
      }
      case 'renter': {
        return profile.user_type === 'renter' || profile.user_type === 'owner' || profile.user_type === 'admin';
      }
      default: {
        return true;
      }
    }
  }
}
