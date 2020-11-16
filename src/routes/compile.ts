import {Request, Response, Router} from "express";
import {CompileRequest, parseCompileRequest} from "../utils/CompileRequest";
import {Multer} from "multer";
import {CompileRequestProcessor} from "../utils/CompileRequestProcessor";

export const compileRoutes = (upload: Multer) => {
    const router = Router();

    router.post('/', upload.fields([{name: "file", maxCount: 1}, {name: "stylesheet", maxCount: 1}]), async (req: Request, res: Response) => {
        console.log("Received animation request")
        let compileRequest = parseCompileRequest(req.body as CompileRequest)
        let files = req.files as {file: Express.Multer.File[], stylesheet: Express.Multer.File[]}
        compileRequest.file = files.file[0]
        compileRequest.stylesheetFile = files.stylesheet ? files.stylesheet[0] : undefined

        // set default to "out" and strip any extension
        if(!compileRequest.outputName || compileRequest.outputName.length === 0) {
            compileRequest.outputName = "out"
        } else {
            compileRequest.outputName = compileRequest.outputName.split(".")[0]
        }

        let requestProcessor = new CompileRequestProcessor();

        console.log("Generating animation")
        try {
            let folderUID = await requestProcessor.generateAnimation(compileRequest)
            console.log("Packing animation")
            let filePath = await requestProcessor.packageAndReturnPath(folderUID, compileRequest.outputName, compileRequest.pythonFile)

            res.download(filePath, async (err) => {
                if (!err) {
                    await requestProcessor.cleanup(folderUID)
                }
            });
        } catch (e) {
            res.send({success: false, message: e})
        }
    });

    router.post("/check", upload.single("file"), upload.single("stylesheet"), async (req: Request, res: Response) => {
        // TODO: Add flag to compiler to return whether compiled correctly (semantic and syntantic check)
    });

    return router;
};
