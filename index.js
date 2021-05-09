const fetch = require('node-fetch');

class TBLError extends Error {
  constructor({ message, response }) {
    super(message || `Error ${response.status}: ${response.statusText}`);
    this.response = response;
  }
}

class TBLAPI {
  constructor(token, client) {
    if (!token || typeof token !== 'string') throw new Error(`Missing a token.`);
    
    if (client) {
      this.client = client;
      client.on('ready', () => {
        this.postStats();
        setInterval(() => {
          this.postStats();
        }, 1800000);
      });
    }
    
    const baseURL = 'https://turkeylist.gq/api';
    this._request = async (method, endpoint, body=null, auth=false) => {
      if (auth && typeof token !== 'string') throw new TBLError({ message: `The endpoint '${endpoint}' requires a token.` });
      
      const response = await fetch(`${baseURL}${endpoint}`, {
        method,
        body,
        headers: auth ? { Authorization: token } : {}
      });
      
      let json;
      if (response.status >= 400) throw new TBLError({ response });
      try {
        json = await response.json();
        
        if (!json.success && json.error) throw new TBLError({ message: `Error: ${json.error}` });
        return json;
      } catch {
        throw new TBLError({ message: `Error: unable to parse JSON response. please try again later.` });
      }
    };
  }

  async postStats(serverCount, shardId, shardCount) {
    if (!serverCount && !this.client) throw new Error('postStats requires 1 argument');
    
    const response = await this._request('POST', `/auth/stats/${this.client.user.id}`, {
      server_count: serverCount || this.client.guilds.cache.size || this.client.guilds.size
    }, true);
    console.log("Server Count Posted to TBL!");
    return response;
  }
}

module.exports = TBLAPI;