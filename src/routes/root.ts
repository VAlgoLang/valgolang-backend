import {Request, Response, Router} from "express";

export const rootRoutes = () => {
    const router = Router();

    router.get('/', async (req: Request, res: Response) => {
        res.send("Manim DSL API Backend");
    });

    return router;
};
