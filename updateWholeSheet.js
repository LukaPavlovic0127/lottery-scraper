const { Builder, Browser, By } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome');
const { insertOrUpdateSheetCells } = require('./sheet')

let options = new chrome.Options();
options.addArguments('--headless'); // Run in headless mode

const updateWholeLotterySheet = async () => {
  let driver = await new Builder().setChromeOptions(options).forBrowser(Browser.CHROME).build()
  const res = []

  try {
    await driver.get('https://www.lottery.net/georgia/cash-pop/numbers/2024')

    const tableElements = await driver.findElements(By.css('#content .inner table>tbody>tr'))
    const len = tableElements.length
    for(let i = 0; i < len; i ++) {
      const element = tableElements[i]
      const columns = await element.findElements(By.css('td'))

      let dateTime = await columns[0].getText()
      const number = await columns[1].getText()

      dateTime = dateTime.split('\n')
      temp = dateTime[0].split(' - ')
      column1 = `${temp[0]}, ${dateTime[1]}`
      column2 = `${temp[1]}`

      res.push({ column: 'A', id: i + 2, value: column1 })
      res.push({ column: 'B', id: i + 2, value: column2 })
      res.push({ column: 'C', id: i + 2, value: number })
    }
    console.log(res.length)
    insertOrUpdateSheetCells(res)
  } finally {
    await driver.quit()
  }
}


;(async function main() {
  updateWholeLotterySheet()
})()

