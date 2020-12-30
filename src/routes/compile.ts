import {Request, Response, Router} from "express";
import {parseCompileRequest} from "../utils/CompileRequest";
import {Multer} from "multer";
import {CompileRequestProcessor} from "../utils/CompileRequestProcessor";

const fs = require("fs")

export const compileRoutes = (upload: Multer) => {
    const router = Router();

    router.post('/', upload.fields([{name: "file", maxCount: 1}, {name: "stylesheet", maxCount: 1}]), async (req: Request, res: Response) => {
        console.log("Received animation request")
        let compileRequest = parseCompileRequest(req.body)
        let files = req.files as {file: Express.Multer.File[], stylesheet: Express.Multer.File[]}
        compileRequest.file = files.file[0]
        compileRequest.stylesheetFile = files.stylesheet ? files.stylesheet[0] : undefined

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

    router.get('/examples', async (req: Request, res: Response) => {
        res.send(fs.readdirSync("examples").filter((folder :string) => folder[0] != '.'))
    });

    router.get('/example', async (req: Request, res: Response) => {
        const fileName = req.query.file
        const files :string[] = fs.readdirSync("examples/" + fileName)
        const manimFile = files.find((file:string) => file.endsWith('.manimdsl'))
        const stylesheetFile = files.find((file:string) => file.endsWith('.json'))
        const readManimFile = fs.readFileSync("examples/" + fileName + "/" + manimFile).toString()
        const readStylesheetFile = fs.readFileSync("examples/" + fileName + "/" + stylesheetFile).toString()
        res.send({"manimFile": readManimFile, "stylesheetFile": readStylesheetFile})
    });


    return router;
};
