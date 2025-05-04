async function ask(question){
  alert('test');
  l = await fetch(`/ask?question=${encodeURIComponent(question)}`)
  alert(l);
}
ask("hello!");
