const title = 'Feedback Service';
const lorem = `Please, use the form below to provide feedback about your experience with this web page. Your feedback is vital to help us improve the quality of our services.`;

export default {
    pf: null,
    container: null,
    init() {
      this.pf = this.build();
      $('body').addClass('overflow-hidden').append(this.pf);
      this.pf.fadeIn();
    },
    getLoading() {
      const loadingHTML = `<div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div><p class="starting">Hold on! We are setting everything up for liftoff!</p>`;
      return loadingHTML;
    },
    setForm(form) {
      this.container.empty();
      this.container.append(form);
    },
    getError() {
      return $('<p>', { class: 'pf-message pf-error' })
        .text('Ouch! Something went wrong starting the Feedback Service. Please do click on "close" and try again');
    },
    setError() {
      this.container.empty();
      this.container.append(this.getError());
    },
    build() {
      const pf = $('<div>', { class: 'philly-feedback' });
      const background = $('<div>', { class: 'pf-background' });
      background.on('click', this.close);

      pf.append(background);

      const wrapper = $('<div>', { class: 'pf-wrapper' });
      wrapper.append($('<a>', { href: '#', class: 'pf-close' }).on('click', this.close));
      wrapper.append($('<img>', {
        src: '//beta.phila.gov/wp-content/themes/phila.gov-theme/img/city-of-philadelphia-logo.svg',
        class: 'logo',
        width: 150,
      }));
      wrapper.append($('<h3>').text(title));
      wrapper.append($('<p>').text(lorem));

      this.container = $('<div>', { class: 'pf-container' });
      wrapper.append(this.container.append(this.getLoading()));
      pf.append(
        $('<div>', { class: 'dt' }).append(
          $('<div>', { class: 'dc middle' }).append(wrapper)
        )
      );
      return pf;
    },

    close(evt) {
      evt.preventDefault();
      $('.philly-feedback').fadeOut(300, () => {
        // if (typeof firebase !== 'undefined') firebase.auth().signOut();
        $('body').removeClass('overflow-hidden');
        $(this).remove();
      });
    },
};
