import {Request, Response, Router} from "express";
import {CompileRequest} from "../utils/CompileRequest";
import {Multer} from "multer";
import {CompileRequestProcessor} from "../utils/CompileRequestProcessor";

export const compileRoutes = (upload: Multer) => {
    const router = Router();

    router.post('/', upload.single("file"), async (req: Request, res: Response) => {
        let compileRequest = req.body as CompileRequest
        compileRequest.file = req.file
        let requestProcessor = new CompileRequestProcessor();
        let folderUID = await requestProcessor.generateAnimation(compileRequest)
        let filePath = await requestProcessor.packageAndReturnPath(folderUID, compileRequest.outputName, compileRequest.pythonFile)
        res.download(filePath, async (err) => {
            if (!err) {
                await requestProcessor.cleanup(folderUID)
            }
        });
    });

    return router;
};
