export type TPaginate = React.FC<
  Pick<PaginationButtonProps, "color" | "backgroundColor">
>;

export interface PaginationButtonProps {
  onClick: () => void;
  currentPage: number;
  pageNumber: number | null;
  children?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
}

interface PaginationType<DataType> {
  currentPage: number;
  previousPage: number;
  dataLimit: number;
  pagesCount: number;
  pages: number[];
  originalData: DataType[];
  paginatedData: DataType[];
}

interface Actions<DataType> {
  setCurrentPage: (
    currentPageNumber: number | null,
    previousPage: number
  ) => void;
  setCalculatedValues: (
    originalData: PaginationType<DataType>["originalData"],
    dataLimit: PaginationType<DataType>["dataLimit"]
  ) => void;
}

export type PaginationState<DataType> = PaginationType<DataType> &
  Actions<DataType>;

export interface PaginationReturnType<DataType>
  extends PaginationType<DataType> {
  setCurrentPage: Actions<DataType>["setCurrentPage"];
  Paginate: TPaginate;
}
