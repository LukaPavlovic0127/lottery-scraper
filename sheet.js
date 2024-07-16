const { google } = require('googleapis')
const credentials = require('./sheet/credentials.json')
const token = require('./sheet/token.json')
require('dotenv').config()

const waitForTimeout = (time) => {
  return new Promise((resolve) => setTimeout(() => {
    resolve()
  }, time));
}

const spreadsheetId = process.env.SPREADSHEET_ID;

const insertOrUpdateSheetCells = async (values) => {
  const oauth2Client = new google.auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris
  );
  oauth2Client.setCredentials(token)
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const request = {
    spreadsheetId,
    valueInputOption: 'RAW',
    resource: {
      data: values.map(value => ({ range: `Sheet1!${value.column}${value.id}`, values: [[value.value]] }))
    },
  };

  try {
    const response = await sheets.spreadsheets.values.batchUpdate(request);
    return response.data.updatedCells
  } catch (error) {
    console.error('The API returned an error:', error);
    return false
  }  
}

const appendRowsToSheet = async (values) => {
  try {

    const oauth2Client = new google.auth.OAuth2(
      credentials.installed.client_id,
      credentials.installed.client_secret,
      credentials.installed.redirect_uris
    );
    oauth2Client.setCredentials(token)
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Example: Inserting a new row at position 2 (row index starts at 1)
    const requests = [{
      insertDimension: {
        range: {
          sheetId: '0',
          dimension: 'ROWS',
          startIndex: 1, // Row index where the new row should be inserted
          endIndex: 2,
        },
        inheritFromBefore: false,
      },
    }];
  
    const batchUpdateRequest = { requests };
  
    try {
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: batchUpdateRequest,
      });
      console.log('Row Inserted')
    } catch (error) {
      console.error('Error on inserting row', error)
    }

    const resource = { values }
    let tries = 3

    while(tries --) {
      try {
        const response = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Sheet1!A1:C1',
          valueInputOption: 'RAW',
          resource: resource
        });
        return response.data.updatedCells
      } catch (error) {
        console.error('The API returned an error:', error, 'retrying... Left: ', tries); 
      }
      await waitForTimeout(10000)
    }
  } catch (err) {
    console.error(err)
  }
}

const getTopLotteryInfoFromSheet = async () => {
  try {    
    const oauth2Client = new google.auth.OAuth2(
      credentials.installed.client_id,
      credentials.installed.client_secret,
      credentials.installed.redirect_uris
    );
    oauth2Client.setCredentials(token)
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:B2',
    });
    console.log(result.data.values)
    return [result.data.values[0][0], result.data.values[0][1]];
  } catch (err) {
    return ''
  }
}


module.exports = {
  appendRowsToSheet,
  getTopLotteryInfoFromSheet,
  insertOrUpdateSheetCells
}