const http = require("http");
const { URL } = require("url");
const { Client } = require("@elastic/elasticsearch");
const { DESTRUCTION } = require("dns");

const client = new Client({
  node: process.env.ES_URL
});

http.createServer(handle).listen(8080);

async function handle(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const url = new URL(`http://incoming${req.url}`);
    switch (`${req.method} ${url.pathname}`) {
      case "GET /orgs":
        res.writeHead(200).end(
          JSON.stringify({
            message: "OK",
            results: await searchOrgs(url.searchParams)
          })
        );
        break;

      case "GET /orgs/cash-money":
      res.writeHead(200).end(
        JSON.stringify({
          message: "OK",
          results: await searchOrgsWithCashMoney(url.searchParams)
        })
      );
      break;

      case "GET /fundings":
        res.writeHead(200).end(
          JSON.stringify({
            message: "OK",
            results: await searchFundings(url.searchParams)
          })
        );
        break;

        //ser ut att innehålla samma som /fundings
        case "GET /fundings-iensu":
        res.writeHead(200).end(
          JSON.stringify({
            message: "OK",
            results: await searchFundingsIensu(url.searchParams)
          })
        );
        break;

      default:
        res.writeHead(404).end(
          JSON.stringify({
            message: "Not Found"
          })
        );
        break;
    }
  } catch (e) {
    console.error(e.stack);
    res.writeHead(500).end(
      JSON.stringify({
        message: "Something went wrong"
      })
    );
  }
}

async function searchOrgs(queryParams) {
  const limit = queryParams.get("limit");
  const offset = queryParams.get("offset");

  const response = await client.search({
    index: "org",
    body: {
      size: limit || 10,
      from: offset || 0
    }
  });

  return {
    hits: response.body.hits.hits.map(h => h._source),
    total: response.body.hits.total.value
  };
}

async function searchOrgsWithCashMoney(queryParams) {
  const limit = queryParams.get("limit");
  const offset = queryParams.get("offset");

  const response = await client.search({
    index: "org",
    body: {
      query: {
        bool: {
          filter: [
            { exists: { field : "description" }},
            // { "term": { "company_name": "maxi"   }},
            // { range: { date: { lte: "2020-01-01" }}}
          ]
        }
      },
      sort: { funding_total_usd: "desc" },
      size: limit != null ? limit : 10,
      from: offset != null ? offset : 0
    }
  });

  const commonWords = ["the","of","and","a","to","in","is","you","that","it","he","was","for","on","are","as","with","his","they","I","at","be","this","have","from","or","one","had","by","word","but","not","what","all","were","we","when","your","can","said","there","use","an","each","which","she","do","how","their","if","will","up","other","about","out","many","then","them","these","so","some","her","would","make","like","him","into","time","has","look","two","more","write","go","see","number","no","way","could","people","my","than","first","water","been","call","who","oil","its","now","find","long","down","day","did","get","come","made","may","part"];
  
  const total = response.body.hits.total.value;
  const hits = response.body.hits.hits.map(h => h._source);
  const descriptionArray = hits.map(h => h.description.split(" "));
  const allWordsArray = [].concat(...descriptionArray);

  allWordsArrayFiltered = allWordsArray.filter(word => !commonWords.includes(word.toLowerCase()));


  const wordCountObj = allWordsArrayFiltered.reduce((acc, curr) => {
    if (acc[curr]) acc[curr] += 1
    else acc[curr] = 1;

    return acc;
  }, {});

  const wordCountArray = [];
  const keys = Object.keys(wordCountObj);
  keys.forEach(key => {
    wordCountArray.push({ key: key, value: wordCountObj[key] });
  });

  wordCountArray.sort((a, b) => b.value - a.value).splice(50);
  return {
    wordCountArray
  };
}

async function searchFundings(queryParams) {
  const limit = queryParams.get("limit");
  const offset = queryParams.get("offset");

  const response = await client.search({
    index: "funding",
    body: {
      // query: {
      //   // term: { "company_name": "maxi" }
      //   // term: { "_id": "51d72ce7-3075-b4d9-941f-8a90b23c9c14" }
      // },
      sort: { "raised_amount_usd": "desc" },
      size: limit || 10,
      from: offset || 0
    }
  });

  return {
    hits: response.body.hits.hits.map(h => h._source),
    total: response.body.hits.total.value
  };
}

async function searchFundings(queryParams) {
  const limit = queryParams.get("limit");
  const offset = queryParams.get("offset");

  const response = await client.search({
    index: "funding-iensu",
    body: {
      size: limit || 10,
      from: offset || 0
    }
  });

  return {
    hits: response.body.hits.hits.map(h => h._source),
    total: response.body.hits.total.value
  };
}
