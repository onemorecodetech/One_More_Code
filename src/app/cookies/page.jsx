import Link from "next/link";
import PaginaLegal from "../../components/legal/pagina-legal";

export const metadata = { title: "Aviso de Cookies | OneMoreCode", description: "Quais cookies o site da OneMoreCode utiliza.", alternates: { canonical: "/cookies" } };

export default function Cookies() {
  return (
    <PaginaLegal atual="/cookies" titulo="Aviso de Cookies"
      resumo="O site usa apenas o essencial para funcionar. Não usamos cookies de publicidade nem de análise de comportamento.">
      <h2>1. O que são cookies</h2>
      <p>Cookies são pequenos arquivos guardados pelo navegador para lembrar informações entre uma página e outra, como o fato de você estar conectado.</p>

      <h2>2. Cookies que usamos</h2>
      <div className="overflow-x-auto"><table>
        <thead><tr><th>Nome</th><th>Tipo</th><th>Para que serve</th><th>Duração</th></tr></thead>
        <tbody>
          <tr><td>omc_sessao</td><td>Essencial (próprio)</td><td>Mantém você conectado na área do cliente ou no painel. Só é criado quando você faz login.</td><td>Até 7 dias ou até você clicar em “Sair”</td></tr>
        </tbody>
      </table></div>
      <p>Também guardamos no seu navegador (armazenamento local, não é um cookie) apenas a informação de que você já viu o aviso de cookies, para não mostrá-lo de novo.</p>

      <h2>3. Por que não pedimos consentimento</h2>
      <p>Cookies essenciais são necessários para o funcionamento do serviço que você solicitou, como o login. Se um dia passarmos a usar cookies não essenciais (de estatística ou publicidade), eles só serão ativados com a sua autorização.</p>

      <h2>4. Como controlar</h2>
      <p>Você pode apagar ou bloquear cookies nas configurações do navegador. Se bloquear o cookie de sessão, não será possível entrar na área do cliente.</p>

      <p>Mais informações na <Link href="/privacidade">Política de Privacidade</Link>.</p>
    </PaginaLegal>
  );
}
