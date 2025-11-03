/**
 * Interface para hash e verificação de senhas
 * Implementações: BcryptPasswordHasher (infra/auth)
 */
export interface PasswordHasher {
  /**
   * Cria um hash bcrypt para a senha
   * @param password - Senha em texto plano
   * @returns Hash bcrypt da senha
   */
  hash(password: string): Promise<string>;

  /**
   * Verifica se a senha corresponde ao hash
   * @param password - Senha em texto plano
   * @param hash - Hash bcrypt para comparar
   * @returns true se a senha corresponde, false caso contrário
   */
  verify(password: string, hash: string): Promise<boolean>;
}
