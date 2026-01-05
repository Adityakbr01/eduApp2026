import { useDropzone } from "react-dropzone";

export function DragDropZone({ onFile }: { onFile: (file: File) => void }) {
    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,
        onDrop: files => onFile(files[0])
    });

    return (
        <div {...getRootProps()} className="border-dashed border p-6">
            <input {...getInputProps()} />
            Drag & Drop or Click
        </div>
    );
}
