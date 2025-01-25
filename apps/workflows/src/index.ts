// This file is the entrypoint for this Cloudflare worker, which contains our workflows.
// It exports the workflows and the scheduled function. Which allows us to use workflows defined outside of this file.
// The scheduled function is used to trigger the workflows.

import {DailyRecapWorkflow} from "./workflows/daily-recap";
import { GetUsersForRecapWorkflow } from "./workflows/get-users-for-recap";

export {
	DailyRecapWorkflow,
	GetUsersForRecapWorkflow
}

export default {
	scheduled(event, env: Env, ctx) {
		console.log("cron processed");
		ctx.waitUntil(env.GET_USERS_WORKFLOW.create());
	}
} satisfies ExportedHandler<Env>;
