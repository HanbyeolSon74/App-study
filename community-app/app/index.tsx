import { useEffect, useState } from "react";
import { router } from "expo-router";

export default function Index() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      router.replace("/auth/login");
    }
  }, [mounted]);

  return null;
}
