// 最小化版本：不依赖 Redis，直接返回硬编码数据
const ACCOUNTS = [
  { id: 1, name: "追风少年", category: "搞笑/生活", desc: "搞笑段子手", fans: "100.0w", status: "账号已重置" },
  { id: 2, name: "梅尼耶", category: "美食/网红", desc: "鼓上舞创始人", fans: "2600w", status: "-" },
  { id: 3, name: "毒角SHOW", category: "剧情/搞笑", desc: "独特角先生", fans: "2500w", status: "-" },
  { id: 4, name: "毒舌电影", category: "影视解说", desc: "专业电影解说", fans: "6000w", status: "-" },
  { id: 5, name: "藏不住的秘密", category: "剧情/情感", desc: "悬疑反转剧情", fans: "1000w", status: "-" },
  { id: 6, name: "小白剪辑", category: "技能/教程", desc: "Pr/Ae教学", fans: "200.0w", status: "-" },
  { id: 7, name: "科技呆", category: "科技/数码", desc: "数码测评", fans: "200.0w", status: "-" },
  { id: 8, name: "科技季", category: "科技/数码", desc: "手机测评", fans: "100.0w", status: "-" },
  { id: 9, name: "一何正经", category: "知识/职场", desc: "职场干货", fans: "100.0w", status: "-" },
  { id: 10, name: "小lin出品", category: "财经/商业", desc: "商业科普", fans: "500.0w", status: "-" },
  { id: 11, name: "冲浪普拉斯", category: "财经/商业", desc: "商业纪录片", fans: "500.0w", status: "-" },
  { id: 12, name: "思维实验室", category: "知识/科普", desc: "深度科普", fans: "500.0w", status: "-" },
  { id: 13, name: "三维地图集", category: "知识/地理", desc: "全球旅行", fans: "500.0w", status: "-" },
  { id: 14, name: "蛋解创业", category: "财经/创业", desc: "创业故事", fans: "100.0w", status: "-" },
  { id: 15, name: "硬核看板", category: "科技/商业", desc: "商业科技", fans: "100.0w", status: "-" },
  { id: 16, name: "硬核的半佛仙人", category: "知识/吐槽", desc: "神仙级吐槽", fans: "500.0w", status: "-" },
  { id: 17, name: "果壳", category: "知识/科普", desc: "科普百科", fans: "1000w", status: "-" },
  { id: 18, name: "罗翔", category: "知识/法律", desc: "法律普法", fans: "3000w", status: "-" },
  { id: 19, name: "狂丸食堂", category: "美食/生活", desc: "黑暗料理", fans: "500.0w", status: "-" },
  { id: 20, name: "秀画神笔", category: "创意/绘画", desc: "AI创意画", fans: "200.0w", status: "-" },
  { id: 21, name: "司氏砸缸", category: "知识/旅行", desc: "旅行探险", fans: "200.0w", status: "-" }
];

// ratings 存在内存里（Vercel serverless 每次调用冷启动，不用 Redis）
const ratings = {};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, 'http://' + req.headers.host);

  if (req.method === 'GET' && url.pathname === '/api/accounts') {
    return res.status(200).json({
      source: 'serverless',
      timestamp: new Date().toISOString(),
      accounts: ACCOUNTS.map(a => ({ ...a, rating: ratings[a.id] || null }))
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/rate') {
    let body = {};
    try {
      if (req.body) body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch(e) {}
    const { accountId, rating } = body;
    if (!accountId || !rating) {
      return res.status(400).json({ error: '缺少参数 accountId 或 rating' });
    }
    ratings[accountId] = rating;
    return res.status(200).json({ success: true, accountId, rating, note: '数据保存在内存（重启后会重置）' });
  }

  // 所有其他路径 → 静态文件由 Vercel 处理
  return res.status(404).json({ error: '未知端点', path: url.pathname });
}
