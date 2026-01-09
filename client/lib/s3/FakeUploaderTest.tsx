"use client";

import { S3Uploader } from "@/lib/s3/S3Uploader";
import { useState } from "react";

export default function FakeUploaderTest() {
    const [videoKey, setVideoKey] = useState("");

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-xl font-bold">Fake S3 Uploader Test</h1>
            <S3Uploader
                onUploaded={(keys) => {
                    if (keys.length > 0) {
                        setVideoKey(keys[0]);
                    }
                }}
                getKey={(file) => `user/${"12345"}/avatar-${Date.now()}.${file.name.split('.').pop()}`}
                multiple={true}
                maxFiles={1}
                maxFileSizeMB={600}
                uploadType="video"
                accept={{ "video/*": [] }}
            />

        </div>
    );
}
