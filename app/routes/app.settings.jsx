// app/routes/app.settings.jsx
import { useEffect, useState } from "react";
import { Page, Card, FormLayout, TextField, Checkbox, Button, Banner } from "@shopify/polaris";

export default function Settings() {
  const [embedHint, setEmbedHint] = useState(true);
  const [docsUrl, setDocsUrl] = useState("https://vichome.es/pages/ayuda-o-docs");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = window.localStorage.getItem("schema-advanced-settings");
    if (s) {
      try {
        const parsed = JSON.parse(s);
        if (typeof parsed.embedHint === "boolean") setEmbedHint(parsed.embedHint);
        if (parsed.docsUrl) setDocsUrl(parsed.docsUrl);
      } catch {}
    }
  }, []);

  const onSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "schema-advanced-settings",
        JSON.stringify({ embedHint, docsUrl })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <Page title="Ajustes">
      <Card sectioned>
        {saved && <Banner status="success" title="Ajustes guardados" />}
        <FormLayout>
          <Checkbox
            label="Mostrar aviso para activar App embed"
            checked={embedHint}
            onChange={setEmbedHint}
          />
          <TextField label="URL de documentación" value={docsUrl} onChange={setDocsUrl} />
          <Button primary onClick={onSave}>Guardar</Button>
        </FormLayout>
      </Card>
    </Page>
  );
}
