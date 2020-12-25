import React, { useEffect, useState } from "react";
//allow to interact with spotify
import SpotifyWebApi from "spotify-web-api-js";
import axios from 'axios'
import { useStateValue } from "./StateProvider";
import Player from "./Player";
import { getTokenFromResponse } from "./spotify";
import "./App.css";
import Login from "./Login";

const spotifyApi = new SpotifyWebApi();


function App() {

  const [genres, setGenres] = useState()
  //bring in token to switch between login and player
  const [{ token }, dispatch] = useStateValue();

  useEffect(() => {
    // Get token from URL
    const hash = getTokenFromResponse();
    //after get access token, clear from url
    window.location.hash = "";
    let _token = hash.access_token;

    //put token in context ui
    if (_token) {
      spotifyApi.setAccessToken(_token);

      dispatch({
        type: "SET_TOKEN",
        token: _token,
      });

      axios('https://api.spotify.com/v1/me/playlists', {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + _token}
      })
      .then (response => console.log('from axiossssss',response));

      // spotifyApi.getPlaylist("2ETglc4ED0RIDdolf4i7vA").then((response) =>
      //   dispatch({
      //     type: "SET_DISCOVER_WEEKLY",
      //     discover_weekly: response,
      //   })
      // );

      spotifyApi.getMyTopArtists().then((response) =>
        dispatch({
          type: "SET_TOP_ARTISTS",
          top_artists: response,
        })
      );

      dispatch({
        type: "SET_SPOTIFY",
        spotify: spotifyApi,
      });

      //get user
      spotifyApi.getMe().then((user) => {
        console.log('show user', user)
        dispatch({
          type: "SET_USER",
          user,
        });
      });

      spotifyApi.getUserPlaylists().then((playlists) => {
        console.log('get user playlist', playlists)
        dispatch({
          type: "SET_PLAYLISTS",
          playlists,
        });
      });
    }
  }, [token, dispatch]);

  return (
    <div className="app">
      {!token && <Login />}
      {token && <Player spotify={spotifyApi} />}
    </div>
  );
}

export default App;
