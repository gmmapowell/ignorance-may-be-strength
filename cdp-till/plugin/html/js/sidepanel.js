fetch("http://localhost:1399/src/cafe.till").then(resp => {
	console.log(resp.status, resp.statusText);
  });
  