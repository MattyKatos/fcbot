const axios = require('axios');

const freeCompanyId = '9231394073691181144';
const url = `https://xivapi.com/freecompany/${freeCompanyId}?data=FCM `;

axios.get(url)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error fetching data from XIVAPI:', error.data);
  });