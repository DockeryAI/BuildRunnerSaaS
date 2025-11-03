/**
 * @file database-tables.ts
 * Types and interfaces for database table schemas
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

/**
 * Base entity with common fields for all tables
 */
@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn() 
  updatedAt!: Date;
}

/**
 * User table schema
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];
}

/**
 * Post table schema
 */
@Entity('posts')
export class Post extends BaseEntity {
  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @Column({ default: false })
  published!: boolean;

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column()
  authorId!: string;

  @OneToMany(() => Comment, comment => comment.post)
  comments!: Comment[];
}

/**
 * Comment table schema
 */
@Entity('comments')
export class Comment extends BaseEntity {
  @Column('text')
  content!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column()
  authorId!: string;

  @ManyToOne(() => Post, post => post.comments)
  @JoinColumn({ name: 'postId' })
  post!: Post;

  @Column()
  postId!: string;
}

/**
 * Tag table schema
 */
@Entity('tags')
export class Tag extends BaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;
}

/**
 * Post-Tag many-to-many join table
 */
@Entity('post_tags')
export class PostTag extends BaseEntity {
  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post!: Post;

  @Column()
  postId!: string;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'tagId' })
  tag!: Tag;

  @Column()
  tagId!: string;
}

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  type: 'postgres' | 'mysql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: any[];
  synchronize: boolean;
  logging: boolean;
}

/**
 * Database error types
 */
export enum DatabaseErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FOREIGN_KEY_ERROR = 'FOREIGN_KEY_ERROR',
  UNIQUE_CONSTRAINT_ERROR = 'UNIQUE_CONSTRAINT_ERROR'
}

/**
 * Custom database error class
 */
export class DatabaseError extends Error {
  constructor(
    public type: DatabaseErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Database migration interface
 */
export interface Migration {
  up(): Promise<void>;
  down(): Promise<void>;
}

/**
 * Validation rules type
 */
export type ValidationRules = {
  [key: string]: {
    type: string;
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
};

/**
 * Entity validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string[] };
}