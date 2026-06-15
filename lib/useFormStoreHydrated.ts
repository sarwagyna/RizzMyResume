"use client";

import { useEffect, useState } from "react";
import { useFormStore } from "@/stores/formStore";

export function useFormStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useFormStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }

    const unsub = persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (persist.hasHydrated()) {
      setHydrated(true);
    } else {
      void persist.rehydrate();
    }

    return unsub;
  }, []);

  return hydrated;
}
