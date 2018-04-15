function processSignUpForm () {

  $("#signup-form").submit(function(event) {
    event.preventDefault();

    $.ajax({
      type: "POST",
      url: 'signup',
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({"name": $("#name").val(), "username": $("#username").val(), "pass": $("#pass").val()}),
      success: function(data) {console.log(data)},
      error: function(error) {console.log(error)}
    });

  });
}

function documentReady () {
  processSignUpForm();
}

$(documentReady);