const { Builder, Browser, By, Capabilities } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome');
const { appendRowsToSheet, getTopLotteryInfoFromSheet } = require('./sheet')

let lastDate = '', lastTime = ''
let options = new chrome.Options();
options.addArguments('--headless'); // Run in headless mode

const checkLatestLotteryInfo = async () => {
  let driver = await new Builder().setChromeOptions(options).forBrowser(Browser.CHROME).build()

  try {
    await driver.get('https://www.lottery.net/georgia/cash-pop/numbers/2024')

    const tableElements = await driver.findElements(By.css('#content .inner table>tbody>tr'))
    const topElement = tableElements[0]
    const columns = await topElement.findElements(By.css('td'))

    let dateTime = await columns[0].getText()
    const number = await columns[1].getText()

    dateTime = dateTime.split('\n')
    temp = dateTime[0].split(' - ')
    column1 = `${temp[0]}, ${dateTime[1]}`
    column2 = `${temp[1]}`
    
    if(lastDate == column1 && lastTime == column2) {
      console.log('NO NEW LOTTERY INFO FOUND! SKIPPING...')
      return
    }
    lastDate = column1, lastTime = column2
    
    console.log('NEW LOTTERY!!! Updating Google Sheet')
    console.table([column1, column2, number])

    const rowValues = [[column1, column2, number]]
    await appendRowsToSheet(rowValues)
  } finally {
    await driver.quit()
  }
}


;(async function main() {
  const res = await getTopLotteryInfoFromSheet()
  lastDate = res[0], lastTime = res[1]
  console.log('Last Lottery Date:', lastDate, lastTime)

  checkLatestLotteryInfo()
  setInterval(() => {
    checkLatestLotteryInfo()
  }, 30 * 60 * 1000)
})()

