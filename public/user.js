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

const monthtext=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];

function populateDateDropdowns (dayfield, monthfield, yearfield) {
  const today = new Date();
  var dayfield = document.getElementsByClassName(dayfield);
  var monthfield = document.getElementsByClassName(monthfield);
  var yearfield = document.getElementsByClassName(yearfield);
  for (let j = 0; j < dayfield.length; j++) {
    for (var i = 1; i <= 31; i++) {
      //select today's day
      dayfield[j].options[i] = new Option(i, i + 1);
      dayfield[j].options[today.getDate()]=new Option(today.getDate(), today.getDate(), true, true);
    }
  }
  for (let j = 0; j < monthfield.length; j++) {
    for (var m = 0; m < 12; m++) {
      //select today's month
      monthfield[j].options[m]=new Option(monthtext[m], monthtext[m]);
      monthfield[j].options[today.getMonth()]=new Option(monthtext[today.getMonth()], monthtext[today.getMonth()], true, true);
    }
  }
  var thisyear = today.getFullYear();
  for (let j = 0; j < yearfield.length; j++) {
    for (var y = 0; y < 20; y++) {
      yearfield[j].options[y] = new Option(thisyear, thisyear);
      thisyear+=1;
    }
    // select today's year
    yearfield[j].options[0] = new Option(today.getFullYear(), today.getFullYear(), true, true);
  }
}

function addNewBill () {
  console.log('addnewBill working');
  $('#add-new-bill').click(function () {
    $('#new-bill-form').show();
  });
}

function listenIfBillIsRecurring () {
  $('input:radio[name="bill-recurring-input"]').change(function(){
    // if bill is recurring, ask how often
      // hide counter-question in case user changes mind
    if ($("input[name='bill-recurring-input']:checked").val() === 'Yes') {
      console.log('Yes');
      $('.bill-recurrence-frequency').show();
      $('.when-is-bill-due').hide();
      //billRecurringFrequency();
    }
    // if bill is not recurring, ask for date due
    if ($("input[name='bill-recurring-input']:checked").val() === 'No') {
      console.log('No');
      $('.when-is-bill-due').show();
      $('.bill-recurrence-frequency').hide();
    }
  });
}

function billRecurringFrequency () {
  $('input:radio[name="bill-recurring-value"]').change(function(){
    let frequency = $("input[name='bill-recurring-value']:checked").val();
    console.log(frequency);
    const frequencyOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

    if (frequency === 'Daily') {
      // do something
    }

    if (frequency === 'Weekly') {
      $('.bill-recurrence-weekly').show();
    }

    if (frequency === 'Monthly') {
      // do something
    }

    if (frequency === 'Yearly') {
      // do something
    }
    // depending on the value of frequency, hide all other form options, in case user changes mind
    function hideAllOthers () {
      for (let i = 0; i < frequencyOptions.length; i++) {
        if (frequencyOptions[i] === frequency) {
          continue;
        }

      }
    }

  });
}


// TODO: only addnewbill or checkforauthtoken is running, depending on position?
$(
  addNewBill,
  //listenIfBillIsRecurring,
  //checkForAuthToken,
  populateDateDropdowns("daydropdown", "monthdropdown", "yeardropdown")
);

$(listenIfBillIsRecurring);
$(billRecurringFrequency);

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