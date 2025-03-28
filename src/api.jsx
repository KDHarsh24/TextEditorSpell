const spellCheckAPI = async (word, api) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/${api}`, {
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
