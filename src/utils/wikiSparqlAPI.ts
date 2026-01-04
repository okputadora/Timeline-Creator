
import axios from "axios";

const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";

async function runSparqlQuery(query: string) {
  const response = await axios.get(WIKIDATA_SPARQL_URL, {
    params: {
      format: "json",
      query,
    },
    headers: {
      Accept: "application/sparql+json",
    },
  });

  return response.data.results.bindings;
}

export async function getWarInfo(wikidataId: string) {
  const query = `
    SELECT
      ?start
      ?end
      ?locationLabel
      ?participantLabel
      ?casualties
    WHERE {
      wd:${wikidataId} wdt:P580 ?start .
      wd:${wikidataId} wdt:P582 ?end .
      OPTIONAL { wd:${wikidataId} wdt:P276 ?location . }
      OPTIONAL { wd:${wikidataId} wdt:P710 ?participant . }
      OPTIONAL { wd:${wikidataId} wdt:P1120 ?casualties . }

      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en".
      }
    }
  `;

  const rows = await runSparqlQuery(query);

  return rows.map(row => ({
    startDate: row.start?.value,
    endDate: row.end?.value,
    location: row.locationLabel?.value,
    participant: row.participantLabel?.value,
    casualties: row.casualties?.value,
  }));
}


export async function getWarBattles(wikidataId: string) {
    if (!/^Q\d+$/.test(wikidataId)) {
    throw new Error("Invalid Wikidata ID");
  }

  const query = `
    SELECT
      ?battle
      ?battleLabel
      ?start
      ?end
      ?locationLabel
      ?participantLabel
      ?winnerLabel
      ?casualties
    WHERE {
      ?battle wdt:P361 wd:${wikidataId} ;
              wdt:P31/wdt:P279* wd:Q178561 .

      OPTIONAL { ?battle wdt:P580 ?start . }
      OPTIONAL { ?battle wdt:P582 ?end . }
      OPTIONAL { ?battle wdt:P276 ?location . }
      OPTIONAL { ?battle wdt:P710 ?participant . }
      OPTIONAL { ?battle wdt:P1346 ?winner . }
      OPTIONAL { ?battle wdt:P1120 ?casualties . }

      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en".
      }
    }
    ORDER BY ?start
  `;

  const rows = await runSparqlQuery(query);
  console.log({rows});
  return rows.map(row => ({
    battleName: row.battleLabel?.value,
    startDate: row.start?.value,
    endDate: row.end?.value,
    location: row.locationLabel?.value,
    participant: row.participantLabel?.value,
    winner: row.winnerLabel?.value,
    casualties: row.casualties?.value,
  }));
}