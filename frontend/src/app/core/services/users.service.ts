import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { User } from "../models/user.model";

@Injectable({ providedIn: 'root' })
export class UsersService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getPatients(): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/users/patients`);
    }
}