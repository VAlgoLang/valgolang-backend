import {compileRoutes} from "./routes/compile";
import {examplesRoutes} from "./routes/examples";

const cors = require('cors');

export const rest = (): any => {

    const express = require('express');
    const bodyParser = require('body-parser');

    const multer = require('multer');
    // Could switch to memory storage byt
    const upload = multer({dest: 'uploads/'});

    const app: any = express();

    app.use(cors());

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(express.static('public'))

    app.use('/compile', compileRoutes(upload));
    app.use('/examples', examplesRoutes(upload));

    return app;

};
