'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Form, InputGroup, Pagination, Card } from 'react-bootstrap';
import { sortBy } from '../../../../lib/sort';
import { Question } from '../../../../types/formType';
import { BsCardList, BsCheckSquare, BsFileFont, BsQuestionCircle, BsUiRadios } from 'react-icons/bs';

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

export default function MasterQuestionTab() {
  const isMobile = useIsMobile();
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<"" | "label" | "type">("");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchQuestions = async () => {
    const res = await fetch('/api/admin/master-questions');
    const data = await res.json();
    setQuestions(data);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filtered = questions.filter((q: Question) =>
    q.label.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = sortBy(filtered, sortKey, sortAsc);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);

  const getIconByType = (type: string) => {
    switch (type) {
      case 'text':
        return <span><BsFileFont />テキスト</span>;
      case 'radio':
        return <span><BsUiRadios />ラジオ</span>;
      case 'checkbox':
        return <span><BsCheckSquare />チェックボックス</span>;
      case 'select':
        return <span><BsCardList />セレクトボックス</span>;
      default:
        return <BsQuestionCircle />;
    }
  };

  const handleSort = (key: "label" | "type") => {
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
          placeholder="質問を検索"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </InputGroup>

      {isMobile ? (
        <div>
          {paginated.map((q: Question) => (
            <Card key={q.id} className="mb-3" bg="light" text="dark">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <Card.Title className="mb-0">{q.label}</Card.Title>
                </div>
                <div className="d-flex align-items-center mb-2">
                  {getIconByType(q.type)}
                </div>
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
              <th style={{ cursor: "pointer", width: "60%", minWidth: "60%" }} onClick={() => handleSort("label")}>
                ラベル {sortKey === 'label' ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => handleSort("type")}>
                タイプ {sortKey === "type" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={{width: "7.5rem", minWidth: "7.5rem"}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((q: Question) => (
              <tr key={q.id}>
                <td>{q.label}</td>
                <td>{q.type}</td>
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
