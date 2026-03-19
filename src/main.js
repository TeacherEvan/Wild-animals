import { AppController } from './app/app-controller.js';

const app = new AppController(document);
app.bootstrap();

window.wildAnimalsApp = app;
