"use client";

import FormEditor from "@/app/components/FormEditor"
import { useParams } from "next/navigation";
import { Button } from "react-bootstrap";

export default function EditFormPage() {
  const { id } = useParams();

  const openResults = () => {
    window.open(`${new URL(window.location.href).origin}/public/${id}`, '_blank')
  }

  return (
    <>
      <div className="d-flex justify-content-end gap-3" hidden={!!id}>
        <Button size="sm" variant="outline-secondary" onClick={openResults}>回答ページ</Button>
      </div>
      <FormEditor />
    </>
  )
}
