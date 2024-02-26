import Pagination from "react-js-pagination";
import { styled } from "styled-components";

interface paginatorProps {
  totalItemsCount: number;
  activePage: number;
  itemsPerPage: number;
  handlePageChange: (pageNumber: number) => void;
}
const PaginationComponent = ({
  totalItemsCount,
  activePage,
  itemsPerPage,
  handlePageChange,
}: paginatorProps) => {
  return (
    <PaginationWrapper>
      <Pagination
        activePage={activePage}
        itemsCountPerPage={itemsPerPage}
        totalItemsCount={totalItemsCount || 1}
        pageRangeDisplayed={5}
        prevPageText="‹"
        nextPageText="›"
        onChange={handlePageChange}
      />
    </PaginationWrapper>
  );
};

export default PaginationComponent;

const PaginationWrapper = styled.div`
  font-size: 1.3rem;
  display: flex;
  justify-content: right;
  margin-top: 2rem;

  ul {
    display: flex;
    list-style-type: none;
    padding: 0;

    li {
      margin: 0 0.4rem;
      border-radius: 5rem;
      a {
        display: inline-block;
        padding: 0.6rem 1rem;
        text-decoration: none;
      }

      &.active {
        background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
        a {
          color: white;
        }
      }
    }

    li:nth-child(1),
    li:nth-child(2),
    li:nth-child(8),
    li:nth-child(9) {
      background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
      a {
        color: #ffffff;
      }
    }

    li:hover {
      background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
      color: #ffffff;
    }
  }
`;
