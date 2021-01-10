import {Request, Response, Router} from "express";
import {parseCompileRequest} from "../utils/CompileRequest";
import {Multer} from "multer";
import {CompileRequestProcessor, SpawnedProcess} from "../utils/CompileRequestProcessor";
const fs = require("fs");

export const compileRoutes = (upload: Multer) => {
    const router = Router();

    const processes = new Map<string, SpawnedProcess>()

    router.post('/compile', upload.fields([{name: "file", maxCount: 1}, {name: "stylesheet", maxCount: 1}]), async (req: Request, res: Response) => {
        console.log("Received animation request")
        let compileRequest = parseCompileRequest(req.body)
        let files = req.files as {file: Express.Multer.File[], stylesheet: Express.Multer.File[]}
        compileRequest.file = files.file[0]
        compileRequest.stylesheetFile = files.stylesheet ? files.stylesheet[0] : undefined

        let requestProcessor = new CompileRequestProcessor();

        console.log("Generating animation")
        try {
            let spawnedProcess = requestProcessor.generateAnimation(compileRequest)
            processes.set(spawnedProcess.uid, spawnedProcess)
            spawnedProcess.process.on('close', (code) => {
                let process = processes.get(spawnedProcess.uid)!!
                process.complete = true
                processes.set(spawnedProcess.uid, process)

                fs.unlink(spawnedProcess.compileRequest.file.path, () => {
                    let logFile = `${process.uid}-stdout.log`;
                    fs.unlink(logFile, async () => {
                        console.log("Complete")
                    })
                })
            });

            spawnedProcess.process.stdout.pipe(fs.createWriteStream(`${spawnedProcess.uid}-stdout.log`))
            spawnedProcess.process.stderr.pipe(fs.createWriteStream(`${spawnedProcess.uid}-stdout.log`))

            res.send({success: true, data: spawnedProcess.uid, message: "Animation generation started"})
        } catch (e) {
            console.log(e)
            res.send({success: false, message: e})
        }
    });

    router.get('/status', async (req: Request, res: Response) => {
        let uid = req.query["uid"] as string;
        let logFile = `${uid}-stdout.log`;
        let spawnedProcess = processes.get(uid)
        if(spawnedProcess === undefined) {
            res.send({success: false, data: ["Video deleted"]})
            return
        } else {
            if(!spawnedProcess.complete) {
                let buffer = fs.readFileSync(logFile);
                let lines = buffer.toString().split("\r");
                res.send({success: true, data: lines.slice(-5)})
            } else {
                spawnedProcess = spawnedProcess!!
                console.log("Packing animation")
                let requestProcessor = new CompileRequestProcessor();
                let filePath = await requestProcessor.packageAndReturnPath(spawnedProcess!.uid, spawnedProcess!.compileRequest.outputName, spawnedProcess!.compileRequest.pythonFile)
                res.download(filePath, async (err) => {
                    if (!err) {
                        await requestProcessor.cleanup(uid)
                        processes.delete(spawnedProcess!!.uid)
                    }
                });
            }
        }
    });

    router.post("/boundaries", upload.fields([{name: "file", maxCount: 1}, {name: "stylesheet", maxCount: 1}]), async (req: Request, res: Response) => {
        // /boundaries?type=[auto | stylesheet]
        let compileRequest = parseCompileRequest(req.body)
        let files = req.files as {file: Express.Multer.File[], stylesheet: Express.Multer.File[]}
        compileRequest.file = files.file[0]
        compileRequest.stylesheetFile = files.stylesheet ? files.stylesheet[0] : undefined
        let requestProcessor = new CompileRequestProcessor();

        try {
            let boundaries = await requestProcessor.getBoundaries(compileRequest)
            res.send({success: true, data: boundaries})
        } catch (e) {
            res.send({success: false, message: e})
        }
    });

    return router;
};
