const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');
const { mongo_username, mongo_password } = require('./config');

const urlCoronaData = 'https://datawrapper.dwcdn.net/DwpzG/7/'

let scrape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(urlCoronaData);
  
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

async function connectAndUpdateData(data){
  const uri = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0-lf1xq.gcp.mongodb.net/test?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true });

  try {
    await client.connect();
    await  updateCases(client, data);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function updateCases(client, cases){
  const collection = await client.db("corona_cases").collection("cases");

  collection.deleteMany({});
  collection.insertMany(cases);
};

scrape().then((data) => {
  connectAndUpdateData(data).catch(console.error)
})
