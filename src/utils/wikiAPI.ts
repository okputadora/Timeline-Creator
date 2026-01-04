import axios from "axios";
import { getWarBattles, getWarInfo } from "./wikiSparqlAPI";

const WIKI_API_URL = "https://en.wikipedia.org/w/api.php";

export async function searchWikipedia(query: string) {
  const response = await axios.get(WIKI_API_URL, {
    params: {
      action: "query",
      list: "search",
      srsearch: query,
      format: "json",
      origin: "*", // REQUIRED for browser requests (CORS)
    },
  });

  const results = response.data.query.search;
  const linksResponse  = await getPageLinks(results[0].pageid);
  const detailedResposne = await getWarBattles(linksResponse.pageprops.wikibase_item);
  // Raw search results
  return detailedResposne;
  // Normalize the data
//   return results.map(item => ({
//     pageId: item.pageid,
//     title: item.title,
//     snippet: item.snippet, // HTML snippet
//     wordCount: item.wordcount,
//     timestamp: item.timestamp,
//     url: `https://en.wikipedia.org/?curid=${item.pageid}`,
//   }));
}

async function getPageLinks(pageId) {
  const response = await axios.get(WIKI_API_URL, {
    params: {
      action: "query",
      pageids: pageId,
      prop: "pageprops",
      pllimit: "max",
      format: "json",
      origin: "*",
    },
  });

  return response.data.query.pages[pageId];
//
  const page = response.data.query.pages[pageId];
//   return page.links.map(link => link.title);
}