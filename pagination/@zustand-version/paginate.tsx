/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { memo, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { create } from "zustand";
import {
  PaginationButtonProps,
  PaginationReturnType,
  PaginationState,
  TPaginate,
} from "./paginateTypes";

//* UTILS
const range = (start: number, end: number): number[] => {
  if (start >= end) {
    return [];
  }
  if (!start) return Array.from({ length: end - start }, (_, index) => index);
  return Array.from({ length: end - start }, (_, index) => index + start);
};

const countTotalPages = (length: number, limit: number): number =>
  Math.ceil(length / limit);

const getPaginatedData: <DataType>(
  arrayOfData: DataType[],
  startIndex: number,
  endIndex: number
) => DataType[] = (arrayOfData, startIndex, endIndex) => {
  if (!arrayOfData) return [];
  return arrayOfData.slice(startIndex, endIndex + 1);
};

const usePaginationState = create<PaginationState<unknown>>()(set => ({
  currentPage: 0,
  previousPage: 0,
  dataLimit: 0,
  pagesCount: 0,
  pages: [],
  originalData: [],
  paginatedData: [],
  setCurrentPage: (currentPageNumber, previousPage) => {
    if (typeof currentPageNumber !== "number") return;

    set({
      currentPage: currentPageNumber,
      previousPage,
    });
  },
  setCalculatedValues: (originalData, dataLimit) =>
    set(store => {
      const pagesCount: number = countTotalPages(
        originalData?.length,
        dataLimit
      );
      const startIndex: number = (store.currentPage - 1) * dataLimit;
      const endIndex: number = store.currentPage * dataLimit - 1;
      return {
        dataLimit,
        originalData,
        pagesCount,
        pages: range(1, pagesCount + 1),
        startIndex,
        endIndex,
        paginatedData: getPaginatedData(originalData, startIndex, endIndex),
      };
    }),
}));

export function usePaginate<DataType>(
  data: DataType[],
  dataLimit: number
): PaginationReturnType<DataType> {
  const store = usePaginationState(store => store) as PaginationState<DataType>;

  //? Initial page number
  useEffect(() => {
    store.setCurrentPage(1, store.currentPage);
  }, []);

  //? Calculate the values of the state needed pagination to work
  useEffect(() => {
    store.setCalculatedValues(data, dataLimit);
  }, [store.currentPage, data, dataLimit]);

  //? PAGINATION COMPONENT FOR RENDERING PAGE NUMBERS
  const Paginate: TPaginate = memo(({ color, backgroundColor }) => {
    if (store.pagesCount === 1) return null;

    const PaginationButton: React.FC<PaginationButtonProps> = memo(
      ({
        onClick,
        pageNumber,
        currentPage,
        children,
        color,
        backgroundColor,
      }) => {
        return (
          <button
            key={pageNumber}
            type="button"
            onClick={onClick}
            className={twMerge(
              "paginate__btn bg-slate-100 p-3 leading-none hover:bg-slate-50 transition-all first:rounded-s-lg last:rounded-e-lg",
              "has-[+_*]:border-r border-gray-200",
              pageNumber && currentPage === pageNumber
                ? backgroundColor
                  ? "bg-[var(--background-color)] hover:bg-[var(--background-color)] hover:opacity-60 text-[var(--text-color)]"
                  : "bg-blue-400 text-white hover:bg-blue-300"
                : ""
            )}
            style={
              {
                "--background-color": backgroundColor || "#60a5fa",
                "--text-color": color || "#fff",
              } as React.CSSProperties
            }>
            {children || pageNumber}
          </button>
        );
      }
    );

    return (
      <section className="flex flex-row flex-wrap justify-start gap-0">
        {/* PreviousPage Btn */}
        <PaginationButton
          color={color}
          backgroundColor={backgroundColor}
          onClick={() =>
            store.setCurrentPage(
              store.currentPage > 1 ? store.currentPage - 1 : null,
              store.currentPage
            )
          }
          pageNumber={null}
          currentPage={store.currentPage}>
          <FaChevronLeft size={13} />
        </PaginationButton>
        {/* PageNumbers Btn */}
        {store.pages.map(pageNumber => {
          return (
            <PaginationButton
              color={color}
              backgroundColor={backgroundColor}
              onClick={() =>
                store.setCurrentPage(pageNumber, store.currentPage)
              }
              pageNumber={pageNumber}
              currentPage={store.currentPage}
            />
          );
        })}
        {/* NextPage Btn */}
        <PaginationButton
          color={color}
          backgroundColor={backgroundColor}
          onClick={() =>
            store.setCurrentPage(
              store.currentPage < store.pagesCount
                ? store.currentPage + 1
                : null,
              store.currentPage
            )
          }
          pageNumber={null}
          currentPage={store.currentPage}>
          <FaChevronRight size={13} />
        </PaginationButton>
      </section>
    );
  });

  return { ...store, setCurrentPage: store.setCurrentPage, Paginate };
}
