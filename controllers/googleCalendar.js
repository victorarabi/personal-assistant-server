const axios = require('axios');

/**
 * Function that fetchs data from user Google Calendar.
 */
exports.getEvents = (calendarID, apiKey) => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events?key=${apiKey}&timeMin=2022-01-01T00:00:00-00:00`;
  axios
    .get(url)
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.log(e);
    });
};
