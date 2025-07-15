'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

// ラベル変換マップ（必要に応じて拡張）
const LABEL_MAP: Record<string, string> = {
  dashboard: 'ダッシュボード',
  forms: 'フォーム一覧',
  results: '回答結果',
  preview: 'プレビュー',
  edit: '編集',
  new: '作成',
};

export default function BreadcrumbsAuto() {
  const router = useRouter();
  const pathname = usePathname(); // 例: "/forms/123/results"
  const segments = pathname.split('/').filter((seg: any) => isNaN(seg) && seg !== "dashboard"); // ['', 'forms', '123', 'results'] → ['forms', '123', 'results']

  const crumbs = segments.map((segment: any, index: number) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = LABEL_MAP[segment] || decodeURIComponent(segment);
    return {
      label,
      href: index === segments.length - 1 ? undefined : href, // 最後はリンクにしない
    };
  });

  return (
    <Breadcrumb>
      <Breadcrumb.Item className="text-decoration-none" onClick={() => router.push(`/dashboard`)} hidden={pathname === `/dashboard`}>ダッシュボード</Breadcrumb.Item>
      <span className="ms-2 me-2" hidden={pathname === `/dashboard`}>/</span>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={i}>
          {crumb.href ? (
            <React.Fragment key={i}>
              <Breadcrumb.Item className="text-decoration-none" key={i} active={!crumb.href } onClick={() => crumb.href ? router.push(crumb.href) : {}}>{crumb.label}</Breadcrumb.Item>
              <span className="ms-2 me-2">/</span>
            </React.Fragment>
          ) : (
            crumb.label
          )}
        </React.Fragment>
      ))}
    </Breadcrumb>
  );
}
