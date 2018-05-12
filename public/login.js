function processLoginForm () {

  $("#login-form").submit(function(event) {
    event.preventDefault();

    $.ajax({
      type: "POST",
      url: 'login',
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({"username": $("#username").val(), "pass": $("#pass").val()}),
      success: function(data) {
        //save JWT token that returns and redirect user to their page
        localStorage.setItem("authToken", data.authToken);
        window.location.href = '/user';
      },
      error: function(error) {
        alert(error.responseJSON.message);
      }
    });

  });
}

$(processLoginForm());