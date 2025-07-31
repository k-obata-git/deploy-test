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
    const fetchForm = async () => {
      const res = await fetch(`/api/templates/${templateId}`);
      if (res.ok) {
        const data = await res.json();
        setTemplate(data);
      }
    };

    if (templateId) {
      fetchForm();
    }
  }, [templateId])

  return <FormEditor formTemplate={template} />;
}


