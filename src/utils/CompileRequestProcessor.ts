import {CompileRequest} from "./CompileRequest";
import {v4 as uuidv4} from 'uuid';

const fs = require("fs").promises;
const exec = require('node-exec-promise').exec;
const AdmZip = require('adm-zip');

export class CompileRequestProcessor {

    async compilerAvailable() {
        await fs.access("compiler.jar", fs.F_OK)
    }

    async generateAnimation(compileRequest: CompileRequest) {
        let uid = uuidv4()
        await exec(`java -jar compiler.jar "${compileRequest.file.path}" -o="${uid}/${compileRequest.outputName}.mp4" -p`)
        await fs.unlink(compileRequest.file.path)
        return uid
    }

    async packageAndReturnPath(uid: string, outputName: string, generatePython: boolean) {
        if (generatePython) {
            const animationZip = `${uid}/animation.zip`;
            const zip = new AdmZip();
            zip.addLocalFile(`${uid}/${outputName}.mp4`)
            zip.addLocalFile(`${uid}/${outputName}.py`)
            await fs.writeFile(animationZip, zip.toBuffer(), "binary")
            return animationZip
        } else {
            return `${uid}/${outputName}.mp4`
        }
    }

    async cleanup(uid: string) {
        await exec("rm -rf " + uid)
    }

}
