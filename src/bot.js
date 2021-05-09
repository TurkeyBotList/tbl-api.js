module.exports = class TBLBot {
    constructor(data) {
        this.name = data.username;
        this.id = data.botid;
        this.description = data.description;
        this.longDescription = data.long;
        this.prefix = data.prefix;
        this.invite = data.invite;
        this.support = data.support || null;
        this.website = data.website || null;
        this.github = data.github || null;
        this.addedAt = data.addedAt ? new Date(data.addedAt) : null;
        this.likes = data.likes || 0;
        this.avatarURL = data.logo;
        this.verified = data.state === "verified";
        this.owners = data.owners;
        this.tags = data.tags || [];

        Object.defineProperty(this, 'serverCount', {
            get: () => ((!data.servers || !data.servers.length) ? 0 : data.servers[data.servers.length - 1].count)
        });

        Object.defineProperty(this, 'servers', {
            get: () => data.servers || []
        });
    }
}