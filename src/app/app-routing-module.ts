import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './Pages/login/login';
import { System } from './Pages/system/system';
import { AuthGuard } from './Guards/auth.guard';
import { Home } from './Pages/system/home/home';
import { Rating } from './Pages/system/rating/rating';
import { Profile } from './Pages/system/profile/profile';



const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'system',
    component: System,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'rating', component: Rating },
      { path: 'profile', component: Profile },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
