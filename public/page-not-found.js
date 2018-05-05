function redirectToHomePage () {
  setTimeout(function () {
    window.location.href = '/';
  }, 3000);
}

$(document).ready(function () {
  redirectToHomePage();
});