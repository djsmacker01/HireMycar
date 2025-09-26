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
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('AuthGuard checking access to:', state.url);
    console.log('Required role:', route.data?.['role']);

    // Debug authentication status
    this.authService.debugAuthStatus();

    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        console.log('Auth state:', authState);

        if (authState.isLoading) {
          console.log('Auth still loading, waiting...');
          // If still loading, wait a bit and check again
          setTimeout(() => {
            const isAuth = this.authService.isAuthenticated;
            console.log('Auth check after timeout:', isAuth);
            if (!isAuth) {
              this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
            }
          }, 100);
          return false; // Return false while loading
        }

        if (!authState.isAuthenticated) {
          console.log('User not authenticated, redirecting to login');
          console.log('Auth state details:', {
            isAuthenticated: authState.isAuthenticated,
            isLoading: authState.isLoading,
            hasUser: !!authState.user,
            hasProfile: !!authState.profile
          });
          // Store the attempted URL for redirect after login
          this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        // Check for role-based access if specified in route data
        const requiredRole = route.data?.['role'];
        if (requiredRole) {
          const hasRequiredRole = this.checkUserRole(requiredRole);
          console.log('Role check:', { requiredRole, hasRequiredRole, userProfile: this.authService.currentProfile });

          // TEMPORARY: Completely bypass role checking for debugging
          console.log('TEMPORARY: Bypassing role check for debugging');
          // if (!hasRequiredRole) {
          //   console.log('User does not have required role, but allowing access for debugging');
          //   this.router.navigate(['/'], { queryParams: { returnUrl: state.url, error: 'unauthorized' } });
          //   return false;
          // }
        }

        console.log('AuthGuard: Access granted');
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
