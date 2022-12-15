import React from "react";
import { useState } from "react";
import { Row, Col } from "antd";
import { Modal, Timeline, Table, Tag, Badge, Space, Dropdown } from "antd";
import { DownOutlined, SmileOutlined } from "@ant-design/icons";

const items = [
  {
    key: "1",
    label: "View Note",
  },
  {
    key: "2",
    label: "Add Note",
  },
];

function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("None");

  const expandedRowRender = () => {
    const columns = [
      {
        title: "Packtype",
        dataIndex: "pcktype",
        key: "pcktype",
      },
      {
        title: "Size",
        dataIndex: "size",
        key: "size",
      },
      {
        title: "Size(mm)",
        dataIndex: "msize",
        key: "msize",
      },
      {
        title: "Man Power",
        dataIndex: "mpow",
        key: "mpow",
      },
      {
        title: "Allergen",
        dataIndex: "allergen",
        key: "allergen",
        render: (_, { allergen }) => (
          <>
            {allergen.map((all) => {
              let color = all.length > 5 ? "geekblue" : "green";
              if (all === "sulphite") {
                color = "volcano";
              }
              return (
                <Tag color={color} key={all}>
                  {all.toUpperCase()}
                </Tag>
              );
            })}
          </>
        ),
      },
      {
        title: "Product/sec",
        dataIndex: "psec",
        key: "psec",
      },
      {
        title: "Station",
        dataIndex: "station",
        key: "station",
      },
      {
        title: "Status",
        key: "status",
        render: () => (
          <span>
            <Badge status="success" />
            In Progress
          </span>
        ),
      },
      {
        title: "Action",
        dataIndex: "ops",
        key: "ops",
        render: () => (
          <Space size="middle">
            <a>Remove</a>
            <a>Update</a>
            <Dropdown
              menu={{
                items,
              }}
            >
              <a>
                More <DownOutlined />
              </a>
            </Dropdown>
          </Space>
        ),
      },
    ];
    const data = [];

    data.push({
      pcktype: "DoyPack",
      size: "Large",
      msize: "120-200 MM",
      mpow: "340 Employee",
      psec: "140P/sec",
      station: "D2 (Recommended)",
      allergen: ["Soybeans", "T", "W"],
    });
    data.push({
      pcktype: "DoyPack",
      size: "Small",
      msize: "150-200 MM",
      mpow: "310 Employee",
      psec: "140P/sec",
      station: "D7 (Recommended)",
      allergen: ["T", "W"],
    });
    data.push({
      pcktype: "DoyPack",
      size: "Medium",
      msize: "110-170 MM",
      mpow: "125 Employee",
      psec: "108P/sec",
      station: "D9 (Recommended)",
      allergen: ["W", "sulphite"],
    });

    const handleTableClick = (rec, i, e) => {
      setModalOpen(true);
      setTitle(rec.station);
    };

    const closeModal = () => {
      setModalOpen(false);
    };

    return (
      <div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          onRow={(record, index) => {
            return {
              onClick: (event) => handleTableClick(record, index, event),
            };
          }}
        />
        <Modal
          title={"Timeline of " + title}
          footer={null}
          open={modalOpen}
          onCancel={closeModal}
        >
          <Timeline>
            <Timeline.Item color="green">
              Create a services site 2015-09-01
            </Timeline.Item>
            <Timeline.Item color="green">
              Create a services site 2015-09-01
            </Timeline.Item>
            <Timeline.Item color="red">
              <p>Solve initial network problems 1</p>
              <p>Solve initial network problems 2</p>
              <p>Solve initial network problems 3 2015-09-01</p>
            </Timeline.Item>
            <Timeline.Item>
              <p>Technical testing 1</p>
              <p>Technical testing 2</p>
              <p>Technical testing 3 2015-09-01</p>
            </Timeline.Item>
            <Timeline.Item color="gray">
              <p>Technical testing 1</p>
              <p>Technical testing 2</p>
              <p>Technical testing 3 2015-09-01</p>
            </Timeline.Item>
            <Timeline.Item color="gray">
              <p>Technical testing 1</p>
              <p>Technical testing 2</p>
              <p>Technical testing 3 2015-09-01</p>
            </Timeline.Item>
            <Timeline.Item color="#00CCFF" dot={<SmileOutlined />}>
              <p>Custom color testing</p>
            </Timeline.Item>
          </Timeline>
        </Modal>
      </div>
    );
  };
  const columns = [
    {
      title: "PO#",
      dataIndex: "po",
      key: "po",
    },
    {
      title: "Part Description",
      dataIndex: "pdesc",
      key: "pdesc",
    },
    {
      title: "Pack Type",
      dataIndex: "pcktyp",
      key: "pcktyp",
    },
    {
      title: "Wt(Oz)",
      dataIndex: "wtoz",
      key: "wtoz",
    },
    {
      title: "Action",
      key: "operation",
      render: () => (
        <Space size="middle">
          <a>Remove</a>
          <a>Update</a>
          <Dropdown
            menu={{
              items,
            }}
          >
            <a>
              More <DownOutlined />
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ];
  const data = [];

  data.push({
    key: "demo100",
    po: "PO#0000",
    pdesc: "Awesome product",
    pcktyp: "DoyPack",
    wtoz: "2000 Oz",
  });
  data.push({
    key: "demo101",
    po: "PO#0000",
    pdesc: "Awesome product",
    pcktyp: "DoyPack",
    wtoz: "2000 Oz",
  });

  data.push({
    key: "demo102",
    po: "PO#4622",
    pdesc: "Fascinating product",
    pcktyp: "Multipack",
    wtoz: "12 Oz",
  });
  data.push({
    key: "demo103",
    po: "PO#4622",
    pdesc: "Fascinating product",
    pcktyp: "Multipack",
    wtoz: "12 Oz",
  });
  data.push({
    key: "demo104",
    po: "PO#2837",
    pdesc: "Fantastic product",
    pcktyp: "Single Pack",
    wtoz: "26 Oz",
  });
  data.push({
    key: "demo105",
    po: "PO#2837",
    pdesc: "Fantastic product",
    pcktyp: "Single Pack",
    wtoz: "26 Oz",
  });

  return (
    <Row>
      <Col xs={2} sm={4} md={6} lg={8} xl={4}></Col>
      <Col xs={20} sm={16} md={12} lg={8} xl={16}>
        <Table
          columns={columns}
          expandable={{ expandedRowRender, defaultExpandedRowKeys: ["0"] }}
          dataSource={data}
        />
      </Col>
      <Col xs={2} sm={4} md={6} lg={8} xl={4}></Col>
    </Row>
  );
}

export { Home };
