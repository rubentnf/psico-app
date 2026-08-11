import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WeeklyTemplate, AvailabilityException } from '../models/availability.model';

export interface CreateWeeklyTemplateDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    active?: boolean;
}

export interface CreateExceptionDto {
    date: string;
    type: 'blocked' | 'extra';
    startTime?: string;
    endTime?: string;
    reason?: string;
}

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getTemplates(): Observable<WeeklyTemplate[]> {
        return this.http.get<WeeklyTemplate[]>(`${this.baseUrl}/availability/templates`);
    }

    createTemplate(dto: CreateWeeklyTemplateDto): Observable<WeeklyTemplate> {
        return this.http.post<WeeklyTemplate>(`${this.baseUrl}/availability/templates`, dto);
    }

    deactivateTemplate(id: string): Observable<WeeklyTemplate> {
        return this.http.patch<WeeklyTemplate>(`${this.baseUrl}/availability/templates/${id}/deactivate`, {});
    }

    getExceptions(dateFrom: string, dateTo: string): Observable<AvailabilityException[]> {
        const params = new HttpParams().set('dateFrom', dateFrom).set('dateTo', dateTo);
        return this.http.get<AvailabilityException[]>(`${this.baseUrl}/availability/exceptions`, { params });
    }

    createException(dto: CreateExceptionDto): Observable<AvailabilityException> {
        return this.http.post<AvailabilityException>(`${this.baseUrl}/availability/exceptions`, dto);
    }

    deleteException(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/availability/exceptions/${id}`);
    }
}