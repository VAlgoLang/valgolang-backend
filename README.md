# VAlgoLang API Backend

VAlgoLang API Backend Server using Express and TypeScript

### Installation

#### Docker

If you haven't installed the VAlgoLang Compiler or want a quick way to startup the best way is to use docker:

` docker run -p 5000:5000 manimdsl/manimdsl-api  `

And go to `localhost:5000` in a browser.

#### Alternative Instructions

1. Clone this repo
2. Run `npm install` to get all the dependencies
3. If you'd like the latest published version then run `./fetchCompiler` to get the latest compiler (otherwise build 
your own jar file from the VAlgoLang repo and copy it into the root folder as `compiler.jar`)
4. Run `npm start` to start up the API Server (defaults to port 5000)

There is a basic test page to upload a VAlgoLang file to download either a zip or and mp4 containing your animation

### Endpoints

There is one main endpoint right now: `/compile` which takes a form-data as the body

It takes in a file with key "file", and then 2 properties: 
 - `pythonFile` (whether or not to download python file too)
 - `outputName` (the output filename for the animation) 
 
 
