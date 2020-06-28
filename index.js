const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');
const { mongo_username, mongo_password } = require('./config');

const urlCoronaData = 'https://datawrapper.dwcdn.net/DwpzG/7/';

let scrape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(urlCoronaData);
  let confirmedCases = []

  const extractPageData = () => {
    const pageData = []
    const rows = document.querySelectorAll('table > tbody > tr')
      
    rows.forEach((row) => {
      var tds = row.querySelectorAll('td')

      pageData.push({
        neighborhood: tds[0].innerText,
        serious: parseInt(tds[2].innerText),
        nonSerious: parseInt(tds[3].innerText),
        deaths: parseInt(tds[4].innerText),
      });
    });
    
    return pageData
  }

  for (let pageNumber = 1; pageNumber <= 29; pageNumber++) {
    const pageCases = await page.evaluate(extractPageData);
    confirmedCases = confirmedCases.concat(pageCases)

    if (pageNumber < 29)
      await page.click('button.next')
  }

  browser.close()
  return confirmedCases
};

async function connectAndUpdateData(data) {
  const uri = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0-lf1xq.gcp.mongodb.net/test?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true });

  try {
    await client.connect();
    await updateCases(client, data);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function updateCases(client, cases) {
  const collection = await client.db("corona_cases").collection("cases");

  collection.deleteMany();
  collection.insertMany(cases);
};

scrape().then((data) => {
  console.log('Inserting data in database...')
  connectAndUpdateData(data).catch(console.error)
});
