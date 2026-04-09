// Image Processing Service
import sharp from 'sharp';

export interface ProcessedFile {
    type: 'IMAGE' | 'DICOM' | 'NIFTI';
    imageData: string;
}

export async function processFile(buffer: Buffer, filename: string): Promise<ProcessedFile> {
    const ext = filename.toLowerCase();

    // Handle DICOM files
    if (ext.endsWith('.dcm')) {
        // For DICOM, we'd need a DICOM parser library
        // For now, return as-is with base64 encoding
        return {
            type: 'DICOM',
            imageData: `data:application/dicom;base64,${buffer.toString('base64')}`,
        };
    }

    // Handle NIfTI files
    if (ext.endsWith('.nii') || ext.endsWith('.nii.gz')) {
        // For NIfTI, we'd need a NIfTI parser library
        // For now, return as-is with base64 encoding
        return {
            type: 'NIFTI',
            imageData: `data:application/octet-stream;base64,${buffer.toString('base64')}`,
        };
    }

    // Handle standard image files (JPEG, PNG)
    try {
        // Convert to PNG and optimize
        const processedBuffer = await sharp(buffer)
            .png({ quality: 90 })
            .toBuffer();

        return {
            type: 'IMAGE',
            imageData: `data:image/png;base64,${processedBuffer.toString('base64')}`,
        };
    } catch (error) {
        console.error('Error processing image:', error);
        // Fallback: return original buffer as base64
        const mimeType = ext.endsWith('.jpg') || ext.endsWith('.jpeg')
            ? 'image/jpeg'
            : 'image/png';

        return {
            type: 'IMAGE',
            imageData: `data:${mimeType};base64,${buffer.toString('base64')}`,
        };
    }
}
