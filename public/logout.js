function logoutUser () {
  localStorage.removeItem("authToken");
}

$(document).ready(function () {
  logoutUser();
});