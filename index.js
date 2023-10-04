class Router {
	routes = [];
	handle(request, env, ctx) {
		for (const route of this.routes) {
			const match = route[0](request);
			if (match) {
				return route[1]({ ...match, request, env, ctx });
			}
		}
		const match = this.routes.find(([matcher]) => matcher(request));
		if (match) {
			return match[1](request);
		}
	}
	register(handler, path, method) {
		const urlPattern = new URLPattern({ pathname: path });
		this.routes.push([
			(request) => {
				if (method === undefined || request.method.toLowerCase() === method) {
					const match = urlPattern.exec({
						pathname: new URL(request.url).pathname,
					});
					if (match) {
						return { params: match.pathname.groups };
					}
				}
			},
			(args) => handler(args),
		]);
	}
	options(path, handler) {
		this.register(handler, path, "options");
	}
	head(path, handler) {
		this.register(handler, path, "head");
	}
	get(path, handler) {
		this.register(handler, path, "get");
	}
	post(path, handler) {
		this.register(handler, path, "post");
	}
	put(path, handler) {
		this.register(handler, path, "put");
	}
	patch(path, handler) {
		this.register(handler, path, "patch");
	}
	delete(path, handler) {
		this.register(handler, path, "delete");
	}
	all(path, handler) {
		this.register(handler, path);
	}
}

const router = new Router();

router.get("/", () => {
    return Response.redirect("https://t.me/randomenfess"):
    /*return new Response("200 OK", {
        status: 200,
        headers: { "Content-Type": "text/html" },
    });*/
});

router.post("/send", async ({ request, env }) => {
	const body = await request.json();
	const source = new URL(request.url).searchParams.get("source") || "unknown";
	if (Object.keys(body).length <= 0) {
		return Response.json(
			{
				error: "No Data",
			},
			{
				status: 200,
			},
		);
	} else {
		try {
			let url = "https://api.telegram.org/bot",
				data = JSON.stringify(body, null, 2),
				text = `${source}\n<pre>${data}</pre>`;
			await fetch(`${url}${env.BOT_TOKEN}/sendMessage?chat_id=${env.CHAT_ID}&text=${text}&parse_mode=html`);
			return new Response(data, {
				status: 200,
				headers: {
					"Cache-control": `no-store`,
				},
			});
		} catch (err) {
			return new Response(err, {
				status: 200,
				headers: {
					"Cache-control": `no-store`,
				},
			});
		}
	}
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

export default {
	async fetch(request, env, ctx) {
		return router.handle(request, env, ctx);
	},
};
