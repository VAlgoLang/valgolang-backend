# ManimDSL API Backend

ManimDSL API Backend Server using Express and TypeScript


### Installation

1. Clone this repo
2. Run `npm install` to get all the dependencies
3. If you'd like the latest published version then run `./fetchCompiler` to get the latest compiler (otherwise build 
your own jar file from the ManimDSL repo and copy it into the root folder as `compiler.jar`)
4. Run `npm start` to start up the API Server (defaults to port 5000)


### Endpoints

There is one main endpoint right now: `/compile` which takes a form-data as the body

It takes in a file with key "file", and then 2 properties: 
 - `pythonFile` (whether or not to download python file too)
 - `outputName` (the output filename for the animation) 
 
 
