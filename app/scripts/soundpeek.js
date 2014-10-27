window.Soundpeek = (function(window) {

var Utils;

function Soundpeek(options) {
  this.options = Utils.extend(this.defaults, options);
  this.docElem = this.options.elem;
  this.rootUrl = 'https://api.spotify.com/v1';
  this.templateCache = {};
  this.elems = [];

  if (this.options.init) this.init();

}

Soundpeek.prototype = {
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
    debug: false, // Fetches mockup data from data.json if set to true
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
  init: function() {
    var _ = this;

    _.timeout = {};
    _.updateTime = {};

    var el = document.createElement('div');

    el.setAttribute('id', this.options.elementID);
    el.classList.add(this.options.elementID);

    this.playerEl = el;

    document.body.appendChild(this.playerEl);
    document.addEventListener('mousemove', _.movePopup.bind(_));

    this.elems = Array.prototype.slice.call(document.querySelectorAll(_.options.targetSelector));
    this.elems.forEach(function (el, i) {

      _.initializeElement(el);

    });
  },
  get: function(url, callback) {
    var xmlhttp;

    xmlhttp = new XMLHttpRequest(); 

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
          callback(JSON.parse(xmlhttp.responseText));
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();

  },
  getTrack: function(uri, callback) {
    var _ = this;
    var url = this.rootUrl + '/tracks/' + uri.replace('spotify:track:', '');

    if(this.options.debug) {

      url = 'data.json';

    }

    this.get(url, function(data) {


      if(data.length > 1) {

        var tmp;

        for (var i = data.length - 1; i >= 0; i--) {
          if(data[i].id === uri) {

            tmp = data[i];
            break;

          }
        }

        data = tmp || data[0];

      }

      callback(data);

      return data;

    });
  },
  searchTrack: function(searchText, callback) {

    var url = this.rootUrl + '/search/?q=' + searchText + '&type=track&limit=1';

    this.get(url, function(data) {

      if(data.tracks.items.length > 1) {

        data.tracks.items = data.tracks.items[0];

      }

      callback(data.tracks.items[0]);

      return data.tracks.items;

    });
  },
  playTrack: function() {
    var el = this.activeEl,
        _ = this;

    if(_.options.playSound) {

      if(_.audio) {
        _.audio.pause();
        // clearInterval(_.updateTime);
      }

      _.options.onPlay(_.activeEl);

      el.audio = el.audio || new Audio(el.track.preview_url);

      if(el.audio.readyState !== 4) {
        _.playerEl.classList.add('loading');
      } else {
        _.playerEl.classList.remove('loading');
      }

      el.audio.onloadeddata = function() {

        _.playerEl.classList.remove('loading');

      }

      _.audio = el.audio;

      var interval = 100;

      if(_.options.progressBar && _.playerEl.getElementsByClassName(_.options.progressBar)) {

        var elements = _.playerEl.getElementsByClassName(_.options.progressBar);
      
        var elementsArray = Array.prototype.slice.call(elements);

        _.updateTime = setInterval(function() {
          if(_.audio.currentTime > 30) {
            clearInterval(_.updateTime);
          }

          elementsArray.forEach(function (el, i) {
            
            el.style.width = (Math.ceil(_.audio.currentTime / 30 * 100) + 2) + '%';

          });

        }, interval);
      }

      _.audio.play();  

      if(_.options.fadeInVolume) {

        _.fadeIn();

      }

    }        

  },
  fadeIn: function() {
    var _ = this;

    _.audio.volume = 0;

    var fadeIn = setInterval(function() {

      if(_.audio.volume < 0.8) {
        _.audio.volume += 0.005;
      }
      else {
        _.audio.volume = 1;
        clearInterval(fadeIn);
        
      }
    }, 10);
  },
  initializeElement: function(el) {

    var _ = this;

    _.setupEl(el, function(el) {    

      el.uri = el.getAttribute("data-uri");

      if(el.track === undefined) {

        _.getTrack(el.getAttribute("data-uri"), function(data) {

          el.track = data;

          return;

        });

      }

      if(_.options.prependElement && !el.hasAttribute('data-no-prepend')) {
        el.innerHTML = _.options.prependElement + el.innerHTML;
      }
      console.log(el.hasAttribute('data-no-append'));
      if(_.options.appendElement && !el.hasAttribute('data-no-append')) {
        el.innerHTML = el.innerHTML + _.options.appendElement;
      }

      el.addEventListener('mouseover', Utils.debounce(function(e) {
        _.showEl(e, this, _);
      }, _.options.delay));

      el.addEventListener('mouseout', _.hideEl.bind(_));
      // el.addEventListener('click', _.playSongInSpotify);

    });

  },
  setupEl: function(el, callback){
    var _ = this;
    var uri = el.getAttribute("data-uri") || '';

    if(!Utils.hasClass(el, _.options.targetSelector)) {
      el.classList.add(_.options.targetSelector.replace('.', ''));
    }

    if(uri.length === 0 && el.innerHTML.length > 0) {

      _.searchTrack(el.innerHTML, function(track) {
        console.log(track);

        if(track === undefined) {
          _.options.onError(el);
          return;
        }

        if(track) {

          el.setAttribute('data-uri', track.id);
          callback(el);
        }

      });
    }
    else if(el.innerHTML.length === 0 && _.options.fillEmptyWithTrack) {

        if(_.options.defaultLoadingText.length > 0) {
          el.innerHTML = el.getAttribute('data-loading-content') || _.options.defaultLoadingText;
        }

        _.getTrack(uri, function(track) {

          el.innerHTML = track.name;
          el.track = track;

          callback(el);

        });
    } else {
      callback(el);
    }
  },
  showEl: function(e, el, self) {
    var _ = self;

    console.log(el,self);
    e.stopPropagation();
    e.preventDefault();

    if(e.target)
    _.activeEl = el;

    // if(!Utils.hasClass(e.target, _.options.targetSelector.replace('.', ''))) {
    //   _.activeEl = e.target.parentNode;
    // }


    var el = _.activeEl,
        player = _.playerEl;

    var artists = el.track.artists.map(function(artist) {
      return artist.name;
    });

    el.track.artistsString = artists.join(', ');

    _.playerEl.innerHTML = _.renderTemplate(_.options.template, el);

    el.classList.add('active');
    player.classList.add('active');

    _.movePopup(e);

    _.playTrack();

  },
  hideEl: function(e) {

    var _ = this;

    _.playerEl.classList.remove('active');
    _.activeEl.classList.remove('active');

    if(_.options.playSound && _.audio)  {
      clearTimeout(_.timeout);
      clearTimeout(_.updateTime);

      _.audio.pause();



      if(_.audio.readyState === 4 && _.options.restartPreviewOnPause) {
        _.audio.currentTime = 0;
      }
      _.options.onPause(_.activeEl);
    }


    return;
  },
  // playSongInSpotify: function(e) {
  //   window.location = 'http://open.spotify.com/track/' + e.target.getAttribute('data-uri').replace('spotify:track:');
  // },
  movePopup: function(e) {
    var _ = this;

    if(_.activeEl) {
      _.playerEl.style.left = (isPopupOutOfXBounds()) ?
          (document.documentElement.clientWidth - _.playerEl.offsetWidth) + 'px' 
          : e.pageX + 'px';
    
      if(e.clientY + _.playerEl.offsetHeight > document.documentElement.clientHeight) {
        _.playerEl.style.top = (e.pageY - _.playerEl.offsetHeight - _.options.offsetTop + 10) + 'px';
        // _.playerEl.style.left = _.playerEl.style.left = e.screenX - _.playerEl.offsetWidth - 20 + 'px';
      } else {
        _.playerEl.style.top = (e.pageY + _.options.offsetTop) + 'px';
      }
        // _.playerEl.style.top = (e.pageY + _.options.offsetTop) + 'px';
    }

    function isPopupOutOfXBounds() {
      return (e.pageX + _.playerEl.offsetWidth > document.documentElement.clientWidth);
    }

  },
  addEl: function(elements) {
    var _ = this;

    elements.forEach(function(el, i) {
      _.initializeElement(el);
    });
    
  },
  renderTemplate : function renderTemplate(str, data){
    var _ = this;
      // Figure out if we're getting a template, or if we need to
      // load the template - and be sure to cache the result.
      var fn = !/\W/.test(str) ?
        _.templateCache[str] = _.templateCache[str] ||
          renderTemplate(document.getElementById(str).innerHTML) :
       
        // Generate a reusable function that will serve as a template
        // generator (and which will be _.templateCached).
        new Function("obj",
          "var p=[],print=function(){p.push.apply(p,arguments);};" +
         
          // Introduce the data as local variables using with(){}
          "with(obj){p.push('" +
         
          // Convert the template into pure JavaScript
          str
            .replace(/[\r\t\n]/g, " ")
            .split("{{").join("\t")
            .replace(/((^|\}\})[^\t]*)'/g, "$1\r")
            .replace(/\t(.*?)\}\}/g, "',$1,'")
            .split("\t").join("');")
            .split("}}").join("p.push('")
            .split("\r").join("\\'") +
        "');}return p.join('');");
     
      // Provide some basic currying to the user
      return data ? fn( data ) : fn;
    },
};
Utils = {
  debounce: function(func, wait, immediate) {
      var _ = this;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          _.timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !_.timeout;
        clearTimeout(_.timeout);
        _.timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },
    extend: function (a, b){
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    },
    hasClass: function(el, className) {
      return (' ' + el.className + ' ').indexOf(' ' + className + ' ') > -1;
    },
};

  return Soundpeek;

})(window);