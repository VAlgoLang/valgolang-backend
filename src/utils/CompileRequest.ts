export interface CompileRequest {
    file: Express.Multer.File;
    stylesheetFile?: Express.Multer.File;
    pythonFile: string;
    outputName: string;
}
