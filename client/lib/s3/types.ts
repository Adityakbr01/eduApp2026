// types/upload.ts
export interface UploadFileItem {
    file: File;
    preview: string;
    progress: number;
    status: "idle" | "uploading" | "success" | "error";
    key?: string;
    error?: string;
}


// types/upload-item.ts
export type UploadStatus =
    | "idle"
    | "preparing"
    | "uploading"
    | "paused"
    | "success"
    | "error";

export interface UploadItem {
    file: File;
    preview: string;

    progress: number;
    status: UploadStatus;

    /** Upload result */
    key?: string;
    error?: string;


    /** Used for simple uploads */
    controller: AbortController;
}


