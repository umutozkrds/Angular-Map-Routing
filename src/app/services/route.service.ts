import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RouteService {
    constructor(private http: HttpClient) { }

    getRoute(start: string, end: string) {
        const url = `${environment.apiUrl}/api/route`;
        console.log('Making request to:', url);

        return this.http.get(url, {
            params: {
                origin: start,
                destination: end
            }
        }).pipe(
            tap(response => console.log('Route API Response:', response)),
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

