import express from 'express';
import { applySecurityMiddleware } from './middleware/security';
import {requestLogger, errorLogger} from "./middleware/logware";
import response from './config/responseMessage';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
applySecurityMiddleware(app);
app.use(requestLogger);
app.use(errorLogger);

app.get("/health-check", (req, res)=>{
    res.send(response.SUCCESS);
});

export default app;