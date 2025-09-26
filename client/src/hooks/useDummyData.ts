import * as d3 from "d3";
import { useEffect, useState } from "react";

export function useDummyData<T = unknown>() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const json = await d3.json<T>("/sample-data.json");
                if (!ignore) setData(json ?? null);
            } catch (e: any) {
                if (!ignore) setError(e?.message ?? "Failed to load data");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => { ignore = true; };
    }, []);

    return { data, loading, error };
}
