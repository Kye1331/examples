async function ask(question){
  l = await fetch(`/ask?question=${encodeURIComponent(question)}`)
  alert(l);
}
ask("hello!");
