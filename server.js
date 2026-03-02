const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sert l'admin sur /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

const conversations = {};
let adminWs = null;

function genId() { return crypto.randomBytes(6).toString('hex'); }

wss.on('connection', (ws) => {
  let clientId = null, isAdmin = false;

  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    // Admin se connecte
    if (data.type === 'admin_connect') {
      if (data.password !== (process.env.ADMIN_PASSWORD || 'admin1234')) {
        ws.send(JSON.stringify({ type: 'auth_error' })); return;
      }
      isAdmin = true; adminWs = ws;
      ws.send(JSON.stringify({
        type: 'init',
        conversations: Object.values(conversations).map(c => ({
          id: c.id, name: c.name, messages: c.messages, unread: c.unread || 0
        }))
      }));
      return;
    }

    // Client se connecte
    if (data.type === 'client_connect') {
      clientId = data.clientId || genId();
      if (!conversations[clientId]) {
        conversations[clientId] = {
          id: clientId,
          name: data.name || `Visiteur ${clientId.slice(0,4).toUpperCase()}`,
          messages: [], unread: 0
        };
      }
      conversations[clientId].clientWs = ws;
      ws.send(JSON.stringify({ type: 'connected', clientId, messages: conversations[clientId].messages }));
      // Notifier l'admin
      if (adminWs?.readyState === 1) {
        adminWs.send(JSON.stringify({
          type: 'client_connected',
          conversation: { id: clientId, name: conversations[clientId].name, messages: conversations[clientId].messages, unread: 0 }
        }));
      }
      return;
    }

    // Message d'un client
    if (data.type === 'client_message' && data.clientId) {
      const conv = conversations[data.clientId]; if (!conv) return;
      const msg = { from: 'client', text: data.text, time: Date.now() };
      conv.messages.push(msg);
      conv.unread = (conv.unread || 0) + 1;
      if (adminWs?.readyState === 1) {
        adminWs.send(JSON.stringify({ type: 'new_message', clientId: data.clientId, message: msg, unread: conv.unread }));
      }
      return;
    }

    // Réponse de l'admin
    if (data.type === 'admin_message' && isAdmin) {
      const conv = conversations[data.clientId]; if (!conv) return;
      const msg = { from: 'admin', text: data.text, time: Date.now() };
      conv.messages.push(msg); conv.unread = 0;
      if (conv.clientWs?.readyState === 1) {
        conv.clientWs.send(JSON.stringify({ type: 'new_message', message: msg }));
      }
      adminWs.send(JSON.stringify({ type: 'message_sent', clientId: data.clientId, message: msg }));
      return;
    }

    // Marquer comme lu
    if (data.type === 'mark_read' && isAdmin && data.clientId) {
      if (conversations[data.clientId]) conversations[data.clientId].unread = 0;
      return;
    }
  });

  ws.on('close', () => {
    if (isAdmin) adminWs = null;
    if (clientId && conversations[clientId]) conversations[clientId].clientWs = null;
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ TechStore actif sur le port ${PORT}`));