import { Booking } from "../../booking/entities/booking.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Package } from "../../package/entity/package.entity";
import bcrypt from 'bcrypt'

export enum Role {
    USER=  'USER',
    ADMIN= 'ADMIN'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string


    @Column({length: 50})
    name: string

    @Column({unique: true})
    email: string

    @Column({type: 'varchar',nullable: true})
    avatar: string | null

    
    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role: Role;

    @Column({ default: false})
    isVerified: boolean

    @Column()
    password: string
    @BeforeInsert()
    async hashPassword() {
        this.password= await bcrypt.hash(this.password,10)
    }

    @Column({type: 'varchar', nullable: true})
    resetPasswordToken: string | null

    @Column({type: 'timestamp', nullable: true})
    resetPasswordExpiry: Date | null

    @Column({ type: 'varchar', length: 12, nullable: true})
    phone: string | null;

    @Column({type: 'varchar',length: 6, nullable: true})
    otp: string | null

    @Column({type: 'timestamp',nullable: true})
    otpExpiry: Date | null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date


    @OneToMany(() => Booking, (booking) => booking.user)
    bookings: Booking[]

    @OneToMany(() => Package,(p) => p.user)
    packages: Package[]

}

