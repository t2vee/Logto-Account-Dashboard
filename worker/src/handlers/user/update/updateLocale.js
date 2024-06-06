// Copyright (c) 2024 t2vee. All rights reserved.
// Use of this source code is governed by an MPL license.


import successEMPTY from "../../../responses/empty204";
import failureCONTENT from "../../../responses/content400";

export const handler = async (request, env, ctx) => {
	try {
		const requestData = await request.json();
		ctx.Validate.locale(requestData);
		await ctx.Http.patch(
			`/api/users/${ctx.userid}/profile`,
			{data: {
					"profile": {
						"locale": requestData.locale
					}}
			});
		return successEMPTY
	} catch (e) {
		console.error(e)
		return failureCONTENT(e.message, e.status)	}
}
