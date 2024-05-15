import express from 'express';
import mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import 'dotenv/config';
import verifyTokenMiddleware from './middlewares/verifiyToken.middleware';
import cors from 'cors';

const logRequestMiddleware: express.RequestHandler = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: any, port: any) {
    this.app = express();

    this.app.use(bodyParser.json()); // for parsing application/json
    this.app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  /**
   * Initialize all middlewares
   */
  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(logRequestMiddleware);
    this.app.use(verifyTokenMiddleware);
  }

  public initializeControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      if (controller.path !== '/login' || controller.path !== '/user/create') {
        this.app.use('', controller.router);
      }
      // If route is /login, don't attach token verification middleware, even if already check '/login'
      this.app.use('', controller.router);
    });
  }

  /**
   * Établie la connexion à la base de données
   */
  public connectDatabase() {
    mongoose.connect('mongodb+srv://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD + process.env.MONGO_PATH + '/' + process.env.MONGO_DBNAME + '?retryWrites=true&w=majority');
    const db = mongoose.connection;

    db.on('error', console.error.bind(console, 'Erreur de connexion a la base de base de donnees'));
    db.once('open', () => {
      console.log('Connecte a la base de donnees');
    })
  }

  /**
   * Listen to the defined port
   */
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }

}

export default App;