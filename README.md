[![LinkedIn][linkedin-shield]][linkedin-url]

# Personal Assistant

![Personal Assistant Logo][site-logo]

## About the project

This project is made to be an automation for Google Calendar. The idea of the project is to facilitate the creation of related events and the visualization of any upcoming event in a list like style.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Tech Stack

### Client

- [![React][react.js]][react-url]
- [![Sass][sass]][sass-url]
- [![Axios][axios]][axios-url]

### Server

- [![Node][node.js]][node-url]
- [![Express][express.js]][express-url]
- [![Passport][passport.js]][passport-url]
- [![Google Cloud API][google-cloud]][google-cloud-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

- Ability to login using Google credentials or by creating a local user within the app.
- Create, Request, Update and Delete events and calendars from user's Google Account.
- Privacy; Only events created through the app will be fetched by the app, maintaning user security and privacy for private events and calendars.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

- Node.js must be installed on the machine in which you wish to test this app.

* npm
  ```sh
  npm install npm@latest -g
  ```

### Instalation

**Server**

1. Set up the app, credentials and Auth Screen on [Google Cloud Console](https://console.cloud.google.com/). For more details, please follow this [guide](https://developers.google.com/calendar/api/quickstart/nodejs)
2. Clone the repo
   ```sh
   git clone https://github.com/victorarabi/personal-assistant-server.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Change .env-model to .env and add the credentials acquired on step 1. You also need to define the URL and port for both the server and client.
5. Run the server
   ```sh
   nodemon server.js
   ```

**Client**

1. Clone the repo
   ```sh
   git clone https://github.com/victorarabi/personal-assistant-client.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Change .env-model to .env and copy the settings defined on server installation, step 4.
4. Start the client

   ```sh
   npm start
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/victor-arabi/
[site-logo]: /public/images/logo.png
[react.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://reactjs.org/
[node.js]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[node-url]: https://nodejs.org/en/
[express.js]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[express-url]: https://expressjs.com
[passport.js]: https://img.shields.io/badge/-Passport.js-lightgrey
[passport-url]: https://www.passportjs.org
[google-cloud]: https://img.shields.io/badge/-Google%20Cloud%20API-blue
[google-cloud-url]: https://cloud.google.com/apis
[axios]: https://img.shields.io/badge/-Axios-blueviolet
[axios-url]: https://axios-http.com
[sass]: https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white
[sass-url]: https://sass-lang.com
