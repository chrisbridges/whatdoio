function logoutUser () {
  localStorage.removeItem("authToken");
}

$(logoutUser());