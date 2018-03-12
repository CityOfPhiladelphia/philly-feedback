// SCSS importing
import './scss/main.scss';
import app from './js/container';
import form from './js/form';
import firebaseConfig from './js/firebaseConfig';

const DEBUG = true;

function fireBaseIsLoaded() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig)
    }

    form.setFireBase();
    app.setForm(form.build());

  } catch (err) {
    if(DEBUG) console.log(err);
    app.setError();
  }
}

$(() => {
  // Setup the App
  window.phillyFeedback = {};
  window.phillyFeedback.app = app;
  window.phillyFeedback.form = form;

  // Initilize Firebase
  $('.philly-feedback-button').on('click', (event) => {
    app.init();
    if (typeof firebase === 'undefined' || !firebase) {
      $.ajax({
        url: 'https://www.gstatic.com/firebasejs/4.9.0/firebase.js',
        dataType: 'script',
        cache: true,
        success() {
          $.ajax({
            url: 'https://www.gstatic.com/firebasejs/4.9.0/firebase-firestore.js',
            dataType: 'script',
            cache: true,
            success() {
              fireBaseIsLoaded();
            },
            error(err) {
              if(DEBUG) console.log(err);
              app.setError();
            },
          });
        },
        error(err) {
          if(DEBUG) console.log(err);
          app.setError();
        },
      });
    } else {
      fireBaseIsLoaded();
    }
    event.preventDefault();
    return false;
  });
});