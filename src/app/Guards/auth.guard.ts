import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAuth(state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAuth(state);
  }

  private checkAuth(state: RouterStateSnapshot): boolean {
    // LocalStorage dan ma'lumotlarni tekshirish
    const studentId = localStorage.getItem('studentId');
    const currentStudent = localStorage.getItem('currentStudent');

    // Ma'lumotlarni mavjudligini va to'g'riligini tekshirish
    if (studentId && currentStudent) {
      try {
        const student = JSON.parse(currentStudent);
        // Qo'shimcha tekshirish
        if (student.id && student.name && student.username) {
          return true; // Kirishga ruxsat
        }
      } catch (e) {
        console.error('Invalid student data:', e);
        this.clearStorage();
      }
    }

    // Login sahifasiga yo'naltirish va URL ni saqlash (agar kerak bo'lsa)
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  private clearStorage(): void {
    localStorage.removeItem('studentId');
    localStorage.removeItem('currentStudent');
  }
}