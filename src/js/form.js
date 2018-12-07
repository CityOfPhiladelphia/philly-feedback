import 'location-origin';

const phillyFormObj = {
    sending: false,
    timeout: null,
    uplodedFile: null,
    uplodedURL: null,
    form: null,

    // Form elements
    name: null,
    email: null,
    consent: null,
    consentLabel: null,
    textarea: null,
    file: null,

    build() {
      this.form = $('<form>', { action: '', name: 'send-philly-feedback', enctype: 'multipart/form-data' });
      // Append submit event
      this.form.on('submit', this.submit);

      this.form.append(this.getName());
      this.form.append(this.getEmail());
      this.form.append(this.getConsentField());
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

      this.email.focusout(this.emailFocusOut);
      input_area.append(this.email);
      return input_area;
    },

    emailFocusOut() {
        if($(phillyFormObj.email).val()) {
          phillyFormObj.consentLabel.show();
        } else {
          phillyFormObj.consentLabel.hide();
          phillyFormObj.consent.prop('checked', false);
        }
    },

    getConsentField() {
      const input_area = this.getInputArea();
      this.consentLabel = $('<label>', { class: 'checkbox-label' }).text(" Check this box if you would like to be contacted about this feedback at the e-mail address provided above");
      this.consent = $('<input>', {
          id: 'pf-consent',
          name: 'pf-consent',
          type: 'checkbox',
          value: 1,
        });
      this.consentLabel.hide();
      input_area.append(this.consentLabel.prepend(this.consent));
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
        .text('Close')
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

    saveDataError(err) {
      phillyFormObj.setError('Ehem, aawkwaarrd!', 'Something went wrong sending the feedback. Please try again later.');
      phillyFormObj.sending = false;
      phillyFormObj.button.text('Send');
    },

    getMetaData() {
      const metatags = $("meta[property^='philly:']");
      var metadata = new Array();
      metatags.each(function() {
        const n = $.trim($(this).attr('property').replace('philly:', ''));
        const v = $.trim($(this).attr('content'));
        metadata.push({
          name: n,
          value: v
        });
      });

      return metadata;
    },

    submit(evt) {
      evt.preventDefault();

      if (!phillyFormObj.sending) {
        phillyFormObj.sending = true;
        phillyFormObj.button.text('Sending...');
       
        var form = phillyFormObj.form[0];
        var data = new FormData(form);

        data.append('pf-pageTitle', $('title').eq(0).text());
        data.append('pf-href', location.href);
        data.append('pf-origin', location.origin);
        data.append('pf-metadata', JSON.stringify(phillyFormObj.getMetaData()));

        $.ajax({
          type: "POST",
          enctype: 'multipart/form-data',
          url: "https://feedback-service.phila.gov",
          data: data,
          processData: false,
          contentType: false,
          cache: false,
          timeout: 600000,
          success: function (data) {
            phillyFormObj.setSuccess('Great!', 'Thank you for your feedback. Your opinion is valuable to us!');
            phillyFormObj.form[0].reset();
            phillyFormObj.consent.prop('checked', false);
            phillyFormObj.consentLabel.hide();
            phillyFormObj.sending = false;
            phillyFormObj.button.text('Send');
          },
          error: function (error) {
            phillyFormObj.saveDataError(error);
          }
        });
      }

      evt.preventDefault();
      return false;
    },
};

export default phillyFormObj;
