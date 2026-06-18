# 帮你选奶茶素材包

这是网站首版可用的奶茶/咖啡品牌素材底座。

## Cloudflare Pages 部署

在 Cloudflare Pages 里连接 GitHub 仓库后，使用以下构建配置：

- Framework preset：`Next.js (Static HTML Export)`
- Build command：`npx next build`
- Build output directory：`out`

项目已通过 `next.config.mjs` 配置为静态导出，适合部署到 Cloudflare Pages。

## 文件

- `data/brands.json`：品牌、品类、代表单品、分组 SKU、视觉关键词。
- `data/image-sources.csv`：图片素材来源入口和授权状态。
- `docs/asset-notes.md`：图片使用注意事项和后续补采方向。
- `public/images/`：预留本地图片目录。

## 重要提醒

当前图片清单是“来源索引”，不是已授权图片库。上线前请使用已授权、本地拍摄或非品牌化生成图片替换。
