import App from './app';
import 'dotenv/config';
import UserController from './controllers/user/user.controller';

const app = new App(
  [
    new UserController(),
  ],
  process.env.PORT
);

// Connect to the database
app.connectDatabase();

app.listen();