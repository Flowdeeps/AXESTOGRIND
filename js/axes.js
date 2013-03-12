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
  debug: true,
  cache: {},
  /**
   * Bandcamp functions
   *
   */
  loadBandcampTracks: function(callback) {
    var albumEndpoint = 'band/3/discography';
    var albumParams = [];
    var bandIdsString = mediaPlayer.bandcampBands.join(',');

    albumParams['band_id'] = bandIdsString;
    albumParams['callback'] = 'mediaPlayer.addBandcampAlbumIds';
 
    /* get all albums for all matching bands */
    mediaPlayer._sendBandcamp(albumEndpoint, albumParams, function(album_results) {
      //eval(album_results);
      
      if (typeof album_results.discography == 'undefined') {
          callback();
          return false;
      }

      mediaPlayer.addBandcampAlbumIds(album_results);

      var total_albums = album_results.discography.length;
      var processed = 0;

      for (var a in album_results.discography) {
        var albumInfoEndpoint = "album/2/info";
        var albumInfoParams = [];
        albumInfoParams['album_id'] = album_results.discography[a].album_id;
        albumInfoParams['callback'] = 'mediaPlayer.addBandcampTracks';
        
        /* get album info (track ids) */
        (function(total_albums) {
          mediaPlayer._sendBandcamp(albumInfoEndpoint, albumInfoParams, function(track_results) {
            mediaPlayer.addBandcampTracks(track_results);
            processed++;
            if (processed == total_albums) {
              callback(mediaPlayer.bandcampTracks);
            }
          }); 
        })(total_albums);
      }
    });
  },

    addBandcampBandIds: function(results) {
        // console.log('loading bandcamp bands...');
        for (var b in results.results) {
            var band = results.results[b];
            mediaPlayer.bandcampBands.push(band.band_id);
        }
    },

    addBandcampAlbumIds: function(results) {
        // console.log('loading bandcamp albums...');
        for (var a in results.discography) {
            var album = results.discography[a];
            mediaPlayer.bandcampAlbums.push(album.album_id);
        }
    },

    addBandcampTracks: function(results) {
        // console.log('loading bandcamp tracks...');
        for (var t in results.tracks) {
            var track = results.tracks[t];
            var playlistTrack = {
                'artist': '',
                'albumName': results.title,
                'poster': results.large_art_url,
                'title': track.title,
                'mp3': track.streaming_url
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

        // console.log(url);

        if (this.cache[url]) {
            mediaPlayer.log(url + ' loaded from cache');
            // mediaPlayer.hideLoading();
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

mediaPlayer.loadBandcampTracks(function(tracks) {
  var arrLen = tracks.length;
  var randTrack = Math.floor(Math.random() * arrLen);
  var $randTrack = tracks[randTrack];
  console.log($randTrack);
  $('#stage').append('<figure><img src="' + $randTrack.poster + '" /><figcaption><h3>' + $randTrack.title + '</h3><p>' + $randTrack.albumName + '</p></figcaption></figure>');
  $('#stage').append('<audio src="' + $randTrack.mp3 + '" controls="true" />');
  // }
});
