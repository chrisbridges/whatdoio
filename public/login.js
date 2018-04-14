function processLoginForm () {

  $("#login-form").submit(function(event) {
    event.preventDefault();

    $.ajax({
      type: "POST",
      url: 'login',
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({"username": $("#username").val(), "pass": $("#pass").val()}),
      success: function() {console.log('SUCCESS')},
      error: function(error) {console.log(error)}
    });

  });
}

function documentReady () {
  processLoginForm();
}

$(documentReady);