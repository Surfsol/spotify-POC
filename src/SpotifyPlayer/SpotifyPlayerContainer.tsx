import React, { Component } from 'react';
//loads script
import { ScriptCache } from './ScriptCache';
import { SpotifyAccess } from './SpotifyAccess';
import { getSpotifyAccess } from './LocalStorageData';
import { FaPause, FaPlay } from 'react-icons/fa';
import styles from './App.module.css';

// must add "@types/spotify-web-playback-sdk": "^0.1.7", dependency

interface ISpotifyPlayerProps {
  playingRecordingId: string;
  token: string;
}

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
        console.log('in access', this.state.spotifyAccessToken)
        const spotifyPlayer = new Spotify.Player({
          name: 'React Spotify Player',
          getOAuthToken: (cb) => {
            cb(this.state.spotifyAccessToken);
          },
        });

        // Playback status updates
        spotifyPlayer.addListener('player_state_changed', (state) => {
         console.log('state in spotifyPlayer',state);
        });

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
    console.log('spotifyPlayer', this.state.spotifyPlayer)
    if (this.state.spotifyPlayer) {
      console.log('in clearTimeout')
      clearTimeout(this.connectToPlayerTimeout);
      // Ready
      console.log('spotifyPlayer', this.state.spotifyPlayer)
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
        console.log('in timeout')
      this.connectToPlayerTimeout = setTimeout(
        this.connectToPlayer.bind(this),
        900000
      );
    }
  };
  // private startPlayback  {
  //     $.ajax({
  //       url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
  //       type: 'PUT',
  //       data: '{"uris": ["spotify:track:5ya2gsaIhTkAuWYEMB0nw5"]}',
  //       beforeSend: function (xhr) {
  //         xhr.setRequestHeader('Authorization', 'Bearer ' + _token);
  //       },
  //       success: function (data) {
  //         console.log(data);
  //       },
  //     });
  //   }

  private startPlayback = (spotify_uri: string) => {
    console.log('startPlayback access token', this.state.spotifyAccessToken, 'uri', spotify_uri)
    //spotify_uri = "spotify:track:5ya2gsaIhTkAuWYEMB0nw5"
    spotify_uri = `spotify:track:${spotify_uri}`
    console.log('id uri', spotify_uri)
   // const _token = this.state.spotifyAccessToken;
    fetch("https://api.spotify.com/v1/me/player/play?" +
        "device_id=" + this.state.spotifyDeviceId, {
        method: 'PUT',
        body: JSON.stringify({uris: [spotify_uri]}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.state.spotifyAccessToken}`
        }
        // data: '{"uris": ["spotify:track:5ya2gsaIhTkAuWYEMB0nw5"]}',
        // beforeSend: function (xhr: any) {
        //         xhr.setRequestHeader('Authorization', 'Bearer ' + _token);
        //     },
    })
    // const url =
    //   'https://api.spotify.com/v1/me/player/play?' +
    //   'device_id=' +
    //   this.state.spotifyDeviceId;
    // const headers = {
    //   'Content-Type': 'application/json',
    //   Authorization: `Bearer ${this.state.spotifyAccessToken}`,
    // };
    // const body = JSON.stringify({ uris: [spotify_uri] });
    // let params: RequestInit = {
    //   headers: headers,
    //   method: 'PUT',
    //   body: body,
    // };

    // fetch(url, params)
      .then((resolve) => {
        console.log('resolve status',resolve.status)
       // console.log('resolve line 159', resolve);
        if (resolve.status === 403) {
          this.setState({
            loadingState: 'you need to upgrade to premium for playback',
            spotifyAccess: SpotifyAccess.NO_PREMIUM,
          });
        } else {
          this.setState({
            loadingState: 'playback started',
            playbackOn: true,
            playbackPaused: false,
          });
        //  console.log('Started playback', this.state);
        }
      })
      .catch((error) => {
        this.setState({ loadingState: 'playback error: ' + error });
      });
  };

  private resumePlayback = () => {
    console.log('in resumePlayback')
    fetch(
      'https://api.spotify.com/v1/me/player/play?' +
        'device_id=' +
        this.state.spotifyDeviceId,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.state.spotifyAccessToken}`,
        },
      }
    ).then((ev) => {
      this.setState({ playbackPaused: false });
    });
    console.log('Started playback', this.state);
  };

  private pauseTrack = () => {
    console.log('in paused')
    fetch(
      'https://api.spotify.com/v1/me/player/pause?' +
        'device_id=' +
        this.state.spotifyDeviceId,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.state.spotifyAccessToken}`,
        },
      }
    ).then((ev) => {
      this.setState({ playbackPaused: true });
    });
  };

  render() {
    console.log('paused', this.state.playbackPaused, 'ready',this.state.spotifyPlayerReady)
    console.log('song id', this.props.playingRecordingId)
    return (
      <div className={styles.app}>
        <h3>Spotify</h3>
        <div className={styles.player}>
          {this.state.spotifyPlayerReady && (
            <div
              onClick={() => {
                console.log('in onClick', this.state.playbackOn)
                if (!this.state.playbackOn) {
                  this.startPlayback(this.props.playingRecordingId);
                } else if (this.state.playbackPaused) {
                    this.resumePlayback();
                  
                }
              }}
            >
              <FaPlay />
            </div>
          )}
          {this.state.spotifyPlayerReady && this.state.playbackOn && (
            <div
              onClick={() => {
                if (!this.state.playbackPaused) {
                  console.log('onClick pause 280')
                  this.pauseTrack();
                }
              }}
            >
              <FaPause />
            </div>
          )}
        </div>

        <p className={styles.statusMessage}>{this.state.loadingState}</p>
      </div>
    );
  }
}

export default SpotifyPlayerContainer;
