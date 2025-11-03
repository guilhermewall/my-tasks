import { eq } from "drizzle-orm";
import type { UserRepository } from "@app/interfaces/user-repository";
import { User } from "@core/entities/user";
import { Email } from "@core/value-objects/email";
import { PasswordHash } from "@core/value-objects/password-hash";
import { db } from "@infra/db/connection";
import { users } from "@infra/db/schema";

/**
 * Implementação de UserRepository usando Drizzle ORM
 * Responsável por mapear entre entidades de domínio (User) e registros do banco (users table)
 */
export class DrizzleUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async create(user: User): Promise<void> {
    const plainUser = user.toPlainObject();

    await db.insert(users).values({
      id: plainUser.id,
      name: plainUser.name,
      email: plainUser.email,
      passwordHash: plainUser.passwordHash,
      createdAt: plainUser.createdAt,
      updatedAt: plainUser.updatedAt,
    });
  }

  async update(user: User): Promise<void> {
    const plainUser = user.toPlainObject();

    await db
      .update(users)
      .set({
        name: plainUser.name,
        email: plainUser.email,
        passwordHash: plainUser.passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, plainUser.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  /**
   * Converte um registro do banco de dados para entidade de domínio User
   * @param row - Registro do banco (users table)
   * @returns Entidade User reconstituída
   */
  private toDomain(row: typeof users.$inferSelect): User {
    return User.reconstitute({
      id: row.id,
      name: row.name,
      email: Email.create(row.email),
      passwordHash: PasswordHash.create(row.passwordHash),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
