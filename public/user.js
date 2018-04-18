function checkForAuthToken () {
  let token = localStorage.getItem('authToken');
  if (token) {
    // fetch user bills
    console.log('access allowed');
    fetchUserBills(token);
  } else {
    // redirect
    window.location.href = '/login';
  }
}

function fetchUserBills (token) {
  $.ajax({
    type: 'GET',
    headers: {Authorization: `Bearer ${token}`},
    contentType: "application/json",
    success: displayUserBills,
    error: function(error) {console.error(error)}
  });
}

function displayUserBills (response) {
  //console.log(response);
  const me = response.name;
  for (let bill of response.bills) {
    //determine if bill is to be paid by me, or to me
      // determine if bill is recurring or not - 4 separate catergories
    const formattedBill = formatBill(bill);
    //bills that I owe
    if (bill.for.length === 1 && bill.for[0] === me && bill.recurring === true) {
      //bills that I owe and are recurring
        //append bill to recurring bills for me
      $('#recurring-I-owe').append(`<li>${formattedBill}</li>`);
    } else if (bill.for.length === 1 && bill.for[0] === me && bill.recurring === false) {
      //append bill to one-time bills for me
      $('#one-time-I-owe').append(`<li>${formattedBill}</li>`);
    }

    //bills that are due to me
    if (bill.from.length === 1 && bill.from[0] === me && bill.recurring === true) {
      //bills that i am owed and are recurring
      $('#recurring-owed-me').append(`<li>${formattedBill}</li>`);
    } else if (bill.from.length === 1 && bill.from[0] === me && bill.recurring === false) {
      //append bill to one-time bills for others
      $('#one-time-owed-me').append(`<li>${formattedBill}</li>`);
    }
  }
}

function formatBill (bill) {
  let billParties;
  let parties;
  if (bill.from.includes('Me')) {
    billParties = bill.for;
  } else {
    billParties = bill.from;
  }
 // for whichever group (for or from) that doesn't contain me
  // join those together with a comma
  billParties = billParties.join(', ');

  return `
    <div class="bill">
      <p class="due-date">${bill.dueDate}</p>
      <p class="bill-title">${bill.title}</p>
      <p class="bill-parties">from ${billParties}</p>
      <p class="bill-amount">$${bill.amount}</p>
    </div>`;
}

$(checkForAuthToken);

/*
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
}*/

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