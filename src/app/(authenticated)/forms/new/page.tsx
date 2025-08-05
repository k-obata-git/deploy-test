"use client";

import FormEditor from "@/app/components/FormEditor"
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Template } from "../../../../../types/formType";

export default function NewFormPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (templateId) {
      fetch(`/api/templates/${templateId}`, {
        method: 'GET',
      }).then((res) => {
        if(res.ok) {
          return res.json();
        }
      }).then((data) => {
        setTemplate(data);
      }).finally(() => {

      });
    }
  }, [templateId])

  return <FormEditor formTemplate={template} />;
}


