import { User } from "../../auth/entities/user.entity";
import { Booking } from "../../booking/entities/booking.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING= 'processing',
    SUCCEEDED= 'succeeded',
    FAILED= 'failed',
    CANCELLED= 'cancelled',
    REFUNDED= 'refunded'    
}
export enum PaymentMethod {
    CARD= 'card',
    BANK_TRANSFER = 'bank_transfer',
    WALLET = 'wallet'
}

@Entity('payments')
export class Payments {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    bookingId: string

    @ManyToOne(() => Booking, booking => booking.payments, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'bookingId'})
    booking: Booking

    @Column()
    userId: string

    @ManyToOne(() => User, user => user.payments, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user: User

    @Column({type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING})
    status: PaymentStatus

    @Column({type: 'enum', enum: PaymentMethod, nullable: true})
    paymentMethod: PaymentMethod

    @Column('decimal', {precision: 10, scale: 2 })
    amount: number

    @Column({type:  'varchar',length: 3,default: 'EGP'})
    currency: string

    @Column({nullable: true, unique: true})
    stripePaymentIntentId: string  
    
    @Column({ nullable: true })
    stripeSessionId: string;

    @Column({ nullable: true })
    stripeChargeId: string;

    @Column('decimal', {precision: 10, scale: 2, default: 0})
    refundAmount: number

    @Column({ type: 'varchar', nullable: true })
    refundReason: string;

    @Column({type: 'timestamp',nullable: true})
    refundedAt: Date

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ type: 'varchar', nullable: true })
    failureReason: string;

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

}