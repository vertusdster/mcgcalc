# GSC 请求编入索引计划

> 创建于 2026-07-16。背景:全站 40 页仅首页和 `/peptides/` 被收录,其余肽详情页均为"已发现,尚未抓取"。
> 当日所有 SEO 修复(服务端渲染导航/FAQ、robots.txt、去重复 URL、删占位博客)已部署上线,
> 请求收录时 Google 抓到的即是修复后的版本。

## 操作方法

1. 打开 [Google Search Console](https://search.google.com/search-console)(资源:`sc-domain:mcgcalc.com`)
2. 顶部搜索框粘贴 URL → 等待检查完成 → 点击"请求编入索引"
3. 每天配额约 10 个;若提示"已收录"则跳过,把配额留给下一个
4. 全部提交完后等 1–2 周,再核对收录状态(可用 API 批量复查)

## 第 1 批 — 2026-07-16(核心工具 + 高搜索量肽)

- [ ] https://mcgcalc.com/peptide-calculator/ ← 核心工具页,4 月被爬过但未收录
- [ ] https://mcgcalc.com/peptides/semaglutide/ ← GLP-1,搜索量最大
- [ ] https://mcgcalc.com/peptides/tirzepatide/ ← GLP-1,搜索量第二
- [ ] https://mcgcalc.com/peptides/bpc-157/
- [ ] https://mcgcalc.com/peptides/tb-500/
- [ ] https://mcgcalc.com/peptides/melanotan-2/ ← 曾获排名第 1 的展示
- [ ] https://mcgcalc.com/peptides/ipamorelin/
- [ ] https://mcgcalc.com/peptides/cjc-1295/
- [ ] https://mcgcalc.com/reverse-calculator/
- [ ] https://mcgcalc.com/faq/ ← 全文刚放进静态 HTML,值得重抓

## 第 2 批 — 2026-07-17

- [ ] https://mcgcalc.com/peptides/tesamorelin/
- [ ] https://mcgcalc.com/peptides/sermorelin/
- [ ] https://mcgcalc.com/peptides/pt-141/
- [ ] https://mcgcalc.com/peptides/ghk-cu/
- [ ] https://mcgcalc.com/peptides/nad-plus/
- [ ] https://mcgcalc.com/peptides/semax/
- [ ] https://mcgcalc.com/order-calculator/
- [ ] https://mcgcalc.com/intranasal-calculator/
- [ ] https://mcgcalc.com/unit-converter/
- [ ] https://mcgcalc.com/about/

## 第 3 批 — 2026-07-18(收尾)

- [ ] https://mcgcalc.com/peptides/aod-9604/
- [ ] https://mcgcalc.com/peptides/epithalon/
- [ ] https://mcgcalc.com/peptides/ghrp-2/
- [ ] https://mcgcalc.com/peptides/ghrp-6/
- [ ] https://mcgcalc.com/peptides/hexarelin/
- [ ] https://mcgcalc.com/peptides/igf-1-lr3/
- [ ] https://mcgcalc.com/peptides/selank/
- [ ] https://mcgcalc.com/contact/

## 不需要提交的页面

- `https://mcgcalc.com/` 与 `https://mcgcalc.com/peptides/` — 已收录
- `/saved/` — 已设 noindex 并从 sitemap 移除
- `/blog/` — 暂无真实文章,等内容重建后再提交
- `/privacy/`、`/terms/`、`/about/team/` — 低价值页,让 Google 自然抓取即可

## 复查(2026-07-30 前后)

用 URL Inspection API 批量核对上述 URL 的 `coverageState` 是否从
"Discovered - currently not indexed" 变为 "Submitted and indexed",
并拉取 searchAnalytics 对比展示/排名变化。
