import { LegalPage, H2 } from "@/components/LegalPage";

export const metadata = {
  title: "Exclusão de Dados — Revo",
  description: "Como solicitar a exclusão dos seus dados no Revo, incluindo os obtidos via Instagram.",
};

export default function ExclusaoDeDadosPage() {
  return (
    <LegalPage titulo="Instruções de Exclusão de Dados" atualizado="30 de junho de 2026">
      <p>
        O <b>Revo</b> (getrevo.com.br), operado por <b>LEVERPEAK LTDA</b> (CNPJ 67.097.696/0001-97),
        respeita o seu direito de excluir os dados pessoais que tratamos, em conformidade com a{" "}
        <b>LGPD (Lei nº 13.709/2018)</b> e com as políticas da plataforma Meta. Esta página explica
        como pedir a remoção dos seus dados, inclusive os obtidos por meio da sua conta do Instagram.
      </p>

      <H2>1. Desconectar o Instagram (remoção imediata dos tokens)</H2>
      <p>
        Se você é profissional cliente do Revo e conectou sua conta do Instagram, pode encerrar o
        acesso a qualquer momento dentro do app em <i>Automações → Desconectar</i>. Ao desconectar,
        revogamos e <b>apagamos os tokens de acesso</b> armazenados e interrompemos imediatamente o
        tratamento de comentários e mensagens vindos do Instagram.
      </p>

      <H2>2. Solicitar a exclusão completa da conta e dos dados</H2>
      <p>
        Para excluir <b>todos</b> os seus dados (conta, funis, leads, materiais e dados de integração),
        envie um e-mail para{" "}
        <a href="mailto:atendimento@leverpeak.com.br">atendimento@leverpeak.com.br</a> a partir do
        e-mail cadastrado, com o assunto <b>“Exclusão de dados”</b>. Para confirmarmos sua identidade,
        informe o e-mail da conta e, se aplicável, o <b>@ do Instagram</b> conectado.
      </p>
      <p>
        Concluímos a exclusão em até <b>30 dias</b> e confirmamos por e-mail. Podemos reter o mínimo
        necessário para cumprir obrigações legais (ex.: fiscais), conforme descrito na nossa{" "}
        <a href="/privacidade">Política de Privacidade</a>.
      </p>

      <H2>3. Se você é um lead (contato captado por um funil)</H2>
      <p>
        Os dados de leads pertencem ao profissional dono do funil. Você pode pedir a exclusão
        diretamente a esse profissional ou escrever para{" "}
        <a href="mailto:atendimento@leverpeak.com.br">atendimento@leverpeak.com.br</a> que
        encaminhamos a solicitação ao responsável.
      </p>

      <H2>4. Dados obtidos da Meta/Instagram</H2>
      <p>
        Os identificadores, comentários e mensagens obtidos via Instagram são usados <b>somente</b>{" "}
        para executar as automações que você configurou e são removidos ao desconectar a conta ou ao
        concluir a exclusão da conta. Não vendemos nem usamos esses dados para perfis publicitários.
      </p>

      <H2>5. Contato</H2>
      <p>
        Dúvidas ou pedidos de exclusão:{" "}
        <a href="mailto:atendimento@leverpeak.com.br">atendimento@leverpeak.com.br</a>.
      </p>
    </LegalPage>
  );
}
