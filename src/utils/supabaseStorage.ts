import { supabase } from '../supabaseClient.js';

export const STORAGE_BUCKET = 'app-files';

export interface StorageUploadResult {
  success: boolean;
  path: string;
  signedUrl: string;
  fileName: string;
  fileSize: string;
  error?: string;
}

/**
 * Returns the effective user ID for folder organization under app-files/{userId}/...
 * Strictly complies with RLS: each user only accesses files under their own folder.
 */
export async function getEffectiveUserId(fallbackUserId?: string): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;
  } catch (err) {
    console.warn('Could not retrieve Supabase auth user, using fallback ID:', err);
  }

  // Fallback to active app user profile ID (sanitized)
  return fallbackUserId || 'usr_anonymous';
}

/**
 * Uploads a file to the private 'app-files' Supabase Storage bucket.
 * Destination: {userId}/{folder}/{timestamp}_{cleanFileName}
 */
export async function uploadToStorage(
  file: File,
  folder: 'avatars' | 'materials' | 'assignments' | 'applications' | 'documents',
  fallbackUserId?: string
): Promise<StorageUploadResult> {
  try {
    const userId = await getEffectiveUserId(fallbackUserId);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${folder}/${Date.now()}_${cleanFileName}`;

    // Upload to private bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return {
        success: false,
        path: '',
        signedUrl: '',
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        error: uploadError.message,
      };
    }

    const uploadedPath = uploadData?.path || storagePath;

    // Create signed URL since the bucket is private (valid for 7 days = 604800 seconds)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(uploadedPath, 604800);

    if (signedError) {
      console.warn('Failed to generate initial signed URL:', signedError);
    }

    return {
      success: true,
      path: uploadedPath,
      signedUrl: signedData?.signedUrl || '',
      fileName: file.name,
      fileSize: formatFileSize(file.size),
    };
  } catch (err: any) {
    console.error('Unexpected storage upload exception:', err);
    return {
      success: false,
      path: '',
      signedUrl: '',
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      error: err?.message || 'File upload failed',
    };
  }
}

/**
 * Generates a fresh signed URL for a private storage path in 'app-files'.
 */
export async function getSignedUrl(
  path: string,
  expiresInSeconds: number = 86400,
  download: boolean = false
): Promise<string | null> {
  if (!path) return null;

  try {
    const options: { download?: boolean } = {};
    if (download) options.download = true;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(path, expiresInSeconds, options);

    if (error) {
      console.error('Error creating signed URL for', path, error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (err) {
    console.error('Exception fetching signed URL for', path, err);
    return null;
  }
}

/**
 * Deletes a file from the private 'app-files' Supabase Storage bucket.
 */
export async function deleteFromStorage(path: string): Promise<boolean> {
  if (!path) return true;

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      console.error('Failed to delete file from Supabase storage:', path, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception deleting from Supabase storage:', err);
    return false;
  }
}

/**
 * Initiates direct browser download using a signed URL.
 */
export async function downloadFileByPath(
  path: string,
  fileName?: string
): Promise<boolean> {
  try {
    const signedUrl = await getSignedUrl(path, 3600, true);
    if (!signedUrl) return false;

    const link = document.createElement('a');
    link.href = signedUrl;
    if (fileName) {
      link.download = fileName;
    }
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to trigger download:', err);
    return false;
  }
}

/**
 * Formats file size in bytes to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
