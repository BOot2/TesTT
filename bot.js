"use strict";
// Don't mess with this file it will ruin your bot, to change stuff edit config.json
// PS: This bot is not completed, it may error.

const Discord = require("discord.js")
const started = Date()
const config = require('./config.json')
const bot = new Discord.Client()
const os = require('os')
const prefix = config.prefix
const rb = "```"
const fs = require("fs")
const queues = {}
const ytdl = require('ytdl-core')
const search = require('youtube-search')
const opts = {
  part: 'snippet',
  maxResults: 10,
  key: config.youtube_api_key
}

function getQueue(guild) {
  if (!guild) return
  if (typeof guild == 'object') guild = guild.id
  if (queues[guild]) return queues[guild]
  else queues[guild] = []
  return queues[guild]
}

var express = require("express")
var app = express();

app.get("/queue/:guildid",function(req,res){
  let queue = getQueue(req.params.guildid);
    if(queue.length == 0) return res.send("Uh oh... No music!");
    let text = '';
    for(let i = 0; i < queue.length; i++){
      text += `${(i + 1)}. ${queue[i].title} | by ${queue[i].requested}\n`
    };
  res.send(text)
})
        app.listen(config.server_port)


function play(msg, queue, song) {
  if (!msg || !queue) return
  if (song) {
    search(song, opts, function(err, results) {
      if (err) return bot.sendMessage(msg, "Video not found please try to use a youtube video.");
      song = (song.includes("https://" || "http://")) ? song : results[0].link
      let stream = ytdl(song, {
        audioonly: true
      })
      let test
      if (queue.length === 0) test = true
      queue.push({
        "title": results[0].title,
        "requested": msg.author.username,
        "toplay": stream
      })
      bot.sendMessage(msg, "Queued **" + queue[queue.length - 1].title + "**")
      if (test) {
        setTimeout(function() {
          play(msg, queue)
        }, 1000)
      }
    })
  } else if (queue.length != 0) {
    bot.sendMessage(msg, `Now Playing **${queue[0].title}** | by ***${queue[0].requested}***`)
    let connection = bot.voiceConnections.get('server', msg.server)
    if (!connection) return
    connection.playRawStream(queue[0].toplay).then(intent => {
      intent.on('error', () => {
        queue.shift()
        play(msg, queue)
      })

      intent.on('end', () => {
        queue.shift()
        play(msg, queue)
      })
    })
  } else {
    bot.sendMessage(msg, 'No more music in queue')
  }
}

function secondsToString(seconds) {
    try {
        var numyears = Math.floor(seconds / 31536000);
        var numdays = Math.floor((seconds % 31536000) / 86400);
        var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
        var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
        var numseconds = Math.round((((seconds % 31536000) % 86400) % 3600) % 60);

        var str = "";
        if(numyears>0) {
            str += numyears + " year" + (numyears==1 ? "" : "s") + " ";
        }
        if(numdays>0) {
            str += numdays + " day" + (numdays==1 ? "" : "s") + " ";
        }
        if(numhours>0) {
            str += numhours + " hour" + (numhours==1 ? "" : "s") + " ";
        }
        if(numminutes>0) {
            str += numminutes + " minute" + (numminutes==1 ? "" : "s") + " ";
        }
        if(numseconds>0) {
            str += numseconds + " second" + (numseconds==1 ? "" : "s") + " ";
        }
        return str;
    } catch(err) {
        console.log("Could not get time")
        return 'Could not get time';
    }
}

bot.on('ready', function() {
  bot.setStatus('online', config.status)
  var msg = `
-----------------------------
Use 'git pull' to keep your bot updated
Logging in...
-----------------------------
Logged in as ${bot.user.name}
On ${bot.servers.length} servers with ${bot.channels.length} channels
I have seen ${bot.users.length} users
Let's go!
-----------------------------`

console.log(msg)
console.log("Logged in and ready to respond...")
})

bot.on("message", function(message) {
  try{
  if (message.sender.bot) return
  if (message.channel.server === undefined && message.sender != bot.user) {
    bot.sendMessage(message, "Bot only works in Servers, not Private Messages (This is so blacklist system works properely)")

    return;
  }
  if (sbl.indexOf(message.channel.server.id) != -1 && message.content.startsWith(prefix)) {
    bot.sendMessage(message, "This server is blacklisted")
    return
  }
  if (ubl.indexOf(message.sender.id) != -1 && message.content.startsWith(prefix)) {
    bot.sendMessage(message, message.user + "! You are blacklisted and can not use the bot!")
    return
  }
  if (message.content.startsWith(prefix + "ping")) {
    bot.sendMessage(message, "Pong!", function(error, msg) {
      if (!error) {
        bot.updateMessage(msg, "Pong, **" + (msg.timestamp - message.timestamp) + "**ms")
      }
    })
  }
  if(message.content.startsWith(prefix + 'math')) {
    try{
    var res = maths.eval(message.content.split(" ").splice(1).join(" "))
  }catch(err){
    var res = 'Could not calculate'
  }
    bot.sendMessage("```"+message,res+"```")
  }

  if (message.content.startsWith(prefix + 'help')) {
    bot.sendMessage(message, "Check your DM's **" + message.sender.name + "**")
    bot.sendMessage(message.sender.id, `${rb}ruby
${prefix}help - Shows this message.
${prefix}ping - Ping/Pong with ms amount.
${prefix}servers Shows amount of servers.
${prefix}play - Plays the song you requested.
${prefix}voteskip - You may vote to skip a song.
${prefix}volume <volume> - Change the volume.
${prefix}queue - Check the list of songs that are queued.
${prefix}np/nowplaying - Check the current song out.
${prefix}skip - Skips the playing song.
${prefix}pause - Pause the current song.
${prefix}deletewarn <user> - Deletes a warning from a user.
${prefix}lookupwarn <user> - Lookup warning information on a user.
${prefix}eval - Owner only.
${prefix}clearqueue - Clears the list of queues.
${prefix}say - Admin only.
${prefix}resume - Resumes paused song.
${prefix}shutdown - Power off the bot (Owner only).
${prefix}invite - Creates OAuth URL for bot.
${prefix}git - Sends link to github repo.
${prefix}play - Plays a link that you have wanted it to.
${prefix}userblacklist <add/remove> <user id> - Blacklists a user
${prefix}warn <user> <reason> - Warns a user for the thing they did wrong.
${prefix}reminder <time>|<reminder> - Reminds you of something in a certain time
${prefix}serverblacklist <add/remove> <server id> - Adds or removes servers from blacklist
${prefix}note - Takes a note
${prefix}mynotes - Shows notes you have taken
${prefix}math <maths> - evaluates math equations
${prefix}uptime - Shows bot uptime
${prefix}sys - Gets system information${rb}`)
  }
  if (message.content.startsWith(prefix + 'servers')) {
    bot.sendMessage(message, "I'm currently on **" + bot.servers.length + "** server(s)")
  }
  if(message.content === prefix + 'uptime'){
    bot.sendMessage(message,"I have been up for `"+secondsToString(process.uptime())+"` - My process was started at this time --> `"+started+"`")
  }

  if (message.content.startsWith(prefix + 'play')) {
    if (!bot.voiceConnections.get('server', message.server)) {
      if (!message.author.voiceChannel) return bot.sendMessage(message, 'You need to be in a voice channel')
      bot.joinVoiceChannel(message.author.voiceChannel)
    }
    let suffix = message.content.split(" ").slice(1).join(" ")
    if (!suffix) return bot.sendMessage(message, 'You need to a song link or a song name')
    play(message, getQueue(message.server.id), suffix)
  }

  if(message.content.startsWith(prefix + 'sys')){
    bot.sendMessage(message, "```xl\nSystem info: " + process.platform + "-" + process.arch + " with " + process.release.name + " version " + process.version.slice(1) + "\nProcess info: PID " + process.pid + " at " + process.cwd() + "\nProcess memory usage: " + Math.ceil(process.memoryUsage().heapTotal / 1000000) + " MB\nSystem memory usage: " + Math.ceil((os.totalmem() - os.freemem()) / 1000000) + " of " + Math.ceil(os.totalmem() / 1000000) + " MB\nBot info: ID " + bot.user.id + " #" + bot.user.discriminator + "\n```");
        }
  if (message.content.startsWith(prefix + "serverblacklist")) {
    if (message.sender.id === config.owner_id || config.admins.indexOf(msg.author.id)!= -1) {
      let c = message.content.split(" ").splice(1).join(" ")
      let args = c.split(" ")
      console.log("[DEVELOPER DEBUG] Blacklist args were: " + args)
      if (args[0] === "remove") {
        sbl.splice(sbl.indexOf(args[1]))
        fs.writeFile("./data/blservers.json", JSON.stringify(sbl))
      } else if (args[0] === "add") {
        sbl.push(args[1])
        fs.writeFile("./data/blservers.json", JSON.stringify(sbl))
      } else {
        bot.sendMessage(message, `You need to specify what to do! ${prefix}serverblacklist <add/remove> <server id>`)
      }
    } else {
      bot.sendMessage(message, "Sorry, this command is for the owner only.")
    }

  }
  if(message.content.startsWith(prefix + 'note')) {
    if(notes[message.author.id] === undefined){
      notes[message.author.id] = {
        'notes':[]
      }
    }
    notes[message.author.id].notes[notes[message.author.id].notes.length] = {
      'content':message.cleanContent.split(" ").splice(1).join(" "),
      'time':Date()
    }
    fs.writeFile('./data/notes.json',JSON.stringify(notes),function(err){
      if(err) return;
      bot.sendMessage(message,'Added to notes! Type `'+prefix+'mynotes` to see all your notes')
    })
  }
  if(message.content === prefix + 'mynotes'){
    var nutes = 'Here are your notes:\n\n```'
    for(var i = 0;i < notes[message.author.id].notes.length;i++){
      nutes += `${i + 1}) '${notes[message.author.id].notes[i].content}' - Added ${notes[message.author.id].notes[i].time}\n`
    }

    nutes += "```"
    bot.sendMessage(message,nutes)
  }
  if (message.content.startsWith(prefix + "userblacklist")) {
    if (message.sender.id === config.owner_id || config.admins.indexOf(message.author.id)!= -1) {
      let c = message.content.split(" ").splice(1).join(" ")
      let args = c.split(" ")
      console.log("[DEVELOPER DEBUG] Blacklist args were: " + args)
      if (args[0] === "remove") {
        ubl.splice(ubl.indexOf(args[1]))
        fs.writeFile("./data/blusers.json", JSON.stringify(ubl))
      } else if (args[0] === "add") {
        ubl.push(args[1])
        fs.writeFile("./data/blusers.json", JSON.stringify(sbl))
      } else {
        bot.sendMessage(message, `You need to specify what to do! ${prefix}serverblacklist <add/remove> <server id>`)
      }
    } else {
      bot.sendMessage(message, "Sorry, this command is for the owner only.")
    }

  }

  if(message.content.startsWith(prefix + "clearqueue")){
    if(message.server.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1 || message.server.permissionsOf(message.author).hasPermission('MANAGE_SERVER')){
     let queue = getQueue(message.server.id);
     if(queue.length == 0) return bot.sendMessage(message, `No music in queue`);
     for(var i = queue.length - 1;  i >= 0; i--){
            queue.splice(i, 1);
     }
     bot.sendMessage(message, `Cleared the queue`)
    }else{
      bot.sendMessage(message, 'Only the admins can do this command');
    }
}

  if(message.content.startsWith(prefix + "lookupwarn")){
    if(message.server.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1 || message.server.permissionsOf(message.author).hasPermission('MANAGE_SERVER')){
      let user = message.mentions[0];
      if(!user) return bot.sendMessage(message, "You need to mention the user");
      let list = Object.keys(warns);
      let found = '';
      let foundCounter = 0;
      let warnCase;
      //looking for the case id
      for(let i = 0; i < list.length; i++){
          if(warns[list[i]].user.id == user.id){
              foundCounter++;
              found += `${(foundCounter)}. Username: ${warns[list[i]].user.name}\nAdmin: ${warns[list[i]].admin.name}\nServer: ${warns[list[i]].server.name}\nReason: ${warns[list[i]].reason}\n`;
          }
      }
      if(foundCounter == 0) return bot.sendMessage(message, 'Nothing found for this user');
      bot.sendMessage(message, `Found ${foundCounter} warns\n ${found}`);
    }else{
      bot.sendMessage(message, 'Only the admins can do this command');
    }
}

  if (message.content.startsWith(prefix + 'skip')) {
    if(message.server.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1 || message.server.permissionsOf(message.author).hasPermission('MANAGE_SERVER')){
      let player = bot.voiceConnections.get('server', message.server);
      if(!player || !player.playing) return bot.sendMessage(message, 'The bot is not playing');
      player.stopPlaying()
      bot.sendMessage(message, 'Skipping song...');
    }else{
      bot.sendMessage(message, 'Only the admins can do this command');
    }
  }

  if(message.content.startsWith(prefix + "deletewarn")){
    if (message.channel.permissionsOf(message.sender).hasPermission("kickMembers") || message.channel.permissionsOf(message.sender).hasPermission("banMembers") || message.server.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1) {
        let user = message.mentions[0];
        if(!user) return bot.sendMessage(message, "You need to mention the user");
        let list = Object.keys(warns);
        let found;
        //looking for the case id
        for(let i = 0; i < list.length; i++){
            if(warns[list[i]].user.id == user.id){
                found = list[i];
                break;
            }
        }
        if(!found) return bot.sendMessage(message, 'Nothing found for this user');
        bot.sendMessage(message, `Delete the case of ${warns[found].user.name}\nReason: ${warns[found].reason}`);
        delete warns[found];
        fs.writeFile("./data/warns.json", JSON.stringify(warns))
    }else{
        bot.sendMessage(message, "You have to be able to kick/ban members to use this command")
    }
}

  if (message.content.startsWith(prefix + 'pause')) {
    if(message.server.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1){
      let player = bot.voiceConnections.get('server', message.server);
      if(!player || !player.playing) return bot.sendMessage(message, 'The bot is not playing');
      player.pause();
      bot.sendMessage(message, "Pausing music...");
    }else{
      bot.sendMessage(message, 'Only the admins can use this command');
    }
  }

  if (message.content.startsWith(prefix + 'reminder')) {
    try {
      let c = message.content.substring(message.content.indexOf(' ') + 1, message.content.length)
      let msg = c.split(" ").splice(1).join(" ").split("|")
      msg[0] = msg[0].replace(/\s/g, '')
      let time = parseTime(msg[0])
      let reminder = msg[1].trim()
      message.reply("I will PM you a reminder to " + reminder + " in " + time + "!")
      setTimeout(function() {
        message.author.sendMessage(message.author + " Reminder: " + reminder)
      }, time.countdown)

      function parseTime(str) {
        let num, time
        if (str.indexOf(" ") > -1) {
          num = str.substring(0, str.indexOf(" "))
          time = str.substring(str.indexOf(" ") + 1).toLowerCase()
        } else {
          for (let i = 0; i < str.length; i++) {
            if (str.substring(0, i) && !isNaN(str.substring(0, i)) && isNaN(str.substring(0, i + 1))) {
              num = str.substring(0, i)
              time = str.substring(i)
              break
            }
          }
        }
        if (!num || isNaN(num) || num < 1 || !time || ["d", "day", "days", "h", "hr", "hrs", "hour", "hours", "m", "min", "mins", "minute", "minutes", "s", "sec", "secs", "second", "seconds"].indexOf(time) == -1) {
          return
        }
        let countdown = 0
        switch (time) {
          case "d":
          case "day":
          case "days":
            countdown = num * 86400000
            break
          case "h":
          case "hr":
          case "hrs":
          case "hour":
          case "hours":
            countdown = num * 3600000
            break
          case "m":
          case "min":
          case "mins":
          case "minute":
          case "minutes":
            countdown = num * 60000
            break
          case "s":
          case "sec":
          case "secs":
          case "second":
          case "seconds":
            countdown = num * 1000
            break
        }
        return {
          num: num,
          time: time,
          countdown: countdown
        }
      }
    } catch (err) {
      message.channel.sendMessage("Invalid arguments.")
    }
  }

  if (message.content.startsWith(prefix + 'shutdown')) {
    if (message.sender.id === config.owner_id || config.admins.indexOf(message.author.id)!= -1) {
      bot.sendMessage(message, "Shutdown has been **initiated**.\nShutting down...")
      setTimeout(function() {
        bot.logout()
      }, 1000)
      setTimeout(function() {
        process.exit()
      }, 2000)
    }
  }

if (message.content.startsWith(prefix + 'warn')) {
    if (message.channel.permissionsOf(message.sender).hasPermission("kickMembers") || message.channel.permissionsOf(message.sender).hasPermission("banMembers")) {
      let c = message.content
      let usr = message.mentions[0]
      if(!usr) return bot.sendMessage(message, "You need to mention the user");
      let rsn = c.split(" ").splice(1).join(" ").replace(usr, "").replace("<@!" + usr.id + ">", "")
      let caseid = genToken(20)

      function genToken(length) {
        let key = ""
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (let i = 0; i < length; i++) {
          key += possible.charAt(Math.floor(Math.random() * possible.length))
        }

        return key
      }

      warns[caseid] = {
        "admin": {
          "name": message.sender.name,
          "discrim": message.sender.discriminator,
          "id": message.sender.id
        },
        "user": {
          "name": usr.name,
          "discrim": usr.discrim,
          "id": usr.id
        },
        "server": {
          "name": message.channel.server.name,
          "id": message.channel.server.id,
          "channel": message.channel.name,
          "channel_id": message.channel.id
        },
        "reason": rsn
      }
      bot.sendMessage(message, usr + " was warned for `" + rsn + "`, check logs for more info")
      fs.writeFile("./data/warns.json", JSON.stringify(warns))
    } else {
      bot.sendMessage(message, "You have to be able to kick/ban members to use this command")
    }
  }

  if (message.content.startsWith(prefix + 'say')) {
    if (message.sender.id === config.owner_id || config.admins.indexOf(message.author.id)!= -1) {
      let say = message.content.split(" ").splice(1).join(" ")
      bot.sendMessage(message, say)
    }
  }

  if (message.content.startsWith(prefix + 'eval')) {
    if (message.sender.id === config.owner_id) {
      try {
        let code = message.content.split(" ").splice(1).join(" ")

        let result = eval(code)


        bot.sendMessage(message, "```diff\n+ " + result + "```")

      } catch (err) {

        bot.sendMessage(message, "```diff\n- " + err + "```")
      }
    } else {
      bot.sendMessage(message, "Sorry, you do not have permissisons to use this command, **" + message.author.name + "**.")

    }
  }

  if (message.content.startsWith(prefix + 'volume')) {

    let suffix = message.content.split(" ")[1];
    let player = bot.voiceConnections.get('server', message.server);
    if(!player || !player.playing) return bot.sendMessage(message, 'No, music is playing at this time.');
    if(!suffix) {
        bot.sendMessage(message, `The current volume is ${(player.getVolume() * 50)}`);
    }else if(message.server.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1){
        let volumeBefore = player.getVolume();
        let volume = parseInt(suffix);
        if(volume > 50) return bot.sendMessage(message, "The music can't be higher then 50");
        player.setVolume((volume / 50));
        bot.sendMessage(message, `Volume changed from ${(volumeBefore * 50)} to ${volume}`);
    }else{
      bot.sendMessage(message, 'Only the admins can change the volume');
    }
}

if (message.content.startsWith(prefix + 'resume')) {
    if(message.server.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1){
      let player = bot.voiceConnections.get('server', message.server);
      if(!player) return bot.sendMessage(message, 'No, music is playing at this time.');
      if( player.playing) return bot.sendMessage(message, 'The music is already playing');
      player.resume();
      bot.sendMessage(message, "Resuming music...");
    }else{
      bot.sendMessage(message, 'Only the adminds can do this command');
    }
}



  if (message.content.startsWith(prefix + 'invite')) {
    bot.sendMessage(message, "My OAuth URL: " + `http://discordapp.com/oauth2/authorize?client_id=${config.client_id}&scope=bot`)
  }
  if (message.content.startsWith(prefix + 'git')) {
    bot.sendMessage(message, "GitHub URL: **https://github.com/developerCodex/musicbot**")
  }

  if (message.content.startsWith(prefix + 'about') || message.mentions[0] === bot.user) {
// Please do not change this... It is in the license
if(message.content === bot.user + ' help'){
  var cdb = '```'
  var msg = `${cdb}fix
This is an instance of developerCodex's Open source musicbot
I am written in node.js and use ytdl to source songs and play them!
To see all my commands type ${prefix}help.${cdb}`
bot.sendMessage(message, msg)
return;
}
    var cdb = '```'
    var msg = `${cdb}fix
This is an instance of developerCodex's Open source musicbot
I am written in node.js and use ytdl to source songs and play them!
To see all my commands type ${prefix}help.${cdb}`
bot.sendMessage(message,msg)
  }

  if (message.content.startsWith(prefix + 'np') || message.content.startsWith(prefix + 'nowplaying')) {
    let queue = getQueue(message.server.id);
    if(queue.length == 0) return bot.sendMessage(message, "No music in queue");
    bot.sendMessage(message, `${rb}xl\nCurrently playing: ${queue[0].title} | by ${queue[0].requested}${rb}`);
}

if (message.content.startsWith(prefix + 'queue')) {
    let queue = getQueue(message.server.id);
    if(queue.length == 0) return bot.sendMessage(message, "No music in queue");
    let text = '';
    for(let i = 0; i < queue.length; i++){
      text += `${(i + 1)}. ${queue[i].title} | by ${queue[i].requested}\n`
    };
    bot.sendMessage(message, `${rb}xl\n${text}${rb}`);
  }
    }catch(err){
  console.log("WELL LADS LOOKS LIKE SOMETHING WENT WRONG! Visit MusicBot server for support (https://discord.gg/UbwFDM6) and quote this error:\n\n\n"+err.stack)
  errorlog[String(Object.keys(errorlog).length)] = {
"code":err.code,
    "error":err,
    "stack":err.stack
  }
  fs.writeFile("./data/errors.json",JSON.stringify(errorlog),function(err){
    if(err) return "Even worse we couldn't write to our error log file! make sure data/errors.json still exists!";
  })

}
})

bot.login(config.token)
// This version of discord.js is V8, you may install it using npm install discord.js#indev-old
// Don't mess with this file it will ruin your bot, to change stuff edit config.json
