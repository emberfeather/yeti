/**
 * Yeti app!
 */
 import { h, render } from "preact";
 import App from "../yeti/app";

 const container = document.getElementById("app")
 const app = <App />

 render(app, container);
