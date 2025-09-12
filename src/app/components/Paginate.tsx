import { Pagination } from 'react-bootstrap';
import { PAGINATION } from '../../../constants/pagination';

export default function Paginate({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pageNumbers: (number | string)[] = [];

  const addPage = (page: number) => {
    if (page > 1 && page < totalPages) {
      pageNumbers.push(page);
    }
  };

  // 先頭
  pageNumbers.push(1);

  if (currentPage - PAGINATION.PAGE_RANGE > 2) {
    pageNumbers.push('…');
  }

  for (let i = currentPage - PAGINATION.PAGE_RANGE; i <= currentPage + PAGINATION.PAGE_RANGE; i++) {
    addPage(i);
  }

  if (currentPage + PAGINATION.PAGE_RANGE < totalPages - 1) {
    pageNumbers.push('…');
  }

  // 末尾
  if (totalPages > 1) {
    pageNumbers.push(totalPages);
  }

  return (
    <Pagination>
      <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
      {pageNumbers.map((p, i) =>
        typeof p === 'number' ? (
          <Pagination.Item key={i} active={p === currentPage} onClick={() => onPageChange(p)}>{p}</Pagination.Item>
        ) : (
          <Pagination.Ellipsis key={i} disabled />
        )
      )}
      <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
    </Pagination>
  );
}
