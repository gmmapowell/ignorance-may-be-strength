if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js')
		.then((registration) => {
			console.log("have registered service worker", registration);
			registration.update().catch(ex => console.log(ex.message));
		}).catch(ex => {
			console.log("failed to register service worker", ex.message);
		});
	});
}

var a2hsEv = null;

window.addEventListener('beforeinstallprompt', function(ev) {
	console.log("before install prompt");
	a2hsEv = ev;
	var btn = document.querySelector('.a2hs');
	btn.style.display = 'block';
	btn.addEventListener('click', function(bev) {
		btn.style.display = 'none';
		a2hsEv.prompt();
		a2hsEv.userChoice.then(function(result) {
			if (result.outcome == 'accepted') {
				console.log("added to home screen");
			} else {
				console.log("not added to home screen");
			}
			a2hsEv = null;
		});
	});
});