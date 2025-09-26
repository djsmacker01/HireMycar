import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SmartAuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        console.log('SmartAuthGuard: Checking access to', state.url);
        console.log('Required role:', route.data?.['role']);

        return this.authService.authState$.pipe(
            take(1),
            map(authState => {
                console.log('SmartAuthGuard: Auth state:', authState);

                // If user is not authenticated, show the component anyway but with limited functionality
                if (!authState.isAuthenticated) {
                    console.log('SmartAuthGuard: User not authenticated, but allowing access with limited functionality');
                    return true; // Allow access but component will handle the unauthenticated state
                }

                // Check for role-based access if specified
                const requiredRole = route.data?.['role'];
                if (requiredRole) {
                    const profile = this.authService.currentProfile();
                    const hasRequiredRole = this.checkUserRole(requiredRole, profile);
                    console.log('SmartAuthGuard: Role check:', { requiredRole, hasRequiredRole, userProfile: profile });

                    if (!hasRequiredRole) {
                        console.log('SmartAuthGuard: User does not have required role, but allowing access for now');
                        // For now, allow access but component will handle the role check
                        return true;
                    }
                }

                console.log('SmartAuthGuard: Access granted');
                return true;
            })
        );
    }

    private checkUserRole(requiredRole: string, profile: any): boolean {
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
