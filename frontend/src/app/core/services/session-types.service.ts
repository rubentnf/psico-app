import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { SessionType } from "../models/session-type.model";

export interface CreateSessionTypeDto {
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
    active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SessionTypesService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getAll(): Observable<SessionType[]> {
        return this.http.get<SessionType[]>(`${this.baseUrl}/session-types/all`);
    }

    create(dto: CreateSessionTypeDto): Observable<SessionType> {
        return this.http.post<SessionType>(`${this.baseUrl}/session-types`, dto);
    }

    update(id: string, dto: Partial<CreateSessionTypeDto>): Observable<SessionType> {
        return this.http.patch<SessionType>(`${this.baseUrl}/session-types/${id}`, dto);
    }
}