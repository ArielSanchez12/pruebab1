import { Component } from '@angular/core';
import { IonHeader,IonToolbar,IonTitle,IonContent,IonButtons,IonButton,IonIcon,IonItem,IonLabel,IonInput,IonSelect,IonSelectOption,IonChip,IonFab,IonFabButton} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhotoService } from '../services/photo';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader,IonToolbar,IonTitle,IonContent,IonButtons,IonButton,IonIcon,IonItem,IonLabel,IonInput,IonSelect,IonSelectOption,IonChip,IonFab,IonFabButton,CommonModule,FormsModule]
})
export class Tab2Page {
  nombreGasto: string = '';
  montoGasto: number | null = null;
  quienPago: string = '';
  listaNombres: string[] = ['Juan', 'María', 'Pedro'];
  participantesSeleccionados: string[] = [];
  fotoRecibo: string | null = null;
  fotoCapturada: boolean = false;

  constructor(public photoService: PhotoService) { }

  ionViewWillEnter() {
    this.cargarFotoCapturada();
  }

  alternParticipante(nombre: string) {
    const index = this.participantesSeleccionados.indexOf(nombre);
    if (index > -1) {
      this.participantesSeleccionados.splice(index, 1);
    } else {
      this.participantesSeleccionados.push(nombre);
    }
  }

  async capturarFoto() {
    try {
      const foto = await this.photoService.addNewToGallery();
      this.fotoRecibo = foto.webviewPath || null;
      this.fotoCapturada = true;
    } catch (error) {
      console.error('Error al capturar foto:', error);
      alert('Por favor intenta nuevamente');
    }
  }

  cargarFotoCapturada() {
    if (this.photoService.photos.length > 0) {
      const ultimaFoto = this.photoService.photos[0];
      this.fotoRecibo = ultimaFoto.webviewPath || null;
      this.fotoCapturada = this.fotoRecibo !== null;
    }
  }

  async registrarGasto() {
    if (!this.nombreGasto || !this.montoGasto || !this.quienPago || !this.fotoRecibo) {
      alert('Por favor completa todos los campos y captura la foto del recibo');
      return;
    }

    const gastoNuevo = {
      descripcion: this.nombreGasto,
      monto: this.montoGasto,
      usuario: this.quienPago,
      participantes: this.participantesSeleccionados.length > 0 ? this.participantesSeleccionados : [this.quienPago],
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      receiptPhoto: this.fotoRecibo
    };

    try {
      // guardar en localStorage
      const gastosExistentes = JSON.parse(localStorage.getItem('gastos') || '[]');
      gastosExistentes.push(gastoNuevo);
      localStorage.setItem('gastos', JSON.stringify(gastosExistentes));

      // guardar detalles en el txt
      await this.photoService.guardarDetalleGasto(
        this.nombreGasto,
        this.montoGasto,
        this.quienPago,
        gastoNuevo.fecha
      );

      // limpiar formulario
      this.limpiarFormulario();
      alert('Gasto registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      alert('Por favor intenta nuevamente');
    }
  }

  async descargarDetalles() {
    try {
      await this.photoService.descargarDetallesGastos();
      alert('Archivo descargado correctamente');
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el archivo');
    }
  }

  async limpiarFormulario() {
    this.nombreGasto = '';
    this.montoGasto = null;
    this.quienPago = '';
    this.participantesSeleccionados = [];
    this.fotoRecibo = null;
    this.fotoCapturada = false;
    
    if (this.photoService.photos.length > 0) {
      await this.photoService.deletePhoto(0);
    }
  }
}