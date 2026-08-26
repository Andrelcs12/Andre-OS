import { BasePage } from "@/components/app-shell/base-page";
export default function LinksPage() {
  return (
    <BasePage
      title="Links"
      description="Centralize referências, leituras e recursos salvos."
      actionLabel="+ Salvar link"
      emptyMessage="Nenhum link salvo."
    />
  );
}
