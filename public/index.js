function loginDemoUser () {
  $('.login-demo-user').on('click', function () {
    event.preventDefault();

    $.ajax({
      type: 'POST',
      url: 'login',
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({"username": "sallySample", "pass": "demopassword"}),
      success: function(data) {
        //save JWT token that returns and redirect user to their page
        localStorage.setItem("authToken", data.authToken);
        window.location.href = '/user';
      },
      error: function(error) {
        console.log(error);
        alert(error.responseJSON.message);
      }
    });
  });
}

$(document).ready(function () {
  loginDemoUser();
});