// SCSS importing
import './scss/main.scss';
import app from './js/container';
import form from './js/form';
import firebaseConfig from './js/firebaseConfig';

function fireBaseIsLoaded() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig)
    }

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        form.setFireBase();
        app.setForm(form.build());
      }
    });

    firebase.auth().signInAnonymously().catch((error) => {
      app.setError();
    });
  } catch (err) {
    app.setError();
  }
}

$(() => {
  $('.philly-feedback-button').on('click', (event) => {
    window.phillyFeedback = app;
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
            error() {
              app.setError();
            },
          });
        },
        error() {
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