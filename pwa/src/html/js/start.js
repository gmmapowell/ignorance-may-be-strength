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