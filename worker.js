export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const cityId = url.searchParams.get("cityId") || "9269";

      const diyanetUrl = `https://namazvakitleri.diyanet.gov.tr/tr-TR/${cityId}/ayvalik-namaz-vakitleri`;
      
      const html = await fetch(diyanetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }).then(r => r.text());

      // REGEX İLE ÇEKİYORUZ
      function extract(name) {
        const regex = new RegExp(`var _${name}Time = "([0-9:]+)"`);
        const match = html.match(regex);
        return match ? match[1] : null;
      }

      const data = {
        imsak: extract("imsak"),
        gunes: extract("gunes"),
        ogle: extract("ogle"),
        ikindi: extract("ikindi"),
        aksam: extract("aksam"),
        yatsi: extract("yatsi")
      };

      // Eksik varsa hata ver
      if (!data.imsak || !data.yatsi) {
        return new Response(JSON.stringify({ error: "Parse failed", data }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        cityId,
        success: true,
        times: data
      }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=1800" // 30 dk cache
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.toString() }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
