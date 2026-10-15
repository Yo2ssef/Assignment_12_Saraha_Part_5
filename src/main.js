import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ORIGINS, PORT } from './config/config.js';
import { globalErrorHandling } from './middleware/index.js';
import { bootStrap } from './database/connection.database.js';
import { generateRateLimiter } from './common/utils/index.js';
import { authController, messageController, userController } from './modules/index.js';

const app = express()
await bootStrap(app, PORT)
const corsOptions = { origin: ORIGINS, optionsSuccessStatus: 200 }
const limiter = generateRateLimiter({ limit: 1000 })

app.set("trust proxy", true)
app.use(morgan("combined"), helmet(), cors(corsOptions), limiter, express.json())
app.use("/assets", express.static("./assets"))

app.use("/auth", authController)
app.use("/user", userController)
app.use("/message", messageController)

app.use(globalErrorHandling)
app.all("/*anyThing", (req, res) => res.status(404).json({ message: "Invalid app routing." }))