const fetch = require('node-fetch');
const TBLError = require('./error');

module.exports = (cls, token) => {
  const cache = {};
  const baseURL = 'https://turkeylist.gq/api';
  cls._request = async ({ method, endpoint, body, auth, callback, cacheTime }) => {
    if (auth && (!token || typeof token !== 'string')) throw new TBLError({ message: `The endpoint '${endpoint}' requires a token.` });
    const currentTime = Math.round(new Date().getTime() / 1000);
    
    if (endpoint.startsWith('/auth')) cacheTime = 1750; // minus 50 because why not

    if (cacheTime && cache[endpoint] && cache[endpoint].next > currentTime)
      return cache[endpoint].response;
    
    const response = await fetch(`${baseURL}${endpoint}`, {
      method,
      body,
      headers: auth ? { Authorization: token } : {}
    });
    
    let json;
    if (response.status >= 400) throw new TBLError({ response });
    else if (callback) {
      const res = await callback(response);
      if (cacheTime) cache[endpoint] = { next: currentTime + cacheTime, response: res };
      return res;
    }

    try {
      json = await response.json();
      
      if (!json.success && json.error) throw new TBLError({ message: `Error: ${json.error}`, response, });
      else if (cacheTime) cache[endpoint] = { next: currentTime + cacheTime, response: json };
      
      return json;
    } catch {
      throw new TBLError({ message: `Error: unable to parse JSON response. please try again later.`, response, });
    }
  };
}