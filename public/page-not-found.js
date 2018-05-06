function redirectToHomePage () {
  setTimeout(function () {
    window.location.href = '/user';
  }, 3000);
}

$(document).ready(function () {
  redirectToHomePage();
});