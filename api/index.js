const { Redis } = require('@upstash/redis');

let redis;
try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });
} catch (e) {
  console.error('Redis init error:', e.message);
}

const ACCOUNTS = [
  { id: 1, name: "追风少年", category: "搞笑/生活", desc: "搞笑段子手", fans: "100.0w", date: "账号已重置" },
  { id: 2, name: "梅尼耶", category: "美食/网红", desc: "鼓上舞创始人", fans: "2600w", date: "2024-04-27" },
  { id: 3, name: "毒角SHOW", category: "剧情/搞笑", desc: "独特角先生", fans: "2500w", date: "2024-04-27" },
  { id: 4, name: "毒舌电影", category: "影视解说", desc: "专业电影解说", fans: "6000w", date: "2024-04-27" },
  { id: 5, name: "藏不住的秘密", category: "剧情/情感", desc: "悬疑反转剧情", fans: "1000w", date: "2024-04-27" },
  { id: 6, name: "小白剪辑", category: "技能/教程", desc: "Pr/Ae教学", fans: "200.0w", date: "2024-04-27" },
  { id: 7, name: "科技呆", category: "科技/数码", desc: "数码测评", fans: "200.0w", date: "2024-04-27" },
  { id: 8, name: "科技季", category: "科技/数码", desc: "手机测评", fans: "100.0w", date: "2024-04-27" },
  { id: 9, name: "一何正经", category: "知识/职场", desc: "职场干货", fans: "100.0w", date: "2024-04-27" },
  { id: 10, name: "小lin出品", category: "财经/商业", desc: "商业科普", fans: "500.0w", date: "2024-04-27" },
  { id: 11, name: "冲浪普拉斯", category: "财经/商业", desc: "商业纪录片", fans: "500.0w", date: "2024-04-27" },
  { id: 12, name: "思维实验室", category: "知识/科普", desc: "深度科普", fans: "500.0w", date: "2024-04-27" },
  { id: 13, name: "三维地图集", category: "知识/地理", desc: "全球旅行", fans: "500.0w", date: "2024-04-27" },
  { id: 14, name: "蛋解创业", category: "财经/创业", desc: "创业故事", fans: "100.0w", date: "2024-04-27" },
  { id: 15, name: "硬核看板", category: "科技/商业", desc: "商业科技", fans: "100.0w", date: "2024-04-27" },
  { id: 16, name: "硬核的半佛仙人", category: "知识/吐槽", desc: "神仙级吐槽", fans: "500.0w", date: "2024-04-27" },
  { id: 17, name: "果壳", category: "知识/科普", desc: "科普百科", fans: "1000w", date: "2024-04-27" },
  { id: 18, name: "罗翔", category: "知识/法律", desc: "法律普法", fans: "3000w", date: "2024-04-27" },
  { id: 19, name: "狂丸食堂", category: "美食/生活", desc: "黑暗料理", fans: "500.0w", date: "2024-04-27" },
  { id: 20, name: "秀画神笔", category: "创意/绘画", desc: "AI创意画", fans: "200.0w", date: "2024-04-27" },
  { id: 21, name: "司氏砸缸", category: "知识/旅行", desc: "旅行探险", fans: "200.0w", date: "2024-04-27" }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, 'https://' + req.headers.host);
  const pathname = url.pathname;

  try {
    // API: 获取账号列表 + 评价
    if (pathname === '/api/accounts' && req.method === 'GET') {
      const ratings = {};
      for (const acc of ACCOUNTS) {
        try {
          const val = await redis.get('rating:' + acc.id);
          ratings[acc.id] = val || '';
        } catch (e) {
          ratings[acc.id] = '';
        }
      }
      return res.status(200).json({ accounts: ACCOUNTS, ratings });
    }

    // API: 保存评价
    if (pathname === '/api/rate' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { id, rating } = JSON.parse(body);
      if (!id || !rating) {
        return res.status(400).json({ error: 'Missing id or rating' });
      }
      await redis.set('rating:' + id, rating);
      return res.status(200).json({ success: true });
    }

    // 首页: 返回 HTML
    if (pathname === '/' && req.method === 'GET') {
      const fs = require('fs');
      const path = require('path');
      const htmlPath = path.join(process.cwd(), 'index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    return res.status(404).json({ error: 'Not found', path: pathname });

  } catch (e) {
    console.error('Handler error:', e);
    return res.status(500).json({ error: e.message });
  }
}
