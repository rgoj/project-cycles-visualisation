import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { NgxWebstorageModule } from 'ngx-webstorage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CacheInterceptor } from './services/cache.interceptor';
import { DiagramFirstDraftComponent } from './components/diagram-first-draft/diagram-first-draft.component';
import { DiagramComponent } from './components/diagram/diagram.component';


@NgModule({
  declarations: [
    AppComponent,
    DiagramFirstDraftComponent,
    DiagramComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    NgxWebstorageModule.forRoot(),

    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
