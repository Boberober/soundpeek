
$('#git-button').on('click', function() {
  $(this).addClass('active');

  $(this).find('input').select();
});

// hero.style.height = window.height

$('[data-scroll-target]').on('click', function(e) {
  e.preventDefault();

  var speed = $(this).attr('data-scroll-speed') || 750;

  $('html, body').animate({
      scrollTop: $($(this).attr('data-scroll-target')).offset().top - 115
   }, speed).bind(this);

});

var soundpeek = new Soundpeek({
  template: 'user_tmpl',
  progressBar: 'progress-bar', 
  playSound: true,
  onPlay: function(el) {
    el.classList.add('custom-active-class');
  },
  onPause: function(el) {
    el.classList.remove('custom-active-class');
  },
  onError: function(el) {
    el.classList.add('error');
  },
  prependElement: '<i class="play-button"></i>',
  delay: 0 // hover delay in ms
});

var input = $('#search');
var results = $('#results');

var suggestions = ['Paradis - Wintergatan', 'Comfortably Numb', 'Javascript?']

$(document).on('keyup', function( e ) {
  if(e.keyCode == 13 && input.value.length > 1) {

    console.log(soundpeek);

    var el = document.createElement('li');
    var span = document.createElement('span');


    input.setAttribute('placeholder', (suggestions.length > 0) ? 'e.g ' + suggestions[0] : 'Sorry.. I can\'t think of any more songs. Your time to shine!');

    suggestions.shift();

    span.innerHTML = input.value;
    el.appendChild(span);
    results.appendChild(el);

    soundpeek.addEl([span]);

    input.value = '';
  };
});

