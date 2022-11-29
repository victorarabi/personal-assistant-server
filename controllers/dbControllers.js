const fs = require('fs').promises;
const path = require('path');
const process = require('process');

//The user data is store on the file users.json
const USERS_PATH = path.join(process.cwd(), './model/users.json');
/**
 * Reads user data from db.
 *
 * @return {Promise<dbData|null>}
 */
async function loadUserData() {
  try {
    const content = await fs.readFile(USERS_PATH);
    const db = JSON.parse(content);
    return db;
  } catch (err) {
    console.log('error while saving file' + err);
  }
}

module.exports.loadUserData = loadUserData;
