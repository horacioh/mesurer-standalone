import { createMesurer } from "mesurer"
import { render } from "solid-js/web"
import App from "./App"
import "./index.css"

createMesurer()

render(() => <App />, document.getElementById("app")!)
