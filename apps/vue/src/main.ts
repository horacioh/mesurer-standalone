import { createMesurer } from "mesurer"
import { createApp } from "vue"
import App from "./App.vue"
import "./index.css"

createMesurer()
createApp(App).mount("#app")
