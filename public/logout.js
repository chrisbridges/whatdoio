function logoutUser () {
  console.log('at least the js is loading');
  localStorage.removeItem("authToken");
}


function documentReady () {
  logoutUser();
}

$(documentReady);