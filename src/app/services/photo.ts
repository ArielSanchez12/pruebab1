import { Injectable } from '@angular/core';
import { Camera, CameraPhoto, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private GASTOS_FILE: string = 'gastos_detalles.txt';

  constructor() { }

  public async addNewToGallery(): Promise<UserPhoto> {
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100
      });

      const savedImageFile = await this.savePicture(capturedPhoto);
      this.photos.unshift(savedImageFile);

      await Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos)
      });

      console.log('Foto capturada y guardada:', savedImageFile);
      return savedImageFile;
    } catch (error) {
      console.error('Error al capturar foto:', error);
      throw error;
    }
  }

  public async loadSaved() {
    try {
      const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
      this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

      for (let photo of this.photos) {
        try {
          const file = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data
          });
          photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
        } catch (e) {
          console.warn('No se pudo leer la foto:', photo.filepath);
        }
      }

      console.log('Fotos cargadas desde almacenamiento:', this.photos);
    } catch (error) {
      console.error('Error al cargar fotos:', error);
    }
  }

  //guardar detalles del gasto en un archivo txt
  public async guardarDetalleGasto(
    descripcion: string,
    monto: number,
    quienPago: string,
    fecha: string
  ) {
    try {
      const detalleGasto = `
Descripción: ${descripcion}
Monto: $${monto.toFixed(2)}
Pagado por: ${quienPago}
Fecha: ${fecha}
Hora: ${new Date().toLocaleTimeString('es-ES')}
Fecha de registro: ${new Date().toLocaleDateString('es-ES')}
`;

      let contenidoActual = '';
      try {
        const fileRead = await Filesystem.readFile({
          path: this.GASTOS_FILE,
          directory: Directory.Data
        });
        if (typeof fileRead.data === 'string') {
          contenidoActual = fileRead.data;
        } else {
          contenidoActual = new TextDecoder().decode(new Uint8Array(Object.values(fileRead.data as any)));
        }
      } catch (e) {
        contenidoActual = '';
      }

      const nuevoContenido = contenidoActual + detalleGasto;
      const base64Content = btoa(unescape(encodeURIComponent(nuevoContenido)));

      await Filesystem.writeFile({
        path: this.GASTOS_FILE,
        data: base64Content,
        directory: Directory.Data
      });

      console.log('Detalle del gasto guardado en:', this.GASTOS_FILE);
      return true;
    } catch (error) {
      console.error('Error al guardar detalle del gasto:', error);
      throw error;
    }
  }

  //leer todos los detalles de gastos guardados
  public async leerDetallesGastos(): Promise<string> {
    try {
      const file = await Filesystem.readFile({
        path: this.GASTOS_FILE,
        directory: Directory.Data
      });

      let contenido = '';
      if (typeof file.data === 'string') {
        try {
          contenido = decodeURIComponent(escape(atob(file.data)));
        } catch {
          contenido = file.data;
        }
      } else {
        contenido = new TextDecoder().decode(new Uint8Array(Object.values(file.data as any)));
      }

      console.log('Detalles de gastos leídos:', contenido);
      return contenido;
    } catch (error) {
      console.error('Error al leer detalles de gastos:', error);
      return 'No hay detalles de gastos registrados';
    }
  }

  public async descargarDetallesGastos() {
    try {
      const contenido = await this.leerDetallesGastos();
      
      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
      
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `gastos_detalles_${new Date().getTime()}.txt`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      console.log('Archivo descargado correctamente');
      return true;
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw error;
    }
  }

  public async limpiarDetallesGastos() {
    try {
      await Filesystem.deleteFile({
        path: this.GASTOS_FILE,
        directory: Directory.Data
      });
      console.log('Archivo de detalles de gastos eliminado');
    } catch (error) {
      console.error('Error al limpiar detalles de gastos:', error);
    }
  }

  private async savePicture(photo: CameraPhoto): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(photo);

    const fileName = Date.now() + '.jpeg';
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data
      });
    } catch (error) {
      console.error('Error al escribir archivo:', error);
      throw error;
    }

    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }

  private async readAsBase64(photo: CameraPhoto): Promise<string> {
    try {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob) as string;
    } catch (error) {
      console.error('Error al leer imagen como base64:', error);
      throw error;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async deletePhoto(index: number) {
    const photo = this.photos[index];
    
    try {
      await Filesystem.deleteFile({
        path: photo.filepath,
        directory: Directory.Data
      });

      this.photos.splice(index, 1);

      await Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos)
      });

      console.log('Foto eliminada:', photo.filepath);
    } catch (error) {
      console.error('Error al eliminar foto:', error);
    }
  }

  public async clearPhotos() {
    try {
      for (let photo of this.photos) {
        await Filesystem.deleteFile({
          path: photo.filepath,
          directory: Directory.Data
        });
      }
      this.photos = [];
      await Preferences.remove({ key: this.PHOTO_STORAGE });
      console.log('Todas las fotos han sido eliminadas');
    } catch (error) {
      console.error('Error al limpiar fotos:', error);
    }
  }
}