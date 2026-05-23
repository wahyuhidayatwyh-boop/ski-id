import { supabase } from './supabase';

/**
 * Upload file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path within the bucket
 * @returns The public URL of the uploaded file, or null if upload failed
 */
export async function uploadFile(
    file: File,
    bucket: string = 'events-images',
    folder: string = ''
): Promise<string | null> {
    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const path = folder ? `${folder}/${fileName}` : fileName;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        return null;
    }
}

/**
 * Delete file from Supabase Storage
 * @param filePath - The path of the file to delete
 * @param bucket - The storage bucket name
 */
export async function deleteFile(
    filePath: string,
    bucket: string = 'events-images'
): Promise<void> {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

/**
 * Handle image upload from file input
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path within the bucket
 * @param onProgress - Optional progress callback
 * @returns The public URL of the uploaded file
 */
export async function handleImageUpload(
    file: File,
    bucket: string = 'events-images',
    folder: string = '',
    onProgress?: (progress: number) => void
): Promise<string | null> {
    // Validate file type - support JPEG, PNG, and WebP
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
        return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file harus kurang dari 5MB');
        return null;
    }

    if (onProgress) onProgress(0);

    const url = await uploadFile(file, bucket, folder);

    if (onProgress) onProgress(100);

    return url;
}

/**
 * Create a preview URL from a file
 * @param file - The file to create preview for
 * @returns A promise that resolves to the preview URL
 */
export function createPreview(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    });
}
