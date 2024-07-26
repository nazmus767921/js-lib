import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface PaginateComponentProps<T> {
  onPageChange?: (paginationState: T) => void;
}

interface PaginationState {
  previousPage: number;
  currentPage: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  pagesCount: number;
  pageNumbers: number[];
}

// || _-_-_-_-_-_ UTILS _-_-_-_-_-_ || //
const range = (start: number, end: number): number[] => {
  if (start >= end) {
    return [];
  }
  if (!start) return Array.from({ length: end - start }, (_, index) => index);
  return Array.from({ length: end - start }, (_, index) => index + start);
};

interface DataState<T> {
  originalData: T[];
  paginatedData: T[];
}

const getPaginatedData: <T>(
  arrayOfData: T[],
  startIndex: number,
  endIndex: number
) => T[] = (arrayOfData, startIndex, endIndex) => {
  if (!arrayOfData) return [];
  return arrayOfData.slice(startIndex, endIndex + 1);
};

// || _-_-_-_-_-_ PAGINATION _-_-_-_-_-_ || //
export function usePaginate<T>(originalData: T[], userDefinedPageSize = 10) {
  const [data, setData] = useState<DataState<T>>({
    originalData,
    paginatedData: [],
  });
  const { originalData: originalStateData, paginatedData } = data;

  const [paginationState, setPaginationState] = useState<PaginationState>({
    previousPage: 1,
    currentPage: 1,
    pageSize: userDefinedPageSize,
    startIndex: 0,
    endIndex: 0,
    pagesCount: Math.ceil(originalData?.length / userDefinedPageSize),
    pageNumbers: [] as number[],
  });
  const {
    currentPage,
    previousPage,
    pageSize,
    startIndex,
    endIndex,
    pagesCount,
    pageNumbers,
  } = paginationState;

  const setCurrentPage = (
    currentPageNumber: number,
    returnUpdatedState = false
  ): {
    updated: { paginationState: PaginationState; data: DataState<T> };
  } | void => {
    if (!returnUpdatedState) {
      setPaginationState(ps => ({
        ...ps,
        previousPage: ps.currentPage,
        currentPage: currentPageNumber,
      }));
      return;
    }
    const newStateWithCurrentPageNumber = {
      ...paginationState,
      previousPage: paginationState.currentPage,
      currentPage: currentPageNumber,
      pageNumbers: range(1, pagesCount + 1),
      startIndex: (currentPageNumber - 1) * paginationState.pageSize,
      endIndex: currentPageNumber * paginationState.pageSize - 1,
    };
    const newDataState = {
      ...data,
      paginatedData: getPaginatedData(
        data.originalData,
        newStateWithCurrentPageNumber.startIndex,
        newStateWithCurrentPageNumber.endIndex
      ),
    };
    setData(newDataState);
    setPaginationState(newStateWithCurrentPageNumber);
    return {
      updated: {
        paginationState: newStateWithCurrentPageNumber,
        data: newDataState,
      },
    };
  };

  type HandlePageChangeParamType = PaginationState & DataState<T>;
  const handlePageChange = (
    pageNumber: number,
    callback?: ({
      currentPage,
      startIndex,
      endIndex,
      pagesCount,
      pageNumbers,
      pageSize,
      originalData,
      paginatedData,
    }: HandlePageChangeParamType) => void
  ): void => {
    if (pageNumber === currentPage) return; // do not calculate

    if (callback) {
      const {
        updated: { data, paginationState },
      } = setCurrentPage(pageNumber, true)!;

      callback && callback({ ...data, ...paginationState });
    } else {
      setCurrentPage(pageNumber);
    }
  };

  // || _-_-_-_-_-_ PAGINATION COMPONENT (use this or build your own using pagination hooks return properties) _-_-_-_-_-_ || //
  const Paginate: React.FC<
    PaginateComponentProps<HandlePageChangeParamType>
  > = ({ onPageChange }) => {
    if (pagesCount === 1) return null;
    return (
      <section className="flex flex-row flex-wrap justify-start gap-0">
        {pageNumbers.map(pageNumber => {
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => {
                handlePageChange(pageNumber, onPageChange);
              }}
              className={twMerge(
                "paginate__btn bg-slate-100 p-3 leading-none hover:bg-slate-50 transition-all first:rounded-s-lg last:rounded-e-lg ",
                currentPage === pageNumber
                  ? "bg-blue-400 text-white hover:bg-blue-300"
                  : ""
              )}>
              {pageNumber}
            </button>
          );
        })}
      </section>
    );
  };

  useEffect(() => {
    setPaginationState(ps => ({
      ...ps,
      pageSize: userDefinedPageSize,
      pagesCount: Math.ceil(originalData?.length / userDefinedPageSize),
      pageNumbers: range(1, pagesCount + 1),
      startIndex: (ps.currentPage - 1) * ps.pageSize,
      endIndex: ps.currentPage * ps.pageSize - 1,
    }));

    setData(previousState => ({
      ...previousState,
      originalData,
      paginatedData: getPaginatedData(originalData, startIndex, endIndex),
    }));
  }, [
    currentPage,
    previousPage,
    originalData,
    startIndex,
    endIndex,
    userDefinedPageSize,
    pagesCount,
  ]);

  return {
    currentPage,
    startIndex,
    endIndex,
    pagesCount,
    pageNumbers,
    pageSize,
    originalData: originalStateData,
    paginatedData,
    Paginate,
    setCurrentPage,
  };
}
