window.ask = async function(question){
  alert('test');
  l = await fetch(`/ask?question=${encodeURIComponent(question)}`)
  alert(l);
}
ask("hello!");
