const snekfetch = require('snekfetch');
const API = 'https://turkeylist.gq/api/';

class TBLAPI {
  constructor(token, client) {
    this.token = token;
    if (!this.token || typeof this.token !== 'string') throw new Error(`Missing a token.`);
    if (client) {
      this.client = client;
      client.on('ready', () => {
        this.postStats();
        setInterval(() => {
          this.postStats();
        }, 1800000);
      });
    }
  }

  _request(method, endpoint, data, auth) {
    const request = snekfetch[method](API + endpoint);
    if (method === 'post' && data) request.send(data);
    if (method === 'get' && data) request.query(data);
    if (auth) request.set({ Authorization: this.token });
    return request;
  }

  async postStats(serverCount, shardId, shardCount) {
    if (!serverCount && !this.client) throw new Error('postStats requires 1 argument');
    const response = await this._request('post', `auth/stats/${this.client.user.id}`, {
      server_count: serverCount || this.client.guilds.cache.size || this.client.guilds.size
    }, true);
    console.log("Server Count Posted to TBL!");
    return response.body;
  }
}

module.exports = TBLAPI;