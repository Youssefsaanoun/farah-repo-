import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'products/add', loadComponent: () => import('./pages/product-manage/product-manage.component').then(m => m.ProductManageComponent) },
    { path: 'products/edit/:id', loadComponent: () => import('./pages/product-manage/product-manage.component').then(m => m.ProductManageComponent) },
    { path: 'products/:id', component: ProductDetailComponent },
    { path: 'cart', component: CartComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'favorites', loadComponent: () => import('./pages/favorite/favorite.component').then(m => m.FavoriteComponent) },
    { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
    { path: 'my-orders', loadComponent: () => import('./pages/my-orders/my-orders.component').then(m => m.MyOrdersComponent) },
    { path: 'admin/stock', loadComponent: () => import('./pages/admin/stock/stock').then(m => m.StockComponent) },
    { path: 'admin/orders', loadComponent: () => import('./pages/admin/orders/orders.component').then(m => m.AdminOrdersComponent) },
    { path: 'admin/users', loadComponent: () => import('./pages/admin/user-management/user-management').then(m => m.UserManagementComponent) },
    { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    { path: '**', redirectTo: '' }
];
