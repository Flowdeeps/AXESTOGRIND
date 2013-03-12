/* axes.js */

// list of all Grindcore Karaoke bands and albums
// http://api.bandcamp.com/api/band/3/discography?key=vatnajokull&band_id=3766815619&debug

var mediaPlayer = {
  /* bandcamp vars */
  // bandName: 3766815619,
  bandcampApiKey: 'vatnajokull',
  bandcampDomain: 'http://api.bandcamp.com/api',
  bandcampBands: [3766815619],
  bandcampAlbums: [],
  bandcampTracks: [],
  bandcampImages: [],
  /* properties */
  filterByTopSongs: false,
  filterBySongs: true,
  logSkipped: false,
  debug: true,
  allTrackTitles: [],
  allBios: [],
  allSimilar: [],
  allReviews: [],
  allEvents: [],
  allLinks: [],
  allImages: [],
  cache: {},
  /**
   * Bandcamp functions
   *
   */
  loadBandcampTracks: function(bandName, callback) {
      var bandEndpoint = "band/3/search"
      var bandParams = [];

      bandParams['name'] = encodeURIComponent(bandName);
      bandParams['name'] = bandName;
      bandParams['callback'] = 'mediaPlayer.addBandcampBandIds';

    },

    addBandcampBandIds: function(results) {
        console.log('loading bandcamp bands...');
        for (var b in results.results) {
            var band = results.results[b];
            mediaPlayer.bandcampBands.push(band.band_id);
        }
    },

    addBandcampAlbumIds: function(results) {
        console.log('loading bandcamp albums...');
        for (var a in results.discography) {
            var album = results.discography[a];
            mediaPlayer.bandcampAlbums.push(album.album_id);
        }
    },

    addBandcampTracks: function(results) {
        console.log('loading bandcamp tracks...');
        for (var t in results.tracks) {
            var track = results.tracks[t];
            var popularity = mediaPlayer.isTopTrack('', track.title);
            var playlistTrack = {
                'artist': '',
                'albumName': results.title,
                'poster': results.large_art_url,
                'title': track.title,
                'mp3': track.streaming_url,
                'popularity': popularity
            };
            mediaPlayer.bandcampTracks.push(playlistTrack);
        }
    },

    /**
     * Send functions
     *
     */
    _sendBandcamp: function(endpoint, params, callback) {
        var url = mediaPlayer.bandcampDomain + '/' + endpoint; 
        
        params['key'] = mediaPlayer.bandcampApiKey;

        mediaPlayer._send(url, params, 'jsonp', callback);
    },    _send: function(url, params, dataType, callback) {
        var first = true;
    
        for (param in params) {
            url += (first) ? '?' : '&';
            first=false;
            url += param + "=" + params[param]
        }

        console.log(url);

        if (this.cache[url]) {
            mediaPlayer.log(url + ' loaded from cache');
            mediaPlayer.hideLoading();
            callback(this.cache[url]);
        } else {
            $.ajax({
                url: url,
                type: 'get',
                dataType: dataType,
                success: function(response) {
                    mediaPlayer.cache[url] = response
                    // mediaPlayer.hideLoading();
                    callback(response);
                },
                error: function(errorObj, textStatus, errorMsg) {
                    console.log(url + ' -- ' + JSON.stringify(errorMsg));
                    callback();
                }
            });
        }
    },

}
mediaPlayer.loadBandcampTracks($('#stage').val(), function(tracks) {
  // track variable is now an array of track objects
  for (var t in tracks) {
    var track = tracks[t];
    // do something with track.mp3
  }
});