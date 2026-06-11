export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Real-time Chat Server</title>
<style>body{font-family:sans-serif;max-width:700px;margin:60px auto;padding:0 20px;color:#111}
.badge{display:inline-block;background:#fef3c7;color:#92400e;padding:4px 10px;border-radius:999px;font-size:13px}
.card{background:#f9fafb;border-radius:10px;padding:24px;margin:24px 0}
pre{background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;overflow:auto;font-size:13px}
</style></head>
<body>
<h1>💬 Real-time Chat Server</h1>
<span class="badge">⚠️ Requires long-running server</span>
<p>This app uses <strong>Socket.IO</strong> for real-time WebSocket connections and <strong>MongoDB</strong> for message persistence — both require a persistent server process that isn't compatible with Vercel's serverless functions.</p>
<div class="card">
<h3>Stack</h3>
<ul><li>Node.js + Express</li><li>Socket.IO (WebSockets)</li><li>MongoDB (message storage)</li><li>TypeScript</li></ul>
</div>
<div class="card">
<h3>To run locally</h3>
<pre>git clone https://github.com/rstickel/realtime-chat-server
cd realtime-chat-server && npm install
npm run dev</pre>
</div>
<div class="card"><h3>To deploy</h3><p>Deploy to <strong>Railway</strong>, <strong>Render</strong>, or <strong>Fly.io</strong> — all support persistent Node.js servers with WebSocket connections.</p></div>
</body></html>`);
}
