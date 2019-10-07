import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";

// ObjectType needs to be used when we are using this Entity as a type in graphql queries
@ObjectType()
// Entity means it's a DB table
@Entity("users")
export class User extends BaseEntity {
  //Field means that it will be exposed in queries for GraphQL
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  email: string;

  @Column()
  // Note that we dont use @Field here because we don't want to expose the password to queries
  password: string;
}
