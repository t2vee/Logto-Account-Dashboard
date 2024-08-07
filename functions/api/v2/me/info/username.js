// Copyright (c) 2024 t2vee. All rights reserved.
// Use of this source code is governed by an MPL license.

import { status, error, json } from '../../../../../api/libs/itty/responses/index.js';

export async function onRequestGet(ctx) {
    try {
        const value = await ctx.env.UsernameChangeTimelimit.get(ctx.data.userid);
        return value ? json({value}) : status(204);
    } catch (e) {
        console.error(e)
        return error(418)
    }
}