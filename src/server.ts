import App from './app';
import 'dotenv/config';
import UserController from './controllers/user/user.controller';
import PlatformController from './controllers/platform/platform.controller';
import SpotifyController from './controllers/platform/spotify/spotify.controller';
import PlaylistController from './controllers/playlist/playlist.controller';
import PlaylistTracksController from './controllers/platform/playlistTracks/playlisttracks.controller';

const app = new App(
  [
    new UserController(),
    new PlatformController(),
    new SpotifyController(),
    new PlaylistController(),
    new PlaylistTracksController()
  ],
  process.env.PORT
);

// Connect to the database
app.connectDatabase();

app.listen();