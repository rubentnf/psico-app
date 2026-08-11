import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { SessionType } from "../models/session-type.model";
import { Appointment, AppointmentStatus, AvailableSlot } from "../models/appointment.model";

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getSessionTypes(): Observable<SessionType[]> {
        return this.http.get<SessionType[]>(`${this.baseUrl}/session-types`);
    }

    getAvailableSlots(dateFrom: string, dateTo: string, sessionTypeId: string): Observable<AvailableSlot[]> {
        const params = new HttpParams()
            .set('dateFrom', dateFrom)
            .set('dateTo', dateTo)
            .set('sessionTypeId', sessionTypeId);

        return this.http.get<AvailableSlot[]>(`${this.baseUrl}/appointments/available-slots`, { params });
    }

    createAppointment(sessionTypeId: string, startAt: string): Observable<Appointment> {
        return this.http.post<Appointment>(`${this.baseUrl}/appointments`, { sessionTypeId, startAt });
    }

    getMyAppointments(): Observable<Appointment[]> {
        return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/mine`);
    }

    cancelAppointment(id: string): Observable<Appointment> {
        return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/cancel`, {});
    }

    getAllAppointments(status?: AppointmentStatus, dateFrom?: string, dateTo?: string): Observable<Appointment[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        if (dateFrom) params = params.set('dateFrom', dateFrom);
        if (dateTo) params = params.set('dateTo', dateTo);

        return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`, { params });
    }

    updateAppointmentStatus(id: string, status: AppointmentStatus): Observable<Appointment> {
        return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/status`, { status });
    }
}