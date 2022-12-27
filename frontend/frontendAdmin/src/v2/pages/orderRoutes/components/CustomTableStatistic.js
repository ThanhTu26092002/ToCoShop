import React, { useEffect } from "react";
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
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });


  const columns = [
    {
      title: "Mã đơn hàng ",
      key: "_id",
      dataIndex: "orderCode",
      width: "6%",
      fixed: "left",
      render: (text) => {
        return <BoldText title={text} />;
      },
      ...getColumnSearchProps('orderCode', "mã đơn hàng"),
    },

    {
      title: "Ngày đặt hàng",
      width: "5%",
      key: "formattedCreatedDate",
      dataIndex: "formattedCreatedDate",
      ...getColumnSearchProps('formattedCreatedDate',"ngày đặt hàng"),
    },
    {
       title: "Tên người đặt hàng",
      width: "8%",
      key: "formattedFullName",
      dataIndex: "formattedFullName",
      ...getColumnSearchProps('formattedFullName', "tên người đặt hàng"),
    },
    {
      title: "Trạng thái",
      width: "5%",
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
      width: "4%",
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
      title: "Nơi nhận hàng",
      width: "12%",
      key: "formattedShippingAddress",
      dataIndex: "formattedShippingAddress",
      ...getColumnSearchProps('formattedShippingAddress', 'nơi nhận hàng'),

    },

    {
      title: "Thao tác",
      key: "actions",
      width: "4%",
      fixed: "right",
      render: (record) => {
        return (
          <div className="divActs">
            {/* <Button
              icon={<EditOutlined />}
              type="primary"
              title="Đổi trạng thái"
              onClick={() => handleClick_EditStatus(record)}
            ></Button> */}
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
      dataSource={orders}
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
