import { User } from "../../auth/entities/user.entity";
import { Column, Entity, PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Package } from "../../package/entity/package.entity";
import { Payments } from "../../payment/entities/payment-entity";

export enum BookingStatus {
    PENDING= 'pending',
    COMPLETED= 'completed',
    CANCELLED= 'cancelled'
}
@Entity('booking')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    customerName: string

    @Column()
    destination: string
    
    @Column()
    travelDate: Date

    @Column({type: 'int', default: 1})
    guestCount: number

    @Column({ 
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING
    })
    status: BookingStatus

    @Column('decimal', {precision: 10, scale: 2})
    price: number

    @Column()
    userId: string

    @ManyToOne(() => User, (user) => user.bookings, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user: User

    
    @Column()
    packageId: string


    @ManyToOne(() => Package, (pkg) => pkg.bookings)
    @JoinColumn({name: 'packageId'})
    package: Package
   
    @OneToMany(() => Payments, payments => payments.booking)
    payments: Payments[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date

}