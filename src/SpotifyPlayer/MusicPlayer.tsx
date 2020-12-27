import React from 'react';
import styles from './App.module.css';
import { FaPause, FaPlay } from 'react-icons/fa';

interface States {
  loadingState?: string;
  playbackOn?: boolean;
  playbackPaused?: boolean;
  spotifyDeviceId?:string;
  spotifyPlayerReady?:boolean;
}

interface ISpotifyPlayerState {
  spotifyAccessToken: string;
  spotifyDeviceId: string;
  playbackOn: boolean;
  playbackPaused: boolean;
  playingRecordingId: string;
  changeState: (key: States) => void;
}


const MusicPlayer = ({
  playbackOn,
  spotifyAccessToken,
  playingRecordingId,
  spotifyDeviceId,
  playbackPaused,
  changeState,
}: ISpotifyPlayerState) => {



  const startPlayback = (spotify_uri: string) => {
    //spotify_uri = "spotify:track:5ya2gsaIhTkAuWYEMB0nw5"
    spotify_uri = `spotify:track:${spotify_uri}`;
    console.log('id uri', spotify_uri);
    // const _token = this.state.spotifyAccessToken;
    fetch(
      'https://api.spotify.com/v1/me/player/play?' +
        'device_id=' +
        spotifyDeviceId,
      {
        method: 'PUT',
        body: JSON.stringify({ uris: [spotify_uri] }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    )
      .then((resolve) => {
        console.log('resolve status', resolve.status);
        if (resolve.status === 403) {
          changeState({
            loadingState: 'you need to upgrade to premium for playback',
          });
        } else {
          changeState({
            loadingState: 'playback started',
            playbackOn: true,
            playbackPaused: false,
          });
          //  console.log('Started playback', this.state);
        }
      })
      .catch((error) => {
        changeState({ loadingState: 'playback error: ' + error });
      });
  };

  const resumePlayback = () => {
    console.log('in resumePlayback');
    fetch(
      'https://api.spotify.com/v1/me/player/play?' +
        'device_id=' +
        spotifyDeviceId,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    ).then(() => {
      changeState({ playbackPaused: false });
    });
    console.log('Started playback');
  };

  const pauseTrack = () => {
    console.log('in paused');
    fetch(
      'https://api.spotify.com/v1/me/player/pause?' +
        'device_id=' +
        spotifyDeviceId,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    ).then(() => {
      changeState({ playbackPaused: true });
    });
  };

  return (
    <div className={styles.player}>
      <div
        onClick={() => {
          if (!playbackOn) {
            startPlayback(playingRecordingId);
          } else if (playbackPaused) {
            resumePlayback();
          }
        }}
      >
        <FaPlay />
      </div>

      {playbackOn && (
        <div
          onClick={() => {
            if (!playbackPaused) {
              pauseTrack();
            }
          }}
        >
          <FaPause />
        </div>
      )}
    </div>
  );
};
export default MusicPlayer;
