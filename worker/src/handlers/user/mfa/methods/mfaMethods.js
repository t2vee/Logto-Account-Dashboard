// Copyright (c) 2024 t2vee. All rights reserved.
// Use of this source code is governed by an MPL license.


import { error, json } from 'itty-router'

export default async (request, env, ctx) => {
	try {
		const r = await ctx.Http.get(`/api/users/${encodeURIComponent(ctx.userid)}/mfa-verifications`, {});
		return r.length === 0 ?
			json(["none"]) :
			json(r)
	} catch (e) {
		console.error(e)
		return error(e)
	}
}
