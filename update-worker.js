const fs = require('fs');
const p = 'apps/worker/src/jobs/ingestion.ts';
let c = fs.readFileSync(p, 'utf8');
const searchStr = '} else if (source.type === "text") {';
const replacement = `} else if (source.type === "sitemap") {
      const response = await fetch(config.url);
      if (!response.ok) throw new Error(\`Failed to fetch sitemap: \${response.statusText}\`);
      const xml = await response.text();
      const $ = cheerio.load(xml, { xmlMode: true });
      const urls = [];
      $('url loc').each((i, el) => {
        urls.push($(el).text());
      });
      // limit to first 10 for safety
      const limitedUrls = urls.slice(0, 10);
      let combinedText = '';
      for (const u of limitedUrls) {
        try {
          const pageRes = await fetch(u);
          if (pageRes.ok) {
            const html = await pageRes.text();
            const page$ = cheerio.load(html);
            page$('script, style').remove();
            combinedText += page$('body').text().replace(/\\s+/g, ' ').trim() + '\\n\\n';
          }
        } catch(e) { console.warn('Failed to crawl', u); }
      }
      textContent = combinedText;
    } else if (source.type === "text") {`;
c = c.replace(searchStr, replacement);
fs.writeFileSync(p, c);
