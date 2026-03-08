const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://fourlinq.com/wp-json/wp/v2/media?per_page=100';
const DOWNLOAD_DIR = path.join(__dirname, 'public', 'images', 'wp-export');

// Create directory if it doesn't exist
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to fetch data: ${res.statusCode} - ${res.statusMessage}`));
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
}

async function startScrape() {
  console.log('🚀 Starting FourlinQ Media Extraction...');
  try {
    let currentPage = 1;
    let totalDownloaded = 0;
    let hasMore = true;

    while (hasMore) {
      const pageUrl = `${API_URL}&page=${currentPage}`;
      console.log(`\nFetching Page ${currentPage}...`);
      
      try {
        const mediaItems = await fetchJSON(pageUrl);
        
        if (!mediaItems || mediaItems.length === 0) {
          hasMore = false;
          console.log('No more items found. Finished pagination.');
          break;
        }

        console.log(`Found ${mediaItems.length} media items on page ${currentPage}.`);

        for (const item of mediaItems) {
          if (item.media_type === 'image') {
            const sourceUrl = item.source_url;
            const filename = path.basename(sourceUrl);
            const filepath = path.join(DOWNLOAD_DIR, filename);

            // Skip if already downloaded
            if (!fs.existsSync(filepath)) {
              console.log(`Downloading: ${filename}`);
              try {
                await downloadImage(sourceUrl, filepath);
                totalDownloaded++;
              } catch (err) {
                console.error(`Failed to download ${filename}:`, err.message);
              }
            } else {
              console.log(`Skipping (already exists): ${filename}`);
            }
          }
        }
        currentPage++;
      } catch (err) {
        // If we hit a 400 error (Invalid page number), it means we've reached the end
        if (err.message.includes('400')) {
          console.log('Reached the end of the pagination.');
          hasMore = false;
        } else {
          console.error(`Error fetching page ${currentPage}:`, err);
          hasMore = false;
        }
      }
    }
    
    console.log(`\n✅ Successfully downloaded ${totalDownloaded} new images to /public/images/wp-export/`);
  } catch (error) {
    console.error('Extraction failed:', error);
  }
}

startScrape();
