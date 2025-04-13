String.prototype.format = function() {
  let formatted = this;
  for (let i = 0; i < arguments.length; i++) {
    const regexp = new RegExp('\\{' + i + '\\}', 'gi');
    formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};
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
window.ImgGeneration = async function (prompt) {
  try {
    const res = await fetch(`/gen?question=${encodeURIComponent(prompt)}`);
    const json = await res.json();
    if (json.image) {
      document.getElementById("img").src = json.image;
    } else {
      console.error("No image returned");
    }
  } catch (err) {
    console.error("Image generation failed:", err);
  }
};


window.LoadImage = function (src) {
  const img = document.getElementById('img');
  img.src = src
};

window.Conversation = async function (person, input) {
  try {
    // First, load the contents of MapGenerator.txt
    const personRes = await fetch("conversation.txt");
    const rawText = await personRes.text();  // <- Await here
    const personText = rawText.format(person["persona"], person["his"], input);
    
    // Then, use it as the question
    const res = await fetch(`/ask?question=${encodeURIComponent(personText)}`);

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
    person.his = person.his + `{ User: ${input} \n You: ${finalText}} \n`
  } catch (err) {
    console.error("Streaming failed:", err);
  }
};
let configureAarav = async function(){
  let a= await fetch("aarav.txt");
  let b = await a.text();
window.Aarav = {
  "persona": b,
  "his":""
}
}

configureAarav();