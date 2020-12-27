import React, { Component } from 'react';
//loads script
import { ScriptCache } from './ScriptCache';
import { SpotifyAccess } from './SpotifyAccess';
import { getSpotifyAccess } from './LocalStorageData';

import styles from './App.module.css';

import MusicPlayer from './MusicPlayer'

// must add "@types/spotify-web-playback-sdk": "^0.1.7", dependency

interface ISpotifyPlayerProps {
  playingRecordingId: string;
  token: string;
}

// interface States{
//   loadingState?: string,
//   playbackOn?: boolean,
//   playbackPaused?: boolean,
// }

interface ISpotifyPlayerState {
  loadingState: string;
  spotifyAccessToken: string;
  spotifyAccess: SpotifyAccess;
  spotifyDeviceId: string;
  spotifySDKLoaded: boolean;
  spotifyAuthorizationGranted: boolean;
  spotifyPlayerConnected: boolean;
  spotifyPlayerReady: boolean;
  spotifyPlayer: Spotify.SpotifyPlayer | undefined;
  playbackOn: boolean;
  playbackPaused: boolean;
}

class SpotifyPlayerContainer extends Component<
  ISpotifyPlayerProps,
  ISpotifyPlayerState
> {
  private connectToPlayerTimeout: any;

  public constructor(props: ISpotifyPlayerProps) {
    super(props);

    new ScriptCache([
      {
        name: 'https://sdk.scdn.co/spotify-player.js',
        callback: this.spotifySDKCallback,
      },
    ]);

    window.addEventListener('storage', this.authorizeSpotifyFromStorage);

    this.state = {
      loadingState: 'loading scripts',
      spotifyAccessToken: props.token,
      spotifyDeviceId: '',
      spotifyAuthorizationGranted: false,
      spotifyPlayerConnected: true,
      spotifyPlayerReady: false,
      spotifySDKLoaded: false,
      spotifyPlayer: undefined,
      spotifyAccess: SpotifyAccess.NOT_REQUESTED,
      playbackOn: false,
      playbackPaused: false,
    };
  }
  
  private spotifySDKCallback = () => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      if (this.state.spotifyAccess !== SpotifyAccess.DENIED) {
        console.log('in access', this.state.spotifyAccessToken);
        const spotifyPlayer = new Spotify.Player({
          name: 'React Spotify Player',
          getOAuthToken: (cb) => {
            cb(this.state.spotifyAccessToken);
          },
        });

        // Playback status updates
        spotifyPlayer.addListener('player_state_changed', (state) => {
          console.log('state in spotifyPlayer', state);
        });
        console.log('spotifyPlayer', spotifyPlayer)
        this.setState({
          loadingState: 'spotify scripts loaded',
          spotifyPlayer,
        });

        if (this.state.spotifyAccessToken !== null) {
          this.setState({
            spotifyAccess: SpotifyAccess.ALLOWED,
            loadingState: 'spotify token retrieved',
          });
          this.connectToPlayer();
        }
      } else {
        this.setState({ loadingState: 'spotify authorization rejected' });
      }
    };
  };

  private authorizeSpotifyFromStorage = (e: StorageEvent) => {
    console.log('in auth line 90', e);
    if (e.key === 'spotifyAuthToken') {
      const spotifyAccessToken = e.newValue;

      const spotifyAccess = getSpotifyAccess();
      //console.log('spotifyAccess', spotifyAccess);
      if (spotifyAccess === SpotifyAccess.DENIED) {
        this.setState({
          spotifyAccess: SpotifyAccess.DENIED,
          loadingState: 'spotify access denied',
        });
      } else if (spotifyAccessToken !== null) {
        this.setState({
          spotifyAccessToken: spotifyAccessToken,
          spotifyAccess: SpotifyAccess.ALLOWED,
          loadingState: 'spotify token retrieved',
        });
      }
      this.connectToPlayer();
    }
  };

  private connectToPlayer = () => {
    console.log('spotifyPlayer', this.state.spotifyPlayer);
    if (this.state.spotifyPlayer) {
      console.log('in clearTimeout');
      clearTimeout(this.connectToPlayerTimeout);
      // Ready
      console.log('spotifyPlayer', this.state.spotifyPlayer);
      this.state.spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        this.setState({
          loadingState: 'spotify player ready',
          spotifyDeviceId: device_id,
          spotifyPlayerReady: true,
        });
      });

      // Not Ready
      this.state.spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      this.state.spotifyPlayer.connect().then((ev: any) => {
        this.setState({ loadingState: 'connected to player' });
      });
    } else {
      console.log('in timeout');
      this.connectToPlayerTimeout = setTimeout(
        this.connectToPlayer.bind(this),
        900000
      );
    }
  };

  changeState = (pairs: any) => {
    this.setState(pairs)
  }
  

  render() {
    console.log(
      'paused',
      this.state.playbackPaused,
      'ready',
      this.state.spotifyPlayerReady
    );
    console.log('song id', this.props.playingRecordingId);
    return (
      <div className={styles.app}>
        <h3>Spotify</h3>
        {this.state.spotifyPlayerReady && <MusicPlayer
        spotifyAccessToken={this.state.spotifyAccessToken}
        playbackOn={this.state.playbackOn}
        playingRecordingId={this.props.playingRecordingId} 
        spotifyDeviceId={this.state.spotifyDeviceId}
        playbackPaused={this.state.playbackPaused}
        changeState={this.changeState}
        />}
        <p className={styles.statusMessage}>{this.state.loadingState}</p>
      </div>
    );
  }
}

export default SpotifyPlayerContainer;
