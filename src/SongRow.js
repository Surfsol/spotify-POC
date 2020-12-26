import React, {useState} from "react";
import "./SongRow.css";
import SpotifyPlayerContainer from './SpotifyPlayer/SpotifyPlayerContainer'

function SongRow({ track, token }) {
  const [trackId, setTrackId] = useState()
  
  console.log(track);

 if (trackId){
   return (
    <SpotifyPlayerContainer  token={token} playingRecordingId={trackId}/> 
   )
 } else {
  return ( 
    <div className="songRow" onClick={() => setTrackId(track.id)}>
      <img className="songRow__album" src={track.album.images[0].url} alt="" />
      <div className="songRow__info">
        <h1>{track.name}</h1>
        <p>
          {track.artists.map((artist) => artist.name).join(", ")} -{" "}
          {track.album.name}
        </p>
      </div>
    </div>
  );
}
}

export default SongRow;
