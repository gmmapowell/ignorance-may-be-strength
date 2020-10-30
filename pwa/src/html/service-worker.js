console.log("hello from the service worker");

self.addEventListener('fetch', function(ev) {
	var url = ev.request.url;
	console.log('fetch seen for ' + url);
	ev.respondWith(
		caches.match(ev.request)
		.then(function(response) {
			if (response)
				return response;
			
			return fetch(ev.request).then(
				function(response) {
					// handle error cases that we wouldn't want to cache
					if (!response || response.status !== 200 || response.type !== 'basic')
						return response;

					// clone the response and cache it
					var clonedResponse = response.clone();
					caches.open("simple")
					.then(function(cache) {
						cache.put(ev.request, clonedResponse);
					}).catch(err => console.log("error opening simple cache", err.message));

					return response;
				}
			).catch(err => console.log("error", err.message, ev.request.url));
		}).catch(err => console.log("failed to fetch", ev.request.url, err.message))
	)
});

self.addEventListener('push', function(ev) {
	console.log("received push event", ev.data.text());
});