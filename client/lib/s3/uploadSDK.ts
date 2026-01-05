export async function uploadFile({ file, type, meta }) {
    const init = await api.startUpload({
        size: file.size,
        mime: file.type,
        type,
        meta
    });

    if (init.mode === "simple") {
        await fetch(init.url, { method: "PUT", body: file });
    } else {
        await multipartUpload(file, init);
    }

    await api.completeUpload({ intentId: init.intentId });
}
