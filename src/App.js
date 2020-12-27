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
  //console.log('token', token)
  useEffect(() => {
    // Get token from URL
    const hash = getTokenFromResponse();
    //after get access token, clear from url
    window.location.hash = "";
    let _token = hash.access_token;
     
    if (_token) {
      spotifyApi.setAccessToken(_token);

      dispatch({
        type: "SET_TOKEN",
        token: _token,
      });

      
      
      spotifyApi.getPlaylist("37i9dQZEVXcJZyENOWUFo7").then((response) =>
        dispatch({
          type: "SET_DISCOVER_WEEKLY",
          discover_weekly: response,
        })
      );

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
      {token && <Player token={token} spotify={spotifyApi} />}
    </div>
  );
}

export default App;
