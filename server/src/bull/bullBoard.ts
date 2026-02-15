import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

import emailQueue from "./queues/email.queue.js"; // ✅ your queue
import { progressQueue } from "./queues/progress.queue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
    queues: [
        new BullMQAdapter(emailQueue),
        new BullMQAdapter(progressQueue),
    ],
    serverAdapter,
});

export default serverAdapter;
