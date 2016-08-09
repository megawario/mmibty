"use strict";
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var forms_1 = require('@angular/forms');
var http_1 = require('@angular/http');
var lr_component_1 = require('./components/lr.component');
platform_browser_dynamic_1.bootstrap(lr_component_1.LrComponent, [
    http_1.HTTP_PROVIDERS,
    forms_1.disableDeprecatedForms(),
    forms_1.provideForms()])
    .catch(function (err) { return console.error(err); });
//# sourceMappingURL=main.js.map