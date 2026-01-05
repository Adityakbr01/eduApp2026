const CONCURRENCY = 4;

export async function multipartUpload(file, init) {
    const uploaded = JSON.parse(
        localStorage.getItem(init.intentId) || "[]"
    );

    const parts = [];
    const queue = [];

    for (let i = 1; i <= init.totalParts; i++) {
        if (!uploaded.includes(i)) queue.push(i);
    }

    async function worker() {
        while (queue.length) {
            const part = queue.shift();
            const blob = file.slice(
                (part - 1) * init.partSize,
                part * init.partSize
            );

            const url = await api.signPart(init, part);
            const res = await fetch(url, { method: "PUT", body: blob });

            parts.push({ PartNumber: part, ETag: res.headers.get("ETag") });
            uploaded.push(part);
            localStorage.setItem(init.intentId, JSON.stringify(uploaded));
        }
    }

    await Promise.all(Array(CONCURRENCY).fill(0).map(worker));
    await api.completeMultipart(init, parts);
}
