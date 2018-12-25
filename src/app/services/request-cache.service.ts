// Based on:
// https://nrempel.com/guides/angular-httpclient-httpinterceptor-cache-requests/

import { Injectable } from '@angular/core';
import { HttpResponse } from "@angular/common/http";

import { LocalStorageService } from 'ngx-webstorage';


@Injectable({
  providedIn: 'root'
})
export class RequestCacheService {
  constructor(private storage: LocalStorageService) { }

  get(key): HttpResponse<any> {
    const tuple = this.storage.retrieve(key);

    if (!tuple) {
      console.log(`RequestCache: nothing found in cache for ${key}`)
      return null;
    }

    const expires = new Date(tuple[0]);
    const httpResponse = new HttpResponse(tuple[1]);

    // Don't observe expired keys
    const now = new Date();
    if (expires && expires.getTime() < now.getTime()) {
      console.log(`RequestCache: found cached response but it has already expired, clearing from cache`)
      this.storage.clear(key);
      return null;
    }

    console.log(`RequestCache: found the following and current response in the cache:`);
    console.log(httpResponse);
    return httpResponse;
  }

  set(key, value, ttl = null) {
    console.log(`RequestCache: Storing the following object under "${key}":`);
    console.log(value);
    console.log('with the following TTL:');
    console.log(ttl);

    if (ttl) {
      const expires = new Date();
      expires.setSeconds(expires.getSeconds() + ttl);
      this.storage.store(key, [expires, value]);
    } else {
      this.storage.store(key, [null, value]);
    }
  }
}
