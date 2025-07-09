import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
if (!chatUpdate)
return
this.pushMessage(chatUpdate.messages).catch(console.error)
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m)
return;
if (global.db.data == null)
await global.loadDatabase()       
try {
m = smsg(this, m) || m
if (!m)
return
m.exp = 0
m.coin = false
try {
let user = global.db.data.users[m.sender]
if (typeof user !== 'object')  
global.db.data.users[m.sender] = {}
if (user) {
if (!isNumber(user.exp))
user.exp = 0
if (!isNumber(user.coin))
user.coin = 10
if (!isNumber(user.limit))
user.limit = 10
if (!isNumber(user.lastclaim))
user.lastclaim = 0
if (!isNumber(user.lastweekly))
user.lastweekly = 0
if (!isNumber(user.lastmonthly))
user.lastmonthly = 0
if (!isNumber(user.lastdaily))
user.lastdaily = 0
if (!isNumber(user.lastseen))
user.lastseen = 0
if (!isNumber(user.lastdownload))
user.lastdownload = 0
if (!('registered' in user))
user.registered = false
if (!user.registered) {
if (!('name' in user))
user.name = m.name
if (!isNumber(user.age))
user.age = -1
if (!isNumber(user.regTime))
user.regTime = -1
}
if (!('premium' in user))
user.premium = false
if (!isNumber(user.premiumTime))
user.premiumTime = 0
if (!('banned' in user))
user.banned = false
if (!isNumber(user.warn))
user.warn = 0
if (!isNumber(user.level))
user.level = 0
if (!('role' in user))
user.role = 'Novato(a)'
if (!('autolevelup' in user))
user.autolevelup = true
if (!('pc' in user))
user.pc = 0
if (!('asistencia' in user))
user.asistencia = 0
if (!('pasadoAsistencia' in user))
user.pasadoAsistencia = 0
} else
global.db.data.users[m.sender] = {
exp: 0,
coin: 10,
limit: 10,
lastclaim: 0,
lastweekly: 0,
lastmonthly: 0,
lastdaily: 0,
lastseen: 0,
lastdownload: 0,
registered: false,
name: m.name,
age: -1,
regTime: -1,
premium: false,
premiumTime: 0,
banned: false,
warn: 0,
level: 0,
role: 'Novato(a)',
autolevelup: true,
pc: 0,
asistencia: 0,
pasadoAsistencia: 0,
}
let chat = global.db.data.chats[m.chat]
if (typeof chat !== 'object')
global.db.data.chats[m.chat] = {}
if (chat) {
if (!('isBanned' in chat))
chat.isBanned = false
if (!('welcome' in chat))
chat.welcome = false
if (!('detect' in chat))
chat.detect = false
if (!('sWelcome' in chat))
chat.sWelcome = ''
if (!('sBye' in chat))
chat.sBye = ''
if (!('sPromote' in chat))
chat.sPromote = ''
if (!('sDemote' in chat))
chat.sDemote = ''
if (!('viewonce' in chat))
chat.viewonce = false
if (!('antiLink' in chat))
chat.antiLink = false
if (!('antiLink2' in chat))
chat.antiLink2 = false
if (!('audios' in chat))
chat.audios = true
if (!('antiToxic' in chat))
chat.antiToxic = false
if (!('antiTraba' in chat))
chat.antiTraba = false
if (!('simi' in chat))
chat.simi = false
if (!('autolevelup' in chat))
chat.autolevelup = false
if (!isNumber(chat.expired))
chat.expired = 0
if (!('antiNsfw' in chat))
chat.antiNsfw = false
if (!('modohorny' in chat))
chat.modohorny = false
if (!('modoadmin' in chat))
chat.modoadmin = false
if (!('antitoxic' in chat))
chat.antitoxic = false
if (!('reaction' in chat))
chat.reaction = true
if (!('grupo' in chat))
chat.grupo = false
if (!('antifake' in chat))
chat.antifake = false
if (!('bot' in chat))
chat.bot = false
if (!('autosticker' in chat))
chat.autosticker = false
} else
global.db.data.chats[m.chat] = {
isBanned: false,
welcome: false,
detect: false,
sWelcome: '',
sBye: '',
sPromote: '',
sDemote: '',
viewonce: false,
antiLink: false,
antiLink2: false,
audios: true,
antiToxic: false,
antiTraba: false,
simi: false,
autolevelup: false,
expired: 0,
antiNsfw: false,
modohorny: false,
modoadmin: false,
antitoxic: false,
reaction: true,
grupo: false,
antifake: false,
bot: false,
autosticker: false,
}
let settings = global.db.data.settings[this.user.jid]
if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
if (settings) {
if (!('self' in settings)) settings.self = false
if (!('autoread' in settings)) settings.autoread = false
if (!('restrict' in settings)) settings.restrict = false
if (!('audios' in settings)) settings.audios = true
if (!('antiPrivate' in settings)) settings.antiPrivate = false
if (!('antiCall' in settings)) settings.antiCall = false
if (!('antiToxic' in settings)) settings.antiToxic = false
if (!('modoAdmin' in settings)) settings.modoAdmin = false
if (!('jadibot' in settings)) settings.jadibot = false
if (!('antiLink' in settings)) settings.antiLink = false
if (!('antiLink2' in settings)) settings.antiLink2 = false
if (!('antiLink3' in settings)) settings.antiLink3 = false
if (!('antiLink4' in settings)) settings.antiLink4 = false
if (!('autobio' in settings)) settings.autobio = false
} else global.db.data.settings[this.user.jid] = {
self: false,
autoread: false,
restrict: false,
audios: true,
antiPrivate: false,
antiCall: false,
antiToxic: false,
modoAdmin: false,
jadibot: false,
antiLink: false,
antiLink2: false,
antiLink3: false,
antiLink4: false,
autobio: false
}
} catch (e) {
console.error(e)
}
if (opts['nyimak'])
return
if (!m.fromMe && opts['self'])
return
if (opts['pconly'] && m.chat.endsWith('g.us'))
return
if (opts['gconly'] && !m.chat.endsWith('g.us'))
return
if (opts['swonly'] && m.chat !== 'status@broadcast')
return
if (typeof m.text !== 'string')
m.text = ''
if (opts['antiprivado'] && m.chat.endsWith('net') && !m.fromMe && !global.owner.includes(m.sender)) { 
await m.reply('*[ ⚠ ] Este comando solo puede ser usado al privado del bot.*')
await this.updateBlockStatus(m.chat, 'block')
}
if (opts['anticall'] && m.chat.endsWith('net') && !m.fromMe && !global.owner.includes(m.sender)) { 
await m.reply('*[ ⚠ ] Las llamadas están prohibidas. Serás bloqueado si realizas otra.*')
await this.updateBlockStatus(m.chat, 'block')
}
if (m.isBaileys)
return
m.exp += Math.ceil(Math.random() * 10)
let usedPrefix
let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {};
const participants = (m.isGroup ? groupMetadata.participants : []) || [];
const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === conn.user.jid) : {}) || {};
const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === this.user.jid) : {}) || {}; 
const isROwner = [this.decodeJid(this.user.id), ...global.owner.map(v => v[0])].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
const isOwner = isROwner || m.fromMe;
const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
const isBotAdmin = m.isGroup ? bot.admin === 'admin' || bot.admin === 'superadmin' : false;
const isAdmin = m.isGroup ? _user.admin === 'admin' || _user.admin === 'superadmin' : false;
const isBan = global.db.data.users[m.sender].banned;
let chat = global.db.data.chats[m.chat];
let settings = global.db.data.settings[this.user.jid];
if (opts['restrict']) {
if (m.isBaileys && m.fromMe)
return
}
let _prefix = new RegExp(global.prefix);
if (opts['prefix'])
usedPrefix = opts['prefix'];
if (m.text && _prefix.test(m.text) && !isBan) {
usedPrefix = (_prefix.exec(m.text)).find(v => v === '');
if (usedPrefix == '') {
usedPrefix = (_prefix.exec(m.text)).find(v => v.length >= 1);
}
}
const isCMD = (usedPrefix && m.text.startsWith(usedPrefix));
if (m.isGroup && ((chat.modoadmin && !isOwner && !isMods && !isBotAdmin && !isAdmin) || chat.grupo)) {
if (isCMD) return
}
if (chat.isBanned && !isOwner && !isMods && !isPrems) {
return;
}
if (isCMD) {
if (isBan && !isOwner && !isPrems) {
return
}
if (_user.level < 1) {
this.reply(m.chat, `*[ ⚠ ] Su nivel es muy bajo, contacte con un desarrollador para que le suba el nivel.`, m)
return
}
}
let is  = {
grupos: m.isGroup,
m: m,
conn: this,
budy: (typeof m.text == 'string' ? m.text : ''),
args: m.text.split(' '),
chats: typeof m.text == 'string' ? m.text : '',
fromMe: m.fromMe,
isROwner: isROwner,
isOwner: isOwner,
isMods: isMods,
isPrems: isPrems,
isBotAdmin: isBotAdmin,
isAdmin: isAdmin,
isBan: isBan,
isCMD: isCMD,
chat: chat,
settings: settings,
_user: _user,
};

try {
if (isCMD && !m.isBan && m.text) {
const command = m.text.replace(usedPrefix, '').trim().split(/ +/).shift().toLowerCase();
const plugin = Object.values(global.plugins).find(plugin => plugin.command && (plugin.command.includes(command) || plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command)));
if (plugin) {
m.plugin = plugin;
if (plugin.rowner && !isOwner) {
m.reply('『✦』Este comando solo puede ser usado por los creadores del bot.').then(_ => m.react('✖️'));
return
}
if (plugin.owner && !isOwner) {
m.reply('『✦』Este comando solo puede ser usado por los desarrolladores del bot.').then(_ => m.react('✖️'));
return
}
if (plugin.mods && !isMods) {
m.reply('『✦』Este comando solo puede ser usado por los moderadores del bot.').then(_ => m.react('✖️'));
return
}
if (plugin.premium && !isPrems) {
m.reply('『✦』Este comando solo puede ser usado por los usuarios premium.').then(_ => m.react('✖️'));
return
}
if (plugin.group && !m.isGroup) {
m.reply('『✦』Este comando solo puede ser usado en grupos.').then(_ => m.react('✖️'));
return
}
if (plugin.private && m.isGroup) {
m.reply('『✦』El comando solo puede ser usado al chat privado del bot.').then(_ => m.react('✖️'));
return
}
if (plugin.admin && !isAdmin) {
m.reply('『✦』El comando solo puede ser usado por los administradores del grupo.').then(_ => m.react('✖️'));
return
}
if (plugin.botAdmin && !isBotAdmin) {
m.reply('『✦』Para ejecutar el comando debo ser administrador del grupo.').then(_ => m.react('✖️'));
return
}
if (plugin.unreg && !user.registered) {
m.reply('『✦』El comando solo puede ser usado por los usuarios registrados, regístrate usando: #verify o #reg.').then(_ => m.react('✖️'));
return
}
if (plugin.restrict && !settings.restrict) {
m.reply('『✦』Esta característica está desactivada.').then(_ => m.react('✖️'));
return
}
await plugin.call(this, m, is);
} else {
// Manejar comandos no encontrados o pasar
}
}
} catch (e) {
console.error(e)
}
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizo 'handler.js'"))

if (global.conns && global.conns.length > 0) {
for (let i = 0; i < global.conns.length; i++) {
const conn = global.conns[i]
try {
conn.handler = (await import(`${file}?update=${Date.now()}`)).handler.bind(conn)
} catch (e) {
console.error(e)
}
}
} else {
try {
global.conn.handler = (await import(`${file}?update=${Date.now()}`)).handler.bind(global.conn)
} catch (e) {
console.error(e)
}
}
})
