export interface IPagination {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalCount: number;
}

type PaginationSettings = {paginationSettings: IPagination}

export default PaginationSettings
