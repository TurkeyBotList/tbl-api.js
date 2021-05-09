const fetch = require('node-fetch');

class TBLError extends Error {
  constructor({ message, response }) {
    super(message || `Error ${response.status}: ${response.statusText}`);
    this.response = response;
  }
}

class TBLAPI {
  /**
   * The TBL API client object.
   * @param {string} token The bot token.
   * @param {any} client discord.js client object.
   */
  constructor(token, client) {
    if (client) {
      this.client = client;
      client.on('ready', () => {
        this.postStats();
        setInterval(() => {
          this.postStats();
        }, 1800000);
      });
    }
    
    const cache = {};
    const baseURL = 'https://turkeylist.gq/api';
    this._request = async ({ method, endpoint, body, auth, callback, cacheTime }) => {
      if (auth && (!token || typeof token !== 'string')) throw new TBLError({ message: `The endpoint '${endpoint}' requires a token.` });
      const currentTime = Math.round(new Date().getTime() / 1000);

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

  /**
   * Returns the image embed of a bot ID listed on Turkey Bot List.
   * @param {number|string} botID The bot's ID.
   * @returns {Promise<Buffer>} The image buffer.
   */
  async embed(botID) {
    if (!botID || isNaN(botID)) throw new TypeError(`Please provide a valid bot ID.`);
    return await this._request({
      method: 'GET',
      endpoint: `/embed/${botID}`,
      cacheTime: 600,
      callback: async (res) => await res.buffer()
    });
  }

  /**
   * Posts the server count to the Turkey Bot List servers.
   * @param {number} serverCount The server count.
   * @returns {Object} The response.
   */
  async postStats(serverCount) {
    if (!serverCount && !this.client) throw new Error('postStats requires 1 argument');
    
    const response = await this._request({
      method: 'POST',
      endpoint: `/auth/stats/${this.client.user.id}`,
      body: {
        server_count: serverCount || this.client.guilds.cache.size || this.client.guilds.size
      },
      auth: true
    });
    console.log("Server Count Posted to TBL!");
    return response;
  }
}

module.exports = Object.assign(TBLAPI, { error: TBLError });