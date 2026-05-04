#!/usr/bin/env node
// publish.mjs — Auto-publish articles from generator JSON to Astro pages
// Usage: node publish.mjs article.json
// Or pipe: echo '{"seo":{...},"article":{...}}' | node publish.mjs --lang es

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const AFFILIATE_TAG_EN = 'ringadvice-20';
const AFFILIATE_TAG_ES = 'ringadvice-es21';

function buildAstroPage(data, lang) {
  const { seo, article } = data;
  const isES = lang === 'es';

  const amazonUrl = (asin) =>
    isES
      ? `https://www.amazon.es/dp/${asin}?tag=${AFFILIATE_TAG_ES}`
      : `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG_EN}`;

  const today = new Date().toISOString().split('T')[0];

  // Build sections HTML
  let sectionsHtml = '';

  for (const section of article.sections || []) {
    sectionsHtml += `\n<h2>${section.heading}</h2>\n`;

    if (section.intro) sectionsHtml += `<p>${section.intro}</p>\n`;

    if (section.type === 'comparison_table' && section.table) {
      const t = section.table;
      sectionsHtml += `<div class="table-wrap"><table class="comparison-table">\n`;
      sectionsHtml += `<thead><tr>${t.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>\n`;
      sectionsHtml += `<tbody>`;
      for (const row of t.rows) {
        const isWinner = t.winner && row[0]?.toLowerCase().includes(t.winner.toLowerCase().split(' ')[0]);
        sectionsHtml += `<tr${isWinner ? ' class="winner"' : ''}>${row.map(c => `<td>${c}</td>`).join('')}</tr>\n`;
      }
      sectionsHtml += `</tbody></table></div>\n`;
    }

    if (section.content) {
      const paragraphs = section.content.split('\n\n').filter(Boolean);
      sectionsHtml += paragraphs.map(p => `<p>${p.replace(/\n/g, ' ')}</p>`).join('\n') + '\n';
    }

    if (section.pros && section.cons) {
      sectionsHtml += `<div class="pros-cons">
  <div class="pros-box">
    <span class="pros-box__label">${isES ? '✓ VENTAJAS' : '✓ PROS'}</span>
    <ul>${section.pros.map(p => `<li>${p}</li>`).join('')}</ul>
  </div>
  <div class="cons-box">
    <span class="cons-box__label">${isES ? '✗ DESVENTAJAS' : '✗ CONS'}</span>
    <ul>${section.cons.map(c => `<li>${c}</li>`).join('')}</ul>
  </div>
</div>\n`;
    }

    if (section.cta) {
      sectionsHtml += `<p><a href="#buy" class="cta-btn">${section.cta}</a></p>\n`;
    }

    if (section.items) {
      for (const item of section.items) {
        sectionsHtml += `<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <p class="faq-item__q" itemprop="name">${item.q}</p>
  <div class="faq-item__a" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <p itemprop="text">${item.a}</p>
  </div>
</div>\n`;
      }
    }
  }

  // FAQ Schema for the whole article (if has FAQ section)
  const faqSection = article.sections?.find(s => s.type === 'faq');
  const faqSchema = faqSection ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqSection.items?.map(i => ({
      "@type": "Question",
      "name": i.q,
      "acceptedAnswer": { "@type": "Answer", "text": i.a }
    }))
  }) : null;

  return `---
import ArticleLayout from '${isES ? '../../../' : '../../'}layouts/ArticleLayout.astro';

const meta = {
  title: "${seo.title.replace(/"/g, '\\"')}",
  description: "${seo.metaDescription.replace(/"/g, '\\"')}",
  lang: "${lang}",
  publishDate: "${today}",
  readingTime: "${seo.readingTime}",
  focusKeyword: "${seo.focusKeyword}",
  affiliate: true,
};
---

<ArticleLayout {...meta}>
${faqSchema ? `<script type="application/ld+json">${faqSchema}</script>` : ''}

<div class="verdict-box">
  <span class="verdict-box__label">${isES ? '⚡ CONCLUSIÓN RÁPIDA' : '⚡ QUICK VERDICT'}</span>
  <p>${article.quickVerdict || ''}</p>
</div>

<p>${article.intro || ''}</p>

${sectionsHtml}

<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-top:32px;">
  <p style="font-size:15px;color:rgba(255,255,255,0.8);margin-bottom:16px;">${article.verdict || ''}</p>
  <a href="#buy" class="cta-btn">${article.finalCta || (isES ? 'Ver precio en Amazon →' : 'Check price on Amazon →')}</a>
</div>

</ArticleLayout>
`;
}

// Main
const args = process.argv.slice(2);
const langFlag = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'es';
const inputFile = args.find(a => a.endsWith('.json'));

let data;
if (inputFile) {
  data = JSON.parse(readFileSync(inputFile, 'utf-8'));
} else {
  const stdin = readFileSync('/dev/stdin', 'utf-8');
  data = JSON.parse(stdin);
}

const lang = data.seo?.targetMarkets?.includes('España') ? 'es' : langFlag;
const isES = lang === 'es';
const slug = data.seo?.slug || 'article';

const dir = isES
  ? join('src', 'pages', 'es', 'analisis')
  : join('src', 'pages', 'reviews');

mkdirSync(dir, { recursive: true });
const outPath = join(dir, `${slug}.astro`);
writeFileSync(outPath, buildAstroPage(data, lang), 'utf-8');

console.log(`✅ Published: ${outPath}`);
console.log(`🔗 URL: ${isES ? '/es/analisis/' : '/reviews/'}${slug}`);
console.log(`📝 Title: ${data.seo?.title}`);
