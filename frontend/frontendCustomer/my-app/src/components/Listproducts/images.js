import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import Product from "./product/index";
import "./images.css";
import {
  BrowserRouter,
  Link,
  useNavigate,
  Routes,
  Route,
} from "react-router-dom";
function images(props) {
  // function images(props) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data } = props;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [currentItems, setCurrentItems] = useState([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [pageCount, setPageCount] = useState(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [itemOffset, setItemOffset] = useState(0);

  let itemsPerPage = 8;
  if (props.count) {
    itemsPerPage = props.count;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(data.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(data.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, data]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % data.length;

    setItemOffset(newOffset);
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();
  const url=window.location.pathname
  return (
    <div>
      <div className="images">
        {currentItems.map((image) => {
          return (
            <React.Fragment key={image._id}>
              {/* <Link to={`/productDetail/${image._id}`}> */}
              {/* <Link
                to={`/productDetail?product=${image._id}&&attribute=${image.attributeId}`}
                
              > */}
              {/* <Qu to={{ pathname: '/the/path', query: { go: 'nuts' } }}>click me</Qu> */}
              <div
                onClick={() => {
                  if(url==="/productDetail"){
                    navigate(
                      `/productDetail?product=${image._id}&&attribute=${image.attributeId}`
                    );
                    window.location.reload();
                  }else{
                    navigate(
                      `/productDetail?product=${image._id}&&attribute=${image.attributeId}`
                    );
                  }
                }}
              >
                <Product imgproduct={image} />
              </div>
              {/* </Link> */}
            </React.Fragment>
          );
        })}
      </div>
      <ReactPaginate
        breakLabel=""
        nextLabel=">"
        onPageChange={handlePageClick}
        pageRangeDisplayed={6}
        marginPagesDisplayed={0}
        pageCount={pageCount}
        previousLabel="<"
        renderOnZeroPageCount={null}
        containerClassName="pagination"
        pageClassName="page-num"
        previousClassName="page-num"
        nextClassName="page-num"
        activeLinkClassName="active"
      />
    </div>
  );
}
export default images;
