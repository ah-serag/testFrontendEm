import { apiSlice } from '../app/api/apiSlice';


export const supplierApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    getSuppliers: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search.trim());
        if (params.status) queryParams.append('status', params.status);
        
        return `/api/suppliers?${queryParams.toString()}`;
      },
      providesTags: ['Suppliers'],
    }),




    createSupplier: builder.mutation({
      query: (payload) => ({
        url: '/api/suppliers',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Suppliers'],
    }),
    
    updateSupplier: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/suppliers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Suppliers'],
    }),

    getSuppliersForSelect: builder.query({
      query: () => '/api/suppliers/select',
      providesTags: ['Suppliers'],
    }),

  }),
});

export const { 
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useGetSuppliersForSelectQuery ,
  useGetSuppliersQuery
} = supplierApiSlice;