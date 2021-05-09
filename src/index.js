const TBLError = require('./error');
const TBLBot = require('./bot');
const apiRequest = require('./request');

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
        setInterval(() => this.postStats(), 1800000);
      });
    }

    apiRequest(this, token);
  }

  /**
   * Returns the image embed of a bot ID listed on Turkey Bot List.
   * @param {string} botID The bot's ID.
   * @returns {Promise<Buffer>} The image buffer.
   */
  async embed(botID) {
    if (!botID || !(/^\d+$/.test(botID))) throw new TypeError(`Please provide a bot ID.`);
    return await this._request({
      method: 'GET',
      endpoint: `/embed/${botID}`,
      cacheTime: 600,
      callback: async (res) => await res.buffer()
    });
  }

  /**
   * Fetchest latest top 10 bots.
   * @returns {TBLBot[]} An array of bots.
   */
  async fetchLatestBots() {
    return await this._request({
      method: 'GET',
      endpoint: `/bots/listnew`,
      cacheTime: 1800,
      callback: async (res) => {
        const json = await res.json();
        return json.map(bot => new TBLBot(bot));
      }
    });
  }

  /**
   * Fetches the most 10 liked bots.
   * @returns {TBLBot[]} An array of bots.
   */
  async fetchMostLikedBots() {
    return await this._request({
      method: 'GET',
      endpoint: `/bots/list`,
      cacheTime: 1800,
      callback: async (res) => {
        const json = await res.json();
        return json.map(bot => new TBLBot(bot));
      }
    });
  }

  /**
   * Searches for bots from the name in the bot list.
   * @param {string} query The query.
   * @param {number} limit The limit to return for, defaults to 50. maxes at 100.
   * @returns {TBLBot[]} An array of bots.
   */
  async searchBots(query, limit) {
    if (!query || typeof query !== 'string') throw new TypeError(`Please input a query.`);
    else if (limit) {
      if (isNaN(limit)) throw new TypeError(`limit must be a number.`);
      limit = Number(limit <= 100 && limit > 0 ? limit : 50);
    }

    return await this._request({
      method: `GET`,
      endpoint: `/bots/search?q=${encodeURIComponent(query.slice(0, 150))}&limit=${typeof limit === 'number' ? limit : 50}`,
      cacheTime: 1800,
      callback: async (res) => {
        const json = await res.json();
        return json.map(bot => new TBLBot(bot));
      }
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