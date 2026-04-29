// 极简测试 - 零依赖，验证 Vercel Serverless 是否可用
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    node: process.version,
    arch: process.arch,
    platform: process.platform,
    env_vercel: !!process.env.VERCEL,
    env_region: process.env.VERCEL_REGION || 'unknown'
  });
}
