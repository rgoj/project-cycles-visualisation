// Based on:
// https://nrempel.com/guides/angular-httpclient-httpinterceptor-cache-requests/

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpResponse,
  HttpRequest,
  HttpHandler,
  HttpInterceptor
} from '@angular/common/http';
import { RequestCacheService } from '../services/request-cache.service';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

const TTL = 10;

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private cache: RequestCacheService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const cachedResponse = this.cache.get(req.url);
    return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next);
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        // There may be other events besides the response.
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, event, TTL); // Update the cache.
        }
      })
    );
  }
}
