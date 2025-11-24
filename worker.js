export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const cityId = url.pathname.replace("/", "").trim();

      if (!cityId) {
        return new Response(JSON.stringify({ error: "City ID missing" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Diyanet JSON URL
      const targetUrl = `http://namazvakitleri.diyanet.gov.tr/tr-TR/${cityId}?output=json`;

      // Cloudflare Cache
      const cache = caches.default;
      const cacheKey = new Request(targetUrl);

      let cached = await cache.match(cacheKey);
      if (cached) {
        return cached;
      }

      // Diyanet’ten veri çek
      const response = await fetch(targetUrl);

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Diyanet error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const data = await response.text();

      // Cache kaydı 10 dakika
      const output = new Response(data, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=600",
        },
      });

      await cache.put(cacheKey, output.clone());

      return output;
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
