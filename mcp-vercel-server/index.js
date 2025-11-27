import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

// 프로젝트 목록 조회
app.post('/mcp/list-projects', async (req, res) => {
  const response = await fetch('https://api.vercel.com/v9/projects', {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  const data = await response.json();
  res.json({ type: 'success', data });
});

// 새 배포
app.post('/mcp/deploy', async (req, res) => {
  const { projectName } = req.body;
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: projectName })
  });
  const data = await response.json();
  res.json({ type: 'success', data });
});

app.listen(9001, () => {
  console.log('MCP Vercel Server running on port 9001');
});
