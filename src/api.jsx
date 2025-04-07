const spellCheckAPI = async (word, api, lang) => {
  try {
    const response = await fetch(`https://spell-checkerproject.vercel.app/${lang}/${api}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch spell-check suggestions");
    }

    const data = await response.json();
    return data.suggestions; // Returns the array of suggested words
  } catch (error) {
    console.error("Error fetching spell-check suggestions:", error);
    return [];
  }
};
export default spellCheckAPI;
export const trackUser = () => {
if (!sessionStorage.getItem("tracked")) {
  (async () => {
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipRes.json();
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geo = await geoRes.json();
      const userAgent = navigator.userAgent;

      const payload = {
        ip,
        userAgent,
        geo,
        timestamp: new Date().toISOString(),
      };

      // ✅ Send data to your Flask backend
      await fetch("https://trackdata.onrender.com/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      sessionStorage.setItem("tracked", "true");
      console.log("✅ User tracked:", payload);
    } catch (err) {
      console.error("❌ Failed to track user:", err);
    }
  })();
}
}