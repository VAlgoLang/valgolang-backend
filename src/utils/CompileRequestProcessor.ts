import {CompileRequest} from "./CompileRequest";
import {v4 as uuidv4} from 'uuid';
import {ChildProcessWithoutNullStreams} from "child_process";

const {exec, spawn} = require("child_process");
const fs = require("fs").promises;
const AdmZip = require('adm-zip');

export interface SpawnedProcess {
    process: ChildProcessWithoutNullStreams,
    compileRequest: CompileRequest,
    uid: string,
    complete: boolean
}

export class CompileRequestProcessor {

    async compilerAvailable() {
        await fs.access("compiler.jar", fs.F_OK)
    }

    generateAnimation(compileRequest: CompileRequest): SpawnedProcess {
        let uid = uuidv4()
        let args = ['-jar', "compiler.jar", `${compileRequest.file.path}`,  `-o=${uid}/${compileRequest.outputName}.mp4`];

        if (compileRequest.stylesheetFile) {
            args.push(`-s=${compileRequest.stylesheetFile.path}`)
        }
        if (compileRequest.pythonFile) {
            args.push("-p")
        }
        args.push(`-q=${compileRequest.quality || "low"}`)
        args.push("--progress_bars")
        return {
            process: spawn('java', args),
            uid: uid,
            compileRequest: compileRequest,
            complete: false
        }
    }

    async getBoundaries(compileRequest: CompileRequest) {
        return new Promise(((resolve, reject) => {
            let options = ""
            if (compileRequest.stylesheetFile) {
                options += `-s="${compileRequest.stylesheetFile.path}"`
            }
            exec(`java -jar compiler.jar "${compileRequest.file.path}" ${options} -b`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.log(stderr)
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
