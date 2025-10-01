import { useQuery } from "@tanstack/react-query";
import { getParkings } from "../services/parkings.api";

export function useParkings() {
  return useQuery(["parkings"], () => getParkings(), { staleTime: 1000 * 60 * 2 });
}
