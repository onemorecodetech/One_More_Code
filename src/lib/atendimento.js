// Horário de atendimento humano da OneMoreCode (fuso de Brasília).
// Online das 08h00 até 23h59; offline da meia-noite até 07h59.
// Para mudar o horário, altere só estes números.
export const ATENDIMENTO = {
  fuso: "America/Sao_Paulo",
  abre: { hora: 8, minuto: 0 },
  fecha: { hora: 24, minuto: 0 }, // 24 = meia-noite
};

// Hora e minuto atuais no fuso de Brasília (regras do fuso, sem deslocamento fixo)
export function horaEm(instante, fuso = ATENDIMENTO.fuso) {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: fuso, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date(instante));
  const v = (t) => Number(p.find((x) => x.type === t).value);
  return { h: v("hour"), m: v("minute"), s: v("second") };
}

export function estaOnline(instante) {
  const { h, m } = horaEm(instante);
  const agora = h * 60 + m;
  return agora >= ATENDIMENTO.abre.hora * 60 + ATENDIMENTO.abre.minuto && agora < ATENDIMENTO.fecha.hora * 60 + ATENDIMENTO.fecha.minuto;
}

// Milissegundos até a próxima troca (às 08h00 ou à meia-noite)
export function msAteProximaTroca(instante) {
  const { h, m, s } = horaEm(instante);
  const agoraSeg = h * 3600 + m * 60 + s;
  const marcos = [ATENDIMENTO.abre.hora * 3600 + ATENDIMENTO.abre.minuto * 60, (ATENDIMENTO.fecha.hora % 24) * 3600 + ATENDIMENTO.fecha.minuto * 60];
  const diffs = marcos.map((mk) => ((mk - agoraSeg + 86400) % 86400) || 86400);
  return Math.min(...diffs) * 1000 - (new Date(instante).getMilliseconds());
}
