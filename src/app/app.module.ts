import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

//#region PAGES
import { HomePage } from '../pages/home/home';
import { PedidoPage } from '../pages/pedido/pedido';
import { TabsPage } from '../pages/tabs/tabs';
import { ClientePage } from '../pages/cliente/cliente';
import { ArticuloPage } from '../pages/articulo/articulo';
import { RubroPage } from '../pages/rubro/rubro';
import { DetallePage } from '../pages/detalle/detalle';
import { PedidosPage } from '../pages/pedidos/pedidos';
//#endregion

//#region PROVIDERS
import { ClienteProvider } from '../providers/cliente.provider';
import { ArticuloProvider } from '../providers/articulo.provider';
import { RubroProvider } from '../providers/rubro.provider';
import { PedidoProvider } from '../providers/pedido.provider';
import { DetalleProvider } from '../providers//detalle.provider';
import { DomicilioProvider } from '../providers/domicilio.provider';
import { DbControllerProvider } from '../providers/db-controller.provider';
//#endregion

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';

import { ClienteApi, SDKModels, InternalStorage, LoopBackAuth, PedidoventadetalleApi, ArticuloApi, RubroApi, PedidoventaApi, UsuariosApi, DomicilioApi } from './shared/sdk';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PedidoPage,
    DetallePage,
    ClientePage,
    ArticuloPage,
    RubroPage,
    PedidosPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: '',
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out',
      tabsPlacement: 'bottom',
      pageTransition: 'ios-transition'
    }),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    PedidoPage,
    DetallePage,
    TabsPage,
    ClientePage,
    RubroPage,
    ArticuloPage,
    PedidosPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    SQLite,
    ClienteProvider,
    DomicilioApi, UsuariosApi, ClienteApi, PedidoventaApi, RubroApi, ArticuloApi, PedidoventadetalleApi,
    HttpClientModule, SDKModels, InternalStorage, LoopBackAuth,
    RubroProvider,
    ArticuloProvider,
    PedidoProvider,
    DetalleProvider,
    DomicilioProvider,
    DbControllerProvider
  ]
})
export class AppModule { }
