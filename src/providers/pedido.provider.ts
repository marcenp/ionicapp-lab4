import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite';
import { Pedidos } from '../wrappers/Pedidos';
import { Pedidoventa, PedidoventaApi } from '../app/shared/sdk';
import { Observable } from 'rxjs';

@Injectable()
export class PedidoProvider {

  // public properties

  db: SQLiteObject = null;

  constructor(public http: HttpClient, private pedidoventaApi: PedidoventaApi) { }

  // public methods
  setDatabase(db: SQLiteObject) {
    if (this.db === null) {
      this.db = db;
    }
  }

  createInServer(data: Pedidos): Observable<Pedidoventa> {
    let pedidoVentaData: Pedidoventa = new Pedidoventa();
    let jsonString = JSON.stringify(data);
    pedidoVentaData = <Pedidoventa>JSON.parse(jsonString);
    pedidoVentaData.id = null;
    return this.pedidoventaApi.create(pedidoVentaData);
  }

  createLocal(p: Pedidos) {
    p.migrado = 0;
    let sql = "INSERT INTO pedidoventa (nroPedido, fechaPedido, fechaEstimadaEntrega, gastosEnvio, estado, entregado, subTotal, montoTotal, migrado, clienteId, domicilioId) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
    return this.db.executeSql(sql, [p.nroPedido, p.fechaPedido, p.fechaEstimadaEntrega, p.gastosEnvio, p.estado, p.entregado, p.subTotal, p.montoTotal, p.migrado, p.clienteId, p.domicilioId]);
  }

  createTableLocal() {
    console.log("creando tabla pedido");
    let sql =
      `CREATE TABLE IF NOT exists pedidoventa(
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      nroPedido double NOT NULL,
      fechaPedido datetime NOT NULL,
      fechaEstimadaEntrega datetime DEFAULT NULL,
      gastosEnvio double NOT NULL,
      estado varchar(45) NOT NULL,
      entregado tinyint(1) NOT NULL,
      subTotal double NOT NULL,
      montoTotal double NOT NULL,
      migrado tinyint(1) NOT NULL,
      clienteId int(10) NOT NULL,
      domicilioId int(10) NOT NULL,
      CONSTRAINT clienteId FOREIGN KEY(clienteId) REFERENCES cliente(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT domiicilioId FOREIGN KEY(domicilioId) REFERENCES domicilio(id)
      )`;
    this.db.executeSql(sql, [])
      .then(() => console.log("creada tabla pedido"))
      .catch(error => console.log(error));
  }

  deleteLocal(p: Pedidos) {
    let sql = "DELETE FROM pedidoventa WHERE id=?";
    return this.db.executeSql(sql, [p.id]);
  }

  getAllLocal() {
    let sql = "SELECT * FROM pedidoventa";
    return this.db.executeSql(sql, [])
      .then(response => {
        let pedido = [];
        for (let index = 0; index < response.rows.length; index++) {
          pedido.push(response.rows.item(index));
        }
        return Promise.resolve(pedido);
      })
      .catch(error => Promise.reject(error));
  }

  updateLocal(p: Pedidos) {
    let sql = "UPDATE pedidoventa SET nroPedido=?, fechaPedido=?, fechaEstimadaEntrega=?,  gastosEnvio=?, estado=?, entregado=?, subTotal=?, montoTotal=?, clienteId=?, domicilioId=? WHERE id=?";
    return this.db.executeSql(sql, [p.nroPedido, p.fechaPedido, p.fechaEstimadaEntrega, p.gastosEnvio, p.estado, p.entregado, p.subTotal, p.montoTotal, p.clienteId, p.domicilioId, p.id]);
  }

  updateMigrarPedido(p: Pedidos, migrado: number) {
    let sql = "UPDATE pedidoventa SET migrado=? WHERE id=?";
    return this.db.executeSql(sql, [migrado, p.id]);
  }

  getLastInsertedId() {
    let sql = "SELECT seq FROM sqlite_sequence WHERE name='pedidoventa'";
    return this.db.executeSql(sql, [])
      .then(response => {
        let seq = [];
        for (let index = 0; index < response.rows.length; index++) {
          seq.push(response.rows.item(index));
        }
        return Promise.resolve(seq);
      })
      .catch(error => Promise.reject(error));
  }

}
