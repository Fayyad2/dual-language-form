// Gemini API utility for getting AI suggestions
// Insert your Gemini API key below where indicated

export async function getGeminiSuggestions({ prompt, history }) {
  const API_KEY = "AIzaSyDbOjolH6_vJLh6h5dpT3zgtoV0PiZxgew"; 
  // Use the latest free Gemini model endpoint (as of 2025)
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  // Compose a prompt for Gemini
  const messages = [
    {
      role: "user",
      parts: [
        {
          text: `You are an assistant for suggesting Arabic payment order purposes.
                Here are some previous purposes: ${history.join("; ")}.
                Given the user's current input: '${prompt}', suggest up to 5 relevant, medium to semi-long (at least 20 characters), and common Arabic purposes. 
                You may suggest from the history, but you can also generate new, creative completions or expansions of the user's input, even if not seen before. 
                Return only a JSON array of suggestions.`
        }
      ]
    }
  ];

  // Debug: log the prompt
  console.log("[Gemini] Prompt sent:", messages[0].parts[0].text);

  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY
      },
      body: JSON.stringify({ contents: messages })
    });
  } catch (err) {
    console.error("[Gemini] Fetch error:", err);
    return [];
  }

  if (!res.ok) {
    console.error("[Gemini] Response not OK:", res.status, res.statusText);
    return [];
  }
  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error("[Gemini] Error parsing JSON:", err);
    return [];
  }
  // Debug: log the raw response
  console.log("[Gemini] Raw response:", data);
  // Try to extract the JSON array from Gemini's response
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Debug: log the text Gemini returned
    console.log("[Gemini] Text returned:", text);
    const match = text.match(/\[.*\]/s);
    if (match) {
      const parsed = JSON.parse(match[0]);
      console.log("[Gemini] Parsed suggestions:", parsed);
      return parsed;
    } else {
      console.warn("[Gemini] No JSON array found in text:", text);
    }
  } catch (e) {
    console.error("[Gemini] Error extracting suggestions:", e);
  }
  return [];
}
