import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { RouteOptions } from '../interfaces/route-options.interface';

interface RouteResponse {
    routes: Array<{
        duration: string;
        distanceMeters: number;
        polyline: {
            encodedPolyline: string;
        };
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class RouteService {
    private headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
    });

    constructor(private http: HttpClient) { }

    getRoute(start: string, end: string, options: RouteOptions) {
        const [startLat, startLng] = start.split(',').map(Number);
        const [endLat, endLng] = end.split(',').map(Number);

        const requestBody = {
            origin: {
                location: {
                    latLng: {
                        latitude: startLat,
                        longitude: startLng
                    }
                }
            },
            destination: {
                location: {
                    latLng: {
                        latitude: endLat,
                        longitude: endLng
                    }
                }
            },
            ...options
        };

        console.log('Sending request:', requestBody); // Debug log

        return this.http.post<RouteResponse>(`${environment.apiUrl}/api/route`, requestBody, { headers: this.headers })
            .pipe(
                tap(response => {
                    console.log('Route API Response:', response);
                    if (!response || !response.routes) {
                        console.error('Invalid response structure:', response);
                    }
                }),
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        console.error('API Error:', error);
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
        } else {
            // Server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        return throwError(() => errorMessage);
    }
}

