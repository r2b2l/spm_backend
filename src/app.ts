import express from 'express';
import mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import 'dotenv/config';
import verifyTokenMiddleware from './middlewares/verifiyToken.middleware';
import errorMiddleware from './middlewares/error.middleware';
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

    // When in production use __dirname to have static folder, when in dev use src
    this.app.use('/static', express.static('./src/public'));
    this.app.use(bodyParser.json()); // for parsing application/json
    this.app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    this.port = port;

    this.initializeControllers(controllers);
    this.initializeMiddlewares();
  }

  /**
   * Initialize all middlewares
   */
  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(logRequestMiddleware);
    this.app.use(verifyTokenMiddleware);
    this.app.use(errorMiddleware);

    /**
     * PassportJS section
     * Needs express-session to store user session
     */
    // const passport = require('passport');
    // const session = require('express-session');
    // this.app.use(
    //   session({secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true})
    // );
    // // Initialize Passport!  Also use passport.session() middleware, to support
    // // persistent login sessions (recommended).
    // this.app.use(passport.initialize());
    // this.app.use(passport.session());

    // passport.serializeUser(function(user: any, done: any) {
    //   done(null, user);
    // });
    // passport.deserializeUser(function(user: any, done: any) {
    //   done(null, user);
    // });
  }

  public initializeControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      if (controller.path !== '/login' ||
      controller.path !== '/user/create' ||
      controller.path !== '/platform/connect/Spotify/callback') {
        this.app.use('', controller.router);
      }
      // If route is in the list, don't attach token verification middleware, even if already check '/login'
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