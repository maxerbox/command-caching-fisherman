const defaults = require('defaults')
const Cacheman = require('cacheman')
class CommandCaching {
  constructor (options) {
    this.options = defaults(options, {
      keyGenerator: function (req /*, res */) {
        return req.message.author.id + req.command.name
      },
      cachemanOptions: {},
      cacheName: 'commandCache'
    })
    this.keyGenerator = options.keyGenerator
    this.cache = new Cacheman(this.options.cacheName, this.options.cachemanOptions)
    /**
     * Put in cache a command
     * @private
     * @param {string} text The text for the message
     * @param {} [messageOptions={}]
     * @param {number} [expireTime=1] the expire time in seconds
     * @returns {Promise<Message>}
     * @memberof CommandCaching
     */
    this.cacheMessage = function (text, messageOptions = {}, expireTime) {
      var that = this
      return new Promise(function (resolve, reject) {
        var key = that.keyGenerator(that.req)
        that.cache.set(key, {text: text, messageOptions: messageOptions}, expireTime, function (err, value) {
          if (err) reject(err)
          that.res.send(value.text, value.messageOptions).then(mesg => resolve(mesg), err => reject(err))
        })
      })
    }.bind(this)
  }
  handle (req, res, next) {
    this.req = req
    this.res = res
    res.sendAndCache = this.cacheMessage
    if (req.isCommand && !req.command.locales.disableCaching) {
      var key = this.keyGenerator(req)
      this.cache.get(key, function (err, value) {
        if (err) { next(err) } else {
          if (value) {
            res.send(value.text, value.messageOptions).then(() => {}).catch(() => {})
            next(true)
          } else {
            next(null, res, req)
          }
        }
      })
    } else {
      next(null, res, req)
    }
  }
  parallelHandle (router, callback) {
    this.req = router.req
    this.res = router.res
    router.res.sendAndCache = this.cacheMessage
    if (router.req.isCommand && !router.req.command.locales.disableCaching) {
      var key = this.keyGenerator(router.req)
      this.cache.get(key, function (err, value) {
        if (err) { callback(err) } else {
          if (value) {
            router.res.send(value.text, value.messageOptions).then(() => {}).catch(() => {})
            callback(true)
          } else {
            callback()
          }
        }
      })
    } else {
      callback()
    }
  }
}
module.exports = CommandCaching
