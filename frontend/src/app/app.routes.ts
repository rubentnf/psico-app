import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { BookAppointmentComponent } from './features/appointments/book-appointment/book-appointment.component';
import { MyAppointmentsComponent } from './features/appointments/my-appointments/my-appointments.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './core/guards/admin.guard';
import { SessionTypesManagementComponent } from './features/admin/session-types-management/session-types-management.component';
import { AvailabilityManagementComponent } from './features/admin/availability-management/availability-management.component';
import { AppointmentsManagementComponent } from './features/admin/appointments-management/appointments-management.component';
import { PatientsListComponent } from './features/admin/patients-list/patients-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'appointments', component: BookAppointmentComponent },
            { path: 'my-appointments', component: MyAppointmentsComponent },
            {
                path: 'admin',
                component: AdminDashboardComponent,
                canActivate: [adminGuard],
                children: [
                    { path: '', redirectTo: 'session-types', pathMatch: 'full' },
                    { path: 'session-types', component: SessionTypesManagementComponent },
                    { path: 'availability', component: AvailabilityManagementComponent },
                    { path: 'appointments', component: AppointmentsManagementComponent },
                    { path: 'patients', component: PatientsListComponent },
                ]
            }
        ]
    }
];
