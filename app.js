
//Set up checkbox actions and default selection
document.getElementById('threeday').checked = true
document.getElementById('threeday').addEventListener('change', function(){
  if (this.checked) {
    document.getElementById('sixday').checked = false
  } else{
    this.checked = true
  }
})
document.getElementById('sixday').addEventListener('change', function(){
  if (this.checked) {
    document.getElementById('threeday').checked = false
  } else{
    this.checked = true
  }
})
// clears data before each new api call
function clearOldData(){
    for(let i = 2;i<table.rows.length;){
      table.deleteRow(i);
  }
}
//Set up listeners for previous and next buttons
document.getElementById('prevbutton').addEventListener('click',prevpredictions)
document.getElementById('nextbutton').addEventListener('click',nextpredictions)

//Establish prelim date adjuster variable for prev and next (how many days to add or subtract) 
// This depends on what cycle is selected in the checkboxes
function prevpredictions(evt) {
  let datePicker = document.getElementById("pred_date").value
  let tday = new Date(datePicker)
  let dateDay = tday.getDay();
  if (document.getElementById('threeday').checked === true) {
      let dateadjustment = dateDay === 1 ? -2 : -1 
      datecorrection(dateadjustment);
  } else{  
      let dateadjustment = dateDay === 0 ? -1 : 0 
      datecorrection(dateadjustment);
    }
}
function nextpredictions(evt) {
  let datePicker = document.getElementById("pred_date").value
  let tday = new Date(datePicker)
  let dateDay = tday.getDay();
  if (document.getElementById('threeday').checked === true) {
      let dateadjustment = dateDay === 5 ? 4 : 3 
      datecorrection(dateadjustment);
    } else{  
      let dateadjustment = dateDay === 5 ? 3 : 2 
      datecorrection(dateadjustment);
    }
}

// Using prelim date adjuster, further adjusts date by a series of re-formating when needed
// Calls api and inserts new date in datePicker
function datecorrection(dateadjustment){
  let datePicker = document.getElementById("pred_date").value
  let date = new Date(datePicker)
  const newDate = date.getDate() + dateadjustment;
  date.setDate(newDate)
  let switchDate = (date.toLocaleDateString())
  clearOldData()
  SendApi(switchDate,"Y")
  let dat = switchDate
  let yourdate = dat.split("/").reverse();
  let mm = yourdate[2] < 10 ? (0 + yourdate[2]): yourdate[2]
  let dd = yourdate[1] < 10 ? (0 + yourdate[1]): yourdate[1]
  let yyyy = yourdate[0]
  newdatePicker = (yyyy +"-"+mm+"-"+dd)
  document.getElementById("pred_date").value = newdatePicker
}


//Format datePicker date and call API from 'Get predictions' button
document.getElementById("predbutton").onclick = function(){
    clearOldData()
    let datePicker = document.getElementById("pred_date").value
    let dateFormat = datePicker.split("-");  
    let urlDate = dateFormat[1]+ "/" +dateFormat[2]+ "/" +dateFormat[0].substring(2); 
    let tday = new Date(datePicker)
    let dateDay = tday.getDay();
    SendApi(urlDate)  
} 

//send API 
function SendApi(date, loadFilter = "N"){
  // let url = ("../xxxxxxxxxxxxxxxx" + date + "&enddate=" + date);
  let url = ("https:xxxxxxxxxxxxxxxxxxxxxxxstartdate=" + date + "&enddate=" + date);
    fetch(url)
    .then(resp => resp.json())
    .then(apidata =>{
      if (apidata.predictions.length < 1) {
          alert ("NO PREDICTION FOUND | RECHECK DATE");
      }

      for (let i = 0; i < (apidata.predictions.length); i++){
         for (let j = 0; j < (apidata.predictions[i].prediction[1].items.length); j++){
            tr = table.insertRow(-1)     
            let Cell1 = tr.insertCell(-1);
                Cell1.innerHTML = (apidata.predictions[i].prediction[0].supplier[0].farm)
                Cell1.className ='row';
                Cell1.addEventListener("click",farmfilter);
            let Cell2 = tr.insertCell(-1);
                Cell2.innerHTML = (apidata.predictions[i].prediction[1].items[j].qty)
            let Cell3 = tr.insertCell(-1);
                Cell3.innerHTML = (apidata.predictions[i].prediction[1].items[j].sku)
            let Cell4 = tr.insertCell(-1);
                Cell4.innerHTML = (apidata.predictions[i].prediction[1].items[j].desc)
                Cell4.className ='row';
                Cell4.addEventListener("click",itemfilter);
            let Cell5 = tr.insertCell(-1);
                if ((apidata.predictions[i].prediction[1].items[j].risk)===1) {
                  Cell5.innerHTML = "At_Risk" 
                } else {
                  Cell5.innerHTML = "" 
                }
            let Cell6 = tr.insertCell(-1);
                Cell6.innerHTML = (apidata.predictions[i].prediction[1].items[j].notes)
  }
  }

  // Sort table A-Z by Farm Name
  sortTable()
  function sortTable() {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("table");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[0];
        y = rows[i + 1].getElementsByTagName("td")[0];
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

  // When prev and next buttons are being used, maintain previous filtering
  if (loadFilter ==="Y" && document.getElementById("farminput").value != "") {
    document.getElementById("iteminput").value =""
    farmsearch()
  }
  if (loadFilter ==="Y" && document.getElementById("iteminput").value != "") {
    document.getElementById("farminput").value =""
    itemsearch()
  }

  // Set up filters to retrieve table values from farm and item click and call filtering
  function itemfilter(evt){
      document.getElementById("iteminput").value = (evt.currentTarget.innerHTML);
      document.getElementById("farminput").value = ""
      farmsearch();
      itemsearch();
    }
    function farmfilter(evt){
      document.getElementById("iteminput").value = ""
      document.getElementById("farminput").value = (evt.currentTarget.innerHTML);
      itemsearch();
      farmsearch();
    }
    // Add listeners to main filter inputs and clear button actions
    document.getElementById("farminput").addEventListener("keyup",farmsearch);
    document.getElementById("iteminput").addEventListener("keyup",itemsearch);
    document.getElementById("clearitemfilter").onclick = function(){
      document.getElementById("iteminput").value = ""
      document.getElementById("farminput").value = ""
      farmsearch();
      itemsearch();
    }
    // farm filter
    function farmsearch() {
      let input, filter, table, tr, td, i;
      input = document.getElementById("farminput");
      filter = input.value.toUpperCase();
      table = document.getElementById("table");
      tr = table.getElementsByTagName("tr");
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
          if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }       
      }
    }
    // item filter
    function itemsearch() {
      let input, filter, table, tr, td, i;
      input = document.getElementById("iteminput");
      filter = input.value.toUpperCase();
      table = document.getElementById("table");
      tr = table.getElementsByTagName("tr");
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[3];
        if (td) {
          if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }       
      }
    }
  })
}


// console.log("EndOfScript")
//Final
