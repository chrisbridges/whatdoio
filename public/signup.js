function processSignUpForm () {

  $("#signup-form").submit(function(event) {
    event.preventDefault();

    $.ajax({
      type: "POST",
      url: 'signup',
      data: {"name": $("#name").val(), "username": $("#username").val(), "password": $("#password").val()},
      success: function() {console.log('SUCCESS')},
      error: function() {console.log('Error')}
    });

  });
}

function documentReady () {
  processSignUpForm();
}

$(documentReady);