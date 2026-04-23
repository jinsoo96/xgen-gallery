// Test scraping main org page
const r = await fetch('https://github.com/PlateerLab', {
    headers: { 'User-Agent': 'Mozilla/5.0 xgen-gallery test' },
});
console.log('status', r.status);
const h = await r.text();
console.log('bytes', h.length);
console.log('title:', /<title>([^<]+)<\/title>/.exec(h)?.[1]);

// Find People section markers
const peopleIdx = h.indexOf('People');
console.log('People idx:', peopleIdx);
if (peopleIdx > 0) {
    console.log('--- around People ---');
    console.log(h.slice(peopleIdx, peopleIdx + 2000));
}
