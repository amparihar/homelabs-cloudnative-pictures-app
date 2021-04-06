import { useEffect, useState } from "react";

const UseAsync = (callback, defaultValue) => {
  const [state, setState] = useState({
    value: defaultValue,
    error: null,
    isPending: true,
  });

  useEffect(() => {
    callback()
      .then((value) =>
        setState((prev) => ({ ...prev, value, isPending: false }))
      )
      .catch((err) =>
        setState((prev) => ({
          ...prev,
          error: err.message || err,
          isPending: false,
        }))
      );
  }, [callback]);

  const { value, error, isPending } = state;

  return [value, error, isPending];
};

export const useAsync = UseAsync;
