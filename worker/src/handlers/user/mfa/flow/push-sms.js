// Copyright (c) 2024 t2vee. All rights reserved.
// Use of this source code is governed by an MPL license.


import pushCode from "../../../../lib/pushCode";

export const handler = async (request, env, ctx) => {
	return pushCode(request, env, ctx, 'phone');
}
