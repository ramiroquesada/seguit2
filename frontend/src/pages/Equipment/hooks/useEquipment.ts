import { useQuery } from '@tanstack/react-query';
import { equipmentApi } from '../../../api/equipment.api';

export const useEquipment = (params: any) => {
  return useQuery({
    queryKey: ['equipment', 'list', params],
    queryFn: () => equipmentApi.getAll(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching
  });
};
