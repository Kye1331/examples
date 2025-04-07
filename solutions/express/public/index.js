window.loadAndAskStream = async function () {
  try {
    // First, load the contents of MapGenerator.txt
    const mapRes = await fetch("MapGenerator.txt");
    const mapText = await mapRes.text();

    // Then, use it as the question
    const res = await fetch(`/ask?question=${encodeURIComponent(mapText)}`);

    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let finalText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      finalText += chunk;

      // Live update the DOM
      document.getElementById("answer").innerText = finalText;
    }
  } catch (err) {
    console.error("Streaming failed:", err);
  }
};
