import { mkdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), ".cache/expenses.json");
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedData<T>(
  fetcher: () => Promise<T>,
  invalidateCache: boolean = false,
): Promise<T> {
  try {
    const stats = await stat(CACHE_PATH).catch(() => null);

    if (stats && !invalidateCache) {
      const isCacheExpired = Date.now() - stats.mtimeMs > TTL;

      if (!isCacheExpired) {
        console.log("Fetching data from cache...");
        const data = await readFile(CACHE_PATH, "utf-8");
        return JSON.parse(data);
      }
    }

    console.log("Cache data is stale, fetching fresh data from source...");
    const freshData = await fetcher();

    await mkdir(path.dirname(CACHE_PATH), { recursive: true });
    await writeFile(CACHE_PATH, JSON.stringify(freshData));

    return freshData;
  } catch (error) {
    console.log("Error fetching data from cache:", error);
    return fetcher();
  }
}
