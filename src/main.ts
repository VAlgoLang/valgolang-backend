import { rest } from './rest';
import {CompileRequestProcessor} from "./utils/CompileRequestProcessor";

const app = rest();

const port = process.env.PORT || 5000;

new CompileRequestProcessor().compilerAvailable().then(r => {
    app.listen(port, () => console.log(`Backend service running at http://localhost:${port}`))
}).catch(() => {
    console.log("Manim DSL Compiler not downloaded, use fetchCompiler to get the compiler")
})

module.exports = app;
