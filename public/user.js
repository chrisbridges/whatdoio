// substitute for global variables?
// let global = (function() {
//   let bills = [];

//   return {
//     editBills: function (arg) {
//       bills = arg;
//     },
//     getBills: function () {
//       return bills;
//     }
//   }
// })();

// console.log(global.getBills());
// global.editBills(['test'])
// console.log(global.getBills());

  // if you have to declare a global var, just declare one
// var MyApp = {
//   globals: {
//     foo: "bar",
//     fizz: "buzz"
//   }
// };

// console.log(MyApp.globals.foo);
// MyApp.globals.foo = 'foo';
// console.log(MyApp.globals.foo);

let bills = [];

// function to parseJWT (used to retrieve userID without making another call to back-end)
  // https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript
function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

function getUserIDFromToken () {
  const result = parseJwt(getToken());
  return result.user._id;
}

function getToken () {
  return localStorage.getItem('authToken');
}

function checkForAuthToken () {
  if (getToken()) {
    // fetch user bills if authenticated
    fetchUserBills(displayUserBills);
  } else {
    // redirect to login
    window.location.href = '/login';
  }
}

function fetchUserBills (callback) {
  $.ajax({
    type: 'GET',
    headers: {Authorization: `Bearer ${getToken()}`},
    contentType: "application/json",
    success: function (response) {
      storeBillsLocally(response);
    },
    error: function(error) {console.error(error)}
  });
}

function storeBillsLocally (response) {
  bills = response.bills;
  console.log(bills);
  displayUserBills(bills);
}

function displayUserBills (bills) {
  // clear out previously shown bills before appending new ones
  // STRETCH: display bills by which is due soonest
  $('ul').empty();
  const me = 'Me';
  bills.forEach(function (bill) {
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
  });
}

function formatBill (bill) {
  let billParties;
  let parties;
  if (bill["from"].includes('Me')) {
    billParties = bill["for"];
  } else {
    billParties = bill["from"];
  }
 // for whichever group (for or from) that doesn't contain me
  // join those together with a comma, if multiple parties involved
  if (billParties.length > 1) {
    billParties = billParties.join(', ');
  }
  function limitNumbersAfterDecimal (num) {
    return num.toFixed(2);
  }
  function amountWithCommas (x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  return `
    <div data-id=${bill._id} class="bill">
      <p class="due-date">Due: ${bill.dueDate}</p>
      <p class="bill-title">${bill.title}</p>
      <p class="bill-parties">from ${billParties}</p>
      <p class="bill-amount">$${amountWithCommas(limitNumbersAfterDecimal(bill.amount))}</p>
      <button class="editBill">Edit</button>
      <button class="deleteBill">X</button>
    </div>`;
}

function deleteBill () {
  // TODO: bills don't delete every time upon button press
  $('.bills').on('click', '.deleteBill', function (event) {
    // need to listen on DOM element that's already there
    const billID = $(this).parent().data("id");
    const userID = getUserIDFromToken();

    $.ajax({
      type: "DELETE",
      url: `user/${userID}/bills/${billID}`,
      dataType: 'json',
      headers: {Authorization: `Bearer ${getToken()}`},
      contentType: "application/json",
      success: function (response) {
        storeBillsLocally(response);
      },
      error: function(error) {console.error(error)}
    });
  });
}

function populateDateDropdowns (dayfield, monthfield, yearfield) {
  // INSPIRED FROM JAVASCRIPT KIT, HEAVILY MODIFIED BY CHRIS BRIDGES
  const monthtext=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
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
  $('#add-new-bill').click(function () {
    $('#new-bill-form').show();
  });
}

function payingOrReceiving () {
  $('input:radio[name="bill-payer-input"]').change(function() {
    // if bill is to be paid BY me
      // for whichever part of form is hidden, no longer require that question
    if ($("input[name='bill-payer-input']:checked").val() === 'By Me') {
      $('.bill-paid-by-me').show().find(':input').attr('required', true);
      $('.bill-paid-to-me').hide().find(':input').attr('required', false);
      //billPayer = ['Me'];
      // billReceiver = the value(s) from form
    }
    // if bill is to be paid TO me
    if ($("input[name='bill-payer-input']:checked").val() === 'To Me') {
      $('.bill-paid-by-me').hide().find(':input').attr('required', false);
      $('.bill-paid-to-me').show().find(':input').attr('required', true);
      //billReceiver = ['Me'];
      // billPayer = the value(s) from form
    }
  });
}

function listenIfBillIsRecurring () {
  $('input:radio[name="bill-recurring-input"]').change(function(){
    // if bill is recurring, ask how often
      // hide counter-question in case user changes mind
    if ($("input[name='bill-recurring-input']:checked").val() === 'Yes') {
      $('.bill-recurrence-frequency').show().find(':input').attr('required', true);
      $('.when-is-bill-due').hide().find(':input').attr('required', false);
      //billRecurringFrequency();
    }
    // if bill is not recurring, ask for date due
    else if ($("input[name='bill-recurring-input']:checked").val() === 'No') {
      $('.when-is-bill-due').show().find(':input').attr('required', true);
      $('.bill-recurrence-frequency').hide().find(':input').attr('required', false);
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

function addAdditionalParty () {
  $('.add-additional-party').on('click', function (event) {
    event.preventDefault();
    if ($(this).parent().hasClass('bill-paid-to-me')) {
      const billPaidToMeHTML = `
        <input type="text" name="bill-paid-to-me-input[]" id="bill-paid-to-me-input" placeholder="Jack, Jill, Up The Hill, Inc.">
        <button class="remove-additional-party">X</button>`;
      $(billPaidToMeHTML).insertBefore(this);
    }
    else if ($(this).parent().hasClass('bill-paid-by-me')) {
      const billPaidByMeHTML = `
        <input type="text" name="bill-paid-by-me-input[]" id="bill-paid-by-me-input" placeholder="Jack, Jill, Up The Hill, Inc.">
        <button class="remove-additional-party">X</button>`;
      $(billPaidByMeHTML).insertBefore(this);
    }
  });
}

function removeAdditionalParty () {
  $('.bill-paid-to-me').on('click', '.remove-additional-party', function (event) {
    event.preventDefault();
    const parties = $('.bill-paid-to-me *').filter('input');
    parties[parties.length - 1].remove();
    $(this).remove();
  });

  $('.bill-paid-by-me').on('click', '.remove-additional-party', function (event) {
    event.preventDefault();
    const parties = $('.bill-paid-by-me *').filter('input');
    parties[parties.length - 1].remove();
    $(this).remove();
  });
}
// DOES (and should)
function postNewBill () {
  // post new user bill w/ ajax
  $("#new-bill-form").submit(function(event) {
    event.preventDefault();

    (function trimTextInputs () {
      
      const title = $('#bill-title-input').val();
      console.log(title);
      $('#bill-title-input').val($.trim(title));
      console.log($('#bill-title-input').val());
      
    })();

    let recurring;
    let interval;
    let title = $('#bill-title-input').val();
    let amount = $('#bill-amount-input').val();
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

      (function defineDueDate () {

        function addNumberSuffix (num) {
          let j = num % 10;
          let k = num % 100;
          if (j === 1 && k !== 11) {
            return num + "st";
          }
          if (j === 2 && k !== 12) {
            return num + "nd";
          }
          if (j === 3 && k !== 13) {
            return num + "rd";
          }
          return num + "th";
        }

        if (interval === '1d') {
          dueDate = `Every day`;
        }
        if (interval === '7d') {
          const weekday = $('.bill-recurrence-weekly select').val();
          dueDate = `Every ${weekday}`;
        }
        if (interval === '1m') {
          let date = $('.bill-recurrence-monthly select').val();
          dueDate = `${addNumberSuffix(date)} of every month`;
        }
        if (interval === '1y') {
          const day = $('.bill-recurrence-yearly .daydropdown').val();
          const month = $('.bill-recurrence-yearly .monthdropdown').val();
          dueDate = `${month} ${addNumberSuffix(day)} of every year`;
        }
      })();

    } else {
      interval = null;
      let day = $('.when-is-bill-due .daydropdown').val();
      let month = $('.when-is-bill-due .monthdropdown').val();
      let year = $('.when-is-bill-due .yeardropdown').val();
      dueDate = `${month} ${day}, ${year}`;
    }
    //define billPayer and billReceiver
    let billPayer;
    let billReceiver;
    (function defineBillParties () {
      if ($("input[name='bill-payer-input']:checked").val() === 'By Me') {
        billPayer = ['Me'];
        billReceiver = $("input[name='bill-paid-by-me-input[]']").map(function() {
          return $(this).val();
        }).get();
        // console.log(billPayer, billReceiver);
      }
      if ($("input[name='bill-payer-input']:checked").val() === 'To Me') {
        billPayer = $("input[name='bill-paid-to-me-input[]']").map(function() {
          return $(this).val();
        }).get();
        billReceiver = ['Me'];
        // console.log(billPayer, billReceiver);
      }
    })();

    $.ajax({
      type: "POST",
      url: 'user',
      dataType: 'json',
      headers: {Authorization: `Bearer ${getToken()}`},
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
      success: function () {
        fetchUserBills(displayUserBills);
        // clear and hide form
        $('#new-bill-form').trigger("reset").hide();
        hideFormDivs();
        removeExtraBillPayerInputs();
        // temp fix to remove added bill parties inputs
        // location.reload();
      },
      error: function(error) {console.error(error)}
    });

  });
}
// reset hidden divs back to hidden upon form submit
  // DOES
function hideFormDivs () {
  const divsToRemainVisible = [
    'bill-title',
    'bill-amount',
    'bill-payer',
    'bill-recurring'
  ];

  $('#new-bill-form *').filter('div').each(function (div) {
    $(this).hide();
    for (let i = 0; i < divsToRemainVisible.length; i++) {
      if ($(this).hasClass(divsToRemainVisible[i])) {
        $(this).show();
      }
    }
  });
}

// removes all additional bill party inputs and buttons on submit
  // DOESN'T
function removeExtraBillPayerInputs () {
  const billPayerDivs = [
    '.bill-paid-to-me',
    '.bill-paid-by-me'
  ];

  for (let i = 0; i < billPayerDivs.length; i++) {
    $(`${billPayerDivs[i]} *`).filter('input').each(function (input) {
      if (input === 0) {
        return;
      }
      $(this).remove();
    });
  }
  $('.remove-additional-party').remove();
}

function editBill () {
  // show form with current bill values prepopulated
  // fetchUserBills on success
  $('.bills').on('click', '.editBill', function (event) {
    event.preventDefault();

    // fetchUserBills
      // write new func to display form values as success callback

    const $billID = $(this).parent().data('id');
    const $billTitle = $(this).parent().find('.bill-title').text();
    const $billAmount = $(this).parent().find('.bill-amount').text();
    const $billDueDate = $(this).parent().find('.due-date').text();
    const $billParties = $(this).parent().find('.bill-parties').text();
    console.log($billAmount);

    const editBillFormHTML = `
    <form role="form" id="edit-bill-form">

    <div class="bill-title">
      <label for="bill-title-input">Bill Title:</label>
      <input type="text" name="bill-title" id="bill-title-input" placeholder="Rent, Utilities" required>
    </div>

    <div class="bill-amount">
      <label for="bill-amount-input">Amount:</label>
      <input type="number" min="0" step="0.01" id="bill-amount-input" placeholder="$100" required>
    </div>

    <!-- Am I paying or receiving this bill? -->
    <div class="bill-payer">
      <p>Will this bill be paid <span class="underline">by you</span> or <span class="underline">to you</span>?</p>
      <input type="radio" id="by-me" name="bill-payer-input" value="By Me" required>
      <label for="by-me">By Me</label>
      <input type="radio" id="to-me" name="bill-payer-input" value="To Me" required>
      <label for="to-me">To Me</label>
    </div>
    
    <!-- If bill is to be paid to me -->
    <div hidden class="bill-paid-to-me">
      <label for="bill-paid-to-me-input[]">Who is paying you this bill?</label>
      <input type="text" name="bill-paid-to-me-input[]" id="bill-paid-to-me-input" placeholder="Jack, Jill, Up The Hill, Inc.">
      <button class="add-additional-party">Add Additional</button>
    </div>

    <!-- If bill is to be paid by me -->
    <div hidden class="bill-paid-by-me">
      <label for="bill-paid-by-me-input[]">To whom are you paying this bill?</label>
      <input type="text" name="bill-paid-by-me-input[]" id="bill-paid-by-me-input" placeholder="Jack, Jill, Up The Hill, Inc.">
      <button class="add-additional-party">Add Additional</button>
    </div>

    <!-- Is this bill recurring? -->
    <div class="bill-recurring">
      <p>Is this bill recurring?</p>
      <input type="radio" id="yes" name="bill-recurring-input" value="Yes" required>
      <label for="yes">Yes</label>
      <input type="radio" id="no" name="bill-recurring-input" value="No" required>
      <label for="no">No</label>
    </div>

    <!-- If bill is not recurring, when is it due? -->
    <div hidden class="when-is-bill-due">
      <p>When is this bill due?</p>
      <select class="daydropdown"></select> 
      <select class="monthdropdown"></select> 
      <select class="yeardropdown"></select>
    </div>

    <!-- If bill is recurring, how often? -->
    <div hidden class="bill-recurrence-frequency">
      <p>How often does this bill recur?</p>
      <input type="radio" id="daily" name="bill-recurring-value" value="daily">
      <label for="daily">Daily</label>
      <input type="radio" id="weekly" name="bill-recurring-value" value="weekly">
      <label for="weekly">Weekly</label>
      <input type="radio" id="monthly" name="bill-recurring-value" value="monthly">
      <label for="monthly">Monthly</label>
      <input type="radio" id="Yearly" name="bill-recurring-value" value="yearly">
      <label for="Yearly">Yearly</label>
    

      <!-- If bill recurs weekly -->
      <div hidden class="bill-recurrence-weekly">
        <p>What day of the week does this bill recur?</p>
        <select>
          <option value="Monday">Monday</option> 
          <option value="Tuesday">Tuesday</option> 
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option> 
          <option value="Friday">Friday</option> 
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option> 
          <!-- <button type="submit">Submit</button> -->
        </select>
      </div>

      <!-- If bill recurs monthly -->
      <div hidden class="bill-recurrence-monthly">
        <p>What day of the month does this bill recur?</p>
        <select class="daydropdown"></select> 
        <!-- <button type="submit">Submit</button> -->
      </div>

      <!-- If bill recurs yearly -->
      <div hidden class="bill-recurrence-yearly">
        <p>What date does this bill recur?</p>
        <select class="daydropdown"></select> 
        <select class="monthdropdown"></select> 
        <!-- <button type="submit">Submit</button> -->
      </div>
    </div>

    <button type="submit">Save</button>
  </form>`;

  $(this).closest('li').html(editBillFormHTML);
  $('#edit-bill-form #bill-title-input').val($billTitle);
  $('#edit-bill-form #bill-amount-input').val($billAmount);
  
    
  });
}

$(document).ready(function() {
  checkForAuthToken();
  showNewBillForm();
  listenIfBillIsRecurring();
  populateDateDropdowns("daydropdown", "monthdropdown", "yeardropdown");
  billRecurringFrequency();
  payingOrReceiving();
  addAdditionalParty();
  removeAdditionalParty();
  postNewBill();
  deleteBill();
  editBill();
});