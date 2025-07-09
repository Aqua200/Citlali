import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

import { owners } from './data/owner.js';
import { communityLinks } from './data/community.js';

global.BotConfig = {
    // --- Identidad del Bot ---
    identity: {
        name: 'Citlali',     // ¡El nombre de tu bot!
        prefix: '.',         // Prefijo para los comandos (ej. !menu)
        version: 'Core 3.0', // Versión del software del bot
        author: 'Neykoor',
        poweredBy: 'Citlali AI Spanish',
        qrName: 'CitlaliAuth',   // Nombre para el código QR de autenticación
        sessionDir: 'citlali_sessions', // Directorio para las sesiones de Baileys
    },

    // --- Red de Contactos (Referencia a owner.js) ---
    contacts: {
        owners: owners, // ¡Aquí se importan desde data/owner.js!
        moderators: [], // Puedes seguir definiendo aquí otros roles directamente 
        premiumUsers: [],
    },

    // --- Funcionalidades Específicas ---
    features: {
        enableJadibot: true,
        jadibotAlias: 'CitlaliProxy', // Alias para la funcionalidad Jadibot
        linkedBotNumber: '', // Si tu bot será un Jadibot de otro bot principal, define su número aquí.
    },

    // --- Contenido Multimedia y Branding ---
    branding: {
        stickerPackName: 'CitlaliStickers',
        botTagline: 'Tu asistente personal en WhatsApp',
        watermark: '© CitlaliBot',
        welcomeMessage: '¡Bienvenido(a)! Soy Citlali, tu asistente. ¿En qué puedo ayudarte?',
        goodbyeMessage: '¡Hasta la próxima! Citlali te espera.',
        bannerURL: 'https://files.catbox.moe/e98ktt.jpg', // URL de tu imagen de banner (ejemplo)
        avatarURL: 'https://files.catbox.moe/oly31v.jpeg', // URL de tu imagen de avatar (ejemplo)
        catalogImage: './src/citlali_catalog.jpg', // Ruta local para una imagen de catálogo (asegúrate que exista)
    },

    // --- Enlaces y Comunidad (Referencia a community.js) ---
    community: {
        links: communityLinks, // ¡Aquí se importan desde data/community.js!
        githubRepo: 'https://github.com/TuUsuario/TuRepositorioCitlali', // Ajusta a tu repositorio de GitHub
        contactEmail: 'citlali.support@example.com', // Tu correo electrónico de contacto
    },

    // --- Configuración Avanzada y Librerías ---
    advanced: {
        baileysVersion: '6.7.17', // Versión de Baileys que estás usando
        scoreMultiplier: 60, // Multiplicador para un sistema de puntos o experiencia (ajusta según necesites)
        newsletterChannels: {
            channel1: '120363392571425662@newsletter', // ID de un canal de WhatsApp (ej. para enviar noticias)
        },
    },

    
    utils: {
        cheerio: cheerio,
        fs: fs,
        fetch: fetch,
        axios: axios,
        moment: moment,
    }
};

global.estilo = {
    key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {})
    },
    message: {
        orderMessage: {
            itemCount : -999999,
            status: 1,
            surface : 1,
            message: global.BotConfig.branding.stickerPackName,
            orderTitle: 'Información de Citlali',
            thumbnail: fs.readFileSync(global.BotConfig.branding.catalogImage), // Carga la imagen de catálogo
            sellerJid: '0@s.whatsapp.net'
        }
    }
};

const currentFile = fileURLToPath(import.meta.url);
watchFile(currentFile, () => {
    unwatchFile(currentFile);
    console.log(chalk.yellowBright(`[CONFIG] Actualización detectada en '${currentFile}'. Recargando configuración...`));
    import(`${currentFile}?update=${Date.now()}`);
});
