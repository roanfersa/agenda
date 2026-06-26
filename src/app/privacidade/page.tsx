import { LegalPage, H2 } from "@/components/LegalPage";

export const metadata = {
  title: "Política de Privacidade — Revo",
  description: "Como o Revo coleta, usa e protege os dados, incluindo os obtidos via Instagram.",
};

export default function PrivacidadePage() {
  return (
    <LegalPage titulo="Política de Privacidade" atualizado="26 de junho de 2026">
      <p>
        O <b>Revo</b> (getrevo.com.br) é uma ferramenta que ajuda profissionais autônomos a criarem
        páginas de bio-link e funis que captam e qualificam contatos. Esta política explica quais
        dados tratamos, como e por quê, em conformidade com a <b>LGPD (Lei nº 13.709/2018)</b> e com
        as políticas da plataforma Meta.
      </p>

      <H2>1. Quem somos</H2>
      <p>
        O Revo é um produto operado por <b>LEVERPEAK LTDA</b>, inscrita no CNPJ{" "}
        <b>67.097.696/0001-97</b>, com sede na Av. Paulista, 1636, conj. 4, sala 1504, Bela Vista,
        São Paulo/SP, CEP 01.310-200. Controlador dos dados nos termos da LGPD. Contato:{" "}
        <a href="mailto:atendimento@leverpeak.com.br">atendimento@leverpeak.com.br</a>.
      </p>

      <H2>2. Dados que coletamos</H2>
      <p><b>Do profissional (cliente do Revo):</b> nome, e-mail, WhatsApp, @ do Instagram, especialidade,
        foto/identidade visual e dados de assinatura (processados pela Stripe — não armazenamos dados
        de cartão).</p>
      <p><b>Dos visitantes/leads dos funis:</b> nome, WhatsApp, e-mail e as respostas que a pessoa
        fornece no funil, sempre mediante consentimento explícito.</p>
      <p><b>Da integração com o Instagram</b> (quando o profissional conecta sua conta): identificador e
        nome de usuário da conta, comentários públicos feitos em publicações do profissional e
        mensagens diretas relacionadas a essas interações. Usamos isso exclusivamente para executar a
        automação que o próprio profissional configurou (ex.: responder a um comentário e enviar uma
        mensagem com o link do funil).</p>

      <H2>3. Como usamos os dados</H2>
      <p>Para operar o serviço: publicar funis, registrar e qualificar leads, agendar atendimentos,
        executar automações de comentário→mensagem no Instagram, gerar resumos e recomendações por
        inteligência artificial e processar a assinatura. Não vendemos seus dados nem os usamos para
        publicidade de terceiros.</p>

      <H2>4. Compartilhamento e subprocessadores</H2>
      <p>Compartilhamos dados apenas com prestadores necessários à operação, sob contrato:</p>
      <ul>
        <li><b>Supabase</b> — banco de dados e autenticação.</li>
        <li><b>Stripe</b> — processamento de pagamentos.</li>
        <li><b>Anthropic (Claude)</b> — geração de resumos/recomendações por IA.</li>
        <li><b>Meta / Instagram</b> — integração de comentários e mensagens, conforme as permissões
          que você autoriza.</li>
      </ul>

      <H2>5. Dados obtidos da plataforma Meta/Instagram</H2>
      <p>Os dados obtidos via Instagram são usados <b>somente</b> para as funcionalidades solicitadas
        pelo profissional e <b>não</b> são vendidos, alugados ou usados para construir perfis
        publicitários. O profissional pode desconectar sua conta a qualquer momento em
        <i> Automações → Desconectar</i>, o que encerra o acesso e remove os tokens armazenados.</p>

      <H2>6. Retenção</H2>
      <p>Mantemos os dados enquanto a conta estiver ativa e pelo tempo necessário às finalidades
        acima ou a obrigações legais. Após a exclusão da conta ou do dado, removemos as informações
        em prazo razoável.</p>

      <H2>7. Seus direitos e exclusão de dados (LGPD)</H2>
      <p>Você pode solicitar acesso, correção, portabilidade ou <b>exclusão</b> dos seus dados, bem
        como revogar consentimentos. Para isso, escreva para{" "}
        <a href="mailto:atendimento@leverpeak.com.br">atendimento@leverpeak.com.br</a> ou, no caso de leads,
        acione o profissional responsável pelo funil. Profissionais podem desconectar o Instagram a
        qualquer momento para interromper o tratamento desses dados.</p>

      <H2>8. Segurança</H2>
      <p>Adotamos isolamento por usuário (RLS), criptografia em trânsito (HTTPS) e restrição de acesso
        a credenciais sensíveis. Tokens de integração ficam acessíveis apenas no servidor.</p>

      <H2>9. Alterações</H2>
      <p>Podemos atualizar esta política; mudanças relevantes serão comunicadas pelos canais do
        serviço.</p>

      <H2>10. Contato</H2>
      <p>Dúvidas sobre privacidade: <a href="mailto:atendimento@leverpeak.com.br">atendimento@leverpeak.com.br</a>.</p>

      <p style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 28 }}>
        Este documento é um modelo inicial e deve ser revisado por assessoria jurídica antes do uso
        comercial definitivo.
      </p>
    </LegalPage>
  );
}
