// create variable to hold db connection
let db;
// establish a connection to IndexedDB database  and set it to version 1
const request = indexedDB.open('PWA-Payment-App', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_payment', { autoIncrement: true }); //keyPath: "id" });
  };

  // upon a successful 
request.onsuccess = function(event) {
 db = event.target.result;
  
   if (navigator.onLine) {
     uploadPayment();
    }
  };
  
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };

function saveRecord(record) {
    const transaction = db.transaction(['new_payment'], 'readwrite');
    const paymentObjectStore = transaction.objectStore('new_payment');
    paymentObjectStore.add(record);
  }

  function uploadPayment() {
    const transaction = db.transaction(['new_payment'], 'readwrite');
    const paymentObjectStore = transaction.objectStore('new_payment');
    const getAll = paymentObjectStore.getAll();
  
    // upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/payments', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_payment'], 'readwrite');
          const paymentObjectStore = transaction.objectStore('new_payment');
          paymentObjectStore.clear();

          alert('All saved payment has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
  }

  // listen for app coming back online
window.addEventListener('online', uploadPayment);