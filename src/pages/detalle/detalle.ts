import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, IonicApp, ItemSliding, ModalController } from 'ionic-angular';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Pedidoventadetalle, Articulo, Pedidoventa } from '../../app/shared/sdk';
import { StringsRegex } from '../../wrappers/StringsRegex';
import { DbControllerProvider } from '../../providers/db-controller.provider';
import { PedidoPage } from '../pedido/pedido';
import { DetalleProvider } from '../../providers/detalle.provider';
import { ArticuloProvider } from '../../providers/articulo.provider';
import { Pedidos } from '../../wrappers/Pedidos';

@IonicPage()
@Component({
  selector: 'page-detalle',
  templateUrl: 'detalle.html',
})
export class DetallePage {

  dForma: FormGroup;
  showForm: boolean = false;
  id: any;
  action: string;
  detallesParaBorrar: Pedidoventadetalle[] = [];
  detallesParaActualizar: Pedidoventadetalle[] = [];
  detallesNuevosParaCrear: Pedidoventadetalle[] = [];
  _detalles: Array<Pedidoventadetalle> = [];
  isAdding: boolean = true;
  private articulos: Articulo[] = [];
  private _articulo: Articulo;
  private detalle: Pedidoventadetalle;
  private aux: Pedidoventadetalle = new Pedidoventadetalle();
  private pedidoForEdit: Pedidos = new Pedidos();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private detalleProvider: DetalleProvider,
    private articuloProvider: ArticuloProvider,
    private dbController: DbControllerProvider,
    private formBuilder: FormBuilder,
  ) {
    this.validarFormulario();
    this.id = this.navParams.get('id');
  }

  ionViewDidLoad() {
    this.articulos = this.dbController.getArticuloLocal();
    if (this.id == '' || this.id == null) {
      this.action = "Generar Pedido";
    } else {
      this.action = "Actualizar Pedido";
      this.detallesParaBorrar = [];
      this.pedidoForEdit = this.navParams.get('pedido');
      this.detalleProvider.getLocalById(this.id)
        .then(detallesLocal => {
          if (detallesLocal != null && detallesLocal.length > 0) {
            let jsonString = JSON.stringify(detallesLocal);
            let auxDetalles = <Pedidoventadetalle[]>JSON.parse(jsonString);
            for (let i = 0; i < auxDetalles.length; i++) {
              this.articuloProvider.getLocalArticuloById(auxDetalles[i].articuloId)
                .then(data => {
                  let jsonString = JSON.stringify(data);
                  let articulo = <Articulo[]>JSON.parse(jsonString);
                  auxDetalles[i].articulo = new Articulo(articulo[0]);
                })
            }
            this._detalles = auxDetalles;
          }
        })
        .catch(error => console.log(error))
    }
  }

  private validarFormulario() {
    this.dForma = this.formBuilder.group({
      cantidad: new FormControl('', [Validators.required, Validators.pattern(StringsRegex.greaterThanZero)]),
      descuento: new FormControl('', [Validators.required, Validators.pattern(StringsRegex.percentage)]),
      subTotal: new FormControl({ value: '', disabled: true }, [Validators.required]),
      articulo: new FormControl('', [Validators.required])

    })
  }

  private setDefaultForm() {
    this.detalle = new Pedidoventadetalle();
    this.detalle.cantidad = 1;
    this.detalle.subTotal = 0;
    this.detalle.porcentajeDescuento = 0;
  }

  private setFormValues(data: Pedidoventadetalle) {
    console.log(data);
    this.setSelectedArticulo(data.articuloId);
    this.detalle = data;
  }

  selectArticuloChange(selectedArticulo: Articulo) {
    this.detalle.articulo = selectedArticulo;
    this.detalle.articuloId = selectedArticulo.id;
    this.calculateSubtotal();
  }

  private setSelectedArticulo(articuloId: number) {
    if (articuloId != null) {
      this._articulo = this.articulos.find(a => a.id == articuloId)
    } else {
      this.dForma.get('articulo').setValue(null);
    }
  }

  calculateSubtotal() {
    if (this.detalle.articulo == null) return;
    let subTotal = 0;
    let cantidad = this.detalle.cantidad
    let articulo = this.detalle.articulo;
    let precio = articulo.precioVenta + (articulo.precioVenta * articulo.iva);
    let descuento = precio * (this.detalle.porcentajeDescuento / 100);
    subTotal = (cantidad * precio) - descuento;
    this.detalle.subTotal = subTotal;
  }

  addDetalle() {
    if (this.isAdding) { //Agregando nuevo detalle al arreglo
      console.log("Se agrego detalle")
      this.detallesNuevosParaCrear.push(this.detalle);
      let auxId = 1;
      for (const d of this._detalles) {
        auxId = auxId + d.id
      }
      this.detalle.id = auxId;
      this._detalles.push(this.detalle);
    } else {

      for (let i = 0; i < this._detalles.length; i++) {
        if (this._detalles[i].id == this.detalle.id) {
          console.log("Se actualizo detalle")
          this._detalles[i] = this.detalle;
          this.detallesParaActualizar.push(this.detalle);
        }
      }
    }
    this.seeForm(false, false);
  }

  seeForm(v: boolean, isAdding: boolean) {
    this.isAdding = isAdding;
    this.showForm = v;
    this.setDefaultForm();
    this.setSelectedArticulo(null);
  }

  deleteRow(refDetalle: Pedidoventadetalle, slidingItem: ItemSliding) {
    for (let i = 0; i < this._detalles.length; ++i) {
      if (this._detalles[i].id === refDetalle.id) {
        this._detalles.splice(i, 1);
      }
    }

    for (let i = 0; i < this.detallesParaActualizar.length; ++i) {
      if (this.detallesParaActualizar[i].id === refDetalle.id) {
        this.detallesParaActualizar.splice(i, 1);
      }
    }

    slidingItem.close();

    if (this.id != '') {
      this.detallesParaBorrar.push(refDetalle)
    }
  }

  editRow(refDetalle: Pedidoventadetalle, slidingItem: ItemSliding) {
    this.isAdding = false;
    this.seeForm(true, false);
    this.aux = refDetalle;
    this.setFormValues(this.aux);
    slidingItem.close();
  }

  cancel() {
    this.detalle = this.aux;
    this.seeForm(false, false);
  }

  generatePedido() {
    if (this.id == '') {
      this.navCtrl.push(PedidoPage, {
        id: '',
        detalles: this._detalles
      });
    } else {
      this.navCtrl.push(PedidoPage, {
        id: this.pedidoForEdit.id,
        detalles: this._detalles,
        pedidoForEdit: this.pedidoForEdit,
        detallesParaBorrar: this.detallesParaBorrar,
        detallesParaActualizar: this.detallesParaActualizar,
        detallesNuevosParaCrear: this.detallesNuevosParaCrear
      });
    }
  }

  //#region MENSAJES DE VALIDACION
  validation_messages = {
    'cantidad': [
      { type: 'required', message: '* Este campo es requerido.' },
      { type: 'pattern', message: '* Numeros enteros mayores a 0.' }
    ],
    'descuento': [
      { type: 'required', message: '* Este campo es requerido.' },
      { type: 'pattern', message: '* Numeros entre 0 - 100' }
    ],
    'requerido': [
      { type: 'required', message: '* Este campo es requerido.' }
    ]
  }
  //#endregion

}