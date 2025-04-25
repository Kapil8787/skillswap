fetch("https://x8ki-letl-twmt.n7.xano.io/api:yMKVO2U0")
  .then(response => response.json())
  .then(data => {
    console.log(data); // Use this data to update your UI
  })
  .catch(error => {
    console.error('Error:', error);
  });
