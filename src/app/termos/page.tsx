import { LegalPage, H2 } from "@/components/LegalPage";

export const metadata = {
  title: "Termos de Uso — Revo",
  description: "Termos de uso do Revo.",
};

export default function TermosPage() {
  return (
    <LegalPage titulo="Termos de Uso" atualizado="26 de junho de 2026">
      <p>Ao usar o <b>Revo</b> (getrevo.com.br) você concorda com estes termos. Leia também a{" "}
        <a href="/privacidade">Política de Privacidade</a>.</p>

      <H2>1. O serviço</H2>
      <p>O Revo permite criar páginas de bio-link, funis conversacionais e automações para captar e
        qualificar contatos. Os recursos disponíveis dependem do plano contratado.</p>

      <H2>2. Conta e responsabilidades</H2>
      <p>Você é responsável por manter suas credenciais seguras e pelo conteúdo que publica. Deve usar
        o serviço de forma lícita, obter o consentimento dos contatos que captar e respeitar as regras
        das plataformas integradas (incluindo as políticas da Meta/Instagram).</p>

      <H2>3. Automações de Instagram</H2>
      <p>As automações são executadas conforme as regras que você configura e as permissões que
        concede. Você se compromete a não usá-las para spam ou para violar os Termos da Meta.</p>

      <H2>4. Assinatura e pagamento</H2>
      <p>Planos pagos são cobrados via Stripe conforme o ciclo escolhido. Você pode cancelar a qualquer
        momento; o acesso permanece até o fim do período já pago.</p>

      <H2>5. Inteligência artificial</H2>
      <p>Recursos de IA geram sugestões (resumos, textos, recomendações) que podem conter imprecisões.
        Revise antes de usar; a decisão final é sua.</p>

      <H2>6. Limitação de responsabilidade</H2>
      <p>O serviço é fornecido "como está". Não nos responsabilizamos por indisponibilidades de
        terceiros (Meta, Stripe, etc.) ou por uso indevido da ferramenta.</p>

      <H2>7. Alterações e contato</H2>
      <p>Podemos atualizar estes termos. Dúvidas:{" "}
        <a href="mailto:atendimento@leverpeak.com.br">atendimento@leverpeak.com.br</a>.</p>

      <p style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 28 }}>
        Modelo inicial — recomenda-se revisão jurídica antes do uso comercial definitivo.
      </p>
    </LegalPage>
  );
}
