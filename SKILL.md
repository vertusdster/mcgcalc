# SKILL: Peptide Content Page Author

> 生成高质量肽类内容页面，在 SEO 技术、E-E-A-T 权威性、生物黑客实用性三个维度全面超越竞品 peptidescalculator.com。

## 前置条件（权限）

本 SKILL 使用 3 个 Subagent 执行脚本和文件操作。启动前必须确保以下权限已授予，否则 Subagent 会因权限拒绝而失败：

- **Bash** — Subagent A/B/C 均需要执行 Node.js 脚本和 shell 命令
- **Write** — Subagent A/B 需要将脚本写入 `/tmp/` 目录
- **Read** — Subagent C 需要读取生成的 `.mdx` 文件进行质检

> 如果使用 Claude Code CLI，在启动 SKILL 前运行时选择 "Allow all tools for this session" 或在权限弹窗中对 Bash/Write 选择 "Always allow"。
> 如果权限无法预授予，则将脚本执行部分回退到主上下文执行（Subagent 仅返回分析文本）。

## 触发条件

当需要创建或升级 `src/content/peptides/` 下的肽类内容页面时使用此 SKILL。

## 执行流程总览

```
┌─────────────────────────────────────────────────────────┐
│  用户输入：肽名称（+ 可选论文列表）                        │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
  ┌──────────────────┐   ┌──────────────────┐
  │ Subagent A:      │   │ Subagent B:      │
  │ 竞品页面抓取      │   │ PubMed 论文搜索   │
  │ (Playwright)     │   │ (E-utilities +   │
  │                  │   │  Semantic Scholar)│
  └────────┬─────────┘   └────────┬─────────┘
           │  ← 并行执行 →         │
           ▼                       ▼
  ┌──────────────────────────────────────────┐
  │ 主上下文：汇总结果                         │
  │ - 竞品分析摘要                             │
  │ - 论文筛选分组 → 用户确认                   │
  └──────────────────────┬───────────────────┘
                         ▼
  ┌──────────────────────────────────────────┐
  │ 主上下文：内容撰写                         │
  │ - 按 8 章节结构生成 .mdx                   │
  │ - 写入文件                                │
  └──────────────────────┬───────────────────┘
                         ▼
  ┌──────────────────────────────────────────┐
  │ Subagent C：独立质检                       │
  │ - 阶段一：自动化脚本检查                    │
  │ - 阶段二：结构审查（独立上下文）             │
  │ - 阶段三：构建验证                         │
  │ - 返回质检报告                             │
  └──────────────────────┬───────────────────┘
                         ▼
  ┌──────────────────────────────────────────┐
  │ 主上下文：处理质检结果                      │
  │ - PASS → 完成                             │
  │ - FAIL → 修复 → 重新启动 Subagent C       │
  └──────────────────────────────────────────┘
```

### Subagent 分工

| Subagent | 职责 | 启动时机 | 并行 |
|----------|------|---------|------|
| A: 竞品抓取 | Playwright 无头浏览器抓取竞品 SPA 页面，返回结构化分析 | SKILL 启动时 | A 与 B 并行 |
| B: 论文搜索 | PubMed 搜索 + Semantic Scholar 引用次数，返回论文 JSON | SKILL 启动时 | A 与 B 并行 |
| C: 质检审查 | 三阶段独立质检，返回 PASS/FAIL 报告 | 内容写入文件后 | 单独执行 |

### 主上下文保留的职责（不使用 subagent）

- **论文筛选与用户确认** — 需要与用户交互
- **内容撰写** — 核心创作任务，需要完整上下文（论文+竞品+模板）
- **质检结果处理与修复** — 需要编辑文件并决策

## 输入要求

### 用户可选提供的材料

以下材料如果用户提供则优先使用，未提供则自动获取：

1. **PubMed 论文列表** — 至少 3-5 篇与该肽相关的核心论文，格式：
   - 作者, 期刊, 年份, PMID 或 DOI
   - 如果用户未提供，自动通过 NCBI E-utilities 搜索（见下方「自动获取：PubMed 论文搜索」）
   - 自动搜索结果需提示用户确认后再使用

### 自动获取：PubMed 论文搜索（Subagent B）

如果用户未提供论文列表，由 Subagent B 自动搜索。

> **重要：自动搜索的论文仍需人工审核。** 自动获取后应提示用户确认论文选择。如果用户主动提供了论文列表，以用户提供的为准，可用自动搜索结果作为补充。

**Subagent B 调用方式：**

```
Agent({
  description: "PubMed paper search",
  prompt: `你是论文搜索助手。为肽类 "{肽名}" 搜索 PubMed 论文并补充 Semantic Scholar 引用次数。

## 代理配置

所有 API 请求通过代理池轮询发送，代理清单位于 ../TrendRadar/.env 的 WEIBO_STATIC_PROXY 变量中（20 个代理，逗号分隔）。

## 执行步骤

1. 使用 Bash 工具将下方脚本写入 /tmp/peptide-research-fetcher.js
2. 执行：node /tmp/peptide-research-fetcher.js "{肽名}"
3. 读取 stdout 的 JSON 输出
4. 按摘要内容将论文分类到研究方向（组织修复、GI 保护、作用机制、安全性、综述等）
5. 每个方向选 1-2 篇（优先高引用 + 近年）
6. 返回分类后的论文列表

## 脚本内容

使用以下 Bash 命令写入脚本：

```bash
cat > /tmp/peptide-research-fetcher.js << 'EOF'
/**
 * peptide-research-fetcher.js
 * 
 * 用法：node peptide-research-fetcher.js "BPC-157"
 * 
 * 功能：
 * 1. PubMed E-utilities 搜索论文 PMID
 * 2. PubMed E-utilities 获取论文详情（标题、作者、期刊、年份、摘要）
 * 3. Semantic Scholar API 补充引用次数
 * 4. 所有 HTTPS 请求通过 HTTP 代理 CONNECT 隧道转发
 * 5. 输出结构化 JSON 供 SKILL 后续流程使用
 * 
 * 依赖：仅 Node.js 内置模块（http, https），无需 npm install
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');

// ── 代理池 ──────────────────────────────────────────────────
let proxies = [];
let proxyIndex = 0;

function loadProxies() {
  const env = fs.readFileSync('/Users/vertusd/GitHub/TrendRadar/.env', 'utf-8');
  const match = env.match(/WEIBO_STATIC_PROXY=(.+)/);
  if (!match) throw new Error('WEIBO_STATIC_PROXY not found');
  return match[1].split(',').map(p => {
    const url = new URL(p.trim());
    return { host: url.hostname, port: parseInt(url.port),
      auth: url.username && url.password ? `${url.username}:${url.password}` : undefined };
  });
}

function nextProxy() { return proxies[proxyIndex++ % proxies.length]; }

// ── HTTPS via HTTP 代理 CONNECT 隧道 ────────────────────────
function fetchViaProxy(targetUrl, { maxRetries = 3, timeout = 20000 } = {}) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    function attempt() {
      attempts++;
      const proxy = nextProxy();
      const target = new URL(targetUrl);

      const connectOpts = {
        host: proxy.host,
        port: proxy.port,
        method: 'CONNECT',
        path: `${target.hostname}:443`,
        timeout,
      };
      if (proxy.auth) {
        connectOpts.headers = {
          'Proxy-Authorization': 'Basic ' + Buffer.from(proxy.auth).toString('base64')
        };
      }

      const connectReq = http.request(connectOpts);
      connectReq.on('connect', (res, socket) => {
        if (res.statusCode !== 200) {
          socket.destroy();
          if (attempts < maxRetries) return attempt();
          return reject(new Error(`CONNECT failed: ${res.statusCode}`));
        }
        const tlsReq = https.request({
          hostname: target.hostname,
          path: target.pathname + target.search,
          method: 'GET',
          headers: { 'User-Agent': 'mcgcalc-research/1.0' },
          socket: socket,
          agent: false,
          timeout,
        }, (tlsRes) => {
          let data = '';
          tlsRes.on('data', chunk => data += chunk);
          tlsRes.on('end', () => {
            if (tlsRes.statusCode === 429 && attempts < maxRetries) {
              setTimeout(attempt, 2000 * attempts);
            } else if (tlsRes.statusCode >= 200 && tlsRes.statusCode < 300) {
              resolve(data);
            } else {
              if (attempts < maxRetries) return attempt();
              reject(new Error(`HTTP ${tlsRes.statusCode}: ${data.slice(0, 200)}`));
            }
          });
        });
        tlsReq.on('timeout', () => { tlsReq.destroy(); if (attempts < maxRetries) attempt(); else reject(new Error('Timeout')); });
        tlsReq.on('error', (err) => { if (attempts < maxRetries) attempt(); else reject(err); });
        tlsReq.end();
      });
      connectReq.on('timeout', () => { connectReq.destroy(); if (attempts < maxRetries) attempt(); else reject(new Error('Connect timeout')); });
      connectReq.on('error', (err) => { if (attempts < maxRetries) attempt(); else reject(err); });
      connectReq.end();
    }
    attempt();
  });
}

// ── PubMed 搜索 ────────────────────────────────────────────
async function searchPubMed(peptideName) {
  const term = encodeURIComponent(`${peptideName} peptide`);
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${term}&retmax=10&retmode=json&sort=relevance`;
  const raw = await fetchViaProxy(url);
  const data = JSON.parse(raw);
  const pmids = data.esearchresult?.idlist || [];
  const total = parseInt(data.esearchresult?.count || '0');

  if (pmids.length < 5) {
    const url2 = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(peptideName)}&retmax=10&retmode=json&sort=relevance`;
    const raw2 = await fetchViaProxy(url2);
    for (const id of (JSON.parse(raw2).esearchresult?.idlist || [])) {
      if (!pmids.includes(id)) pmids.push(id);
    }
  }

  const reviewUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${term}+AND+review[pt]&retmax=5&retmode=json&sort=relevance`;
  const reviewRaw = await fetchViaProxy(reviewUrl);
  for (const id of (JSON.parse(reviewRaw).esearchresult?.idlist || [])) {
    if (!pmids.includes(id)) pmids.push(id);
  }
  return { pmids: pmids.slice(0, 15), total };
}

// ── PubMed 论文详情 ─────────────────────────────────────────
async function fetchPubMedDetails(pmids) {
  if (pmids.length === 0) return [];
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml&rettype=abstract`;
  const xml = await fetchViaProxy(url);
  const articles = [];
  for (const block of xml.split('<PubmedArticle>').slice(1)) {
    const get = (tag) => { const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)); return m ? m[1].replace(/<[^>]+>/g, '').trim() : ''; };
    const getAll = (tag) => { const r = []; let m; const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'); while ((m = re.exec(block)) !== null) r.push(m[1].replace(/<[^>]+>/g, '').trim()); return r; };
    const pmid = get('PMID');
    const title = get('ArticleTitle');
    const journal = get('ISOAbbreviation') || get('Title');
    const year = get('Year');
    const abstract = getAll('AbstractText').join(' ').slice(0, 500);
    const ab = block.match(/<AuthorList[\s\S]*?<\/AuthorList>/);
    let firstAuthor = '';
    if (ab) { const ln = ab[0].match(/<LastName>([^<]+)<\/LastName>/); const ini = ab[0].match(/<Initials>([^<]+)<\/Initials>/); if (ln) firstAuthor = ln[1] + (ini ? ' ' + ini[1] : ''); }
    const ac = (block.match(/<Author /g) || []).length;
    const authors = firstAuthor ? (ac > 1 ? `${firstAuthor} et al.` : firstAuthor) : 'Unknown';
    const isReview = block.includes('Review</PublicationType>') || title.toLowerCase().includes('review');
    articles.push({ pmid, title, journal, year, abstract, authors, isReview, pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` });
  }
  return articles;
}

// ── Semantic Scholar 引用次数（通过代理，有限流）──────────────
async function fetchCitationCounts(pmids) {
  const results = {};
  for (const pmid of pmids) {
    try {
      const raw = await fetchViaProxy(`https://api.semanticscholar.org/graph/v1/paper/PMID:${pmid}?fields=citationCount`, { maxRetries: 2, timeout: 10000 });
      results[pmid] = JSON.parse(raw).citationCount || 0;
    } catch { results[pmid] = null; }
    await new Promise(r => setTimeout(r, 1500));
  }
  return results;
}

// ── 主流程 ──────────────────────────────────────────────────
async function main() {
  const peptideName = process.argv[2];
  if (!peptideName) { console.error('Usage: node peptide-research-fetcher.js "BPC-157"'); process.exit(1); }

  console.error(`[1/4] Loading proxies...`);
  proxies = loadProxies();
  console.error(`  Loaded ${proxies.length} proxies`);

  console.error(`[2/4] Searching PubMed for "${peptideName}"...`);
  const { pmids, total } = await searchPubMed(peptideName);
  console.error(`  Found ${total} total results, fetching top ${pmids.length}`);

  console.error(`[3/4] Fetching article details...`);
  const articles = await fetchPubMedDetails(pmids);
  console.error(`  Parsed ${articles.length} articles`);

  console.error(`[4/4] Fetching citation counts (Semantic Scholar)...`);
  const citations = await fetchCitationCounts(pmids);
  const citationsFetched = Object.values(citations).filter(v => v !== null).length;
  console.error(`  Got citations for ${citationsFetched}/${pmids.length} articles`);

  // 合并结果
  for (const article of articles) {
    article.citationCount = citations[article.pmid] ?? null;
  }

  // 按引用次数排序（有引用数据的优先，然后按引用数降序）
  articles.sort((a, b) => {
    if (a.citationCount !== null && b.citationCount !== null)
      return b.citationCount - a.citationCount;
    if (a.citationCount !== null) return -1;
    if (b.citationCount !== null) return 1;
    return parseInt(b.year || '0') - parseInt(a.year || '0');
  });

  // 输出 JSON 到 stdout
  const output = {
    peptide: peptideName,
    searchDate: new Date().toISOString().split('T')[0],
    totalResults: total,
    articles,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
EOF

node /tmp/peptide-research-fetcher.js "{肽名}"
```

## 返回格式

返回结构化结果：
- 总搜索结果数
- 按研究方向分组的推荐论文（每篇含 PMID、标题、作者、期刊、年份、引用次数、PubMed URL）
- 搜索日期
`
})
```

**执行方式（在 SKILL 流程中）：**

```bash
# 从项目根目录执行，输出 JSON 到临时文件
node /tmp/peptide-research-fetcher.js "BPC-157" > /tmp/bpc157-papers.json 2>/tmp/bpc157-papers.log

# 检查执行日志
cat /tmp/bpc157-papers.log

# 读取结果供后续流程使用
cat /tmp/bpc157-papers.json
```

**输出格式示例：**

```json
{
  "peptide": "BPC-157",
  "searchDate": "2026-04-12",
  "totalResults": 168,
  "articles": [
    {
      "pmid": "12345678",
      "title": "BPC-157 accelerates tendon healing in rat model",
      "journal": "J Orthop Res",
      "year": "2003",
      "authors": "Staresinic M et al.",
      "abstract": "Body Protection Compound-157 (BPC-157) was studied...",
      "isReview": false,
      "citationCount": 142,
      "pubmedUrl": "https://pubmed.ncbi.nlm.nih.gov/12345678/"
    }
  ]
}
```

**脚本获取结果后的处理流程（主上下文执行，非 subagent）：**

Subagent B 返回论文 JSON 后，主上下文负责：
1. 读取 JSON 输出
2. 按摘要内容将论文分类到研究方向（组织修复、GI 保护、作用机制、安全性、综述等）
3. 每个方向选 1-2 篇（优先高引用 + 近年）
4. 呈现给用户确认：

```
自动搜索到 {N} 篇 {肽名} 相关论文，建议使用以下 {M} 篇：

组织修复：
- [PMID: 12345678] Staresinic M et al., J Orthop Res, 2003 (142 citations) — "BPC-157 accelerates..."

作用机制：
- [PMID: 34567890] Sikiric P et al., J Physiol Pharmacol, 2016 (89 citations) — "Stable gastric..."

综述：
- [PMID: 41898733] Author et al., Int J Mol Sci, 2026 (3 citations) — "From Regeneration to..."

请确认是否使用这些论文，或提供你自己的论文列表。
```

### 自动填充：审稿人信息

所有肽类页面统一使用团队页面（`src/components/sections/team-section.tsx`）中的科学顾问信息：

```yaml
reviewedBy: "Dr. Sarah Chen, PhD Biochemistry"
```

- 来源：`/about/team` 页面的 Lead Scientific Advisor
- 如果团队信息发生变更，只需修改 `team-section.tsx` 中的 `team` 数组，然后批量更新所有肽类页面的 `reviewedBy` 字段
- 这比竞品的 "Dr. Logan, M.D." 更具体（含专业方向），且与站内 `/about/team` 页面形成 E-E-A-T 内链闭环

### 可自动获取/推导的数据

以下数据可通过 PubChem、UniProt 等公开数据库验证：
- 分子式、分子量、CAS 号、PubChem CID、氨基酸序列、同义词

### 自动获取：竞品页面内容 — Subagent A（仅作参考，严禁复制）

每次创建或升级肽类页面时，由 Subagent A 自动抓取竞品页面，与 Subagent B（论文搜索）并行启动。

> **重要：竞品内容仅用于差距分析，严禁直接复制、改写或翻译竞品文本。**
> - 抓取目的是了解竞品覆盖了哪些主题、用了哪些关键词、内容量级是多少
> - 我们的内容必须基于 PubMed 论文独立撰写，用自己的结构、措辞和视角
> - 如果竞品覆盖了某个研究方向而我们没有，应回到原始论文获取信息，而非参考竞品的描述
> - Google 的 Helpful Content Update 会惩罚与已有页面高度相似的内容，重复内容会直接损害排名
> - 竞品分析的价值在于发现「他们有什么、我们缺什么」，而非「他们怎么写、我们怎么抄」

**Subagent A 调用方式（与 Subagent B 并行启动）：**

```
Agent({
  description: "Competitor page analysis",
  prompt: `你是竞品分析助手。抓取 peptidescalculator.com 上 "{肽名}" 的页面内容并生成结构化分析。

## 竞品内容仅作差距分析参考，严禁复制

## URL 推导规则
- 基础 URL：https://peptidescalculator.com/
- slug 映射：取肽名称，常见映射：
  BPC-157 → bpc157, TB-500 → tb-500, Semaglutide → semaglutide-glp-1-analogue,
  CJC-1295 → cjc1295DAC, Ipamorelin → ipamorelin
- 如果推导的 URL 返回 404 或空内容，先尝试 WebFetch 获取站点地图：
  https://peptidescalculator.com/sitemap.xml

## 抓取方法

使用 Bash 工具将以下脚本写入 /tmp/fetch-competitor.js 并执行：

```bash
cat > /tmp/fetch-competitor.js << 'EOF'
const { chromium } = require('/Users/vertusd/GitHub/mcgcalc/node_modules/playwright');

(async () => {
  const slug = process.argv[2];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://peptidescalculator.com/' + slug, {
    waitUntil: 'networkidle', timeout: 30000
  });
  await page.waitForTimeout(5000);

  const title = await page.title();
  const metas = await page.$$eval('meta', els =>
    els.map(el => ({
      name: el.getAttribute('name') || el.getAttribute('property'),
      content: el.getAttribute('content')
    })).filter(m => m.content)
  );
  const headings = await page.$$eval('h1,h2,h3,h4', els =>
    els.map(el => el.tagName + ': ' + el.textContent.trim())
  );
  const text = await page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('script,style,noscript').forEach(el => el.remove());
    return clone.innerText;
  });
  await browser.close();

  console.log(JSON.stringify({ title, metas, headings, text }, null, 2));
})();
EOF

node /tmp/fetch-competitor.js "{slug}"
```

## 分析要求

抓取成功后，生成竞品分析摘要，包含以下 5 项：

1. **内容覆盖** — 列出竞品的所有 H2 章节主题
2. **关键词** — 提取 meta keywords 完整列表
3. **内容量** — 估算竞品正文字数（去掉导航和侧边栏）
4. **内容缺陷** — 标记竞品的错误、缺失、或薄弱点
5. **剂量信息** — 提取竞品的剂量方案（如有）

如果抓取失败，返回失败原因。
`
})
```

**如果 Subagent A 抓取失败：** 主上下文提醒用户手动提供竞品 URL 或确认该肽在竞品站点上是否存在。

## 输出规范

### 文件格式

使用 `.mdx` 格式（需要导入 Disclaimer 组件），放置于 `src/content/peptides/` 目录。

### Frontmatter 模板

```yaml
---
name: "{肽名称}"
description: "{一句话描述，必须包含'reconstitution calculator'和'dosage'关键词，120-160字符}"
category: "{分类}"
defaultDose: {数字，单位mcg}
defaultVialSize: {数字，单位mg}
molecularWeight: "{数值} g/mol"
molecularFormula: "{分子式}"
casNumber: "{CAS号}"
pubchemCid: "{PubChem CID}"
sequence: "{氨基酸序列}"
synonyms:
  - "{同义词1}"
  - "{同义词2}"
keywords:
  - "{肽名} reconstitution"
  - "{肽名} dosage calculator"
  - "{肽名} how many units"
  - "{肽名} BAC water"
reviewedBy: "Dr. Sarah Chen, PhD Biochemistry"
pubDate: {YYYY-MM-DD}
updatedDate: {YYYY-MM-DD}
---
```

### 内容结构（按顺序）

#### 1. 严格免责声明
```mdx
import { Disclaimer } from '../../components/sections/peptide-disclaimer.tsx';

<Disclaimer type="strict" />
```

#### 2. What Is {肽名}?（200-300 字）

要求：
- 第一句定义：合成/天然 + 氨基酸数量 + 肽类型（如 pentadecapeptide）
- 来源/发现历史（哪个实验室/年代/期刊）
- 区别于同类肽的独特物理化学性质（如 BPC-157 的 pH 稳定性）
- 不做任何疗效声明，仅陈述"被研究用于..."
- 🔗 **站内交叉引用：** 提及同类或相关肽时，必须链接到本站对应页面（如 "similar in structure to [TB-500](/peptides/tb-500)"）

#### 3. Research Context（1000-1800 字）⚠️ 需要论文输入

这是与竞品拉开差距的核心章节。竞品约 2000 字但有复制粘贴错误，本站需要更精准、更有深度、且覆盖面不低于竞品。

> 写作方法论参考 Q1 期刊 narrative review 的 thematic synthesis 结构：
> 不是逐篇罗列论文，而是按研究主题整合多篇文献，呈现共识、矛盾与缺口。

**整体结构：**

```
> 声明块：研究阶段与证据等级

### 3.1 主题概述（50-80 字）
简述该肽的研究全景：总论文数量级、主要研究方向、证据成熟度。

### 3.2 主题一：[核心适应症]（200-300 字）
### 3.3 主题二：[第二适应症/作用机制]（200-300 字）
### 3.4 主题三：[第三研究方向]（150-250 字）
### 3.5 主题四：[第四研究方向]（150-250 字）— ⚠️ 新增
### 3.6 跨研究方法学观察（100-150 字）
### 3.7 研究缺口与局限性（100-200 字）
```

> **主题数量要求：至少 4 个研究子主题（3.2–3.5）。** 竞品通常覆盖 5-6 个方向，本站必须至少匹配其覆盖广度。如果竞品分析显示某个研究方向我们未覆盖，必须回到 PubMed 论文中寻找对应内容补充，而非忽略。常见的额外方向包括：抗氧化性、药物副作用保护、神经保护、心血管保护、口服生物利用度等。

**声明块（必须）：**

```markdown
> **Evidence Level:** The following summarizes findings from peer-reviewed
> preclinical studies (animal models and _in vitro_ experiments). No
> large-scale human clinical trials have been completed to date. Findings
> should not be interpreted as clinical recommendations.
```

**每个主题子章节的写作规范（借鉴 narrative review thematic synthesis）：**

1. **主题句** — 一句话概括该方向的研究共识或核心发现
2. **关键研究整合** — 不逐篇描述，而是将 2-3 篇研究的发现整合叙述：
   - 具体实验模型（如 "rat Achilles tendon transection model"）
   - 关键发现的量化描述（如 "accelerated healing by X% compared to control"）
   - 研究间的一致性或矛盾（如 "consistent with earlier findings by X" 或 "in contrast to Y who reported..."）
3. **机制解释** — 提出的分子/细胞机制（如 "via upregulation of VEGFR2"）
4. **文献引用** — 带 PubMed 超链接：`[Author et al., Year](https://pubmed.ncbi.nlm.nih.gov/{PMID}/)`

**跨研究方法学观察（3.5 节，借鉴 narrative review "Methodological observations"）：**

简要评论纳入研究的共通特征与局限：
- 研究设计类型分布（多数为小样本动物实验 vs 少数体外研究）
- 常用实验模型与物种
- 剂量范围与给药途径的一致性或差异
- 测量指标与评估方法

**研究缺口与局限性（3.6 节，借鉴 narrative review "Research gaps and future directions"）：**

系统呈现而非一句带过：
- **证据等级缺口** — 缺乏 RCT / 人体临床数据
- **方法学缺口** — 样本量小、缺乏长期随访、剂量-反应关系不明确
- **转化缺口** — 动物剂量到人体剂量的换算缺乏验证
- **安全性缺口** — 长期毒理学数据不足
- 如有正在进行的临床试验（ClinicalTrials.gov），可提及

**子主题选择优先级（根据该肽的研究重点调整，至少选 4 个）：**
- 核心适应症研究（如 BPC-157 的肌腱/GI 保护）
- 作用机制（信号通路、受体靶点）
- 血管生成/心血管保护（如适用）
- 抗氧化/细胞保护特性（如适用）
- 药物副作用保护/药物相互作用（如适用）
- 协同研究（与其他肽的组合，如 BPC-157 + TB-500）— 🔗 **必须链接到本站对应肽页面**
- 安全性/毒理学数据
- 新兴研究方向（如神经保护、泌尿系统、蜜蜂 CCD 等非典型应用）

> **覆盖率规则：** 撰写前先对照竞品 H2 主题列表，确保竞品覆盖的每个研究方向在本站至少有对应段落。如果竞品有某方向而 PubMed 论文中也有对应数据，必须纳入。

#### 4. Reconstitution Mathematics（200-300 字）

要求：
- 展示通用公式（浓度、剂量体积、注射器单位）
- 提供 3 行常见配比表（不同 vial size × BAC water 组合）
- 引导用户使用页面上的交互式计算器

```markdown
| Vial Size | BAC Water | Concentration | {默认剂量} dose |
|-----------|-----------|---------------|-----------------|
| {小} mg   | 2 mL      | X mg/mL       | **Y IU**        |
| {中} mg   | {中} mL   | X mg/mL       | **Y IU**        |
| {大} mg   | 2 mL      | X mg/mL       | **Y IU**        |
```

#### 5. Common Research Protocols（300-500 字）⚠️ 需要论文输入

这是竞品有而本站缺失的关键章节，生物黑客最关注的内容。

要求：
- 标注 "Based on published preclinical literature"
- **两张表格**：
  1. **剂量分层表** — 按 low/standard/high/oral 分层，标注剂量范围、频率、持续时间、给药途径、实验物种
  2. **渐进式研究设计表** — 按周/阶段递增剂量，模拟竞品的渐进方案但基于文献数据而非编造。格式：

```markdown
> The following graduated design reflects dosing escalation patterns observed across
> multiple published rodent studies. It is not a clinical protocol.

| Phase | Duration | Dose | Frequency | Route |
|-------|----------|------|-----------|-------|
| Acclimation | Week 1–2 | {低剂量} µg/kg | Once daily | SC |
| Standard | Week 3–6 | {中剂量} µg/kg | Once daily | SC |
| Extended | Week 7–12 | {高剂量} µg/kg | Once daily | SC |
```

- 渐进表下方加注：剂量数值来源于文献中报告的范围，非固定方案
- 注明给药途径（SC/IP/oral）和实验物种
- 不使用 "protocol" 或 "cycle" 等暗示人体使用的词汇
- 使用 "research dosing parameters" 或 "published study designs"
- 如果该肽有口服生物利用度数据，单独列一行 oral route

#### 6. Stability & Storage（150-250 字）

要求：
- 三态存储表（冻干粉 / 重构后冷藏 / 重构后室温）
- BAC water 说明（为什么用苯甲醇防腐）
- 标准重构步骤（6 步，含 45° 角注射、沿壁注入等细节）

#### 7. FAQ（4-6 个问题）

要求：
- 每个 Q&A 50-100 字
- 必须包含的问题类型：
  - "How many units do I draw for {默认剂量} of {肽名}?" — 含具体数字答案
  - 与相关肽的区别或组合问题 — 🔗 **链接到对应肽页面和 [多肽计算器](/peptide-calculator)**
  - 盐型/变体区别（如适用）
  - 存储/稳定性实操问题
- 问题措辞使用用户真实搜索语言（长尾关键词）

#### 8. 简短免责声明
```mdx
<Disclaimer type="brief" />
```

## 质量检查流程

内容撰写完成并写入 `.mdx` 文件后，必须启动独立质检流程。

> **关键：质检必须在独立上下文中执行。** 撰写者和质检者不能是同一个上下文，避免"自己检查自己"的盲区。使用 Agent 工具启动专门的质检 subagent，传入文件路径和竞品分析摘要。

### 质检 subagent 调用方式

```
Agent({
  description: "Peptide page QA review",
  prompt: `你是肽类内容页面的独立质检审查员。请对以下文件执行三阶段质检。

文件路径：src/content/peptides/{slug}.mdx
肽名称：{肽名}
竞品分析摘要：{竞品 H2 主题列表、关键词、字数}

## 你的职责

你是独立审查员，不是内容撰写者。你的目标是找出问题，而非确认内容正确。
对每个检查项，给出 ✅ PASS 或 ❌ FAIL + 具体问题描述。

## 阶段一：自动化检查

执行以下 bash 脚本并报告结果：
[阶段一脚本]

## 阶段二：结构审查

逐项检查以下内容（需要读取文件）：
[阶段二清单]

## 阶段三：构建验证

执行 npx astro build 并报告结果。

## 输出格式

最终输出质检报告：
- 总评：PASS / FAIL
- 各阶段结果汇总
- 如果 FAIL：列出所有需要修复的问题，按严重程度排序（Critical > High > Medium）
`
})
```

### 阶段一：自动化检查（脚本执行）

质检 subagent 执行以下脚本：

```bash
FILE="src/content/peptides/{slug}.mdx"

# 1. Frontmatter 完整性检查
echo "=== Frontmatter Check ==="
for field in name description category defaultDose defaultVialSize molecularWeight molecularFormula casNumber pubchemCid sequence reviewedBy pubDate; do
  grep -q "^${field}:" "$FILE" && echo "✅ $field" || echo "❌ MISSING: $field"
done

# 2. description 长度检查（120-160 字符）
DESC=$(grep "^description:" "$FILE" | sed 's/^description: //' | tr -d '"')
LEN=${#DESC}
if [ "$LEN" -ge 120 ] && [ "$LEN" -le 160 ]; then
  echo "✅ description length: $LEN chars"
else
  echo "❌ description length: $LEN chars (should be 120-160)"
fi

# 3. 关键词检查
grep -qi "reconstitution calculator" "$FILE" && echo "✅ 'reconstitution calculator' in description" || echo "❌ MISSING: 'reconstitution calculator' in description"

# 4. Disclaimer 组件检查
DISC_COUNT=$(grep -c 'Disclaimer' "$FILE")
[ "$DISC_COUNT" -ge 2 ] && echo "✅ Disclaimer components: $DISC_COUNT" || echo "❌ Disclaimer components: $DISC_COUNT (need 2)"

# 5. PubMed 链接检查（至少 3 个）
PUBMED_COUNT=$(grep -co "pubmed.ncbi.nlm.nih.gov" "$FILE")
[ "$PUBMED_COUNT" -ge 3 ] && echo "✅ PubMed links: $PUBMED_COUNT" || echo "❌ PubMed links: $PUBMED_COUNT (need ≥3)"

# 6. 正文字数估算
WORD_COUNT=$(sed -n '/^---$/,/^---$/!p' "$FILE" | grep -v '^\`\`\`' | wc -w | tr -d ' ')
echo "📊 Estimated word count: $WORD_COUNT (target: 2000-2800)"

# 7. PubMed 链接可达性验证（抽查前 3 个）
echo "=== PubMed Link Validation ==="
grep -oP 'https://pubmed\.ncbi\.nlm\.nih\.gov/\d+/' "$FILE" | head -3 | while read url; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  [ "$STATUS" = "200" ] && echo "✅ $url" || echo "❌ $url (HTTP $STATUS)"
done

# 8. 疗效声明词扫描
echo "=== Compliance Word Scan ==="
for word in "treat" "cure" "heal" "therapy" "therapeutic" "clinical benefit" "patients"; do
  COUNT=$(grep -ci "$word" "$FILE")
  [ "$COUNT" -gt 0 ] && echo "⚠️ Found '$word' x$COUNT — review context" || true
done

# 9. 站内交叉引用检查（至少 2 处）
echo "=== Internal Cross-Reference Check ==="
INTERNAL_LINKS=$(grep -coP '\(/peptides/|\(/peptide-calculator' "$FILE")
[ "$INTERNAL_LINKS" -ge 2 ] && echo "✅ Internal links: $INTERNAL_LINKS" || echo "❌ Internal links: $INTERNAL_LINKS (need ≥2)"

# 10. Research Context 子主题数量检查（至少 4 个 ###）
echo "=== Research Subtopic Check ==="
SUBTOPIC_COUNT=$(grep -c '^###' "$FILE")
[ "$SUBTOPIC_COUNT" -ge 6 ] && echo "✅ Research subtopics: $SUBTOPIC_COUNT (includes overview + 4 themes + methodology + gaps)" || echo "❌ Research subtopics: $SUBTOPIC_COUNT (need ≥6: overview + 4 themes + methodology + gaps)"

# 11. 渐进式剂量表检查
echo "=== Progressive Dosing Table Check ==="
grep -qi "acclimation\|graduated\|escalation\|phase.*week" "$FILE" && echo "✅ Progressive dosing table found" || echo "❌ MISSING: Progressive dosing table"
```

### 阶段二：结构审查（独立上下文逐项检查）

质检 subagent 读取完整文件内容后，逐项检查：

**Frontmatter & SEO：**
- [ ] 所有可选字段均已填写
- [ ] description 长度 120-160 字符，含 "reconstitution calculator"
- [ ] keywords 覆盖竞品 meta keywords 中的核心词

**Research Context 结构（Q1 narrative review 标准）：**
- [ ] ≥ 1000 字，按主题式统整（thematic synthesis）组织，非逐篇罗列
- [ ] 至少 4 个研究子主题（3.2–3.5），覆盖面不低于竞品
- [ ] **主题覆盖率检查：** 将竞品 H2 主题列表与本站子主题逐一比对，标记竞品有而本站缺失的方向。如有缺失且 PubMed 论文中有对应内容，标记为 High 级别问题
- [ ] 每个子主题有主题句 + 多篇研究整合叙述 + 机制解释
- [ ] 研究间的一致性或矛盾有明确标注
- [ ] 包含跨研究方法学观察（3.6 节）
- [ ] 包含研究缺口与局限性（3.7 节）：证据等级、方法学、转化、安全性
- [ ] 每个子主题有带 PMID 超链接的引用，引用格式统一

**Common Research Protocols：**
- [ ] 包含剂量分层表（low/standard/high/oral）
- [ ] 包含渐进式研究设计表（按阶段递增）
- [ ] 渐进表有文献来源声明，非编造数据
- [ ] 无 "protocol" / "cycle" 等暗示人体使用的词汇

**合规与准确性：**
- [ ] 无任何疗效声明或人体使用建议（结合阶段一的词扫描结果，逐条审查上下文）
- [ ] 无复制粘贴错误（每个段落的主语与该肽一致，无其他肽的内容混入）
- [ ] 内容与竞品无高度相似段落（如有竞品文本，抽取 3 段做相似度比对）
- [ ] 重构数学表格验算：`Concentration = VialSize ÷ BACWater`，`Units = (Dose ÷ Concentration) × 100`

**组件与格式：**
- [ ] 两个 Disclaimer 组件均已放置（strict 在顶部，brief 在底部）
- [ ] FAQ 问题使用自然搜索语言，非学术措辞
- [ ] 所有外部链接使用 PubMed/PubChem 等权威域名
- [ ] 站内交叉引用 ≥ 2 处（Research Context 中的相关肽链接 + FAQ 中的计算器/肽页面链接）

### 阶段三：构建验证

```bash
cd /Users/vertusd/GitHub/mcgcalc
npx astro build 2>&1 | tail -20
# 如果构建失败，检查 MDX 语法错误
# 常见问题：未转义的 < > 符号、JSX 组件导入路径错误
```

### 质检结果处理

质检 subagent 返回报告后，主流程根据结果处理：

- **全部 PASS** — 输出最终确认：
  ```
  ✅ 质检通过 — {肽名} 页面已就绪
  - Frontmatter: 完整 (12/12 字段)
  - PubMed 引用: {N} 篇，链接均可达
  - 正文字数: {N} 字
  - 构建: 成功
  ```

- **有 FAIL 项** — 按严重程度修复：
  - **Critical**（必须修复）：疗效声明、复制粘贴错误、构建失败、PubMed 链接不可达
  - **High**（应该修复）：Research Context 结构缺失、Frontmatter 字段缺失、字数不达标
  - **Medium**（建议修复）：description 长度微调、关键词补充
  - 修复后重新启动质检 subagent 复查

## 内容护城河策略（防抄袭）

核心思路：不靠"埋指纹"，靠「持续领先 + 技术层不可复制」让抄袭者永远落后。

### 第一层：先索引优势

- Astro SSG 生成纯静态 HTML，Google 爬虫首次访问即可完整索引
- 竞品 SPA 需要 JS 渲染，首次索引延迟数天甚至数周
- **操作要求：** 新页面发布后 24 小时内通过 Google Search Console 手动提交索引请求
- Google 重复内容去重时，优先保留首次被索引的版本

### 第二层：持续更新节奏

- 每篇肽类页面至少每季度更新一次 `updatedDate`
- 更新内容：补充新发表的论文、修正数据、扩展 FAQ
- 抄袭者拿到的永远是过期快照，Google 偏好持续维护的内容
- **操作要求：** 每次更新时在 Research Context 中补充最近 6 个月内的新论文（如有）

### 第三层：不可复制的交互层

以下内容无法通过复制文本获得，是最硬的护城河：

- 嵌入式 sticky 计算器（React 组件，需要完整前端工程）
- Chemical Identification 表格（从 frontmatter 自动生成，非手写 HTML）
- PubChem CID 自动外链（模板层处理）
- JSON-LD Article schema（自动生成，抄文字拿不到结构化数据信号）

### 第四层：E-E-A-T 信号网络

单篇文章的权威性来自整站信号的叠加，抄一篇文章无法复制：

- `/about/team` 团队页 ↔ 每篇文章的 `reviewedBy` 内链闭环
- PubMed 论文引用（带 PMID 超链接，可验证）
- 站内交叉引用（见下方写作要求）

### 第五层：站内交叉引用（写作时必须执行）

每篇肽类页面必须包含至少 2 处站内链接，指向本站其他页面：

- Research Context 中提及相关肽时，链接到对应页面（如 "BPC-157 is often studied alongside [TB-500](/peptides/tb-500)"）
- FAQ 中引导到相关计算器或肽页面（如 "Use the [multi-peptide mode](/peptide-calculator) to compute combined volumes"）

**作用：** 抄袭者要么保留指向我们站点的链接（为我们导流），要么手动删除（破坏内容完整性且费时），要么替换为自己的链接（需要有对应页面）。同时增强站内 SEO 权重传递。

### 第六层：DMCA 兜底

如果发现内容被原封不动抄袭：

1. 通过 Google Search Console 的首次索引时间证明原创
2. Git commit 历史作为创作时间线证据
3. 向 Google 提交 DMCA takedown request
4. 这是最后手段，前五层的目标是让抄袭变得没有价值

## 与竞品的差异化策略

| 竞品弱点 | 本站对策 |
|----------|---------|
| SPA 纯 JS 渲染，SEO 爬取困难 | Astro SSG 静态 HTML + JSON-LD schema（已由模板自动处理） |
| BPC-157 页面无嵌入式计算器 | 每个肽页面自带 sticky 计算器（已由 [slug].astro 模板处理） |
| 内容有复制粘贴错误（Adipotide 内容混入 BPC-157） | 质量检查清单强制验证 |
| 无 CAS 号 | Frontmatter 必填 casNumber |
| PubChem CID 无超链接 | 模板自动生成 PubChem 外链（已由 [slug].astro 处理） |
| 无 JSON-LD 结构化数据 | Article schema 自动生成（已由 [slug].astro 处理） |
| 无存储指导 | 每页必含 Stability & Storage 章节 |
| 无 FAQ | 每页 4-6 个 FAQ，覆盖长尾搜索词 |
| 100+ 肽类链接堆砌在侧边栏 | 干净的面包屑导航 + 分类索引 |

## 示例：升级 BPC-157 页面时的提醒

如果用户要求升级 BPC-157 但未提供论文：

> 升级 BPC-157 页面需要以下输入：
>
> **核心论文列表**（建议 5-8 篇），当前页面引用了 Staresinic 2003 和 Sikiric 2018 但缺少 PMID。建议补充：
> - 血管生成相关论文（VEGFR2 通路）
> - 肌腱修复的 FAK-paxillin 机制论文
> - GI 保护的 NSAID 模型论文
> - BPC-157 + TB-500 协同研究（如有）
> - 安全性/毒理学数据
>
> 审稿人将自动填充为 "Dr. Sarah Chen, PhD Biochemistry"（来自 /about/team）。
> 竞品页面将自动通过无头浏览器抓取分析。
>
> 请提供论文列表，或者我可以先基于现有引用扩充内容框架，后续再补充 PMID 链接。
