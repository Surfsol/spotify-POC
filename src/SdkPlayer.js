import React from 'react';
import { useStateValue } from './StateProvider';
import { ScriptCache } from './ScriptCache';

const SdkPlayer = ({ trackId }) => {
  const [{ token }] = useStateValue();

  new ScriptCache([
    {
      name: 'https://sdk.scdn.co/spotify-player.js',
      callback: spotifySDKCallback,
    },
  ]);

  window.addEventListener('storage', this.authorizeSpotifyFromStorage);

  // const script = document.createElement('script');
  // script.src = 'https://sdk.scdn.co/spotify-player.js';
  // document.body.appendChild(script);
  // console.log('inside sdk player', window.onSpotifyPlayerAPIReady);
  //<script src="https://sdk.scdn.co/spotify-player.js"></script>
  const spotifySDKCallback = () => {
    window.onSpotifyPlayerAPIReady = () => {
      const player = new Spotify.Player({
        name: 'Web Playback SDK Template',
        getOAuthToken: (cb) => {
          cb(_token);
        },
      });

      // Error handling
      player.on('initialization_error', (e) => console.error(e));
      player.on('authentication_error', (e) => console.error(e));
      player.on('account_error', (e) => console.error(e));
      player.on('playback_error', (e) => console.error(e));

      // Playback status updates
      player.on('player_state_changed', (state) => {
        console.log(state);
        $('#current-track').attr(
          'src',
          state.track_window.current_track.album.images[0].url
        );
        $('#current-track-name').text(state.track_window.current_track.name);
      });

      // Ready
      player.on('ready', (data) => {
        console.log('Ready with Device ID', data.device_id);

        // Play a track using our new device ID
        play(data.device_id);
      });

      // Connect to the player!
      player.connect();
    };
  };

  const song = `spotify:track:${trackId}`;
  // Play a specified track on the Web Playback SDK's device ID
  function play(device_id) {
    fetch({
      url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
      type: 'PUT',
      data: `{"uris": [${song}]}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      },
      success: function (data) {
        console.log(data);
      },
    });
  }

  return (
    <>
      <h1 class="text-salmon">Spotify Web Playback SDK Template</h1>
      <h4>
        This app uses the implicit grant authorization flow to get an access
        token and initialise the Web Playback SDK. It then uses the Spotify
        Connect Web API to play a song.
      </h4>
      <p>If everything is set up properly, you should hear some music!</p>
      <img id="current-track" />
      <h3 id="current-track-name"></h3>
      <a
        class="btn btn-salmon btn-lg"
        href="https://glitch.com/edit/#!/spotify-web-playback"
      >
        Get started!
      </a>
    </>
  );
};
export default SdkPlayer;
