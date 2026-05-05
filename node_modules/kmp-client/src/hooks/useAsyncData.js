import { useEffect, useState } from "react";

export function useAsyncData(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const value = await loader();
        if (!ignore) {
          setData(value);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || "Something went wrong");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, dependencies);

  return { data, loading, error, setData };
}
