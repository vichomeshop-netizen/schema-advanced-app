// app/routes/app.products.jsx
import { Page, Card, IndexTable, Text } from "@shopify/polaris";

export default function Products() {
  const rows = []; // Conecta después a Admin API si quieres datos reales

  return (
    <Page title="Productos">
      <Card>
        {rows.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Text as="p" variant="bodyMd">No hay productos cargados en el panel.</Text>
            <Text as="p" variant="bodySm" tone="subdued">
              (El valor principal está en el App embed del tema; esta vista es informativa.)
            </Text>
          </div>
        ) : (
          <IndexTable
            resourceName={{ singular: "producto", plural: "productos" }}
            itemCount={rows.length}
            headings={[{ title: "ID" }, { title: "Título" }, { title: "Estado" }]}
            selectable={false}
          >
            {rows.map((r, index) => (
              <IndexTable.Row id={r.id} key={r.id} position={index}>
                <IndexTable.Cell><Text as="span" variant="bodySm">{r.id}</Text></IndexTable.Cell>
                <IndexTable.Cell>{r.title}</IndexTable.Cell>
                <IndexTable.Cell>{r.status}</IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        )}
      </Card>
    </Page>
  );
}
