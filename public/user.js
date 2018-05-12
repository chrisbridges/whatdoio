// sole global variable used to store user's bills
let bills = [];

// function to parseJWT (used to retrieve userID without making another call to back-end)
  // https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript
function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};
// parse token and return user ID
function getUserIDFromToken () {
  const result = parseJwt(getToken());
  return result.user.id;
}
// parse token and return username
function getUserNameFromToken () {
  const result = parseJwt(getToken());
  return result.user.name;
}
// get authorization token from local storage
function getToken () {
  return localStorage.getItem('authToken');
}
// ensure that user is allowed to view this page, else redirect
function checkForAuthToken () {
  if (getToken()) {
    // fetch user bills if authenticated
    fetchUserBills();
  } else {
    // redirect to login
    window.location.href = '/login';
  }
}
// display's user name
function displayUserName () {
  $('#welcome-user').text(getUserNameFromToken());
}
// fetch user's bills upon initial page load
function fetchUserBills () {
  $.ajax({
    type: 'GET',
    url: 'user?noCache=true', // differentiated url with query to prevent Chrome from caching page
    headers: {Authorization: `Bearer ${getToken()}`},
    contentType: "application/json",
    success: function (response) {
      storeBillsLocally(response);
    },
    error: function(error) {console.error(error)}
  });
}
// bills are stored locally to prevent excessive API calls
function storeBillsLocally (response) {
  bills = response.bills;
  displayUserBills(bills);
}
// display bills client-side
function displayUserBills (bills) {
  // clear out previously shown bills before appending new ones
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
// format bill for displaying client-side
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
    // if decimal values are only trailing zeroes, forget em
    if (num.toString() === num.toFixed(0)) {
      return num;
    }
    return num.toFixed(2);
  }
  function amountWithCommas (x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  return `
  <div class="row">
    <div data-id=${bill._id} class="bill">
      <div class="due-date-box col-3">
        <p class="due-date"><span class="due-date-due">Due:</span><br>${bill.dueDate}</p>
      </div>
      <div class="bill-title-and-parties col-6">
        <p class="bill-title">${bill.title}</p>
        <p class="bill-parties">from: ${billParties}</p>
      </div>
      <div class="col-3">
        <p class="bill-amount">$${amountWithCommas(limitNumbersAfterDecimal(bill.amount))}</p>
      </div>
      <input type="image" class="deleteBill" src="https://i.imgur.com/KCPL1FN.png" alt="Delete Bill Icon" />
      <input type="image" class="editBill" src="https://i.imgur.com/Itkb5gf.png" alt="Edit Bill Icon" />
    </div>
  </div>
  
  <hr class="bill-line-break">`;
}
// populates 'select' dropdowns with dates and auto-selects with today's date
function populateDateDropdowns (dayfield, monthfield, yearfield) {
  // INSPIRED FROM JAVASCRIPT KIT, HEAVILY MODIFIED BY CHRIS BRIDGES
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
  const today = new Date();
  var dayfield = document.getElementsByClassName(dayfield);
  var monthfield = document.getElementsByClassName(monthfield);
  var yearfield = document.getElementsByClassName(yearfield);
  for (let j = 0; j < dayfield.length; j++) {
    for (var i = 1; i <= 31; i++) {
      //select today's day
      dayfield[j].options[i] = new Option(i, i);
      dayfield[j].options[today.getDate()] = new Option(today.getDate(), today.getDate(), true, true);
    }
  }
  for (let j = 0; j < monthfield.length; j++) {
    for (var m = 0; m < 12; m++) {
      //select today's month
      monthfield[j].options[m] = new Option(months[m], months[m]);
      monthfield[j].options[today.getMonth()] = new Option(months[today.getMonth()], months[today.getMonth()], true, true);
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
// display form for user to add new bill
function showNewBillForm () {
  $('.add-new-bill').click(function () {
    // run this function to clear the page of any 'edit bill forms'
      // ensuring that only one form is displayed at once
    resetAddNewBillForm();
    displayUserBills(bills);
    blurBackground();
    $('#new-bill-form').show();
  });
}
// if user decides to not add new bill
function cancelNewBill () {
  $('.cancel-new-bill').on('click', function (event) {
    event.preventDefault();
    displayUserBills(bills);
    resetAddNewBillForm();
    blurBackground();
  });
}
// clear out any form elements that may have been added to the DOM
function resetAddNewBillForm () {
  $('#new-bill-form').trigger("reset").hide();
  // reset hidden divs back to hidden upon form submit
  (function hideFormDivs () {
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
  })();
  // remove any dynamically added bill party inputs upon form submission
  (function removeExtraBillPayerInputs () {
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
  })();
}
// listen for if the user is paying or receiving this particular bill
function listenForPayingOrReceiving () {
  // func is immediately invoked when called to auto-populate edit bill form
    // listener is set for when user inputs value on add bill form
  function showProperInputs () {
  // if bill is to be paid BY me
    // for whichever part of form is hidden, no longer require that question
    if ($("input[name='bill-payer-input']:checked").val() === 'By Me') {
      $('.bill-paid-by-me').show().find(':input').attr('required', true);
      $('.bill-paid-to-me').hide().find(':input').attr('required', false);
    }
    // if bill is to be paid TO me
    if ($("input[name='bill-payer-input']:checked").val() === 'To Me') {
      $('.bill-paid-by-me').hide().find(':input').attr('required', false);
      $('.bill-paid-to-me').show().find(':input').attr('required', true);
    }
  }
  showProperInputs();

  $('input:radio[name="bill-payer-input"]').change(function() {
    showProperInputs();
  });
}
// listen for is this particular bill is recurring
function listenIfBillIsRecurring () {

  function showProperInputs () {
  // if bill is recurring, ask how often
    // hide counter-question in case user changes mind
    if ($("input[name='bill-recurring-input']:checked").val() === 'Yes') {
      $('.bill-recurrence-frequency').show().find(':input').attr('required', true);
      $('.when-is-bill-due').hide().find(':input').attr('required', false);
    }
    // if bill is not recurring, ask for date due
    else if ($("input[name='bill-recurring-input']:checked").val() === 'No') {
      $('.when-is-bill-due').show().find(':input').attr('required', true);
      $('.bill-recurrence-frequency').hide().find(':input').attr('required', false);
    }
  }
  showProperInputs();

  $('input:radio[name="bill-recurring-input"]').change(function(){
    showProperInputs();
  });
}
// if bill is recurring, how often?
function listenForBillRecurrenceFrequency () {

  function showProperInputs () {
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
  }
  showProperInputs();

  $('input:radio[name="bill-recurring-value"]').change(function() {
    showProperInputs();
  });
}
// add additional bill party if bill involves more than 1 person
function addAdditionalParty () {
  $('.add-additional-party').unbind('click');
  $('.add-additional-party').on('click', function (event) {
    event.preventDefault();
    if ($(this).parent().hasClass('bill-paid-to-me')) {
      const billPaidToMeHTML = `
        <input type="text" name="bill-paid-to-me-input[]" id="bill-paid-to-me-input" placeholder="Friend, company, co-worker, etc.">
        <button class="remove-additional-party">X</button>`;
      $(billPaidToMeHTML).insertBefore(this);
    }
    else if ($(this).parent().hasClass('bill-paid-by-me')) {
      const billPaidByMeHTML = `
        <input type="text" name="bill-paid-by-me-input[]" id="bill-paid-by-me-input" placeholder="Friend, company, co-worker, etc.">
        <button class="remove-additional-party">X</button>`;
      $(billPaidByMeHTML).insertBefore(this);
    }
  });
}
// remove additional bill party 
function removeAdditionalParty () {
  $('.bill-paid-to-me').on('click', '.remove-additional-party', function (event) {
    event.preventDefault();
    $(this).prev('input').remove();
    $(this).remove();
  });

  $('.bill-paid-by-me').on('click', '.remove-additional-party', function (event) {
    event.preventDefault();
    $(this).prev('input').remove();
    $(this).remove();
  });
}
// post new bill to database
function postNewBill () {
  $("#new-bill-form").submit(function(event) {
    event.preventDefault();
    const data = defineBillData();
    const userID = getUserIDFromToken();

    $.ajax({
      type: "POST",
      url: `user/${userID}/bills`,
      dataType: 'json',
      headers: {Authorization: `Bearer ${getToken()}`},
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        storeBillsLocally(response);
        blurBackground();
        resetAddNewBillForm();
      },
      error: function(error) {console.error(error)}
    });
  });
}
// removes bill from database
function deleteBill () {
  $('.bills').on('click', '.deleteBill', function (event) {
    // need to listen on DOM element that's already there
    const $billID = $(this).closest('.bill').data('id');
    const userID = getUserIDFromToken();

    $.ajax({
      type: "DELETE",
      url: `user/${userID}/bills/${$billID}`,
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
// defining bill data from form for submission to API
function defineBillData () {
  let recurring = defineRecurring();
  let interval;
  let title = $('#bill-title-input').val();
  let amount = parseFloat($('#bill-amount-input').val());
  let dueDate;
  // check if bill is recurring
  function defineRecurring (value) {
    if ($("input[name='bill-recurring-input']:checked").val() === 'Yes') {
      value = true;
    }
    if ($("input[name='bill-recurring-input']:checked").val() === 'No') {
      value = false;
    }
    return value;
  };
  // if it is recurring, what is the frequency?
  if (recurring) {
    const frequencyValues = {
      daily: 'daily',
      weekly: 'weekly',
      monthly: 'monthly',
      yearly: 'yearly'
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

      if (interval === 'daily') {
        dueDate = `Every day`;
      }
      if (interval === 'weekly') {
        const weekday = $('.bill-recurrence-weekly select').val();
        dueDate = `Every ${weekday}`;
      }
      if (interval === 'monthly') {
        let date = $('.bill-recurrence-monthly select').val();
        dueDate = `${addNumberSuffix(date)} of every month`;
      }
      if (interval === 'yearly') {
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

  function defineBillParties () {
    let billPayer, billReceiver;
    if ($("input[name='bill-payer-input']:checked").val() === 'By Me') {
      billPayer = ['Me'];
      billReceiver = $("input[name='bill-paid-by-me-input[]']").map(function() {
        return $(this).val();
      }).get();
    }
    if ($("input[name='bill-payer-input']:checked").val() === 'To Me') {
      billPayer = $("input[name='bill-paid-to-me-input[]']").map(function() {
        return $(this).val();
      }).get();
      billReceiver = ['Me'];
    }
    return {billPayer: billPayer, billReceiver: billReceiver};
  };
  let billParties = defineBillParties();
  let {billPayer, billReceiver} = billParties;
  billPayer = removeEmptyInputs(billPayer);
  billReceiver = removeEmptyInputs(billReceiver);

  const data = {
    for: billPayer, 
    from: billReceiver, 
    amount: amount, 
    title: title, 
    dueDate: dueDate, 
    recurring: recurring, 
    interval: interval
  };

  return data;
}
// remove empty bill party values before committing to database
function removeEmptyInputs (inputs) {
  let trimmedInputs = inputs.map(function (input) {
    return input.trim();
  });
  let filteredInputs = trimmedInputs.filter(function (input) {
    return input !== '';
  });
  return filteredInputs;
}
// displays edit bill form with current bill values pre-populated
  // verifies appropriate values entered
  // submits edits to database and displays
function editBill () {
  // show form with current bill values prepopulated
  $('.bills').on('click', '.editBill', function (event) {
    event.preventDefault();
    resetAddNewBillForm();

    const $billID = $(this).closest('.bill').data('id');
    const editBillFormHTML = `
    <form role="form" id="edit-bill-form" aria-live="assertive">

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
      <input type="text" name="bill-paid-to-me-input[]" id="bill-paid-to-me-input" placeholder="Friend, company, co-worker, etc.">
      <button class="add-additional-party">Add Additional</button>
    </div>

    <!-- If bill is to be paid by me -->
    <div hidden class="bill-paid-by-me">
      <label for="bill-paid-by-me-input[]">To whom are you paying this bill?</label>
      <input type="text" name="bill-paid-by-me-input[]" id="bill-paid-by-me-input" placeholder="Friend, company, co-worker, etc.">
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
        <select class="day-of-the-week-dropdown">
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
    
    <button class="save-bill-edits">Save</button>
    <button class="cancel-bill-edits">Cancel</button>
  </form>`;

  $(this).closest('li').html(editBillFormHTML);

  // users can cancel if they decide they don't want to edit bill
  (function cancelBillEdits () {
    $('.cancel-bill-edits').on('click', function (event) {
      event.preventDefault();
      displayUserBills(bills);
      return false;
    });
  })();

  populateDateDropdowns("daydropdown", "monthdropdown", "yeardropdown");
  const bill = bills.find(function (element) {
    return element._id === $billID;
  });
  let {amount, dueDate, interval, recurring, title} = bill;
  let billPayer = bill.for;
  let billReceiver = bill.from;
  // capture bill values, display them appropriately on form
  (function displayBillDataOnForm () {
    // bill title
    $('#edit-bill-form #bill-title-input').val(title);
    // bill amount
    $('#edit-bill-form #bill-amount-input').val(amount);
    // Paid: By Me or To Me?
    (function payingOrReceiving () {
      if (billPayer[0] === 'Me' && billPayer.length === 1) {
        $(`#edit-bill-form input[name="bill-payer-input"][value="By Me"]`).prop("checked", true);
        addAdditionalParty();
        for (let i = 0; i < billReceiver.length; i ++) {
          if (i === 0) {
            // for the first party, an additional input does not need to be added to the DOM, since one is loaded initially
            $($('#edit-bill-form input[name="bill-paid-by-me-input[]"]')[i]).val(billReceiver[i]);
            continue;
          }
          $('.add-additional-party').trigger('click');
          $($('#edit-bill-form input[name="bill-paid-by-me-input[]"]')[i]).val(billReceiver[i]);
        }
      }
      else if (billReceiver[0] === 'Me' && billReceiver.length === 1) {
        $(`#edit-bill-form input[name="bill-payer-input"][value="To Me"]`).prop("checked", true);
        addAdditionalParty();
        for (let i = 0; i < billPayer.length; i ++) {
          if (i === 0) {
            $($('#edit-bill-form input[name="bill-paid-to-me-input[]"]')[i]).val(billPayer[i]);
            continue;
          }
          $('.add-additional-party').trigger('click');
          $($('#edit-bill-form input[name="bill-paid-to-me-input[]"]')[i]).val(billPayer[i]);
        }
      }
    })();
    // bill recurring
    (function isBillRecurring () {
      if (recurring) {
        $(`#edit-bill-form input[name="bill-recurring-input"][value="Yes"]`).prop("checked", true);
        $('#edit-bill-form input:radio[name="bill-recurring-value"]').each(function () {
          $(this);
          if ($(this).val() === interval) {
            $(this).prop("checked", true);
          }
        });
        listenForBillRecurrenceFrequency();
      } else {
        $(`#edit-bill-form input[name="bill-recurring-input"][value="No"]`).prop("checked", true);
      }
      listenIfBillIsRecurring();
    })();

    (function displayCurrentBillDateInDropdown () {
      // I should have only stored the value that I wanted to display in these dropdowns
        // in my database, but too much front-end code now depends on my original architecture
        // live and learn - this function is a less than ideal solution I'm aware
      if (interval === 'weekly') {
        const weekday = dueDate.split(' ')[1];  // grabbing the value, eliminating the "Every"
        $('.day-of-the-week-dropdown').val(weekday);
      }
      if (interval === 'monthly') {
        $('.daydropdown').val(parseInt(dueDate));
      }
      if (interval === 'yearly') {
        const dueDateSplit = dueDate.split(' ');
        const month = dueDateSplit[0]
        const date = dueDateSplit[1];
        $('.daydropdown').val(parseInt(date));
        $('.monthdropdown').val(month);
      }
      if (!recurring) {
        let dueDateSplit = dueDate.split(' ');
        let month = dueDateSplit[0];
        let date = parseInt(dueDateSplit[1]);
        let year = parseInt(dueDateSplit[2]);
        $('.daydropdown').val(date);
        $('.monthdropdown').val(month);
        $('.yeardropdown').val(year);
      }
    })();

  })();

  function billHasNoEmptyFields (newBill) {
    // return false if bill has no empty fields
      // true, elsewise
    for (let field in newBill) {
      if (typeof newBill[field] === typeof 'string') {
        newBill[field] = newBill[field].trim();
      }
      if (Array.isArray(newBill[field]) && newBill[field].length === 0) {
        newBill[field] = '';
      }
    }
    // 
    if (newBill.recurring === true && newBill.interval === undefined || newBill.interval === null) {
      newBill.interval = '';
    }
    if (newBill.recurring === false) {
      newBill.interval = null;
    }
    return Object.values(newBill).every(field => {
      return field !== '';
    });
  }

  (function submitEdits () {
    $('.save-bill-edits').on('click', function (event) {
      event.preventDefault();
      const newBillValues = defineBillData();
      if (!billHasNoEmptyFields(newBillValues)) {
        alert('Bills cannot have empty fields. Please confirm all fields are filled.');
        return false;
      }
      const changedValues = {};
      for (let field in newBillValues) {
        if (newBillValues[field] !== bill[field]) {
          changedValues[field] = newBillValues[field];
        }
      }
      const userID = getUserIDFromToken();
      $.ajax({
        type: "PUT",
        url: `user/${userID}/bills/${bill._id}`,
        dataType: 'json',
        headers: {Authorization: `Bearer ${getToken()}`},
        contentType: "application/json",
        data: JSON.stringify(changedValues),
        success: function (response) {
          storeBillsLocally(response);
          resetAddNewBillForm();
        },
        error: function(error) {console.error(error)}
      });
    });
  })();

    removeAdditionalParty();
    listenIfBillIsRecurring();
    listenForBillRecurrenceFrequency();
    listenForPayingOrReceiving();
  });
}
// when the new bill modal populates on the DOM, the rest of the page blurs out - highlighting the form
function blurBackground () {
  $('.bills, header').toggleClass('blur-it');
}
// refreshes user token
function refreshAuthToken () {
  // tokens expire after 7 days, refresh every 6
  setInterval(function () {
    $.ajax({
      type: 'POST',
      url: 'login/refresh',
      success: function (response) {
        localStorage.setItem("authToken", response.authToken);
      },
      error: function(error) {console.error(error)}
    });
  }, 518400000);
}
// log's out user and removes auth token
function logoutUser () {
  $('.logout-button').on('click', function(event) {
    event.preventDefault();
    $.ajax({
      type: 'GET',
      url: 'user/logout',
      success: function () {
        window.location.href = '/user/logout';
      },
      error: function(error) {console.error(error)}
    });
  });
}

$(document).ready(function() {
  checkForAuthToken();
  displayUserName();
  showNewBillForm();
  cancelNewBill();
  listenIfBillIsRecurring();
  listenForBillRecurrenceFrequency();
  listenForPayingOrReceiving();
  populateDateDropdowns("daydropdown", "monthdropdown", "yeardropdown");
  addAdditionalParty();
  removeAdditionalParty();
  postNewBill();
  deleteBill();
  editBill();
  logoutUser();
});