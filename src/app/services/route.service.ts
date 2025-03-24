import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RouteService {
    constructor(private http: HttpClient) { }

    getRoute(start: string, end: string) {
        return this.http.get(`${environment.apiUrl}/api/route`, {
            params: {
                origin: start,
                destination: end
            }
        });
    }
}

