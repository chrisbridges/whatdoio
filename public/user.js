let token = localStorage.getItem('authToken');

function checkForAuthToken () {

  if (token) {
    // fetch user bills if authenticated
    console.log('access allowed');
    fetchUserBills(token);
  } else {
    // redirect to login
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
  console.log(bill);
  let billParties;
  let parties;
  if (bill["from"].includes('Me')) {
    billParties = bill["for"];
  } else {
    billParties = bill["from"];
  }
  console.log(billParties);
 // for whichever group (for or from) that doesn't contain me
  // join those together with a comma, if multiple parties involved
  if (billParties.length > 1) {
    billParties = billParties.join(', ');
  }
  // TODO: billParties showing as undefined
  return `
    <div data-id=${bill._id} class="bill">
      <p class="due-date">${bill.dueDate}</p>
      <p class="bill-title">${bill.title}</p>
      <p class="bill-parties">from ${billParties}</p>
      <p class="bill-amount">$${bill.amount}</p>
      <button class="deleteBill">X</button>
    </div>`;
}

// INSPIRED FROM JAVASCRIPT KIT, HEAVILY MODIFIED BY CHRIS BRIDGES
const monthtext=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];

function populateDateDropdowns (dayfield, monthfield, yearfield) {
  const today = new Date();
  var dayfield = document.getElementsByClassName(dayfield);
  var monthfield = document.getElementsByClassName(monthfield);
  var yearfield = document.getElementsByClassName(yearfield);
  for (let j = 0; j < dayfield.length; j++) {
    for (var i = 1; i <= 31; i++) {
      //select today's day
      dayfield[j].options[i] = new Option(i, i);
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

function showNewBillForm () {
  // console.log('addnewBill working');
  $('#add-new-bill').click(function () {
    $('#new-bill-form').show();
  });
}

function listenIfBillIsRecurring () {
  $('input:radio[name="bill-recurring-input"]').change(function(){
    // if bill is recurring, ask how often
      // hide counter-question in case user changes mind
    if ($("input[name='bill-recurring-input']:checked").val() === 'Yes') {
      // console.log('Yes');
      $('.bill-recurrence-frequency').show();
      $('.when-is-bill-due').hide();
      //billRecurringFrequency();
    }
    // if bill is not recurring, ask for date due
    if ($("input[name='bill-recurring-input']:checked").val() === 'No') {
      // console.log('No');
      $('.when-is-bill-due').show();
      $('.bill-recurrence-frequency').hide();
    }
  });
}

function billRecurringFrequency () {
  $('input:radio[name="bill-recurring-value"]').change(function() {
    let frequency = $("input[name='bill-recurring-value']:checked").val();

    if (frequency === 'daily') {
      $('.bill-recurrence-weekly').hide();
      $('.bill-recurrence-monthly').hide();
      $('.bill-recurrence-yearly').hide();
    }
    if (frequency === 'weekly') {
      $('.bill-recurrence-weekly').show();
      $('.bill-recurrence-monthly').hide();
      $('.bill-recurrence-yearly').hide();
    }
    if (frequency === 'monthly') {
      $('.bill-recurrence-weekly').hide();
      $('.bill-recurrence-monthly').show();
      $('.bill-recurrence-yearly').hide();
    }
    if (frequency === 'yearly') {
      $('.bill-recurrence-weekly').hide();
      $('.bill-recurrence-monthly').hide();
      $('.bill-recurrence-yearly').show();
    }
  });
}

let billPayer; // who is paying money ('for' in my schema)
let billReceiver; // who is receiving money ('from' in my schema)

function payingOrReceiving () {
  // console.log('payingOrReceiving running');
  $('input:radio[name="bill-payer-input"]').change(function() {
    if ($("input[name='bill-payer-input']:checked").val() === 'By Me') {
      $('.bill-paid-by-me').show();
      $('.bill-paid-to-me').hide();
      billPayer = ['Me'];
      // billReceiver = the value(s) from form
    }
    if ($("input[name='bill-payer-input']:checked").val() === 'To Me') {
      $('.bill-paid-by-me').hide();
      $('.bill-paid-to-me').show();
      billReceiver = ['Me'];
      // billPayer = the value(s) from form
    }
  });
}

function listenForBillPayer () {
  $('input:radio[name="bill-payer-input"]').change(function() {
    if ($("input[name='bill-payer-input']:checked").val() === 'By Me') {
      billPayer = ['Me'];
      // These variables need to be able to accept array and accept multiple names accordingly
      billReceiver = $("input[name='bill-paid-by-me-input']:checked").val();
    }
    if ($("input[name='bill-payer-input']:checked").val() === 'To Me') {
      billReceiver = ['Me'];
      // These variables need to be able to accept array and accept multiple names accordingly
      billPayer = $("input[name='bill-paid-to-me-input']:checked").val();
    }
  });
}

function postNewBill () {
  // post new user bill w/ ajax
  $("#new-bill-form").submit(function(event) {
    event.preventDefault();
    let recurring;
    let interval;
    const title = $('#bill-title-input').val();
    const amount = $('#bill-amount-input').val();
    let dueDate;
    // check if bill is recurring
    if ($("input[name='bill-recurring-input']:checked").val() === 'Yes') {
      recurring = true;
    }
    if ($("input[name='bill-recurring-input']:checked").val() === 'No') {
      recurring = false;
    }
    // if it is recurring, what is the frequency?
    if (recurring) {
      const frequencyValues = {
        daily: '1d',
        weekly: '7d',
        monthly: '1m',
        yearly: '1y'
      };
      const frequencyValue = $("input[name='bill-recurring-value']:checked").val();
      interval = frequencyValues[frequencyValue];
    } else {
      interval = null;
    }
    // define dueDate
    // if bill is not recurring, dueDate is specific date
    if (!recurring) {
      let day = $('.when-is-bill-due .daydropdown').val();
      let month = $('.when-is-bill-due .monthdropdown').val();
      let year = $('.when-is-bill-due .yeardropdown').val();
      dueDate = `${month} ${day} ${year}`;
    }
    //define billPayer and billReceiver

    $.ajax({
      type: "POST",
      url: 'user',
      dataType: 'json',
      headers: {Authorization: `Bearer ${token}`},
      contentType: "application/json",
      data: JSON.stringify({
        for: billPayer, 
        from: billReceiver, 
        amount: amount, 
        title: title, 
        dueDate: dueDate, 
        recurring: recurring, 
        interval: interval
      }),
      success: displayUserBills,
      error: function(error) {console.log(error)}
    });

  });
  // reset form values and hide form again
  // only show submit button when all required fields are filled
}

// how to grab id for specific bill to delete
  // see bottom of user.html

$(document).ready(function() {
  checkForAuthToken();
  showNewBillForm();
  listenIfBillIsRecurring();
  populateDateDropdowns("daydropdown", "monthdropdown", "yeardropdown");
  billRecurringFrequency();
  postNewBill();
  payingOrReceiving();
});