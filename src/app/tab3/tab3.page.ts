import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol,IonModal,IonButtons,IonButton} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol,IonModal,IonButtons,IonButton,CommonModule,FormsModule],
})
export class Tab3Page {
  gastos: any[] = [];
  totalRecibos: number = 0;
  fotoSeleccionada: string | null = null;
  modalAbierto: boolean = false;

  ionViewWillEnter() {
    this.cargarRecibos();
  }

  cargarRecibos() {
    this.gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    this.totalRecibos = this.gastos.length;
  }

  abrirFoto(foto: string) {
    this.fotoSeleccionada = foto;
    this.modalAbierto = true;
  }

  cerrarFoto() {
    this.modalAbierto = false;
    this.fotoSeleccionada = null;
  }

  obtenerIniciales(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }
}