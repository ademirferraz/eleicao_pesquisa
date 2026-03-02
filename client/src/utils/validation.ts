/**
 * Valida um CPF usando o algoritmo de dígito verificador
 * @param cpf - CPF formatado ou não (ex: "123.456.789-01" ou "12345678901")
 * @returns true se CPF é válido, false caso contrário
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres especiais
  const cleaned = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;

  return true;
}

/**
 * Valida uma data de nascimento
 * @param dateString - Data no formato DD/MM/AAAA
 * @returns true se data é válida, false caso contrário
 */
export function isValidDate(dateString: string): boolean {
  const parts = dateString.split("/");
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Validação básica de intervalo
  if (day < 1 || day > 31 || month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  // Validação de dia válido para o mês
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day) return false;

  return true;
}

/**
 * Calcula a idade a partir de uma data de nascimento
 * @param dateString - Data no formato DD/MM/AAAA
 * @returns idade em anos, ou -1 se data inválida
 */
export function calculateAge(dateString: string): number {
  if (!isValidDate(dateString)) return -1;

  const parts = dateString.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Verifica se a idade é válida para votação (mínimo 16 anos)
 * @param dateString - Data no formato DD/MM/AAAA
 * @returns true se idade >= 16, false caso contrário
 */
export function isValidVotingAge(dateString: string): boolean {
  const age = calculateAge(dateString);
  return age >= 16;
}
