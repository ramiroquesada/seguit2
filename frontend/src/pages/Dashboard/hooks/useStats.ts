import { useQuery } from '@tanstack/react-query';
import { equipmentApi } from '../../../api/equipment.api';

export const useStats = (limit: number = 25) => {
  return useQuery({
    queryKey: ['equipment', 'stats', limit],
    queryFn: () => equipmentApi.getStats(limit),
    placeholderData: (prev) => prev,
  });
};
