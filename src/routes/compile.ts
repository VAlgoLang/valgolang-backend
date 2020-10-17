import {Request, Response, Router} from "express";
import {CompileRequest} from "../utils/CompileRequest";
import {Multer} from "multer";
import {CompileRequestProcessor} from "../utils/CompileRequestProcessor";

export const compileRoutes = (upload: Multer) => {
    const router = Router();

    router.post('/', upload.single("file"), async (req: Request, res: Response) => {
        console.log("Received animation request")
        let compileRequest = req.body as CompileRequest
        compileRequest.file = req.file
        compileRequest.pythonFile = req.body.pythonFile === "on"

        // set default to "out" and strip any extension
        if(!compileRequest.outputName || compileRequest.outputName.length === 0) {
            compileRequest.outputName = "out"
        } else {
            compileRequest.outputName = compileRequest.outputName.split(".")[0]
        }

        let requestProcessor = new CompileRequestProcessor();

        console.log("Generating animation")
        let folderUID = await requestProcessor.generateAnimation(compileRequest)

        console.log("Packing animation")
        let filePath = await requestProcessor.packageAndReturnPath(folderUID, compileRequest.outputName, compileRequest.pythonFile)

        res.download(filePath, async (err) => {
            if (!err) {
                await requestProcessor.cleanup(folderUID)
            }
        });
    });

    return router;
};
