export interface CompileRequest {
    file: Express.Multer.File;
    pythonFile: boolean;
    outputName: string;
}
