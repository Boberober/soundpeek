# Spotify Previewer

### Install Gulp if you haven't already
```sh
$ npm install --global gulp
```

### Install dependencies:
```sh
$ npm install 
```

### Start web server
```sh
# Builds and starts web server at localhost:8000
$ gulp
```

### Example usage
```javascript
var soundpeek = new Soundpeek({
      template: 'user_tmpl', // Custom template
      playSound: true,
      targetClassName: 'soundpeek', // Default
      onPlay: function(el) {
        el.classList.add('custom-active-class');
      },
      onPause: function(el) {
        el.classList.remove('custom-active-class');
      },
      onError: function(el) {
        el.classList.add('error');
      },
      prependElement: '<span class="play-button"></span>',
      delay: 0 // hover delay in ms
    });
```
**Custom template:**

```hbs
<script type="text/html" id="user_tmpl">

    <div class="cover">
      <img src="{{ track.album.images[1].url }}" alt="">
    </div>
    <div class="content-container">
      <div class="content">
        <div class="track">{{ track.name }}</div>
        <div class="artists">{{ track.artistsString }}</div>
      </div>
    </div>

</script>

```
Check out [Spotify's track reference](https://developer.spotify.com/web-api/get-track/#example) for available data

```javascript
// Default Options
defaults: {
    init: true,
    elem: window.document.documentElement,
    fillEmptyWithTrack: true,
    elementID: 'spotify-player',
    targetSelector: '.soundpeek',
    prependElement: '',
    appendElement: '',
    offsetTop: 20,
    playSound: true,
    delay: 0,
    onPlay: function(el){},
    onPause: function(el){},
    onError: function(el){},
    fadeInVolume: true,
    restartPreviewOnPause: true,
    defaultLoadingText: 'Loading',
    progressBar: false,
    template: '<div class="cover">' +
      '<img src="{{ track.album.images[1].url }}" alt="">' +
    '</div>' +
    '<div class="content-container">' +
      '<div class="content">' +
        '<div class="track">{{ track.name }}</div>' +
        '<div class="artists">' +
          '{{ track.artistsString }}' +
        '</div>' +
      '</div>' +
    '<div class="progress-bar"></div>' +
    '</div>'
  },
```
