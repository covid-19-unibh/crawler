const puppeteer = require('puppeteer');

const url = 'https://datawrapper.dwcdn.net/DwpzG/4/'

let scrape = async() => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  const data = await page.evaluate(() => {
    const neighborhoodsData = []
    const rows = document.querySelectorAll('table > tbody > tr')
    
    rows.forEach((row) => {
        var tds = row.querySelectorAll('td')
  
        neighborhoodsData.push({
          neighborhood: tds[0].innerText,
          serious: parseInt(tds[2].innerText),
          nonSerious: parseInt(tds[3].innerText),
          deaths: parseInt(tds[4].innerText),
        })
    })

    return neighborhoodsData
  })

  browser.close()
  return data
};

scrape().then((value) => {
  console.log(value)
})
