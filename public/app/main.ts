import { bootstrap }    from '@angular/platform-browser-dynamic';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { HTTP_PROVIDERS } from '@angular/http';


import { LrComponent } from './components/lr.component';

bootstrap(LrComponent,[
    HTTP_PROVIDERS,
    disableDeprecatedForms(),
    provideForms()])
    .catch((err: any) => console.error(err));