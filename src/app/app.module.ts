import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// *******************************************************************************
// NgBootstrap

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// *******************************************************************************
// App

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { LayoutModule } from './layout/layout.module';

// *******************************************************************************
// Pages

import {HomeComponent} from "./home/home.component";
import {DetailComponent } from './detail/detail.component';
import {UnreleasedComponent} from "./unreleased/unreleased.component";
import {AdminComponent} from "./admin/admin.component";

import {HttpClientModule} from "@angular/common/http";
import {SharedModule} from "./shared/interfaces/shared.module";


import {ItemSingleService} from "./shared/services/itemsingle.service";
import {ItemListService} from "./shared/services/itemlist.service";
import {ItemSimpleListService} from "./shared/services/itemsimplelist.service";
import {StylesetService} from "./shared/services/styleset.service";






// *******************************************************************************
//

@NgModule({
  declarations: [
    AppComponent,

    // Pages
    HomeComponent,
    UnreleasedComponent,
    DetailComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    // App
    AppRoutingModule,
    LayoutModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [
    Title,
    AppService,
    ItemSimpleListService,
    ItemListService,
    ItemSingleService,
    StylesetService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
