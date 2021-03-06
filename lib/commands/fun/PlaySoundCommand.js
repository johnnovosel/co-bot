var Sounds = require('../../models/sounds.js');
const User = require('../../models/user.js');
const path = require('path');
const config = require('../../../config.js');
const Commando = require('discord.js-commando');
const os = require('os');
const ytdl = require('ytdl-core');

module.exports = class PlaySoundCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'play-sound',
            aliases: ['play', 'p'],
            memberName: 'play',
            group: 'fun',
            guildOnly: true,
            description: 'Plays a sound',
            details: 'Plays a sound from the sound list',
            examples: ['play soundname'],
            args: [{
                key: 'sound',
                label: 'Sound',
                prompt: 'What sound do you want to play?',
                type: 'string'
            }]
        });
    }
    async run(msg, args) {
        let bot = msg.client;
        let voiceChannel = msg.member.voiceChannel;
        const streamOptions = {volume: .4};
        if (voiceChannel) {
            if (/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(args.sound)) {
                if (bot.voiceConnection === undefined || bot.voiceConnection.channel.id != voiceChannel.id) {
                    return voiceChannel.join().then((con) => {
                        con.playStream(ytdl(args.sound, { filter: 'audioonly' }), streamOptions);
                    });
                } else {
                    return bot.voiceConnections.first().playStream(ytdl(args.sound, { filter: 'audioonly' }), streamOptions);
                }
            } else {
                await Sounds.findOne({
                    "key": {
                        $regex: new RegExp("^" + args.sound.toLowerCase() + "$", "i")
                    }
                }).then(sound => {
                    if (sound) {
                        this.incrementSoundsPlayCount(sound);
                        this.incrementUsersPlayCount(msg.member);
                        if (bot.voiceConnections.first() === undefined || bot.voiceConnections.first().channel.id != voiceChannel.id)
                            return voiceChannel.join().then((con) => {
                                con.playFile(path.join(os.homedir(), 'files', sound.filename));
                            }).catch(e => console.error(e));
                        else
                            return bot.voiceConnections.first().playFile(path.join(os.homedir(), 'files', sound.filename));
                            // return this.play(bot.voiceConnections.first(), sound.filename);
                    } else
                        msg.reply("Sound not found");
                });
            }
        } else
            msg.reply("You must be in a Voice channel to play a sound");
    }
    incrementSoundsPlayCount(sound) {
        sound.playCount++;
        sound.save((err, updatedSound) => {
            if (err)
                console.error(err);
        });
    }
    incrementUsersPlayCount(member) {
        User.findOne({
            _id: member.id
        }).then((user) => {
            user.soundPlays++;
            user.save((err, updatedUser) => {
                if (err)
                    console.error(err);
            });
        });
    }

}
