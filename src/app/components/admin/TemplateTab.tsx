'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Form, InputGroup, Pagination, Card } from 'react-bootstrap';
import { sortBy } from '../../../../lib/sort';
import { Template } from '../../../../types/formType';

const PAGE_SIZE = 5;
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

export default function TemplateTab() {
  const isMobile = useIsMobile();
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<"" | "title" | "description">("");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTemplates = async () => {
    const res = await fetch('/api/admin/templates');
    const data = await res.json();
    setTemplates(data);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filtered = templates.filter((t: Template) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = sortBy(filtered, sortKey, sortAsc);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);

  const handleSort = (key: "" | "title" | "description") => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <>
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="テンプレートを検索"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </InputGroup>

      {isMobile ? (
        <div>
          {paginated.map((t: Template) => (
            <Card key={t.id} className="mb-3" bg="light" text="dark">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <Card.Title className="mb-0">{t.title}</Card.Title>
                </div>
                <Card.Subtitle className="mb-2 text-muted">{t.description}</Card.Subtitle>
                <div className="d-flex justify-content-end">
                  <Button variant="warning" size="sm" className="me-2">編集</Button>
                  <Button variant="danger" size="sm">削除</Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th style={{ cursor: "pointer", width: "60%", minWidth: "60%" }} onClick={() => handleSort("title")}>
                タイトル {sortKey === 'title' ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => handleSort("description")}>
                説明 {sortKey === 'description' ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={{width: "7.5rem", minWidth: "7.5rem"}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((t: Template) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.description}</td>
                <td className="text-center">
                  <Button variant="warning" size="sm" className="me-2">編集</Button>
                  <Button variant="danger" size="sm">削除</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination className="d-flex justify-content-center">
        {[...Array(pageCount)].map((_, idx) => (
          <Pagination.Item
            key={idx}
            active={idx + 1 === currentPage}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </>
  );
}
