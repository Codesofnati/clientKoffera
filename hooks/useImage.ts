// hooks/useImage.ts
import { useState, useEffect } from 'react';

interface ImageData {
  id: number;
  url: string;
  category: string;
  section: string;
  created_at: string;
  storagePath?: string;
}

export function useImage(section: string, category: string) {
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/images/latest/${section}/${category}`, {
          cache: 'no-store',
        });
        
        if (!res.ok) {
          if (res.status === 404) {
            setImage(null);
            return;
          }
          throw new Error('Failed to fetch image');
        }
        
        const data = await res.json();
        setImage({
          ...data,
          url: `${data.url}?t=${Date.now()}`, // Add timestamp to avoid cache
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error(`Error fetching ${category} image:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (section && category) {
      fetchImage();
    }
  }, [section, category, API]);

  return { image, loading, error };
}