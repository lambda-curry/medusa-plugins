import { SoftDeletableEntity, generateEntityId } from "@medusajs/medusa"
import { BeforeInsert, Column, Entity } from "typeorm"

@Entity()
export class Webhook extends SoftDeletableEntity {
  @Column({ nullable: false, type: "varchar" })
  event_type: string

  @Column({ type: "boolean", nullable: false, default: true })
  active: boolean

  @Column({ nullable: false })
  target_url: string

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "webhook")
  }
}
