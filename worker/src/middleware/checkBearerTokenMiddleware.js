// Copyright (c) 2024 t2vee. All rights reserved.
// Use of this source code is governed by an MPL license.


import verifyAuthToken from "../utils/verifyAuthToken";
import failureCONTENT from "../responses/raw/failure-CONTENT";

export default async (request, env, ctx) => {
	try {
		const tokenInfo = await verifyAuthToken(request, env);
		ctx.userid = tokenInfo.sub;
		console.log('[MIDDLEWARE] Bearer Token Check Succeeded')
	} catch (e) {
		return failureCONTENT(env, e.code, 400);
	}
}
