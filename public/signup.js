function processSignUpForm () {

  $("#signup-form").submit(function(event) {
    event.preventDefault();
    const username = $("#username").val();
    const pass = $("#pass").val();

    $.ajax({
      type: "POST",
      url: 'signup',
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({"name": $("#name").val(), "username": username, "pass": pass}),
      success: function(data) {
        console.log(data);
        loginNewUser(username, pass);
      },
      error: function(error) {
        console.log(error);
        alert(`${error.responseJSON.location}: ${error.responseJSON.message}`);
      }
    });

  });
}

function loginNewUser (username, pass) {
  $.ajax({
    type: 'POST',
    url: 'login',
    dataType: 'json',
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify({"username": username, "pass": pass}),
    success: function(data) {
      console.log(data);
      localStorage.setItem('authToken', data.authToken);
      window.location.href = '/user';
    },
    error: function(error) {console.log(error)}
  });
}

function documentReady () {
  processSignUpForm();
}

$(documentReady);