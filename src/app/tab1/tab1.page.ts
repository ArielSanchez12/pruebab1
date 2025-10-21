import { Component } from '@angular/core';
import {
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonNote, 
  IonIcon, 
  IonChip, 
  IonTabs, 
  IonTabBar, 
  IonTabButton,
  IonAvatar,
  IonThumbnail,
  IonImg
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonIcon,
    IonChip,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonAvatar,
    IonThumbnail,
    IonImg,
    CommonModule,
    FormsModule
  ],
})
export class Tab1Page {
  gastos: any[] = [];
  totalGastado: number = 0;
  mesActual: string = '';

  ionViewWillEnter() {
    this.actualizarGastos();
  }

  actualizarGastos() {
    this.gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    this.totalGastado = this.gastos.reduce((suma, gasto) => suma + Number(gasto.monto), 0);
    this.mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  obtenerIniciales(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }

  obtenerColorParticipante(nombre: string): string {
    const colores: { [key: string]: string } = {
      'Juan': 'primary',
      'María': 'secondary',
      'Pedro': 'tertiary'
    };
    return colores[nombre] || 'medium';
  }
}