
import { useState, useEffect } from 'react';
import { Parking } from '../types';
import * as parkingsApi from '../services/parkings.api';

export const useParkings = (activeOnly: boolean = false) => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        setIsLoading(true);
        const data = await parkingsApi.getParkings(activeOnly);
        setParkings(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParkings();
  }, [activeOnly]);

  return { parkings, isLoading, error };
};
