import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonProgressBar, IonDatetime } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonProgressBar, IonDatetime,CommonModule,FormsModule],
})
export class Tab4Page {
  gastos: any[] = [];
  totalGastos: number = 0;
  promedioDaily: number = 0;
  mesActual: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  // categorías con palabras clave para eso de los reportes
  categorias = {
    comida: {
      nombre: 'Comida',
      palabras: ['café', 'pastel', 'pan', 'desayuno', 'almuerzo', 'comida', 'snack', 'supermercado', 'mercado', 'abarrotes'],
      total: 0,
      color: 'primary'
    },
    restaurantes: {
      nombre: 'Restaurantes',
      palabras: ['restaurante', 'cena', 'almuerzo restaurante', 'pizza', 'burger', 'comida rápida'],
      total: 0,
      color: 'secondary'
    },
    transporte: {
      nombre: 'Transporte',
      palabras: ['uber', 'taxi', 'transporte', 'gasolina', 'bus', 'metro', 'pasaje'],
      total: 0,
      color: 'tertiary'
    }
  };

  categoriasArray: any[] = [];

  ionViewWillEnter() {
    this.cargarReporte();
  }

  cargarReporte() {
    this.gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    this.mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    // Establecer fechas por defecto
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.fechaInicio = this.formatearFecha(primerDia);
    this.fechaFin = this.formatearFecha(hoy);

    this.calcularTotales();
    this.clasificarGastos();
    this.calcularPromedios();
    this.construirArrayCategorias();
  }

  calcularTotales() {
    this.totalGastos = this.gastos.reduce((suma, gasto) => suma + Number(gasto.monto), 0);
  }

  clasificarGastos() {
    this.categorias.comida.total = 0;
    this.categorias.restaurantes.total = 0;
    this.categorias.transporte.total = 0;

    this.gastos.forEach(gasto => {
      const descripcion = gasto.descripcion.toLowerCase();
      const monto = Number(gasto.monto);

      if (this.coincideCategoria(descripcion, this.categorias.comida.palabras)) {
        this.categorias.comida.total += monto;
      } else if (this.coincideCategoria(descripcion, this.categorias.restaurantes.palabras)) {
        this.categorias.restaurantes.total += monto;
      } else if (this.coincideCategoria(descripcion, this.categorias.transporte.palabras)) {
        this.categorias.transporte.total += monto;
      } else {
        this.categorias.comida.total += monto;
      }
    });
  }

  coincideCategoria(descripcion: string, palabras: string[]): boolean {
    return palabras.some(palabra => descripcion.includes(palabra.toLowerCase()));
  }

  calcularPromedios() {
    const diasDelMes = this.obtenerDiasDelMes();
    this.promedioDaily = this.totalGastos > 0 ? this.totalGastos / diasDelMes : 0;
  }

  obtenerDiasDelMes(): number {
    const hoy = new Date();
    return hoy.getDate();
  }

  construirArrayCategorias() {
    this.categoriasArray = [
      this.categorias.comida,
      this.categorias.restaurantes,
      this.categorias.transporte
    ];
  }

  calcularPorcentajeBarra(monto: number): number {
    return this.totalGastos > 0 ? monto / this.totalGastos : 0;
  }

  formatearFecha(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    return `${año}-${mes}-${dia}`;
  }

  onFechaInicioChange(event: any) {
    this.fechaInicio = event.detail.value;
  }

  onFechaFinChange(event: any) {
    this.fechaFin = event.detail.value;
  }
}