import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './core/layout/admin-layout/admin-layout.component';

export const routes: Routes = [

    {
        path: '',
        component: AdminLayoutComponent,
        //canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', loadChildren: () => import('../app/features/dashboard/dashboard.routes') },
            { path: 'network-config', loadChildren: () => import('../app/features/network-config/network-config.routes') },
            { path: 'network-flows', loadChildren: () => import('../app/features/network-flows/network-flows.routes') },
            { path: 'threat-detection', loadChildren: () => import('../app/features/threat-detection/threat-detection.routes') }
        
        ]
    },
    /*{
      path: 'auth',
      component: AuthLayoutComponent,
      children: [...]
    }*/
];
