const URLS = [
    'https://raw.githubusercontent.com/MollaMert/ai-readme-generator/main/README.md',
    'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://raw.githubusercontent.com/MollaMert/ai-readme-generator/main/README.md'),
    'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent('https://raw.githubusercontent.com/MollaMert/ai-readme-generator/main/README.md')
];

async function test() {
    for (const url of URLS) {
        console.log(`Testing: ${url}`);
        const start = Date.now();
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);
            
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);

            const text = await res.text();
            console.log(`Status: ${res.status}, Length: ${text.length}, Time: ${Date.now() - start}ms`);
            
            if (text.length > 50) {
                console.log(`Success! Content starts with: ${text.substring(0, 50).replace(/\n/g, ' ')}...`);
            } else {
                console.log(`Short content: ${text}`);
            }
        } catch (e) {
            console.log(`Failed: ${e.message}, Time: ${Date.now() - start}ms`);
        }
        console.log('---');
    }
}

test();
