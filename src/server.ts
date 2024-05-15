import App from './app';
import 'dotenv/config';
import UserController from './controllers/user/user.controller';
import PlatformController from './controllers/platform/platform.controller';

const app = new App(
  [
    new UserController(),
    new PlatformController()
  ],
  process.env.PORT
);

// Connect to the database
app.connectDatabase();

app.listen();