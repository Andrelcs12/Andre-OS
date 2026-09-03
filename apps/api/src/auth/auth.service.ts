import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { SupabaseUserIdentity } from "./auth.types.js";

@Injectable()
export class AuthService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  private client?: SupabaseClient;

  private getClient() {
    if (this.client) return this.client;
    const url = this.config.get<string>("SUPABASE_URL");
    const key =
      this.config.get<string>("SUPABASE_PUBLISHABLE_KEY") ??
      this.config.get<string>("SUPABASE_ANON_KEY");
    if (!url || !key) {
      throw new ServiceUnavailableException(
        "Supabase Auth não está configurado na API.",
      );
    }
    this.client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return this.client;
  }

  async getIdentity(accessToken: string): Promise<SupabaseUserIdentity | null> {
    const { data, error } = await this.getClient().auth.getUser(accessToken);
    if (error || !data.user?.email) return null;
    const metadata = data.user.user_metadata;
    const displayName =
      metadata.full_name ?? metadata.name ?? data.user.email.split("@")[0];
    return {
      authUserId: data.user.id,
      email: data.user.email,
      displayName,
      avatarUrl: metadata.avatar_url ?? null,
    };
  }
}
