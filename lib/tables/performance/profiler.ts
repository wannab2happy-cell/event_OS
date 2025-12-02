// Performance Profiling Utility
export interface ProfilingResult {
  name: string;
  duration: number;
  iterations?: number;
  memoryDelta?: number;
}

const profileResults: ProfilingResult[] = [];

export function startProfile(name: string): () => ProfilingResult {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

  return () => {
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const duration = endTime - startTime;
    const memoryDelta = endMemory - startMemory;

    const result: ProfilingResult = {
      name,
      duration,
      memoryDelta: memoryDelta > 0 ? memoryDelta : undefined,
    };

    profileResults.push(result);
    return result;
  };
}

export function getProfileResults(): ProfilingResult[] {
  return [...profileResults];
}

export function clearProfileResults(): void {
  profileResults.length = 0;
}

export function logProfileSummary(): void {
  console.group('📊 Performance Profile Summary');
  profileResults.forEach((result) => {
    console.log(
      `${result.name}: ${result.duration.toFixed(2)}ms${
        result.memoryDelta ? ` (${(result.memoryDelta / 1024).toFixed(2)}KB)` : ''
      }`
    );
  });
  console.groupEnd();
}

