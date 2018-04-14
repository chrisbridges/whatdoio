/*const MOCK_USER_BILL_DATA = {
  "bills": [
    {
      id: 11111,
      from: ['Connor'],
      for: ['Chris'],
      recurring: false,
      interval: null,
      title: 'KBBQ',
      amount: 100
    },
    {
      id: 22222,
      from: ['Chris'],
      for: ['Cas, Mom, Conner, Justin'],
      recurring: true,
      interval: {
        daily: null,
        weekly: null,
        monthly: {
          dueDate: 6
        },
        yearly: null
      },
      title: 'Phone Bill',
      amount: 150
    },
    {
      id: 33333,
      from: ['Josh'],
      for: ['Chris'],
      recurring: true,
      interval: {
        daily: null,
        weekly: null,
        monthly: {
          dueDate: 10
        },
        yearly: null
      },
      title: 'Rent',
      amount: 800
    },
    {
      id: 44444,
      from: ['Saachi'],
      for: ['Chris'],
      recurring: true,
      interval: {
        daily: null,
        weekly: {
          dueDay: 'Wednesday'
        },
        monthly: null,
        yearly: null
      },
      title: 'Something',
      amount: 5
    }
  ]
};*/

function getUserBills(callbackFn) {
  setTimeout(function(){ callbackFn(MOCK_USER_BILL_DATA)}, 100);
}

// this function stays the same when we connect
// to real API later
function displayUserBills(data) {
  for (index in data.bills) {
     $('body').append(
      '<p>' + data.bills[index].title + '</p>');
  }
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayUserBills() {
  getUserBills(displayUserBills);
}

$(function() {
  getAndDisplayUserBills();
})

// sample ajax post request
/*$.ajax({
  type: "POST",
  url: 'localhost:8080/signup',
  data: //data from form,
  success: //callback function for success,
});*/

//  TODO: WRITE THE html for each page
  //  each page has their own JS file



// localstorage.setItem on the front-end when you log in and the endpoint
  // responds with token
// import all the things with the CDNs - jQuery, JWT decoder, etc

// sign-out page - removes token from localstorage and redirects to login page

// user submits info on html form
// ajax makes the call to endpoint
    // data is like my req.body
// runs through server
  // depending on what that returns
    // error
    // assuming it's good, give them token, save it in localstorage
  // userrouter ensures authentication
    // show them the money