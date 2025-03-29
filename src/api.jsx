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
