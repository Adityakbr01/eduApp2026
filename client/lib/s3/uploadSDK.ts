import { FileTypeEnum } from "@/services/uploads";
import { multipartUpload } from "./useMultipartUpload";
import { uploadApi } from "@/services/uploads/api";

/* ================= TYPES ================= */

export interface UploadFileOptions {
    file: File;
    fileType: FileTypeEnum;
    onProgress?: (progress: {
        loaded: number;
        total: number;
        percentage: number;
    }) => void;
}

export interface UploadResult {
    key: string;
    intentId: string;
}

/* ================= MAIN UPLOAD FUNCTION ================= */

export async function uploadFileToS3({
    file,
    fileType,
    onProgress,
}: UploadFileOptions): Promise<UploadResult> {
    // 1️⃣ Get presigned URL
    const init = await uploadApi.getPresignedUrl(
        file.name,
        fileType,
        file.size,
        file.type
    );

    // 2️⃣ Simple upload
    if (init.mode === "simple" && init.uploadUrl) {
        await fetch(
            init.uploadUrl,
            {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type || "application/octet-stream",
                },
            }
        )
    }
    // 3️⃣ Multipart upload
    else {
        await multipartUpload(file, init);
    }

    // 4️⃣ Complete upload (two-phase commit)
    await uploadApi.completeUpload(init.intentId);

    return {
        key: init.key,
        intentId: init.intentId,
    };
}
