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
  // console.log(response);
  const me = 'Me';
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

/***********************************************
* Drop Down Date select script- by JavaScriptKit.com
* This notice MUST stay intact for use
* Visit JavaScript Kit at http://www.javascriptkit.com/ for this script and more
***********************************************/

var monthtext=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];

function populatedropdown (dayfield, monthfield, yearfield) {
  const today = new Date();
  var dayfield=document.getElementById(dayfield);
  var monthfield=document.getElementById(monthfield);
  var yearfield=document.getElementById(yearfield);
  for (var i = 0 ; i < 31; i++) {
    //select today's day
    dayfield.options[i] = new Option(i, i + 1);
    dayfield.options[today.getDate()]=new Option(today.getDate(), today.getDate(), true, true);
  }
  for (var m = 0; m < 12; m++) {
    //select today's month
    monthfield.options[m]=new Option(monthtext[m], monthtext[m]);
    monthfield.options[today.getMonth()]=new Option(monthtext[today.getMonth()], monthtext[today.getMonth()], true, true);
  }
  var thisyear = today.getFullYear();
  for (var y = 0; y < 20; y++) {
    yearfield.options[y]=new Option(thisyear, thisyear);
    thisyear+=1;
}
  //select today's year
  yearfield.options[0]=new Option(today.getFullYear(), today.getFullYear(), true, true);
}


$(
  checkForAuthToken,
  populatedropdown("daydropdown", "monthdropdown", "yeardropdown")
);


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