# Command Caching Fisherman

> A command caching middleware, used to cache the result of a command.
> Copyright © 2017, Simon Sassi

<h1 align="center"><img width="150" src="https://cdn.rawgit.com/maxerbox/parallel-handle-fisherman/64ee8684/badge.png" alt="fisherman"></h1>

## Installation

```terminal
npm install --save command-caching-fisherman
```

## Usage

A sample example, it's caching the result of a command for 20 seconds.
If you trigger the command `test` two times in less than 20 seconds, it will display the same timestamp

```javascript
const fisherman = require("fisherman-discord.js")
var bot = new fisherman.Fisherman({ prefixes: ['test!'] }) // creating a new fisherman client, with the prefixe "test!"
const CommandCaching = require("command-caching-fisherman")
var caching = new CommandCaching({ cachemanOptions: { ttl: 20 } }) //Creating a new CommandCaching with a 20s default "Title to live"
//(ttl). The command result will be cached 20s if no ttl time is provided
bot.use(caching) //appending the middleware
var register = bot.createRegister('test', 'test') //creating a new register named "test"
console.log('registerCreated')
register.textCommand('test', null, function (req, res) { //creating a new command named "test", will be trigerred with test!test
  console.log("Command trigerred")
  res.sendAndCache("Date: " + Date.now()) //Send the current date. Result : "Date: 1501522374948"
})
bot.on('fisherCode', function (router, code, err) { //Handling fishercodes
  router.response.send('fisherCode ' + code + '\nError message: ' + err.message)
})
bot.init('_token_') //logging in the bot
```

## Backend with redis, mongo, etc

Because this middleware is using cacheman, you can set a custom cache engine. By default `cacheman` uses the `cacheman-memory` engine.

See [https://www.npmjs.com/package/cacheman](https://www.npmjs.com/package/cacheman)

## Api

### req.sendAndCache(text[, messageOptions = {}, ttl])

`text`: The message to send

`messageOptions`: discord.js message options, available [here](https://discord.js.org/#/docs/main/stable/typedef/MessageOptions)

`ttl`: Time To Live in seconds

### Disabling the cache feature on a command (it will not check if command result is in cache)

Just set the option `disableCaching` to `true` in the `locales` property of the command

```javascript
register.textCommand('test', {locales: {disableCaching : true}}, function (req, res) {
[...]
```

### Constructor options

| Name | Default value | Description |
| ---- | ------ | ----- |
| cacheName | `"commandCache"` | The key prefixe used by cacheman to store the command results |
| cachemanOptions | `{}` | The cacheman's options, available [here](https://www.npmjs.com/package/cacheman)
| keyGenerator | `function (req) { return req.message.author.id + req.command.name }` | Used to generate the cache key |
