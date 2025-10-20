import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideAnimations(),
    provideRouter(routes)
  ]
})
  .catch((err) => console.error(err));