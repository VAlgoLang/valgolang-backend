import {Request, Response, Router} from "express";
import {Multer} from "multer";

const fs = require("fs")

export const examplesRoutes = (upload: Multer) => {
    const router = Router();

    router.get('/list', async (req: Request, res: Response) => {
        res.send(fs.readdirSync("examples").filter((folder: string) => folder[0] != '.'))
    });

    router.get('/example', async (req: Request, res: Response) => {
        const fileName = req.query.file
        const files: string[] = fs.readdirSync(`examples/${fileName}`)
        const manimFile = files.find((file: string) => file.endsWith('.val'))
        const stylesheetFile = files.find((file: string) => file.endsWith('.json'))
        const readManimFile = fs.readFileSync(`examples/${fileName}/${manimFile}`).toString()
        const readStylesheetFile = fs.readFileSync(`examples/${fileName}/${stylesheetFile}`).toString()
        res.send({"manimFile": readManimFile, "stylesheetFile": readStylesheetFile})
    });

    router.get('/example/video', async (req: Request, res: Response) => {
        const fileName = req.query.file
        const filePath = `examples/${fileName}/example.mp4`
        res.download(filePath);
    });

    return router;
};
