// FileUploader.tsx
import React, {useCallback, useRef} from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Button, Typography, Paper } from '@mui/material';

interface FileUploaderProps {
    onFileUpload: (files: File[], rejectedFiles: FileRejection[]) => void;
    onFileContentRead: (fileContent: string[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, onFileContentRead }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const openFileDialog = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            onFileUpload(acceptedFiles, rejectedFiles);

            // Assuming only one file is selected for simplicity
            const selectedFile = acceptedFiles[0];
            if (selectedFile) {
                // Read file content
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target && event.target.result) {
                        let lines = (event.target.result as string).split('\n');
                        lines = lines.filter(item => item !== "");
                        onFileContentRead(lines);
                    }
                };
                reader.readAsText(selectedFile);
            }
        },
        [onFileUpload, onFileContentRead]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });


    return (
        <Paper elevation={3} style={{ padding: '20px', textAlign: 'center', width: '30%' }}>
            <Button variant="contained" color="primary" onClick={openFileDialog}>
                Upload Variants
            </Button>
            <div {...getRootProps()} style={{ cursor: 'pointer' }}>
                <input {...getInputProps()} ref={(node) => (inputRef.current = node)} style={{ display: 'none' }} />
                <Typography variant="caption" gutterBottom>
                    {isDragActive ? 'Drop the files here' : 'Drag and drop files here, or click to select files'}
                </Typography>
                <Typography variant={"body2"}>Each line of the file should contain a variant inthe form of .p.[ORG][position][VAR]</Typography>
                <Typography variant={"body2"}>E.g .p.D21H</Typography>
            </div>
        </Paper>
    );
};

export default FileUploader;
