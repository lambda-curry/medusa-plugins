import { IsString, IsOptional, IsBoolean, IsUrl } from "class-validator"

export class CreateWebhookReq {
  @IsString()
  event_type?: string

  @IsBoolean()
  @IsOptional()
  active?: boolean

  @IsString()
  target_url?: string
}

export class EditWebhookReq {
  @IsString()
  id: string

  @IsString()
  event_type?: string

  @IsBoolean()
  @IsOptional()
  active?: boolean

  @IsString()
  target_url?: string
}

export class TestWebhookReq {
  @IsString()
  @IsOptional()
  id: string

  @IsString()
  event_type: string

  @IsBoolean()
  @IsOptional()
  active?: boolean

  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  target_url: string
}
