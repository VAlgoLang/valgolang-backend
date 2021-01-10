import {compileRoutes} from "./routes/compile";
import {examplesRoutes} from "./routes/examples";
import {Express} from "express";

const cors = require('cors');
const rateLimit = require("express-rate-limit");
export const rest = (): any => {

    const express = require('express');
    const bodyParser = require('body-parser');

    const multer = require('multer');
    const upload = multer({dest: 'uploads/'});

    const app: Express = express();

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 20
    });

    app.use('/compile/compile', limiter);
    app.use('/compile', compileRoutes(upload));
    app.use('/examples', examplesRoutes(upload));

    return app;

};
