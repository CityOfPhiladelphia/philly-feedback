import 'location-origin';

const phillyFormObj = {
    sending: false,
    timeout: null,
    uplodedFile: null,
    form: null,
    firebaseStorage: null,
    firebaseDatabase: null,

    // Form elements
    name: null,
    email: null,
    textarea: null,
    file: null,

    build() {
      this.form = $('<form>', { action: '', name: 'send-philly-feedback' });
      // Append submit event
      this.form.on('submit', this.submit);

      this.form.append(this.getName());
      this.form.append(this.getEmail());
      this.form.append(this.getTextArea());
      if(typeof(window.FileReader)!="undefined"){
        this.form.append(this.getFileUpload());
      }
      this.form.append(this.getButton());

      return this.form;
    },

    getInputArea(extraclass) {
      if (!extraclass) extraclass = '';
      return $('<div>', { class: `input-area ${extraclass}` });
    },

    getLabel(id, title) {
      return $('<label>', { for: `pf-${id}` }).text(title);
    },

    getName() {
      const input_area = this.getInputArea();
      input_area.append(this.getLabel('pf-name', 'Name'));
      this.name = $('<input>', {
          id: `pf-name`,
          name: `pf-name`,
          type: 'text',
          placeholder: '(Optional)',
        });
      input_area.append(this.name);
      return input_area;
    },

    getEmail() {
      const input_area = this.getInputArea();
      input_area.append(this.getLabel('pf-email', 'Email'));
      this.email = $('<input>', {
          id: `pf-email`,
          name: `pf-email`,
          type: 'email',
          placeholder: '(Optional)',
        });
      input_area.append(this.email);
      return input_area;
    },

    getTextArea() {
      const input_area = this.getInputArea();
      input_area.append(this.getLabel('feedback', 'Feedback'));
      this.textarea = $('<textarea>', {
        id: 'pf-feedback',
        name: 'pf-feedback',
        placeholder: 'Type your feedback',
        rows: 5,
        required: 'required',
      });
      input_area.append(this.textarea);

      return input_area;
    },

    getFileUpload() {
      const input_area = this.getInputArea();
      input_area.append($('<small>')
        .append('You can submit an image (jpg or png, 2MB max.) to support your comments'));

      const file_input = $('<input>', {
        id: 'pf-image',
        name: 'pf-image',
        type: 'file',
        accept: 'image/jpeg, image/png'
      });
      this.file = file_input;

      input_area.append(file_input);

      return input_area;
    },

    getButton() {
      const input_area = this.getInputArea('last-input');
      this.button = $('<button>', { type: 'submit' }).text('Send');
      input_area.append(this.button);

      return input_area;
    },

    getPFMessageObject(title, msg, clss) {
      const message = $('<div>', { class: `pf-message ${clss}` });
      message.append($('<h4>').text(title));
      message.append($('<p>').text(msg));
      return message;
    },

    setSuccess(title, msg) {
      const message = phillyFormObj.getPFMessageObject(title, msg, 'pf-success');
      window.phillyFeedback.app.container.empty();
      window.phillyFeedback.app.container.append(message);
      const closeBtn = $('<button>', { class: 'pf-close-btn' })
        .text('Ok, looks good!')
        .on('click', window.phillyFeedback.app.close);
      window.phillyFeedback.app.container.append(closeBtn);
    },

    setError(title, msg) {
      if (phillyFormObj.timeout !== null) clearTimeout(phillyFormObj.timeout);
      $('.pf-message').remove();
      const message =  phillyFormObj.getPFMessageObject(title, msg, 'pf-error');
      $('.last-input').prepend(message);
      phillyFormObj.timeout = setTimeout(() => {
        message.fadeOut(() => {
          message.remove();
        });
      }, 7000);
    },

    setFireBase() {
      this.firebaseStorage = firebase.storage();
      this.firebaseDatabase = firebase.firestore();
    },

    upload(file) {
      const storageRef = phillyFormObj.firebaseStorage.ref();
      const fileName = `images/${Date.now()}.jpg`;
      const ref = storageRef.child(fileName);
      ref.put(file).then(function(snapshot) {
        phillyFormObj.uplodedFile = fileName;
        phillyFormObj.saveData();
      })
      .catch((err) => {
        phillyFormObj.sending = false;
        phillyFormObj.button.text('Send');
        phillyFormObj.setError('Ehem, aawkwaarrd!', 'Something went wrong uploading the image. Please try again later.');
      });
    },

    saveDataError(err) {
      if (phillyFormObj.uplodedFile !== null) {
        var ref = this.firebaseStorage.child(phillyFormObj.uplodedFile);
        ref.delete();
      }
      phillyFormObj.setError('Ehem, aawkwaarrd!', 'Something went wrong sending the feedback. Please try again later.');
      phillyFormObj.sending = false;
      phillyFormObj.button.text('Send');
    },

    saveData() {
      const image = phillyFormObj.uplodedFile  || null;
      const dataToSend = {
        name: this.name.val(),
        email: this.email.val(),
        feedback: this.textarea.val(),
        pageTitle: $('title').eq(0).text(),
        image,
        href: location.href,
        origin: location.origin,
        datetime: firebase.firestore.FieldValue.serverTimestamp(),
      };

      try {
        phillyFormObj.firebaseDatabase.collection("feedbacks").doc(`${Date.now()}`).set(dataToSend)
        .then(function() {
          phillyFormObj.setSuccess('Great!', 'We have got your feedback, thank you!');
          phillyFormObj.form[0].reset();
          phillyFormObj.sending = false;
          phillyFormObj.button.text('Send');
        })
        .catch(function(err) {
          phillyFormObj.saveDataError(err);
        });
      } catch(err) {
        phillyFormObj.saveDataError(err);
      }
    },

    submit(evt) {
      if (!phillyFormObj.sending) {
        phillyFormObj.uplodedFile = null;
        phillyFormObj.sending = true;
        phillyFormObj.button.text('Sending...');
        if (phillyFormObj.file[0] && phillyFormObj.file[0].files && phillyFormObj.file[0].files[0]) {
          phillyFormObj.upload(phillyFormObj.file[0].files[0]);
        } else {
          phillyFormObj.saveData();
        }
      }

      evt.preventDefault();
      return false;
    },
};

export default phillyFormObj;
