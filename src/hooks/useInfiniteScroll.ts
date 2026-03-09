import { useRef, useEffect } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => Promise<void>;
  isLoading: boolean;
  hasMore: boolean;
  threshold?: number;
}

/**
 * Generic hook for infinite scroll pagination
 * Prevents infinite loop issues by managing the observer lifecycle properly
 * 
 * @param onLoadMore - Async callback function to fetch more items
 * @param isLoading - Whether data is currently being loaded
 * @param hasMore - Whether there are more items to load
 * @param threshold - Intersection observer threshold (default: 0.1)
 * @returns ref to attach to the trigger element
 * 
 * @example
 * const { triggerRef } = useInfiniteScroll({
 *   onLoadMore: fetchMore,
 *   isLoading: loading,
 *   hasMore: hasNextPage,
 *   threshold: 0.1
 * });
 * 
 * return <div ref={triggerRef} className="load-trigger" />;
 */
export function useInfiniteScroll({
  onLoadMore,
  isLoading,
  hasMore,
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasFiredRef = useRef(false);
  
  // Store state values in refs to avoid recreating observer
  const stateRef = useRef({ onLoadMore, isLoading, hasMore, threshold });
  
  // Update state refs without triggering observer recreation
  useEffect(() => {
    stateRef.current = { onLoadMore, isLoading, hasMore, threshold };
  }, [onLoadMore, isLoading, hasMore, threshold]);

  // Set up observer only once on mount/unmount
  useEffect(() => {
    // Create observer only once
    const observer = new IntersectionObserver(
      entries => {
        const lastEntry = entries[0];
        const { hasMore, isLoading, onLoadMore } = stateRef.current;
        
        // Prevent multiple rapid calls
        if (lastEntry.isIntersecting && hasMore && !isLoading && !hasFiredRef.current) {
          hasFiredRef.current = true;
          console.log('📚 Infinite scroll triggered, loading more items...');
          
          onLoadMore()
            .catch(err => console.error('Failed to load more items:', err))
            .finally(() => {
              hasFiredRef.current = false;
            });
        }
      },
      { threshold }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []); // Empty deps - observer is created once

  return { triggerRef };
}
