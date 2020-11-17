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
    // set default to "out" and strip any extension
    if(!compileRequest.outputName || compileRequest.outputName.length === 0) {
        compileRequest.outputName = "out"
    } else {
        compileRequest.outputName = compileRequest.outputName.split(".")[0]
    }

    return compileRequest
}
