import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RouteService {
    constructor(private http: HttpClient) { }

    getRoute(start: string, end: string) {
        return this.http.get('http://localhost:3000/api/route', {
            params: {
                origin: start,
                destination: end
            }
        });
    }
}

