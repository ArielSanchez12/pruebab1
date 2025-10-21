import { Component } from '@angular/core';
import { 
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonFab,
  IonFabButton,
  IonDatetime,
  IonModal,
  IonDatetimeButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhotoService } from '../services/photo';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonChip,
    IonFab,
    IonFabButton,
    IonDatetime,
    IonModal,
    IonDatetimeButton,
    CommonModule,
    FormsModule
  ]
})
export class Tab2Page {
  nombreGasto: string = '';
  montoGasto: number | null = null;
  quienPago: string = '';
  listaNombres: string[] = ['Juan', 'María', 'Pedro'];
  participantesSeleccionados: string[] = [];
  fotoRecibo: string | null = null;
  fotoCapturada: boolean = false;
  fechaGasto: string = new Date().toISOString();
  fechaFormateada: string = '';

  constructor(public photoService: PhotoService) {
    this.actualizarFechaFormateada();
  }

  ionViewWillEnter() {
    this.cargarFotoCapturada();
  }

  // Actualizar la fecha formateada cuando cambia
  onFechaChange(event: any) {
    this.fechaGasto = event.detail.value;
    this.actualizarFechaFormateada();
  }

  // Formatear la fecha para mostrarla
  actualizarFechaFormateada() {
    const fecha = new Date(this.fechaGasto);
    this.fechaFormateada = fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

    // Formatear fecha para guardar
    const fechaSeleccionada = new Date(this.fechaGasto);
    const fechaGuardar = fechaSeleccionada.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });

    const gastoNuevo = {
      descripcion: this.nombreGasto,
      monto: this.montoGasto,
      usuario: this.quienPago,
      participantes: this.participantesSeleccionados.length > 0 ? this.participantesSeleccionados : [this.quienPago],
      fecha: fechaGuardar,
      fechaISO: this.fechaGasto,
      receiptPhoto: this.fotoRecibo
    };

    try {
      // Guardar en localStorage
      const gastosExistentes = JSON.parse(localStorage.getItem('gastos') || '[]');
      gastosExistentes.push(gastoNuevo);
      localStorage.setItem('gastos', JSON.stringify(gastosExistentes));

      // Guardar detalles en el txt
      await this.photoService.guardarDetalleGasto(
        this.nombreGasto,
        this.montoGasto,
        this.quienPago,
        fechaGuardar
      );

      // Limpiar formulario
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
    this.fechaGasto = new Date().toISOString();
    this.actualizarFechaFormateada();
    
    if (this.photoService.photos.length > 0) {
      await this.photoService.deletePhoto(0);
    }
  }
}