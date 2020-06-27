## Overall architecture

<p align="center">
  <img width="800" src="https://res.cloudinary.com/stanleysathler/image/upload/v1590345728/nothing/cron-arch.svg">
</p>

## Behind the scenes

Every day, at a given time, we crawl a trusted news page (https://em.com.br/) to collect the confirmed cases of COVID-19 in each neighborhood in Belo Horizonte, MG, Brazil.

To persist the extracted data, we save it into a MongoDB instance. No history is maintained: every single day, the stale data gets replaced by the newest one.

