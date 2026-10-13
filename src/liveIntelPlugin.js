/**
 * Vite plugin providing real-time live intelligence feed endpoint (/api/live)
 * for F.R.I.D.A.Y. AI assistant.
 */
export function liveIntelPlugin() {
  const handler = async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const query = (url.searchParams.get('q') || '').trim();

      if (!query) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, liveIntel: null }));
      }

      const qLower = query.toLowerCase();

      // Skip live search on conversational greetings/casual messages to respond instantly
      const commonGreetings = [
        'hi', 'hello', 'hey', 'hey friday', 'good morning', 'good evening',
        'good day', 'how are you', 'who are you', 'test', 'testing', 'sup'
      ];
      if (commonGreetings.some(g => qLower === g || qLower === g + ' friday' || qLower === g + ' boss')) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, liveIntel: null }));
      }

      // 1. Weather Queries
      const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'climate', 'how hot', 'how cold'];
      if (weatherKeywords.some(k => qLower.includes(k))) {
        const cityMatch = query.match(/(?:weather|temperature|forecast|rain)\s+(?:in|for|at|of)?\s+([a-zA-Z\s]+)/i)
          || query.match(/([a-zA-Z\s]+)\s+(?:weather|forecast)/i);
        const city = cityMatch && cityMatch[1].trim() ? cityMatch[1].trim() : 'Mumbai';

        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
            { signal: AbortSignal.timeout(2000) }
          );
          const geo = await geoRes.json();

          if (geo.results && geo.results.length > 0) {
            const { latitude, longitude, name, country } = geo.results[0];
            const wRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`,
              { signal: AbortSignal.timeout(2000) }
            );
            const w = await wRes.json();

            const weatherMap = {
              0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
              45: 'Foggy', 48: 'Depositing rime fog', 51: 'Light drizzle',
              61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
              71: 'Slight snow', 80: 'Rain showers', 95: 'Thunderstorm'
            };
            const condition = weatherMap[w.current?.weather_code] || 'Fair';

            const weatherIntel = `LIVE WEATHER TELEMETRY [${name}, ${country}]:\n- Temperature: ${w.current?.temperature_2m}°C (Feels like: ${w.current?.apparent_temperature}°C)\n- Conditions: ${condition}\n- Relative Humidity: ${w.current?.relative_humidity_2m}%\n- Wind Speed: ${w.current?.wind_speed_10m} km/h\n- Timestamp: ${w.current?.time}`;

            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, liveIntel: weatherIntel, source: 'weather' }));
          }
        } catch (err) {
          console.warn('Weather fetch timeout/error:', err.message);
        }
      }

      // 2. Real-Time News & Live Events (Google News RSS)
      const newsKeywords = [
        'news', 'today', 'latest', 'cricket', 'match', 'score', 'who won',
        'happening', 'briefing', 'headlines', 'update', 'this week', 'yesterday',
        'now', 'election', 'stock', 'game', 'tournament', 'market', 'announce'
      ];

      const isLiveQuery = newsKeywords.some(k => qLower.includes(k));

      if (isLiveQuery) {
        try {
          let rssUrl;
          const isGeneric = ['happening in the world', 'world news', 'morning briefing', 'top stories', 'what is happening', "what's happening"].some(g => qLower.includes(g));

          if (isGeneric) {
            rssUrl = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';
          } else {
            const cleanQuery = query
              .replace(/^(what is|who is|tell me|give me|can you tell me|what are)\s+/i, '')
              .replace(/[?.,!]/g, '')
              .trim();
            rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=en-US&gl=US&ceid=US:en`;
          }

          const rssRes = await fetch(rssUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: AbortSignal.timeout(2500)
          });
          const xml = await rssRes.text();

          const items = [];
          const regex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g;
          let match;
          while ((match = regex.exec(xml)) !== null && items.length < 5) {
            const rawTitle = match[1]
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
            const pubDate = match[2];
            items.push(`- ${rawTitle} [Published: ${pubDate}]`);
          }

          if (items.length > 0) {
            const newsIntel = `LIVE SATELLITE & NEWS FEED [As of ${new Date().toUTCString()}]:\n` + items.join('\n');
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, liveIntel: newsIntel, source: 'news' }));
          }
        } catch (err) {
          console.warn('News RSS fetch timeout/error:', err.message);
        }
      }

      // No live feeds needed for standard knowledge
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, liveIntel: null }));

    } catch (globalErr) {
      console.error('Live Intel Handler Error:', globalErr);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: globalErr.message }));
    }
  };

  return {
    name: 'friday-live-intel',
    configureServer(server) {
      server.middlewares.use('/api/live', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/live', handler);
    }
  };
}
