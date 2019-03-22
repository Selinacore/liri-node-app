require("dotenv").config();

var axios = require ("axios");
var moment = require ("moment");
var keys = require ("./keys.js");
var Spotify = require ("node-spotify-api");
var spotify = new Spotify(keys.spotify);
var fs = require ("fs");

var command = process.argv[2];
var nodeArgs = process.argv.slice (3).join (" ");

function sWitch (command, nodeArgs) {
  console.log(`⮑\tcommand: ${command} args:${nodeArgs}`)

  switch (command) {
    case "movie-this":
      getMovie (nodeArgs);
      break;

    case "concert-this":
      getConcert (nodeArgs);
      break;

    case "spotify-this-song":
      getSpotify (nodeArgs);
      break;

    case "do-what-it-says":
      doWhatItSays ();
      break;

    default:
      console.log ("Please enter a valid command.");
      return;
  }
}

function getMovie (nodeArgs) {
  var movieName = nodeArgs;
  if (!movieName) {
    movieName = "Mr Nobody";
  }
  var queryUrl =
    "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&tomatoes=true&apikey=8b84b7d";

  console.log(`⮑\turl: ${queryUrl}`)

  axios.get (queryUrl)
    .then (function (jsonData) {
      // extract the spotify data
      const spotifyData = jsonData.data

      console.log ("------------------------------------------");
      console.log("Title: " + spotifyData.Title);
      console.log("Release Year: " + spotifyData.Year);
      console.log("IMdB Rating: " + spotifyData.imdbRating);
      console.log("Rotten Tomatoes Rating: " + spotifyData.Ratings[2].Value);
      console.log("Country: " + spotifyData.Country);
      console.log("Language: " + spotifyData.Language);
      console.log("Plot: " + spotifyData.Plot);
      console.log("Actors: " + spotifyData.Actors);
      console.log ("------------------------------------------");
    });
  }

function getConcert (nodeArgs) {
  var artist = nodeArgs;
  if (!artist) {
    artist = "Pink";
  }
  var queryUrl =
    "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=d299f3d77038a2beb28bb1122dce5ba9";

  console.log(`⮑\turl: ${queryUrl}`)

  axios
    .get (queryUrl)
    .then (function (jsonData) {
      // extract the spotify data
      const spotifyData = jsonData.data

      spotifyData.forEach(entry => {
        console.log("------------------------------------------");
        console.log("Venue Name: " + entry.venue.name);
        console.log("Venue Location: " + entry.venue.city);
        console.log (
          "Date of Event: " + moment(entry.datetime).format ("MM/DD/YYYY")
        );
        console.log ("------------------------------------------");
      })
    })
    .catch (function (err) {
      console.log (err);
    });
}

function getSpotify (nodeArgs) {
  var song = nodeArgs;
  if (!song) {
    song = "Can't Help Fallin In Love+Elvis Presley";
    console.log (song);
  }

  spotify.search({ type: 'track', query: song, limit: 10 }, (err, data) => {
    if (err) {
      return console.log('Error occurred: ' + err)
    }

    // console.log('----- DATA -----')
    // console.log(data)

    const { tracks } = data
    // console.log('----- TRACKS -----')
    // console.log(tracks)

    const { items } = tracks
    // console.log('----- ITEMS (ALBUMS) -----')
    // console.log('NUM ALBUMS: ', items.length)
    // console.log(items)

    items.forEach(item => {
      // console.log(item)
      console.log("------------------------------------------")
      console.log('Song Name:', item.name)
      console.log('Preview URL:', item.preview_url)

      const { artists } = item
      // console.log('----- ALBUM ARTISTS -----')
      // console.log(artists)

      artists.forEach(artist => {
        console.log('Artist Name:', artist.name)
      })
    })
  })
}

function doWhatItSays () {
  fs.readFile ("random.txt", "utf8", function (err, data) {
    if (err) {
      return console.log (err);
    }
    var dataArr = data.replace (/(\r\n|\n|\r)/gm, "").split (",");
    //console.log(dataArr);
    //   for (var i = 0; i < dataArr.length; i += 2) {
    //     var command = dataArr[i];
    //     var nodeArgs = dataArr[i+1].replace(/[""]+/g, "").split(" ").join("+");
    //     //console.log(nodeArgs);
    //     //console.log(command);
    //     sWitch(command, nodeArgs);
    //   }
    dataArr.map (function (arg, index) {
      if (index % 2 === 0) {
        var command = arg;
        var nodeArgs = dataArr[index + 1];
        sWitch (command, nodeArgs);
      }
    });
  });
}

sWitch (command, nodeArgs);