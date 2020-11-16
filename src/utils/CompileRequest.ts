export interface CompileRequest {
    file: Express.Multer.File;
    stylesheetFile?: Express.Multer.File;
    pythonFile: boolean;
    outputName: string;
}

// Utility function to convert body to CompileRequest due to weak casting in TS
export function parseCompileRequest(body: any) {
    let compileRequest = body as CompileRequest
    compileRequest.pythonFile = body.pythonFile == "true"
    return compileRequest
}
