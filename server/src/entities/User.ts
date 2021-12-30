import { Field, ID, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@ObjectType() // Noi chuyen tu typscript toi typsscript graphQL
@Entity() // Noi chuyen tu typscript toi postgres
export class User extends BaseEntity {
    @Field(_type => ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(_type => String)
    @Column({ unique: true })
    username!: string

    @Field()
    @Column({ unique: true })
    email!: string

    @Column()
    password!: string

    @Field()
    @CreateDateColumn()
    createdAD: Date

    @Field()
    @UpdateDateColumn()
    updatedAt: Date
}