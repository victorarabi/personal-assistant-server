const axios = require('axios');

/**
 * Function that fetchs data from user Google Calendar.
 */
exports.getEvents = (calendarID, apiKey) => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events?key=${apiKey}&timeMin=2022-01-01T00:00:00-00:00`;
  axios
    .get(url)
    .then((res) => {
      const content = [];
      console.log(res.data.items);
      // content.push(res.data.items);
      // console.log(content[0]);
      // content.map((event) => {
      //   console.log(event.start);
      // });
    })
    .catch((e) => {
      console.log(e);
    });
};

exports.createCalendar = (accessToken, summary) => {
  const url = `https://www.googleapis.com/calendar/v3/calendars`;
  axios
    .post(url, { summary: summary }, { Authorization: `Bearer ${accessToken}` })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
};
