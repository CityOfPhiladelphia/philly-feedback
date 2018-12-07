// SCSS importing
import './scss/main.scss';
import app from './js/container';
import form from './js/form';

const DEBUG = true;

$(() => {
  // Setup the App
  window.phillyFeedback = {};
  window.phillyFeedback.app = app;
  window.phillyFeedback.form = form;

  // Initilize Firebase
  $(document).on('click', '.philly-feedback-button', (event) => {
    
    try {
      app.init();
      app.setForm(form.build());
    } catch (err) {
      if(DEBUG) console.log(err);
      app.setError();
    }
    event.preventDefault();
    return false;
  });
});