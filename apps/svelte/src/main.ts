import { createMesurer } from "mesurer"
import { mount } from "svelte"
import App from "./App.svelte"
import "./index.css"

createMesurer()

const app = mount(App, { target: document.getElementById("app")! })

export default app
