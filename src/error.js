module.exports = class TBLError extends Error {
  constructor({ message, response }) {
    super(message || `Error ${response.status}: ${response.statusText}`);
    this.getRawResponse = () => response;
  }
}