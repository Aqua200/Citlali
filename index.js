process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

import './config.js';

import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import cfonts from 'cfonts';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import { FurinaJadiBot } from './plugins/jadibot-serbot.js';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import boxen from 'boxen';
import pino from 'pino';
import path, { join, dirname } from 'path';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import store from './lib/store.js';
const { proto } = (await import('@whiskeysockets/baileys')).default;
import pkg from 'google-libphonenumber';
const { PhoneNumberUtil } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, Browsers } = await import('@whiskeysockets/baileys');
import readline, { createInterface } from 'readline';
import NodeCache from 'node-cache';

const { CONNECTING } = ws;
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

let { say } = cfonts;

console.log(chalk.hex('#8A2BE2').bold(`\n💖 Iniciando ${global.BotConfig.identity.name} 💖\n`));

say(global.BotConfig.identity.name, {
  font: 'block',
  align: 'center',
  colors: ['magentaBright', 'cyanBright']
});

say(`Desarrollado Por • ${global.BotConfig.identity.author.name}`, {
  font: 'console',
  align: 'center',
  colors: ['greenBright', 'white']
});

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '');

global.timestamp = { start: new Date() };

const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#/!.]');

global.db = new Low(/https?:\/\//.test(global.opts['db'] || '') ? new cloudDBAdapter(global.opts['db']) : new JSONFile('./database.json'));

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function() {
      if (!global.db.READ) {
        clearInterval(this);
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1 * 1000));
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};
loadDatabase();

const { state, saveState, saveCreds } = await useMultiFileAuthState(global.BotConfig.identity.sessionDir);
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache();
const { version } = await fetchLatestBaileysVersion();
let phoneNumber = global.BotConfig.features.botNumber;

const methodCodeQR = process.argv.includes("qr");
const methodCode = !!phoneNumber || process.argv.includes("code");
const MethodMobile = process.argv.includes("mobile");

const colores = chalk.bgMagenta.white;
const opcionQR = chalk.bold.green;
const opcionTexto = chalk.bold.cyan;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

let opcion;
if (methodCodeQR) {
  opcion = '1';
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.BotConfig.identity.sessionDir}/creds.json`)) {
  do {
    opcion = await question(colores('🌟 Seleccione un método de conexión para Citlali: 🌟\n') + opcionQR('1. Con código QR (Recomendado)\n') + opcionTexto('2. Con código de texto de 8 dígitos\n✨ Elija: '));

    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`❌ Entrada no válida. Por favor, ingrese '1' o '2'.`));
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.BotConfig.identity.sessionDir}/creds.json`));
}

console.info = () => {};
console.debug = () => {};

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: opcion == '1' ? Browsers.macOS("Desktop") : methodCodeQR ? Browsers.macOS("Desktop") : Browsers.macOS("Chrome"),
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  getMessage: async (clave) => {
    let jid = jidNormalizedUser(clave.remoteJid);
    let msg = await store.loadMessage(jid, clave.id);
    return msg?.message || "";
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,
  version,
};

global.conn = makeWASocket(connectionOptions);

if (!fs.existsSync(`./${global.BotConfig.identity.sessionDir}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2';
    if (!conn.authState.creds.registered) {
      let addNumber;
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '');
      } else {
        do {
          phoneNumber = await question(chalk.bgAnsi256(166)(chalk.bold.white(`📞 Ingrese el número de WhatsApp para ${global.BotConfig.identity.name}.\n`)) + chalk.bgAnsi256(208)(chalk.bold.white(`    Ejemplo: 521XXXXXXXXXX o +521XXXXXXXXXX\n`)) + chalk.bgAnsi256(226)(chalk.bold.black(`---> `)));
          phoneNumber = phoneNumber.replace(/\D/g, '');
          if (!phoneNumber.startsWith('+')) {
            phoneNumber = `+${phoneNumber}`;
          }
        } while (!await isValidPhoneNumber(phoneNumber));
        rl.close();
        addNumber = phoneNumber.replace(/\D/g, '');
        setTimeout(async () => {
          let codeBot = await conn.requestPairingCode(addNumber);
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
          console.log(boxen(chalk.bold.white(`✨ CÓDIGO DE VINCULACIÓN PARA ${global.BotConfig.identity.name} ✨\n\n`) + chalk.bold.magentaBright(codeBot), { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'magenta' }));
        }, 3000);
      }
    }
  }
}

conn.isInit = false;
conn.well = false;

if (!global.opts['test']) {
  if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write();
    if (global.opts['autocleartmp'] && (global.support || {}).find) {
      (tmp = [tmpdir(), 'tmp', `${global.BotConfig.features.jadibotAlias}`], tmp.forEach((filename) => {
        spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']);
      }));
    }
  }, 30 * 1000);
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update;
  global.stopped = connection;
  if (isNewLogin) conn.isInit = true;
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date();
  }
  if (global.db.data == null) loadDatabase();
  if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) {
      console.log(chalk.bold.yellow(`\n📸 ESCANEE EL CÓDIGO QR PARA ${global.BotConfig.identity.name}. EXPIRA EN 45 SEGUNDOS. 📸`));
    }
  }
  if (connection == 'open') {
    console.log(chalk.bold.green(`\n✅ ${global.BotConfig.identity.name} Conectado exitosamente. ¡Bienvenido al servicio! ✅`));
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
      console.log(boxen(chalk.bold.cyanBright(`\n🚨 SESIÓN INVÁLIDA: Borre la carpeta ${global.BotConfig.identity.sessionDir} y escanee el Código QR nuevamente. 🚨`), { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'red' }));
    } else if (reason === DisconnectReason.connectionClosed) {
      console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☹\n┆ ⚠️ CONEXIÓN CERRADA, INTENTANDO RECONECTAR...`));
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
      console.log(chalk.bold.blueBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☂\n┆ ⚠️ CONEXIÓN PERDIDA CON EL SERVIDOR, INTENTANDO RECONECTAR...`));
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced) {
      console.log(boxen(chalk.bold.yellowBright(`\n⚠️ CONEXIÓN REEMPLAZADA: Se ha abierto otra sesión. Cierre la sesión actual primero.`), { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'yellow' }));
    } else if (reason === DisconnectReason.loggedOut) {
      console.log(boxen(chalk.bold.redBright(`\n❌ SESIÓN CERRADA: Borre la carpeta ${global.BotConfig.identity.sessionDir} y escanee el Código QR nuevamente. ❌`), { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'red' }));
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.restartRequired) {
      console.log(chalk.bold.cyanBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✓\n┆ 🔄 REINICIO NECESARIO: Conectando al servidor...`));
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.timedOut) {
      console.log(chalk.bold.yellowBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ▸\n┆ ⏳ TIEMPO DE CONEXIÓN AGOTADO, INTENTANDO RECONECTAR...`));
      await global.reloadHandler(true).catch(console.error);
    } else {
      console.log(chalk.bold.redBright(`\n🚨 ¡RAZÓN DE DESCONEXIÓN DESCONOCIDA!: ${reason || 'No encontrado'} >> ${connection || 'No encontrado'}`));
    }
    console.log(chalk.bold.blueBright(`╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ⚡️`));
  }
}
process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function(restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Object.keys(Handler || {}).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }
  if (restatConn) {
    const oldChats = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch { }
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions, { chats: oldChats });
    isInit = true;
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  conn.handler = handler.handler.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  const currentDateTime = new Date();
  const messageDateTime = new Date(conn.ev);
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  } else {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  }

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);
  isInit = false;
  return true;
};

global.rutaJadiBot = join(__dirname, `./${global.BotConfig.identity.sessionDir}_${global.BotConfig.features.jadibotAlias}`);

if (global.BotConfig.features.enableJadibot) {
  if (!existsSync(global.rutaJadiBot)) {
    mkdirSync(global.rutaJadiBot, { recursive: true });
    console.log(chalk.bold.cyan(`📁 La carpeta de Jadibots: ${global.BotConfig.features.jadibotAlias} se creó correctamente en ${global.BotConfig.identity.sessionDir}.`));
  } else {
    console.log(chalk.bold.cyan(`📁 La carpeta de Jadibots: ${global.BotConfig.features.jadibotAlias} ya está creada.`));
  }

  const readRutaJadiBot = readdirSync(global.rutaJadiBot);
  if (readRutaJadiBot.length > 0) {
    const creds = 'creds.json';
    for (const gjbts of readRutaJadiBot) {
      const botPath = join(global.rutaJadiBot, gjbts);
      const readBotPath = readdirSync(botPath);
      if (readBotPath.includes(creds)) {
        FurinaJadiBot({ pathFurinaJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot' });
      }
    }
  }
}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
      conn.logger.error(e);
      delete global.plugins[filename];
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`🔄 Plugin actualizado - '${filename}'`);
      else {
        conn.logger.warn(`❌ Plugin eliminado - '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`✨ Nuevo plugin - '${filename}'`);
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`🚨 Error de sintaxis al cargar '${filename}'\n${format(err)}`);
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`🔥 Error al importar plugin '${filename}'\n${format(e)}`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();

async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
  Object.freeze(global.support);
}

function clearTmp() {
  const tmpDir = join(__dirname, 'tmp');
  const filenames = readdirSync(tmpDir);
  filenames.forEach(file => {
    const filePath = join(tmpDir, file);
    unlinkSync(filePath);
  });
}

function purgeSession() {
  let prekey = [];
  let directorio = readdirSync(`./${global.BotConfig.identity.sessionDir}`);
  let filesFolderPreKeys = directorio.filter(file => {
    return file.startsWith('pre-key-');
  });
  prekey = [...prekey, ...filesFolderPreKeys];
  filesFolderPreKeys.forEach(files => {
    unlinkSync(`./${global.BotConfig.identity.sessionDir}/${files}`);
  });
}

function purgeSessionSB() {
  try {
    const listaDirectorios = readdirSync(`./${global.BotConfig.identity.sessionDir}_${global.BotConfig.features.jadibotAlias}/`);
    let SBprekey = [];
    listaDirectorios.forEach(directorio => {
      if (statSync(`./${global.BotConfig.identity.sessionDir}_${global.BotConfig.features.jadibotAlias}/${directorio}`).isDirectory()) {
        const DSBPreKeys = readdirSync(`./${global.BotConfig.identity.sessionDir}_${global.BotConfig.features.jadibotAlias}/${directorio}`).filter(fileInDir => {
          return fileInDir.startsWith('pre-key-');
        });
        SBprekey = [...SBprekey, ...DSBPreKeys];
        DSBPreKeys.forEach(fileInDir => {
          if (fileInDir !== 'creds.json') {
            unlinkSync(`./${global.BotConfig.identity.sessionDir}_${global.BotConfig.features.jadibotAlias}/${directorio}/${fileInDir}`);
          }
        });
      }
    });
    if (SBprekey.length === 0) {
      console.log(chalk.bold.green(`\n╭» ❍ ${global.BotConfig.features.jadibotAlias} ❍\n│→ NADA POR ELIMINAR \n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻︎`));
    } else {
      console.log(chalk.bold.cyanBright(`\n╭» ❍ ${global.BotConfig.features.jadibotAlias} ❍\n│→ ARCHIVOS NO ESENCIALES DE JADIBOTS ELIMINADOS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻︎︎`));
    }
  } catch (err) {
    console.log(chalk.bold.red(`\n╭» ❍ ${global.BotConfig.features.jadibotAlias} ❍\n│→ OCURRIÓ UN ERROR AL LIMPIAR JADIBOTS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻\n` + err));
  }
}

function purgeOldFiles() {
  const directories = [`./${global.BotConfig.identity.sessionDir}/`, `./${global.BotConfig.identity.sessionDir}_${global.BotConfig.features.jadibotAlias}/`];
  directories.forEach(dir => {
    readdirSync(dir, (err, files) => {
      if (err) throw err;
      files.forEach(file => {
        if (file !== 'creds.json') {
          const filePath = path.join(dir, file);
          unlinkSync(filePath, err => {
            if (err) {
              console.log(chalk.bold.red(`\n╭» ❍ ARCHIVO ❍\n│→ ${file} NO SE LOGRÓ BORRAR\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ✘\n` + err));
            } else {
              console.log(chalk.bold.green(`\n╭» ❍ ARCHIVO ❍\n│→ ${file} BORRADO CON ÉXITO\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`));
            }
          });
        }
      });
    });
  });
}

function redefineConsoleMethod(methodName, filterStrings) {
  const originalConsoleMethod = console[methodName];
  console[methodName] = function() {
    const message = arguments[0];
    if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
      arguments[0] = "";
    }
    originalConsoleMethod.apply(console, arguments);
  };
}

setInterval(async () => {
  if (global.stopped === 'close' || !global.conn || !global.conn.user) return;
  await clearTmp();
  console.log(chalk.bold.cyanBright(`\n╭» ❍ MULTIMEDIA ❍\n│→ ARCHIVOS DE LA CARPETA TMP ELIMINADAS\n╰― ― ― ― ― ― ― ― ― 
