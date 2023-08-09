async function injectHTML(filePath,elem) {
	try {
		const response = await fetch(filePath);
		if (!response.ok) {
			return;
		}
		elem.outerHTML = await response.text();
		elem.querySelectorAll("script").forEach(script => {
			const newScript = document.createElement("script");
			Array.from(script.attributes).forEach(attr =>
				newScript.setAttribute(attr.name, attr.value)
			);
			newScript.appendChild(
				document.createTextNode(script.innerHTML)
			)
			script.parentNode.replaceChild(newScript, script);
		})
	} catch (err) {
		console.error(err.message);
	}
}
let isScrolling = false;
let timerScroll = null;

function injectAll() {
	document.querySelectorAll("[include]")
		.forEach((elem) => {
			injectHTML(elem.getAttribute("include"),elem);
		});
	document.addEventListener("scroll",()=>{
		isScrolling = true;
		if (timerScroll !== null){
			clearTimeout(timerScroll);
		}
		timerScroll = setTimeout(()=>{
			isScrolling = false;
		}, 100);
	})
}

injectAll();
