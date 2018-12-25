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


// For now, during development, cache for a month and just flush the cache
// manually whenever necessary
const TTL = 31 * 24 * 3600;


@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private cache: RequestCacheService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log('CacheInterceptor: Intercepting request to: ' + req.url);

    const cachedResponse = this.cache.get(req.url);

    if (cachedResponse) {
      console.log('CacheInterceptor: Retrieved response from cache');
      return of(cachedResponse);
    } else {
      console.log('CacheInterceptor: Sending request to live URL');
      return this.sendRequest(req, next);
    }
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        // There may be other events besides the response.
        if (event instanceof HttpResponse) {
          console.log('CacheInterceptor: Caching the received response');
          this.cache.set(req.url, event, TTL); // Update the cache.
        }
      })
    );
  }
}
