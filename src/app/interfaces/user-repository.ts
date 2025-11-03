import type { User } from "@core/entities/user";

/**
 * Interface de repositório para persistência de usuários
 * Implementações: DrizzleUserRepository (infra/db)
 */
export interface UserRepository {
  /**
   * Busca um usuário pelo email
   * @param email - Email do usuário (normalizado)
   * @returns Usuário encontrado ou null
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca um usuário pelo ID
   * @param id - UUID do usuário
   * @returns Usuário encontrado ou null
   */
  findById(id: string): Promise<User | null>;

  /**
   * Cria um novo usuário no banco de dados
   * @param user - Entidade User a ser persistida
   * @returns void
   */
  create(user: User): Promise<void>;

  /**
   * Atualiza um usuário existente
   * @param user - Entidade User atualizada
   * @returns void
   */
  update(user: User): Promise<void>;

  /**
   * Deleta um usuário pelo ID
   * @param id - UUID do usuário
   * @returns void
   */
  delete(id: string): Promise<void>;
}
