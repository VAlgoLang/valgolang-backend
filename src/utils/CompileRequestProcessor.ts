import {CompileRequest} from "./CompileRequest";
import {v4 as uuidv4} from 'uuid';
const { exec } = require("child_process");
const fs = require("fs").promises;
const AdmZip = require('adm-zip');

export class CompileRequestProcessor {

    async compilerAvailable() {
        await fs.access("compiler.jar", fs.F_OK)
    }

    async generateAnimation(compileRequest: CompileRequest):Promise<string> {
        let uid = uuidv4()
        return new Promise(((resolve, reject) => {
            let options = ""

            if (compileRequest.stylesheetFile) {
                options +=  ` -s="${compileRequest.stylesheetFile.path}"`
            }
            if (compileRequest.pythonFile) {
                options += " -p"
            }
            options += ` -q="${compileRequest.quality}"`
            exec(`java -jar compiler.jar "${compileRequest.file.path}" -o="${uid}/${compileRequest.outputName}.mp4"${options}`, (error: any, stdout: any, stderr: any) => {
                if(error) {
                    console.log(stderr)
                    reject(stdout)
                } else {
                    fs.unlink(compileRequest.file.path).then(() => {
                        resolve(uid)
                    })
                }
            })
        }))
    }

    async getBoundaries(compileRequest: CompileRequest) {
        return new Promise(((resolve, reject) => {
            exec(`java -jar compiler.jar "${compileRequest.file.path}" -b`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    reject(stdout)
                } else {
                    fs.unlink(compileRequest.file.path).then(() => {
                        resolve(JSON.parse(stdout.split("\n")[1]))
                    })
                }
            })
        }))
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
