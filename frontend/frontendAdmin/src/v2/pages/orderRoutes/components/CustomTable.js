import React from "react";
import { Button, Table, Input, Space, Popconfirm  } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,SearchOutlined 
} from "@ant-design/icons";
import {
  NumberFormatter,
  BoldText,
  ColorStatus,
} from "../../../components/subComponents";
import { PropsTable } from "../../../config/props";
import { handleOpenNewPage } from "../../../config/helperFuncs";
import Highlighter from 'react-highlight-words';  
import { useState } from "react";
import { useRef } from "react";

function CustomTable({
  handleClick_EditStatus,
  handleConfirmDelete,
  loading,
  handleMouseLeaveCreate,
  totalDocs,
  orders,
}) {
  const [value, setValue] = useState('');
  const [dataSource, setDataSource] = useState(orders);

    const FilterByNameInput = (
      <Input
        placeholder="Search Name"
        value={value}
        onChange={e => {
          const currValue = e.target.value;
          setValue(currValue);
          const filteredData = orders.filter(entry =>
            entry.formattedFullName.includes(currValue)
          );
          setDataSource(filteredData);
        }}
      />
    );
  // const [searchText, setSearchText] = useState('');
  // const [searchedColumn, setSearchedColumn] = useState('');
  // const searchInput = useRef(null);
  // const handleSearch = (selectedKeys, confirm, dataIndex) => {
    
  //   confirm();
  //   setSearchText(selectedKeys[0]);
  //   setSearchedColumn(dataIndex);
  // };
  // const handleReset = (clearFilters) => {
  //   clearFilters();
  //   setSearchText('');
  // };
  // const getColumnSearchProps = (dataIndex) => ({
  //   filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
  //     <div
  //       style={{
  //         padding: 8,
  //       }}
  //       onKeyDown={(e) => e.stopPropagation()}
  //     >
  //       <Input
  //         ref={searchInput}
  //         placeholder={`Search ${dataIndex}`}
  //         value={selectedKeys[0]}
  //         onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
  //         onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
  //         style={{
  //           marginBottom: 8,
  //           display: 'block',
  //         }}
  //       />
  //       <Space>
  //         <Button
  //           type="primary"
  //           onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
  //           icon={<SearchOutlined />}
  //           size="small"
  //           style={{
  //             width: 90,
  //           }}
  //         >
  //           Search
  //         </Button>
  //         <Button
  //           onClick={() => clearFilters && handleReset(clearFilters)}
  //           size="small"
  //           style={{
  //             width: 90,
  //           }}
  //         >
  //           Reset
  //         </Button>
  //         <Button
  //           type="link"
  //           size="small"
  //           onClick={() => {
  //             confirm({
  //               closeDropdown: false,
  //             });
  //             setSearchText(selectedKeys[0]);
  //             setSearchedColumn(dataIndex);
  //           }}
  //         >
  //           Filter
  //         </Button>
  //         <Button
  //           type="link"
  //           size="small"
  //           onClick={() => {
  //             close();
  //           }}
  //         >
  //           close
  //         </Button>
  //       </Space>
  //     </div>
  //   ),
  //   filterIcon: (filtered) => (
  //     <SearchOutlined
  //       style={{
  //         color: filtered ? '#1890ff' : undefined,
  //       }}
  //     />
  //   ),
  //   onFilter: (value, record) =>
  //     record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  //   onFilterDropdownOpenChange: (visible) => {
  //     if (visible) {
  //       setTimeout(() => searchInput.current?.select(), 100);
  //     }
  //   },
  //   render: (text) =>
  //     searchedColumn === dataIndex ? (
  //       <Highlighter
  //         highlightStyle={{
  //           backgroundColor: '#ffc069',
  //           padding: 0,
  //         }}
  //         searchWords={[searchText]}
  //         autoEscape
  //         textToHighlight={text ? text.toString() : ''}
  //       />
  //     ) : (
  //       text
  //     ),
  // });


  const columns = [
    {
      title: "Mã đơn hàng ",
      key: "_id",
      dataIndex: "orderCode",
      width: "9%",
      fixed: "left",
      render: (text) => {
        return <BoldText title={text} />;
      },
      // ...getColumnSearchProps('orderCode'),
    },

    {
      title: "Ngày đặt hàng",
      width: "5%",
      key: "formattedCreatedDate",
      dataIndex: "formattedCreatedDate",
    },
    {
       title: FilterByNameInput,
      width: "8%",
      key: "formattedFullName",
      dataIndex: "formattedFullName",
      // ...getColumnSearchProps('formattedFullName'),
    },
    {
      title: "Trạng thái",
      width: "7%",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        return <ColorStatus status={status} />;
      },
      filters: [
        {
          text: "WAITING",
          value: "WAITING",
        },
        {
          text: "SHIPPING",
          value: "SHIPPING",
        },
        {
          text: "COMPLETED",
          value: "COMPLETED",
        },
        {
          text: "CANCELED",
          value: "CANCELED",
        }
      ],
      onFilter: (value, record) => record.status.indexOf(value) === 0,
    },

    {
      title: "Ngày gửi hàng",
      width: "5%",
      key: "formattedSendingDate",
      dataIndex: "formattedSendingDate",
    },

    {
      title: "Tổng tiền",
      key: "totalPrice",
      dataIndex: "totalPrice",
      width: "6%",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (text) => {
        return <NumberFormatter text={text} />;
      },
    },

    {
      title: "Ngày nhận hàng",
      width: "5%",
      key: "formattedReceivedDate",
      dataIndex: "formattedReceivedDate",
    },

    {
      title: "Thao tác",
      key: "actions",
      width: "5%",
      fixed: "right",
      render: (record) => {
        return (
          <div className="divActs">
            <Button
              icon={<EditOutlined />}
              type="primary"
              title="Đổi trạng thái"
              onClick={() => handleClick_EditStatus(record)}
            ></Button>
            <Button
              icon={<EllipsisOutlined />}
              type="primary"
              title="Chi tiết"
              onClick={() => {
                handleOpenNewPage({ path: "/orderDetail", params: record._id });
              }}
            ></Button>
            <Popconfirm
              overlayInnerStyle={{ width: 300 }}
              title="Bạn muốn xóa không ?"
              okText="Đồng ý"
              cancelText="Đóng"
              onConfirm={() => handleConfirmDelete(record._id)}
            >
              <Button
                icon={<DeleteOutlined />}
                type="primary"
                danger
                style={{ fontWeight: 600 }}
                onClick={() => {}}
                title="Xóa"
              ></Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  return (
    <Table
      {...PropsTable({
        title: "danh sách đơn đặt hàng",
        isLoading: loading,
      })}
      onRow={() => {
        return { onClick: handleMouseLeaveCreate };
      }}
      columns={columns}
      dataSource={dataSource}
      pagination={{
        total: totalDocs,
        showTotal: (totalDocs, range) =>
          `${range[0]}-${range[1]} of ${totalDocs} items`,
        defaultPageSize: 10,
        defaultCurrent: 1,
      }}
    />
  );
}

export default CustomTable;
