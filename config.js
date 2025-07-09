// settings (2).js
import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

import { 
    owner, mods, suittag, prems, 
    botNumber, nameqr, namebot, sessions, jadi, CitlaliJadibts,
    packname, botname, wm, author, dev, textbot, etiqueta, 
    moneda, welcom1, welcom2, banner, avatar, gp1, comunidad1, channel, channel2, md, correo, 
    catalogo, estilo, ch, multiplier
} from './data/config.js' 

global.botNumber = botNumber

global.owner = owner 
global.mods = mods
global.suittag = suittag 
global.prems = prems

global.libreria = 'Baileys'
global.baileys = 'V 6.7.17' 
global.vs = '2.2.5'
global.nameqr = nameqr 
global.namebot = namebot 
global.sessions = sessions 
global.jadi = jadi 
global.CitlaliJadibts = CitlaliJadibts 

global.packname = packname 
global.botname = botname 
global.wm = wm 
global.author = author 
global.dev = dev 
global.textbot = textbot 
global.etiqueta = etiqueta 

global.moneda = moneda 
global.welcom1 = welcom1 
global.welcom2 = welcom2 
global.banner = banner 
global.avatar = avatar 

global.gp1 = gp1 
global.comunidad1 = comunidad1 
global.channel = channel 
global.channel2 = channel2 
global.md = md 
global.correo = correo 

global.catalogo = catalogo 
global.estilo = estilo 
global.ch = ch 
global.multiplier = multiplier 

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment   

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})
