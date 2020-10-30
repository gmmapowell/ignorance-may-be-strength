const applicationServerKey='BH2FN2WXU5vzd0SRtXWV2qbnP47bxGtLG3lRAjK49bXmPR4aSjxmKkM1VR0v3eQlW_uGVhs2UeYXkRJFHYzuQd0';

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js')
		.then((registration) => {
			console.log("have registered service worker", registration);
			registration.update().catch(ex => console.log(ex.message));

			var pushDiv = document.querySelector('.push');
			var notifyButton = document.querySelector('.notify-button');
			pushDiv.style.display = 'block';
			
			notifyButton.addEventListener('click', function(ev) {
				pushDiv.style.display = 'none';
				var options = {
					userVisibleOnly: true,
					applicationServerKey: applicationServerKey
				};
				registration.pushManager.subscribe(options)
				.then(function(sub) {
					console.log("subscribed to", sub.endpoint);
					var simple = JSON.parse(JSON.stringify(sub));
					console.log("auth", simple.keys.auth);
					console.log("key", simple.keys.p256dh);
				});
			});
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
