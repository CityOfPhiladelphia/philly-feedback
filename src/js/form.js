import 'location-origin';

const formObj = {
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

    showMessage(title, msg, clss) {
      if (formObj.timeout !== null) clearTimeout(formObj.timeout);
      $('.pf-message').remove();
      const container = $('.last-input');
      let message = [];
      message.push($('<h4>', { class: `pf-message ${clss}` }).text(title));
      message.push($('<p>', { class: `pf-message ${clss}` }).text(msg));
      container.prepend(message);
      formObj.timeout = setTimeout(() => {
        $('.pf-message').remove();
      }, 7000);
    },

    setFireBase() {
      this.firebaseStorage = firebase.storage();
      this.firebaseDatabase = firebase.firestore();
    },

    upload(file) {
      const storageRef = formObj.firebaseStorage.ref();
      const fileName = `images/${Date.now()}.jpg`;
      const ref = storageRef.child(fileName);
      ref.put(file).then(function(snapshot) {
        formObj.uplodedFile = fileName;
        formObj.saveData();
      })
      .catch((err) => {
        formObj.sending = false;
        formObj.button.text('Send');
        formObj.showMessage('Ehem, aawkwaarrd!', 'Something went wrong uploading the image. Please try again later.', 'pf-error');
      });
    },

    saveDataError(err) {
      if (formObj.uplodedFile !== null) {
        var ref = this.firebaseStorage.child(formObj.uplodedFile);
        ref.delete();
      }
      formObj.showMessage('Ehem, aawkwaarrd!', 'Something went wrong sending the feedback. Please try again later.', 'pf-error');
      formObj.sending = false;
      formObj.button.text('Send');
    },

    saveData() {
      const image = formObj.uplodedFile  || null;
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
        formObj.firebaseDatabase.collection("feedbacks").add(dataToSend)
        .then(function() {
          formObj.showMessage('Great!', 'We have got your feedback, thank you!', 'pf-success');
          formObj.form[0].reset();
          formObj.sending = false;
          formObj.button.text('Send');
        })
        .catch(function(err) {
          formObj.saveDataError(err);
        });
      } catch(err) {
        formObj.saveDataError(err);
      }
    },

    submit(evt) {
      if (!formObj.sending) {
        formObj.uplodedFile = null;
        formObj.sending = true;
        formObj.button.text('Sending...');
        if (formObj.file[0] && formObj.file[0].files && formObj.file[0].files[0]) {
          formObj.upload(formObj.file[0].files[0]);
        } else {
          formObj.saveData();
        }
      }

      evt.preventDefault();
      return false;
    },
};

export default formObj;
